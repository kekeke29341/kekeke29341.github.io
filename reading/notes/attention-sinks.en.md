## What I took

Streaming windowed attention collapses unless you keep the first tokens (sinks). This is not the same problem as extending RoPE.

## Where I use it

Long sessions, rolling log summaries, and agent loops cannot keep every KV. When I decide what to drop, I try keeping the head first.

## What I doubt

How many sinks, and which layers, move with the model. I do not paste “four tokens” onto every stack.
