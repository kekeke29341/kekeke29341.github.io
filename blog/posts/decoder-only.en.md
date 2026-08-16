Around 2018 the split was clean: BERT (bidirectional) for understanding, GPT (causal) for generation, encoder–decoder for translation. Almost every local LLM you would host now is **decoder-only**. That is not fashion. The objective and the compute shape moved to causal LMs.

## Bidirectional vs causal

A bidirectional (masked) LM fills a hole from both sides. Strong at classification and extraction. “Write left to right” is not the training condition. If you want generation you add a causal stage, or a clever decode.

Causal next-token looks left only. Train and generate are the same condition. Long continuations, tool calls, dialogue, sit on that condition. Understanding tasks can be rewritten as “continue this prompt” on the same weights. A specialist bidirectional model may still win the score. **One weight that does everything** usually wins the floor.

Encoder–decoder (T5 and friends) reads the input bidirectionally and writes the output causally. Still strong for translation and document-conditioned generation. You also get two modules, two KV paths, two surfaces to implement and quantize. If a closed network wants “generate and rerank in the same box,” it drifts decoder-only.

## Shape of the compute

Decoder-only training is one loss: next-token cross-entropy. Data is “text exists.” Instruction following is a format change via SFT. Bidirectional setups still choose mask rate, NSP, and friends. At scale, a simpler objective is easier to feed with data and engineering.

At inference, KV grows in one direction. Encoder–decoder keeps input memory and output generation as two books. Concurrency estimates stay simpler on a decoder. That is an operations reason, not a paper reason.

## Exceptions that remain

Embedding-only, extraction-only, short classification — a small bidirectional model (or a dedicated encoder) can still win latency and score. Do not use a 70B decoder as a retriever; that is the same point as [InfoNCE](post.html?slug=contrastive-infonce&lang=en). “Put it all in the decoder” is a claim about *writing*, not about every ML job.

This looks like history. It is design. Match train and serve, keep one objective, keep one box. Those three choices are the shape of today’s local LLM.
