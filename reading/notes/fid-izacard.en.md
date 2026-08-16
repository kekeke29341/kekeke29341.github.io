## What I took

Fusion-in-Decoder. Instead of concatenating retrieved passages into one prompt, read them separately and fuse in the decoder.

## Where I use it

Internal QA that must track “which sentence is the evidence” is worth a FiD try before a concatenated RAG. It is heavier, so I cap the passage count first.

## What I doubt

Long-context decoders overlap this role. If Lost in the Middle shows up, the FiD split is still useful.
