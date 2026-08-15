## What I took

Instead of a position embedding, a distance-proportional bias that helps length extrapolation. Used in Bloom-family stacks.

## Where I use it

I check RoPE versus ALiBi on the checkpoint before I pick an extension method. I do not paste an ALiBi recipe onto Llama.

## What I doubt

Neither method guarantees quality past training length. I measure at the real length.
