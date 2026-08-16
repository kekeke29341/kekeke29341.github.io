## What I took

Freeze a quantized base and train LoRA. Single-GPU SFT entered operations through this recipe.

## Where I use it

I log base bits, which matrices get LoRA, rank, and whether double quant is on. A run that only says “we used QLoRA” cannot be reproduced.

## What I doubt

4-bit error and a too-small LoRA are different failures. If generation breaks, I doubt calibration text and the teacher first.
