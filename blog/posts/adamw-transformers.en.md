AdamW is still in Transformer training logs for a reason that is not only habit. You want Adam’s adaptive second moment **and** weight decay decoupled from the gradient. SGD + momentum at the same \(\eta\) either diverges or breaks Norm scale first.

## What Adam does

On a gradient \(g_t\) it keeps moving averages \(m_t, v_t\) and steps

$$
w \leftarrow w - \eta \frac{m_t}{\sqrt{v_t} + \varepsilon}
$$

Coordinates with large gradients get a smaller effective step. Embeddings, attention, and FFNs can differ by orders of magnitude and still share \(\eta\). Transformers need that; scale is per layer and per matrix.

The cost: coordinates with tiny \(v_t\) (rarely updated) get a huge effective step. Warmup exists in part to tame that. A large \(\eta\) with no warmup wrecks attention logits in the first few hundred steps.

## Do not mix decay into L2

Classic “Adam + L2” adds \(\frac{\lambda}{2}\|w\|^2\) to the loss and folds that gradient into \(g_t\). After the adaptive scale, decay means something different per coordinate. AdamW (Loshchilov & Hutter) applies, *after* the adaptive step,

$$
w \leftarrow w - \eta \lambda w
$$

a shrink proportional to magnitude. Decay is not warped by adaptivity. In Transformers that difference shows up in generalization. If an implementation pours `weight_decay` into L2 instead of AdamW, you will not reproduce the paper. I read the optimizer name in the log.

## What not to decay

Norm \(\gamma\), biases, and sometimes embeddings are left out. Decay on everything shrinks RMSNorm and slows training. It pairs with the [RMSNorm note](post.html?slug=rmsnorm-prenorm&lang=en). The `no_decay` list should not be empty.

Learning rate scales with tokens and batch. Linear scaling (batch \(\times k\) ⇒ \(\eta \times k\)) is a rough start when warmup exists. Too large and you jump before \(v_t\) catches up. LoRA-only runs usually want an \(\eta\) an order of magnitude below full FT, even with the base frozen. AdamW does not mean “same LR for everyone.”

## What I inspect

- `AdamW` vs `Adam`; fused PyTorch kernels using the same decay order
- \(\beta_1, \beta_2\) (often 0.9 and 0.95 or 0.999). Long sequences make a slow \(v_t\) visible
- \(\varepsilon\) (1e-8 vs 1e-5 changes low-precision stability)
- grad clipping. Explosions are often one outlier batch, not the LR

Optimization is dull and it kills a run before architecture does. Before I blame the model I look at how decay was applied.
