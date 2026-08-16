## What I took

A path from an MHA checkpoint to grouped K/V (GQA). It is why local LLMs after Llama are not plain MHA.

## Where I use it

VRAM is roughly max length × batch × KV heads × layers × width. The GQA group count is a coefficient in that formula. I put it before the quality table.

## What I doubt

Upcycling a checkpoint is not the same as training GQA from scratch. I do not mix the conversion paper with the architecture choice.
