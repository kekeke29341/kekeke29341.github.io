A large model, at generate time, streams the full weights once per token. Arithmetic intensity is low; the GPU waits. **Speculative decoding** (Leviathan et al. / Chen et al., around 2023) lets a small draft model write ahead and has the large model verify in one pass. When it works, you cut large-model forwards. When it does not, you are only hosting two models.

## What is being verified

A draft \(q\) proposes \(y_1, \ldots, y_n\). The large model \(p\) scores that prefix in **one forward**. At position \(i\),

- accept if \(p(y_i \mid \mathrm{prefix}) \ge q(y_i \mid \mathrm{prefix})\)
- otherwise resample from \(p\) at that position

That rule preserves \(p\)'s distribution (a form of rejection sampling). The claim is not "approximate and go faster." It is **same distribution, less expected work**. Implementations that greedily take the nearest token drop the guarantee. They can be fast. They are a different method.

Acceptance rate \(a\) is the whole game. If you draft \(n\) tokens and a fraction \(a\) survive, large-model calls head toward \(1/(1+na)\). Below about \(a = 0.3\), draft cost wins.

## What sets acceptance

Draft and target must share a tokenizer and sit on nearby distributions:

- the same vocabulary (a multibyte split mismatch rejects every time)
- nearby pretraining, or the same SFT line
- modest temperature (high temperature rejects on tail mismatch)

A 70B SFT'd on in-house text, drafted by a vanilla 7B, dies right after the first jargon token. SFT the draft on the same corpus, or use a small distilled sibling, first. A bigger size gap raises the theoretical cap and lowers \(a\) until you never see it.

## Concurrency

Verification wants **aligned lengths inside the batch** — a long draft scored at once by the large model. At 100 concurrent sessions, one sequence drafting 8 tokens and another just rejected, the large kernel follows the short sequence. Schedulers like vLLM batch this on purpose. Adding "speculative for one request" in a home-grown server can raise single-stream tokens/s and worsen p95 under load.

KV cache is paid twice. Different depths mean additive memory. Sliding a 7B next to a 70B that already fills the card is a story about *spare* VRAM.

## What I measure

- acceptance (per position, and start-of-sequence vs. middle)
- large-model forwards / generated token
- tokens/s on one stream *and* at the target concurrency
- tokens that trigger reject (names, numbers, citation brackets)

Quality scores should match \(p\) if acceptance is the guaranteed rule. If they move, I check the implementation did not fall back to a greedy approximation. I do not read a speed report without an acceptance rate.
