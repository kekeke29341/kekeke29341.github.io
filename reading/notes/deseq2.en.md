## What I took

The default differential-expression method for RNA-seq. Dispersion is shrunk so small samples stay stable.

## Where I use it

Before expression enters an ML model I write the normalization, the batch, and which contrast the residual came from. TPM straight into XGBoost skips this paper’s procedure.

## What I doubt

A differential-expression tool is not automatically preprocessing for a classifier. If the goal is classification, I design a non-leaking cut separately.
