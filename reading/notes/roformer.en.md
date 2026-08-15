## What I took

The RoPE paper. Queries and keys rotate by position; the dot product depends on the offset. It is the default in current decoder LLMs.

## Where I use it

Long-context work touches those frequencies — base, YaRN, NTK. I do not reuse a learning rate from an additive-position stack.

## What I doubt

“It uses RoPE, so it is good at long text” is not a claim. Outside the training length, I measure again.
