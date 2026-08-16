After putting local LLMs on air-gapped networks a few times, the expensive mistakes cluster in the same places — and they are rarely about the model name. This is a checklist of decisions I lock down first. Numbers change per project; the order of decisions does not.

## 1. Define "nothing leaves"

"Air-gapped" means different things to different people.

- Inference requests never leave the company
- Training and eval logs do not leave either
- Tokenizer and embedding downloads do not happen after the initial build
- Operator access over VPN is still authorized and audited

Write down what "external" means. Otherwise you discover later that vector-DB telemetry or a container registry is a leak.

## 2. Who may ask what about which documents

For privacy-preserving RAG, ACL comes before retrieval quality. The moment department A's contracts appear in department B's answers, model scores stop mattering.

Decide:

- Document labels (classification, org, retention)
- The principal making the query (human / service account)
- Filters applied on the query side, not "please don't mention this" in the prompt

## 3. Size hardware from concurrency × latency

Starting from a GPU SKU is how you overbuy or underbuy. Decide these three first:

1. How many people can be waiting at once
2. Acceptable latency (TTFT and end-to-end)
3. Practical context-length cap

Then pick quantization (FP8 / AWQ, etc.) and an inference engine (vLLM / TensorRT-LLM). You can add throughput later. You cannot load a model that does not fit.

## 4. Build the eval set before choosing a base model

Fifty to two hundred questions that include in-house jargon, part numbers, form names, and forbidden topics is enough. Include both gold answers and "must not answer" cases.

Run SFT or DPO only after you have agreed to revert if this set gets worse. When you talk about accuracy, always say on which set.

## 5. Freeze operations before the model

The painful failure mode on an air-gapped network is a one-person update ritual.

- How weights, quantized checkpoints, and tokenizers cross the air gap
- How to roll back a version
- What happens when one GPU node dies
- History of prompt and corpus changes

"We can revert" matters more on the floor than "the score went up."

---

If I write a follow-up, it will be either how to build that eval set, or where to put ACL filters in a RAG path.
