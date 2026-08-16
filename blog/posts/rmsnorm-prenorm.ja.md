Llama 以降のデコーダを開くと、Attention の前後に **RMSNorm** があり、残差の足し方は **Pre-norm** です。活性化は GELU ではなく **SwiGLU**。この三つは流行ではなく、深い Transformer を安定して積むための選択です。アーキテクチャの話を「層が多い」で終わらせないためのメモです。

## BatchNorm が系列で使いにくい理由

画像の BatchNorm は、バッチ方向の平均と分散で正規化します。系列モデルでは、

- バッチ内の文長が揃わない
- 推論時はバッチ 1 が普通
- 平均が「今のミニバッチの他の文」に依存する

ので、学習と推論の統計がずれます。LayerNorm（Ba ら, 2016）は、**特徴次元方向** だけを見るので、系列長とバッチから独立です。ここが Transformer の前提です。

## LayerNorm と RMSNorm

LayerNorm は、平均を引いてから分散で割ります。

$$
\mathrm{LN}(x) = \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} \odot \gamma + \beta
$$

RMSNorm（Zhang & Sennrich, 2019）は平均を引きません。二乗平均の平方根だけを使います。

$$
\mathrm{RMSNorm}(x) = \frac{x}{\sqrt{\mathrm{mean}(x^2) + \varepsilon}} \odot \gamma
$$

シフト \(\beta\) も、多くの実装ではありません。計算は減り、学習は安定したまま、という報告が乗って Llama に入りました。平均を引かないので、特徴の「向き」より「大きさ」だけを揃える、と読むと早いです。Attention のスケールが層を経ても爆発しにくい、のが実務上の効きです。

実装では \(\varepsilon\) の置き場（ルートの中か外か）と、\(\gamma\) の初期値 1 を揃えないと、同じ重みでも数値がずれます。推論エンジンを替えたときに「logits が全体に小さい」と出たら、まず Norm の式を見ます。量子化より先です。

## Pre-norm と Post-norm

元の Transformer は Post-norm です。残差を足した **あと** に Norm します。層が浅いときは問題になりにくい。深くなると、残差の通路に Norm が直列に入り、勾配が層依存でスケールします。

Pre-norm は、サブ層の **前** で Norm し、出力を残差に足します。

$$
x_{l+1} = x_l + F(\mathrm{Norm}(x_l))
$$

残差は恒等のまま残るので、深いスタックでも勾配が通ります。今のデコーダLLMは、ほぼこの形です。Post-norm の論文再現を、Llama 用の学習率で回すと発散する、はよくある取り違えです。

## SwiGLU が残った理由

FFN を \(W_2\,\sigma(W_1 x)\) から、ゲート付きの

$$
(W_1 x \odot \mathrm{SiLU}(W_g x))\, W_2
$$

にすると、同じパラメータ数でも品質が上がる、というのが PaLM / LLaMA 周辺の観察です。GLU 系は「通す量」を入力依存にします。ここを GELU のままにした複製は、公開 Llama 重みとは別物です。

## 見る場所

- `input_layernorm` / `post_attention_layernorm` が RMS か Layer か
- Pre-norm なら、残差に乗るテンソルに Norm を二重にかけていないか
- 量子化対象から Norm の \(\gamma\) を外しているか（AWQ でもここは残すことが多い）
- 学習率と warmup は、Norm の種類に合わせて借りる。Post-norm のレシピを Pre-norm に貼らない

モデルを「Transformer」と一括りにすると、この差が見えません。重みを移植するとき、壊れるのは Attention より先に Norm です。
