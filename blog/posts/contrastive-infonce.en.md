Dense retrieval in RAG, CLIP, and most unsupervised sentence embeddings are the same idea: **contrastive learning**. Nearby vectors for the same thing, far vectors for different things. The loss is InfoNCE (van den Oord et al., 2018), the common language of embedding models. If you only talk about generators, this gets flattened to "cosine similarity." The equation is worth writing down.

## What is being maximized

For an anchor \(q\), a positive \(k^+\), and negatives \(\{k_i^-\}\),

$$
\mathcal{L} = -\log \frac{\exp(\mathrm{sim}(q, k^+) / \tau)}{\exp(\mathrm{sim}(q, k^+) / \tau) + \sum_i \exp(\mathrm{sim}(q, k_i^-) / \tau)}
$$

\(\mathrm{sim}\) is usually a dot product after L2 normalization (cosine). \(\tau\) is a temperature; smaller sharpens the positive. This is a classification loss: pick the positive. Negatives sit in the softmax denominator, so **the quality and count of negatives set the representation**.

In-batch negatives — every other item in the batch — are the default for sentence embeddings. Batch 128 gives you 127 negatives for free. If two near-duplicates land in the same batch, you treat a near-positive as a negative and crush the space. In-house corpora are full of duplicates. Dedup, plus a few true hard negatives (nearby but different policies), often beats a 4× batch.

## Symmetric vs asymmetric

A symmetric sentence embedding (one tower for \(q\) and \(k\)) is for clustering and nearest neighbors. Retrieval is asymmetric: a short query, a long passage. Decide early whether you want **two towers** (query encoder / document encoder) or an instruction prefix on the document side. E5-style `query:` / `passage:` prefixes are asymmetry via prompt.

Using a generative LLM's hidden states as a retriever, with mean pooling, mixes a next-token space with a retrieval space. Dedicated embedding models exist because the *loss* is different. If you embed with an LLM, add a contrastive stage or a pooling that was trained for it — not "last token, hope."

## Temperature and dimension

Too-small \(\tau\) overfits a one-character SKU difference. Too-large \(\tau\) makes positives and negatives look the same. Do not change a public checkpoint's \(\tau\) at inference. The training temperature belongs to training.

PCA from 1024 to 256 is faster and drops rare distinctions. If you reduce, do it after contrastive training and after in-house recall@\(k\). Reduce first and you cannot tell what you threw away.

## Back to RAG

When I swap embeddings I score [retrieval only](post.html?slug=rag-evaluation&lang=en), and leave the generator alone. Picking an embedding by "how good the answers feel" mixes prompt drift into the representation. Contrastive learning closes as a retrieval story.
