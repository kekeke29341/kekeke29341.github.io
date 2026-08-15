Dropping weights from 16-bit to 8-bit or 4-bit changes which GPU generation you can use. Done carelessly, the public benchmark score survives and in-house names plus long context die. Quantization is not "make it smaller." It is a design of **what to coarsen and what to keep**.

## What is being quantized

Three tensors get mixed up:

- **Weights** \(W\): most of disk and VRAM. The home of GPTQ / AWQ / FP8
- **Activations**: tensors in flight. Wide dynamic range; coarsen them and the model breaks quickly
- **KV cache**: grows with length. As in [the KV note](post.html?slug=kv-cache-gqa&lang=en), it can exceed the weights under concurrency

"It ran in 4-bit" usually means **weights only**. Activations and KV often stay FP16. Compare bit-widths on the same tensors.

## GPTQ, AWQ, FP8

**GPTQ** minimizes reconstruction error per layer. A Hessian approximation asks how rounding this weight moves the next layer. It needs calibration inputs and **depends on that distribution**. A 4-bit built on web crawl, pointed at internal forms, drops rare part numbers first.

**AWQ** keeps scales on important channels and coarsens the rest. Calibration is lighter than GPTQ; generation quality is, in practice, more stable. Public 4-bit Llama-family weights are often AWQ.

**FP8** (E4M3 / E5M2) is a hardware type more than a compression trick. On Hopper / Ada you can run the GEMM itself in FP8 and buy throughput. It shrinks less than 4-bit, degrades more honestly, and is the easier choice when you want both long context and concurrency.

All three throw information away. They differ in *which* information.

## What dies first

In practice, quantization kills these first:

1. **Past the training length** — RoPE's high-frequency planes meet error in K
2. **Rare proper nouns, SKUs, drug names** — tokens absent from calibration
3. **The decision not to answer** — when the top of the logit pile flattens, hallucination beats refusal
4. **Short numeric agreement** — digits and units. Fluency lasts longest

A one-point MMLU drop does not measure those four. Before an air-gapped deploy I run 50–200 in-house questions and one long document, same prompts, before and after quantization.

## Calibrate on the production distribution

Do not leave GPTQ / AWQ calibration on English Wikipedia. In a closed network, mix anonymized manuals, tickets, and refusal examples. Calibration is not training; the model need not "memorize" the text. The goal is to **move activation scales toward production**.

If medical or contract "must not answer" items are missing from calibration, refusal gets softer after 4-bit. When I talk about accuracy, I say at which weight precision and on which set.

## What to inspect

- Engine dtype matches the checkpoint (do not run AWQ through an FP16 kernel)
- Same `rope_theta` as the unquantized checkpoint
- If KV is quantized too, score 8k and 32k separately
- If quality drops, step back to 8-bit / FP8 and suspect the 4-bit calibration set first

Quantization is how you fit. Quality after it fits is the calibration distribution and the set you actually scored.
