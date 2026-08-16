## What I took

For fixed training compute, it measures the balance of model size and tokens. The typical failure is a model that is too big for its data.

## Where I use it

I take internal-corpus tokens and only then cap model size. Picking 70B first with 1B tokens is the opposite of this paper.

## What I doubt

Inference cost and post-training are not in the fit. Total cost of operations is a different formula.
