## What I took

Train a low-rank update on frozen weights. You move the model toward a task without full-finetune VRAM.

## Where I use it

Start with \(W_q, W_v\); add MLP if that is not enough. Do not raise rank first. Write merge-into-weights and keep-the-adapter as different operations.

## What I doubt

Rank 16 rarely fixes a problem LoRA cannot fix. I doubt the data and the teacher first.
