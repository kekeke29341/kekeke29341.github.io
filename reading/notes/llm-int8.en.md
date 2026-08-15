## What I took

Large Transformer matmuls have outlier channels. Keep those wide; put the rest in 8-bit. It changes how I read “average bits.”

## Where I use it

I do not say “INT8 is enough” from perplexity alone. I look at outlier handling, per-layer error, and drift over a long generation.

## What I doubt

Later AWQ / GPTQ papers are not the same object. I do not put weight-only quant and mixed-precision activations on one table.
