## What I took

Separate adaptive second moment from weight decay. The default Transformer optimizer.

## Where I use it

I read the optimizer name in the log and whether `weight_decay` actually enters AdamW. A framework that pours it into L2 will not reproduce the paper.

## What I doubt

I do not borrow a CNN decay rate. Embeddings and Norm parameters are often left out of decay.
