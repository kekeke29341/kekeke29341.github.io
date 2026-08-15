A large teacher, a small student. Knowledge distillation (Hinton et al., 2015) passes the teacher’s **logit distribution**, not only hard labels. On local LLMs I use it to move a 70B’s manner onto an 8B, and to pull a speculative draft toward the target. That is a different payload than “more SFT labels.”

## What is being matched

The classic classification form is a KL between teacher \(p_T\) and student \(q_T\) softened at temperature \(T\):

$$
\mathcal{L} = T^2 \, \mathrm{KL}\big(p_T \,\|\, q_T\big) + \lambda \, \mathrm{CE}(y, q)
$$

\(T^2\) rescales gradients that the temperature shrank. Whether you keep the hard label \(y\) depends on the task. In-house refusal is safer with a hard “do not answer” left in, because the teacher will sometimes answer politely and wrongly.

On sequences you add this KL per token. Different tokenizers shift positions and the KL is meaningless. Same vocab, same cuts.

## Intermediate layers, or outputs only

Output KL already moves tone and common continuations. If that is not enough, add hidden MSE or attention-map KL (FitNets, Attention Transfer). Different depths mean you must choose which layer maps to which. Wire everything and the student copies the teacher’s internal coordinates and cannot represent them.

In practice: output KL + hard labels first. If it moves, add only the layer before the head. More intermediate loss ties you to the teacher’s architecture. If the student will later become GQA or quantized, output-only is easier to port.

## When the teacher is wrong

Distillation copies bias: hallucination shape, soft refusals, one unit’s phrasing. Evaluating only the student against a 70B teacher “faithfully” shrinks the teacher’s failures. Filter teacher traces on the in-house set before you distill, or skip KL on known-bad continuations. Blind copy is compression, not improvement.

## Draft models

[Speculative](post.html?slug=speculative-decoding&lang=en) acceptance is closeness of draft and target. Distilling the draft on the target’s logits can raise acceptance. A higher temperature than serve tries to match the tail and can *hurt* short accepts. The metric is acceptance, not loss.

Distillation is less “make a small model smart” than “move a large model’s distribution into a box that fits.” Write down what you transfer and what the hard labels overwrite, first.
