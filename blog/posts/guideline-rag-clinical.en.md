RAG the clinical guideline, answer “with sources.” It is the shape hospitals ask a local LLM for first. The failure mode is a hallucination that carries a citation. Compared with generic RAG you also get **stale editions** and **dropped eligibility**.

An eval and design note, not a care plan.

## Guidelines are layered documents

One PDF mixes recommendation, exception, population, evidence grade, revision history. [Chunk](post.html?slug=rag-chunking&lang=en) by page and “reduce the dose in the elderly” splits from “except on dialysis.” Generation cites the first and sounds sure.

Keep the recommendation item (or heading) **and** its exceptions in one chunk. Metadata holds

- edition and date
- population (adult / child, kidney function, pregnancy)
- strength of recommendation

Embed body and heading only. If the query has no age or kidney function, retrieval may run, but generation should lead with “population unknown, this recommendation does not apply.” Whether it does is a [refusal set](post.html?slug=rag-evaluation&lang=en).

## Editions and local protocol

Society guidelines and in-house protocols disagree. If both are indexed, freeze priority in metadata and use it in the sort. A prompt that says “prefer in-house” loses once retrieval ranks the society PDF first.

A retired recommendation remains as an old chunk. RAG without `as_of` and a withdrawn flag will politely cite last year’s dose. Document control comes before the model.

## Eval

On top of ordinary faithfulness, medical RAG needs:

1. citation strings that overlap the chunks you passed
2. exception conditions that remain in the output when the question touches them
3. no recommendation on out-of-population questions
4. no withdrawn doses

Humans check those four, not “is this correct.” Correctness often cannot be judged without that patient’s chart. What you *can* judge is faithfulness to the document. Claims beyond that are outside RAG.

If the LLM is a search window over guidelines: low temperature, hard citations, thick refusal. Eligibility before cleverness.
