## What I took

A paper that separates post-norm and pre-norm by how gradients travel. It is the reason I expect pre-norm to be the stable choice on a deep stack.

## Where I use it

When a run diverges, I look at Norm placement before I look at lr. I do not apply a pre-norm recipe to a post-norm checkpoint.

## What I doubt

Stability is not final quality. Some shallow models still prefer post-norm. I switch on depth.
