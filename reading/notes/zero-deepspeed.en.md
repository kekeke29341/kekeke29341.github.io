## What I took

Shard optimizer state, gradients, and parameters so training memory drops. The core of DeepSpeed.

## Where I use it

I write GPU count and ZeRO stage as premises of the estimate. I do not reject a 70B train from a one-GPU VRAM table alone.

## What I doubt

Communication becomes the limit. Fitting is not finishing. I put the interconnect on the same line as memory.
