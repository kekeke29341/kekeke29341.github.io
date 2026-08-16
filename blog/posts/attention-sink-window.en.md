You do not have to keep full attention on a long sequence. Sliding windows, StreamingLLM’s **attention sink**, “keep the first few tokens” — this is not the same discussion as stretching RoPE. It is **which past you physically drop**. Drop the wrong slice and the system prompt vanishes mid-conversation.

## What a window alone breaks

Sliding attention with width \(w\) means position \(t\) cannot see before \(t-w\). Compute and KV are \(O(T w)\). Past \(w\), the opening role, refusals, and tool specs leave the window. The model sees only the latest user turn and politely violates policy.

“Summarize it back into the window” is one fix. If the summarizer drops policy, the main model faithfully follows a wrong summary. Score this on a refusal set *after* the window. In-window eval will not show it.

## What a sink keeps

Softmax often parks mass on the **first few tokens**, somewhat independent of content. StreamingLLM (Xiao et al.) calls this a sink and keeps those KV vectors while the window slides. The live cache is the first \(s\) tokens plus the last \(w\):

$$
\mathrm{visible}(t) = \{1,\ldots,s\} \cup \{t-w+1,\ldots,t\}
$$

Whether RoPE ids are compacted after a drop, or left absolute, is implementation-defined. Compact them and “relative” no longer means real distance. Changing that *and* a [RoPE](post.html?slug=rope&lang=en) stretch at once gives you two causes. Try one.

A sink is not magic. If the head is only BOS plus the start of the system prompt, “do not use department B’s docs” is still outside the window. Keep the system prompt short, put hard constraints **at the front**, or re-inject them every turn. Re-injection grows KV; put it in the concurrency estimate.

## Prefix cache

If every request shares a system prompt, that KV belongs in a prefix cache. When a window is also on, the “must not drop” span should match the cache boundary. If they disagree, policy survives on some requests and not others, and you cannot reproduce it.

## What I inspect

- window width, sink count, whether position ids are reindexed
- whether the system prompt is protected by sink or by re-injection
- train with full attention, serve with a window — that is a distribution change
- refusal and citation past 8k, scored inside vs. outside the window

Long-context support and a window are different. One is position extrapolation. The other is throwing the past away. Ask which one the “128k” on the card means, in the weights and in the engine.
