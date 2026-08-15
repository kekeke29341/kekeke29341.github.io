## What I took

A RoPE context-extension method that interpolates differently by frequency band.

## Where I use it

After extension I check short-prompt regression and mid-context evidence (Lost in the Middle). A long benchmark can rise while short instructions break.

## What I doubt

Extension does not rewrite the length distribution of the training data. If long internal documents were never in training, extension alone will not solve them.
