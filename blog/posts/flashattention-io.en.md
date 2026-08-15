People write self-attention as \(O(T^2 d)\) FLOPs. In an implementation, what dies first is often **HBM traffic**, not math. FlashAttention (Dao et al.) tiles that I/O into SRAM and never materializes the \(O(T^2)\) score matrix. It is not an approximation. It is the same softmax, moved.

## Why you should not store \(S = QK^\top\)

The naive path:

1. write \(S \in \mathbb{R}^{T \times T}\) to HBM
2. softmax
3. read \(P V\)

At \(T = 8\mathrm{k}\), many heads, dozens of layers, \(S\) alone is huge. Softmax reduces over the row, so a naive pass touches \(S\) twice. Tensor cores sit idle; the bus saturates. Same family of death as reading KV at decode.

FlashAttention streams \(K, V\) tiles against a block of \(Q\), finishes an **online softmax** in SRAM (running max and sum), and writes back \(O\) plus, if needed, softmax stats. \(S\) never lands in HBM.

## Is the numerics the same?

Online softmax is mathematically the usual softmax. It only updates the row max across blocks. In FP16 / BF16, keeping a local max can even be *more* stable than exponentiating a giant \(S\) at once.

This is not approximate attention (Linformer, Performer, window-only). Cut the window and both cost and answers change. Flash changes I/O, not the answer. If a bench “drops after Flash,” I suspect causal masks, dropout, RoPE / ALiBi order, or a bug — not the algorithm.

## Training vs decode

Backward needs \(P\) for the softmax Jacobian. Flash does not keep \(P\), so it recomputes or rebuilds from stats. That is why it pairs with checkpointing. At decode, \(Q\) is one row and \(T\) lives in KV. Flash’s real win is **prefill** (a long prompt in one shot) and full sequences in training.

So “FlashAttention support” shows up in **TTFT on long inputs**, more than tokens/s at decode. RAG that rereads 8k every time should measure that. Expecting a 1-token generate to double is how you get disappointed.

## What I inspect

- Flash / SDPA / xformers, and whether that kernel accepts the mask you use (causal, padding, sliding)
- head dim vs what the kernel was written for (often 64 / 128)
- “memory halved in training” is \(S\) gone from activations. Weights did not shrink
- if numbers drift, set dropout to 0 and compare one layer to a naive impl at the same seed

When someone says they made attention faster, I ask: approximation, or I/O? FlashAttention is the second.
