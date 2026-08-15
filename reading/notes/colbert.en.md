## What I took

Keep token embeddings on the document and interact at query time. A higher-precision dense option between DPR and BM25.

## Where I use it

If corpus size and refresh rate make storage impossible, I skip it. If they fit, I ask whether it catches BM25 misses.

## What I doubt

Late interaction will not rescue a bad chunk boundary. I fix the split first.
