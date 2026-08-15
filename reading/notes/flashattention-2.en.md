## What I took

A follow-up that makes FlashAttention faster by partitioning work better. It is often the hidden premise of long-context serving.

## Where I use it

I log the attention kernel name on the server. “It’s slow on long text, so approximate” is the wrong order if this kernel is not on.

## What I doubt

The speedup moves with GPU generation and head dim. I do not paste the paper’s ratio into a purchase deck.
