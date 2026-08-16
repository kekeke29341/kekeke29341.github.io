A full fine-tune of 70B needs a training replica and optimizer state, and fills an air-gapped GPU allotment immediately. **LoRA** (Hu et al., 2021) locks the update into a low rank:

$$
W' = W + \frac{\alpha}{r} BA, \qquad B \in \mathbb{R}^{d \times r},\; A \in \mathbb{R}^{r \times k}
$$

If \(r \ll \min(d, k)\), trainable parameters per layer are \(r(d+k)\). The story is: freeze the base, keep a delta. The practical question is less "what \(r\)" than **which matrices should remember what**.

## What rank decides

Rank \(r\) is the dimension of the update subspace in that layer. Style, honorifics, JSON frames often fit in \(r = 8\) or \(16\). Definitions of in-house terms, or a new procedure the model must *write*, often do not. A short rank can drop loss and still fail proper nouns on the eval set.

\(r = 256\) on every layer is a slow full FT in costume. VRAM falls; forgetting does not. Before I raise rank I compare more target layers and more data.

\(\alpha / r\) is the effective step size. Change \(r\), leave \(\alpha\), and the update scale moves. In ablations I keep \(\alpha / r\) fixed or reset the learning rate on purpose.

## Which layers

The usual start is attention \(W_q, W_v\) only — close to the paper, fewest parameters. When that is not enough:

- add \(W_k, W_o\) (what to look at, and how to write it back)
- add MLP gate / up / down (terms and format like to live in the FFN)
- leave embeddings and `lm_head` unless you grew the vocabulary

"LoRA everywhere" is (layers × matrices) adapters and a messy merge. I try \(q,v\), then MLP, and watch eval. If it does not move, I suspect data before rank.

## QLoRA, learning on a quantized base

QLoRA (Dettmers et al.) keeps the base in 4-bit and trains LoRA in 16-bit. Fit comes first. Quality is "a delta on top of 4-bit error." When long context and refusal matter, I sometimes train QLoRA and serve the same adapter on an 8-bit or FP8 base. If train and serve bases differ in precision, the delta means something else. Match them, or run a short extra train at serve precision.

## How it forgets

LoRA freezes the base; the served output is still \(W+BA\). The delta overwrites paths the base used for general knowledge. To keep medical general knowledge and only add in-house form:

- keep data on form, do not rewrite medical facts
- leave untrained general items in the eval set
- do not let the delta grow unchecked (\(r\), steps, LR)

"It's LoRA, so it won't forget" is false.

## Shipping

Ship the adapter and you must pin the base revision. Drop it on a base with a different `rope_theta` and it fails quietly. In a closed network I put base hash, quantization, target layers, and \(r\) in one manifest. If I merge into a single weight file, that artifact goes through the eval set before it ships. An untested merge is an untested full FT.
