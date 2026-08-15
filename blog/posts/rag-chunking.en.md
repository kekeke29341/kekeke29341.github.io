Blame the embedding for a RAG miss and you will be wrong about half the time. The retrieval unit is too big or too small for the question. Chunking is not janitorial preprocessing. It is the design of **which sentences may enter which neighborhood**.

## Too big, too small

A too-big chunk (a whole page, a whole section) averages the vector. A detailed question still retrieves “that chapter.” Prompt noise goes up; generation sounds grounded and is not.

A too-small chunk (one sentence, a hard 128 tokens) cuts the referent. “This is the exception to the previous paragraph” lives in another vector. Recall looks better; the passed text cannot answer. Completeness drops.

I start from **heading boundaries + overlap**. 200–500 tokens, 10–20% overlap. Do not split tables or lists mid-structure. Fix two-column PDF reading order *before* you cut. Get this wrong and every later embedding choice is off.

## Do not bake metadata into the vector

Unit, classification, date, doc id are **filters**. Embed “classification: secret” into the body and same-label docs cluster; content neighborhoods die. ACL on the query side is the same rule as the [checklist](post.html?slug=air-gapped-llm-checklist&lang=en). Keep metadata on the chunk object; embed the body (and, if needed, the heading path) only.

A heading path (`Employment > ch.3 > travel`) prefixed to the body is context for a short chunk. That is not the same as stuffing the label value.

## Queries and documents are asymmetric

Users ask “what’s the per diem?”; the document says “Article 12. Per diem shall…”. Chunks in document-speak make cosine with a short query unstable. Three fixes, used together:

1. prefix the heading path on the document side
2. lightly rewrite the query for search (HyDE adds generate cost and hallucination)
3. run lexical BM25 in parallel for SKUs and article numbers

If HyDE sits on the production critical path, a wrong hypothesized doc poisons retrieval. Score rewrite-on and rewrite-off separately.

## Eval

When I change chunking I leave the generator alone and score [retrieval only](post.html?slug=rag-evaluation&lang=en). Gold is a **span**, not a document. If a span crosses a boundary, decide in advance that either chunk counts, or recall will wobble with procedure.

Chunking is not “set once.” Policy-heavy corpora want larger chunks; ticket-heavy corpora want smaller. Mixed sources get mixed strategies. A single global 512-token cut is the unsafe default.
