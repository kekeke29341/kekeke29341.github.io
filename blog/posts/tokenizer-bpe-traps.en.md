A model’s “vocabulary” is not words. It is BPE or Unigram merges over bytes. That cut quietly sets quality on numbers, Japanese, SKUs, and code. I sometimes read the tokenizer before embedding size or temperature.

## What is being cut

BPE repeatedly merges symbols that co-occur. Frequent text becomes a short token string. Ordinary English wins; in-house SKUs, full-width digits, and rare kanji lose. Losing means:

- the same meaning is a longer sequence (KV, cost, latency)
- a one-character edit becomes a totally different id string (retrieval and generation both break)
- a split the trainer almost never saw (flat logits)

“It’s 70B, it can read part numbers” is a long OOV if the tokenizer spends ten tokens on the SKU.

## Numbers, spaces, normalization

A tokenizer that splits digits one-by-one and one that keeps them together disagree on addition, dates, and ID match. Llama-family and other lines differ here. If “three-digit match” drops after an engine swap, I print **whether the same string is the same id sequence** before I blame generation.

Normalization is the other trap. NFKC on full-width alphanumerics, case folding, whitespace collapse. Train and serve disagree, and two identical-looking prompts are different objects. Closed-network forms are full-width; public tokenizers assume half-width. In dense retrieval, if index and query normalize differently, the vocab is already wrong before the vector.

## Japanese and multibyte

Implementations usually refuse to split mid-UTF-8, but kanji outside the vocab fall to bytes. One character becomes several tokens and will not merge with nearby particles. Drug names and proper names get long and unstable here. Decide early: grow the vocab (and init the new rows) or normalize frequent names to a Latin form. Silent SFT spends capacity learning *the cut*.

## Code and control tokens

Some tokenizers eat indent spaces; some do not. “It runs but the formatting is wrecked” is sometimes the tokenizer’s whitespace rule, not the model. Special tokens (`<|eot|>`, BOS/EOS, tool delimiters) colliding with user text is a vocab collision. Escaping user strings that match special tokens is safety, not style.

## What I inspect

- `encode` twenty production inputs and look at length and splits
- SKUs, dates, full-width digits, drug names — change one character, watch the ids
- whether the retriever and the generator share a tokenizer
- after a vocab grow, that `lm_head` and the embedding table have the same rows

Before I talk parameters I want to know how many tokens one sentence is. SFT on a broken cut does not get fixed by blaming the model.
