Instead of a dense 70B, a **Mixture of Experts (MoE)** keeps a large parameter count and runs only a few experts per token. Mixtral and several recent open models do this. Size it like a dense model and both VRAM and latency will be wrong.

## What an “expert” is

The FFN is split into \(E\) experts. A router scores each token \(x\) and runs the top \(k\):

$$
y = \sum_{e \in \mathrm{Top}k} g_e(x)\, \mathrm{FFN}_e(x)
$$

\(g_e\) is a gate (softmax or a variant). Attention is usually shared; the heavy MLP is sparse. Total parameters grow with \(E\); FLOPs are roughly \(k/E\).

So “8x7B” is, on paper, ~56B of capacity and ~13B of compute if \(k=2\). The paper tears when the router collapses onto a few experts.

## If load collapses, sparsity is theater

During training the router prefers easy experts. An auxiliary loss, expert capacity, or load-balancing regularizer spreads tokens. At inference that loss is gone; **the trained imbalance stays**.

When it is bad:

- a few experts run hot (compute and HBM)
- the rest are dead weight
- per-expert token counts inside a batch do not match, so kernels fall into short work

Variance **per token** is larger than in a dense model. p95 under concurrency not matching mean tokens/s is a common MoE surprise.

## Memory is not sparse

Compute is \(k\) experts; weights are still \(E\) experts on the GPU. Expert parallelism across cards adds communication every token. On a 1–2 GPU air-gapped box I ask first: **do all experts fit?** Picking MoE because “compute is cheap” still dies on expert weights plus KV.

Quantization drifts per expert. Idle experts never appear in calibration and break the first time a rare domain wakes them. Calibration data should be diverse on purpose, so usage is not a spike.

## What I inspect

- `num_experts` and `num_experts_per_tok` (\(E\) and \(k\))
- whether the engine packs experts into a GEMM or scatters per token
- routing logs if available — is 80% landing on one expert
- on long context, whether the same experts win layer after layer

MoE is not “a bigger model for the same compute.” Compute is sparse, memory is dense, load is uneven. Do not borrow the dense sizing equation.
