## What I took

After BioBERT, further training on discharge summaries and MIMIC. It became the default public clinical embedding.

## Where I use it

A methods line that only says “we used ClinicalBERT” needs the checkpoint and the note type. A radiology report and a discharge summary drift on the same embedding.

## What I doubt

Replacing it with a decoder LLM does not retire domain adaptation. I do not only rename the embedding.
