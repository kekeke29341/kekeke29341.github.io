The reason a hospital hosts an LLM is often not generation quality. It is **not sending**. Talk, notes, images, orders carry identifiers and, at times, sensitive attributes. “De-identify and call an API” still re-identifies from residuals, and can fail both legally and technically. Air-gap is a premise, not a tax on convenience.

An operations and eval note, not product advice or a legal opinion.

## What “we de-identified” leaves

Strip names and ids with a regex and you still have dates, rare disease bundles, occupation, family structure, room numbers. People who were in the room can tell who it is. Medical NLP de-id benches (hide the name) and operational re-identification are different problems. A high F1 on the first does not solve the second.

When notes become RAG chunks, leftover identifiers leak into other questions via retrieval. Put patient id on [chunk](post.html?slug=rag-chunking&lang=en) metadata, not in the embedded text. Query-side ACL is the same rule as the [air-gap list](post.html?slug=air-gapped-llm-checklist&lang=en). A prompt that says “do not search across units” is not enough.

## Do not SFT on raw notes

Full charts in SFT make the model reproduce a patient’s sentences. Extraction attacks and verbatim memorization are incidents in care. If you train:

- drop identifiers, and drop or synthesize rare combinations
- run a memorization check (train 8-grams in generations) before release
- do not keep raw prompts in logs; keep a de-identified derivative if you must

Inference logs outlive the training run. Do not lift raw text to a cloud “for debug.” Write local ACL and retention first.

## Do not mix patients into the demo

No “real notes” on stage. Eval is synthetic under a written recipe, or excerpts under consent and ethics that are hard to re-identify. Do not paste a public clinical bench into an internal demo. Licenses and residual identifiers travel with it.

## What I inspect

- zero egress, including the update path
- RAG filters on the query, not only in the prompt
- the same identifier policy in writing for train, logs, and eval
- audio and images shed identifiers less easily than text — they sit in the same permission model

Quality of a medical LLM is, before summary fluency, **whose sentences go nowhere**. A demo that does not measure that is a demo.
