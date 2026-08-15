When people size a local LLM, they start with the weight file. 70B in FP16 is about 140GB; AWQ 4-bit is roughly a quarter of that. The thing that actually runs out first, once you have concurrency and long contexts, is usually the **KV cache**.

This note derives why KV grows with sequence length and batch, and what MHA / MQA / GQA actually reduce.

## Attention remembers past K and V

Decoder self-attention, for a new token \(t\), uses the Keys and Values of every earlier position. Recomputing from scratch for \(T\) generated tokens is \(O(T^2)\) work. So we keep past \(K, V\) in GPU memory. That is the KV cache.

The increment per extra token is, roughly,

$$
2 \times L \times H_{\mathrm{kv}} \times d_{\mathrm{head}} \times b \times \mathrm{bytes}
$$

- \(2\): Key and Value
- \(L\): layers
- \(H_{\mathrm{kv}}\): KV heads
- \(d_{\mathrm{head}}\): head dimension
- \(b\): live sequences (batch, or concurrent sessions)
- bytes: 2 for FP16, 1 for FP8

Weights do not grow when a request arrives. KV grows with **concurrency × context length**. A hundred users each near 8k tokens can easily make KV larger than the weights.

## MHA, MQA, GQA

Classic Multi-Head Attention (MHA) uses the same head count for queries and for KV. More heads, more cache.

**Multi-Query Attention (MQA)** shares one KV across all query heads: \(H_{\mathrm{kv}} = 1\). Cache drops sharply. Diversity of "what to look at" drops with it.

**Grouped-Query Attention (GQA)** sits in between. Query heads are split into \(g\) groups; each group owns one KV. Llama 3-family models do this. Cache is \(H_{\mathrm{kv}} / H_q\) of MHA.

| Method | \(H_{\mathrm{kv}}\) | Cache | Representation |
| --- | --- | --- | --- |
| MHA | \(H_q\) | Largest | Per-head KV |
| GQA | \(H_q / g\) | Middle | Shared inside a group |
| MQA | 1 | Smallest | A single KV |

"Same 70B" is not the same memory at 8k × 100 concurrent if one model is GQA and the other is not. I read `num_key_value_heads` before parameter count.

## Bandwidth dies before FLOPs

Generating one token streams huge matrices once. Arithmetic intensity is low; the bottleneck is often **HBM reads of KV**, not the tensor cores. That is why

- PagedAttention (vLLM) to cut fragmentation and keep a real batch
- prefix cache to reuse KV for a shared system prompt
- FP8 / quantized KV

can beat another round of weight quantization. The other side: coarse KV often kills position first on long sequences. [RoPE](post.html?slug=rope&lang=en) is a product on Q/K, so K's precision *is* position.

## Order of estimates

1. How many live sequences, and the max length of each
2. Bytes of KV from \(H_{\mathrm{kv}}\) and depth
3. Weights + KV + activations on one GPU
4. If it does not fit, compare "fewer concurrent / shorter context / a GQA checkpoint" before another quantization pass

When I quote throughput, I write tokens/s **at a given concurrency and length**. A number without those two is a number that ignored KV.
