## What I took

Mixed-precision training with loss scaling. The hidden premise of current LLM training.

## Where I use it

If a run diverges, I look at loss scale and which layers stay FP32 before I look at lr. I do not put this on the same slide as INT8 inference.

## What I doubt

FP16 and BF16 do not behave the same. I do not force a GPU’s default back onto this paper’s FP16 recipe.
