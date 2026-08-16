## What I took

LayerNorm without mean subtraction. Cheaper, and the Llama-family default.

## Where I use it

I do not bring a post-norm learning rate into RMSNorm + pre-norm. That is a standard way to diverge.

## What I doubt

I do not mix “Norm changed, so quality rose” with a run that also changed position and activations.
