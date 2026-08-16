Treating generation "randomness" as one temperature slider fails in production. Temperature is how sharp the softmax is. What you cut off is top-\(k\) and top-\(p\). Agent-assist in a contact center and idea generation want different tuples, even on the same weights.

## What temperature moves

For logits \(z\),

$$
p_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}
$$

\(T \to 0\) piles mass on the top token (greedy). \(T > 1\) lifts the tail. Temperature **stretches or crushes a shape that is already there**. It does not change the candidate set. A low-probability slur stays if the tail is fat.

Greedy is not "accurate." Per-token argmax is not the most likely sentence. You fall into short clichés and common digits after a number. Where correctness matters, put constraints first (JSON schema, citations, banned strings), then lower \(T\).

## top-k and nucleus (top-p)

**top-\(k\)** drops everything outside the \(k\) best tokens. On a large vocabulary, \(k=50\) already cuts tail junk. On a peaked step you do not need \(k\) tokens; on a flat step \(k\) is not enough. A fixed \(k\) changes bite with context.

**top-\(p\)** (Holtzman et al., nucleus sampling) keeps the smallest set whose mass reaches \(p\). Two or three tokens when the model is sure, dozens when it is not. I start around \(p = 0.9\).

If both are on, the usual order is \(k\) first to cap blow-ups, then \(p\) inside that set. Reverse the order and engines disagree. "Same temperature, rougher prose" after an engine swap is often this order, or a missing \(k\)/\(p\).

## Typical, mirostat, and what not to do

Cut the tail too hard and you loop. Leave it and you emit broken rare subwords. Typical sampling keeps tokens near expected information content; mirostat tracks a target perplexity. Effects are domain-dependent. I lock \(T\) and \(p\) first.

What I do not do: score the eval set at \(T=0.8\) and ship \(T=0.2\). The measured distribution is not the served one. Refusal and citation evals use **the same sampling as production**.

## Starting points

| Use | Start | Why |
| --- | --- | --- |
| Extraction, JSON, citations | \(T=0\), constrained decode | No tail needed |
| Inquiry assist | \(T=0.2\)–\(0.4\), \(p=0.9\) | Some paraphrase, no slurs |
| Draft / brainstorm | \(T=0.7\)–\(0.9\), \(p=0.95\) | Diversity; facts checked later |
| Speculative draft | Lower \(T\) | [Acceptance](post.html?slug=speculative-decoding&lang=en) first |

Temperature does not change what the model knows. It chooses how much of the distribution you keep. Reports quote \(T, k, p\) together.
