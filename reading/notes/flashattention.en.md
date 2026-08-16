## What I took

Exact attention, tiled in SRAM, without writing the \(N 	imes N\) matrix to HBM. A paper that counts IO.

## Where I use it

If someone asks “should we approximate attention?” on a long context, I first ask whether a FlashAttention-style kernel is already on. If it is, the reason to approximate is something else (window, sink, a hard memory cap).

## What I doubt

The speedup moves with implementation, length, and head dim. I do not paste the paper’s ratio into a purchase deck.
