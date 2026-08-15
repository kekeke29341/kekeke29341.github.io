Almost every decoder LLM you would run locally today — Llama 3.1, Mistral, Qwen — uses **RoPE** (Rotary Position Embedding) for positions. The paper is Su et al., RoFormer (2021). The short version: it does not *add* a position vector. It *rotates* the query and the key by the token's position.

This note covers why the rotation is there, what survives in the inner product, and what breaks when you stretch context.

## Without positions, word order vanishes

Self-attention is a weighted sum over a set of tokens. If you inject no position,

- "the cat chased the mouse"
- "the mouse chased the cat"

are hard to tell apart from co-occurrence alone. So position has to enter Q / K (and sometimes the embeddings).

The classical choice is **absolute** position: add sinusoids (the original Transformer) or a learned vector per index. The model can see "I am token 17," but "how far apart are we?" is something it must learn. Past the training length, it meets unseen indices and extrapolation falls off a cliff.

What you usually want is the **relative** offset \(m - n\). RoPE puts that offset into the inner product by rotating.

## In 2D, it is literally a rotation

The smallest case is two dimensions. A rotation by \(\theta\) is

$$
R_\theta = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}
$$

Rotate the query at position \(m\) by \(m\theta\) and the key at \(n\) by \(n\theta\):

$$
q_m' = R_{m\theta}\, q, \qquad k_n' = R_{n\theta}\, k
$$

Rotation matrices are orthogonal, so the inner product collapses to

$$
\langle q_m', k_n' \rangle = \langle q,\, R_{(n-m)\theta}\, k \rangle
$$

The left-hand side is similarity after rotating at \(m\) and \(n\). The right-hand side depends on the original \(q, k\) and a rotation by the **difference** \(n-m\). Absolute indices cancel. That is the core of RoPE.

In complex form it is the same statement: multiply \(q\) by \(e^{i m \theta}\). Rotation preserves norm, so you do not stretch vector length the way a naive add-to-embedding can.

## In high dimension, rotate 2D planes at different frequencies

Take an even head size \(d\) and split it into \(d/2\) planes. Plane \(i = 0, \ldots, d/2-1\) advances at its own rate:

$$
\theta_i = \mathrm{base}^{-2i/d}
$$

Llama-family models default to \(\mathrm{base} = 10000\). Small \(i\) means a long wavelength (long-range). Large \(i\) means a short wavelength (local word order). Same idea as sinusoidal PE, stacked across scales.

In code you cache \(\cos(m\theta_i)\) and \(\sin(m\theta_i)\) per position and rotate even/odd pairs. The Hugging Face Llama form looks like this:

```python
def rotate_half(x):
    x1, x2 = x[..., ::2], x[..., 1::2]
    return torch.stack((-x2, x1), dim=-1).flatten(-2)

def apply_rope(x, cos, sin):
    return x * cos + rotate_half(x) * sin
```

`x` is Q or K. **V is not rotated** in the Llama / Mistral convention. Relative position goes into the attention weights (where to look). The values being gathered stay un-twisted.

## Where it sits among other encodings

| Method | What is mixed in | Relative position | Long context |
| --- | --- | --- | --- |
| Sinusoidal / learned PE | Added to embeddings | Indirect | Unseen indices break easily |
| ALiBi | Distance bias on scores | Explicit | Extrapolation is relatively clean |
| RoPE | Rotate Q/K | Falls out of the inner product | You must choose how to stretch |

ALiBi subtracts a linear function of distance from the scores. It is simple and extrapolates well, but the distance effect is a fixed bias. RoPE represents distance as a stack of frequencies, so it is more expressive and less honest past the training length.

## What happens when you extend context

Training may stop at 4k or 8k; inference wants 32k or 128k. Under RoPE, large \(m\) pushes \(m\theta_i\) outside the trained range. Short-wavelength planes leave the trained angles first.

Three common stretches:

1. **Linear interpolation of positions**  
   Shrink \(m' = m \cdot L_{\mathrm{train}} / L_{\mathrm{infer}}\). Angles stay in-distribution; nearby tokens lose resolution.
2. **NTK-aware scaling**  
   Leave high frequencies mostly alone; raise the effective base so low frequencies get longer wavelengths. Keeps local word order, stretches long-range dependence.
3. **YaRN**  
   Interpolate vs. extrapolate by frequency band, and correct attention temperature. Common on public long-context releases.

A model card that says "32k" only means one of the above (or extra training) is in play. For air-gapped long-context RAG, check **which RoPE scaling** you have, and score in-length vs. beyond-length separately. This drops quality more often than head count or GQA width.

Some models just raise `base` (5e5 or 1e6 for long context). Same "we use RoPE," different \(\theta_i\), different angle at the same \(m\). If the engine's RoPE config disagrees with the checkpoint's `rope_theta` / `rope_scaling`, quality dies quietly. Weird vLLM or TensorRT-LLM output: look here first.

## What to inspect in production

- Hugging Face `config.json`: `rope_theta`, `rope_scaling` (`type`, `factor`)
- Code path: `apply_rotary_pos_emb`. Even head dim; same rotation on KV heads under GQA
- After quantization: RoPE is a product with `cos` / `sin`. If Q/K scale drifts, position dies first. Sudden long-context breakage is often RoPE precision
- Cache: `cos` / `sin` are functions of position. The KV cache must agree on "which token index is this." Prefix cache and sliding windows need a shared origin

## Takeaway

RoPE rotates Q and K at position \(m\) so the inner product keeps only the relative offset \(n-m\). It preserves norm, splits frequencies across planes, and is the default for current decoder LLMs.

"Long-context support" on a model card is usually a RoPE-stretching story. Before you pick a GPU SKU, make `rope_theta` and `rope_scaling` match between weights and engine, and evaluate inside vs. outside the training length.
