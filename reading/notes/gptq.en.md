## What I took

Post-training, per-layer second-order quantization of generative weights. Next to AWQ, a real air-gap compression option.

## Where I use it

Calibration text should look like the domain. I do not take a WikiText quant and drop it on internal documents.

## What I doubt

Error that accumulates over a long generation does not show up in one PPL number. I look for breakage at the actual max length.
