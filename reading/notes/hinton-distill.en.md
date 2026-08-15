## What I took

The classic: move a large model’s output distribution into a small one. Soft cross-entropy at a temperature is still the basic distill.

## Where I use it

If the student only copies the teacher’s argmax, it is not distillation. I log temperature and the mix with hard labels.

## What I doubt

LLM vocabularies are large; you often cannot keep every logit. I do not compare a top-k transfer to the paper’s full vector.
