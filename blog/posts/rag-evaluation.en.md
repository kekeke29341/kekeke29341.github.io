The most dangerous sentence after a RAG launch is "accuracy went up." Retrieval, generation, refusal, and citation are mashed into one number. A mashed number does not tell you what to touch. Evaluation cuts the pipeline and scores each cut.

## Four layers, cut first

1. **Retrieval** — did the needed document land in the top \(k\)
2. **Use** — did generation stay inside the documents you passed
3. **Answer** — is the question factually covered
4. **Refusal** — does it decline what is missing or forbidden, instead of filling the gap

A stronger generator moves 2 and 3. A new embedding model moves 1. A prompt change moves 2 and 4. Fold them into one "accuracy" and you cannot tell what you changed.

## Score retrieval without the generator

Basic retrieval metrics are recall@\(k\) and MRR. Gold documents (or gold spans) are placed by a human *first*. Do not backfill "probably this doc" after reading the answer. That leaks generation taste into retrieval scores.

Match \(k\) to what you actually put in the prompt. If you retrieve 20 and pass 4, you measure 4. If you add hybrid search (BM25 + dense), keep the two singles and the fusion. Fusion can raise recall and still drop layer 2 by adding noise.

I do not trust dense vectors alone: part numbers, statute numbers, and abbreviations often want lexical match. Multilingual embedding scores on public benches also drift on in-house Japanese forms.

## Split "correct" on the generator

- **Faithfulness**: only claims the passed documents support
- **Completeness**: the question is actually covered in that span

A faithful empty answer and a complete answer that left the documents need different fixes. The first is prompt and forced citation. The second is retrieval or a hole in the corpus. If you use an LLM-as-judge, give these two separate prompts. One good/bad label mixes them again.

If the model emits citations, check **string overlap with the chunks you passed**. Invented clause numbers show up faster in a regex than in a review meeting.

## Hold a refusal set as large as the answer set

The expensive failures are questions the system must not answer: personal data, another unit's contracts, unpublished figures. Skip them in eval and every retrieval improvement widens the leak. ACL on the query side is in the [air-gap checklist](post.html?slug=air-gapped-llm-checklist&lang=en). In eval I keep two extra tallies:

- zero out-of-scope documents in the top \(k\)
- any generation that still touches them is an immediate fail

I do not fold those into a "combined 82."

## Small set, frozen

Fifty to two hundred items is enough. Adding questions every run breaks the time series. Version the set; additions go in v2. Same items, same \(k\), before and after SFT, DPO, embedding swaps, and quantization.

The report is one line: "recall@4 0.71→0.84, faithfulness flat, two refusal misses left." I do not write "accuracy."
