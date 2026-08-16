When a model says “0.9,” whether that is 9 in 10 is a different property. The first is confidence. The second is **calibration**. Treat LLM logits, retrieval scores, and a medical binary head as the same “probability” and production thresholds break. A high score and a usable probability are not the same.

## What to measure

For binary tasks, bin by predicted \(p\) and compare to the empirical positive rate. The count-weighted absolute gap is ECE (Expected Calibration Error):

$$
\mathrm{ECE} = \sum_{b} \frac{n_b}{n} \big| \mathrm{acc}_b - \mathrm{conf}_b \big|
$$

A reliability diagram shows over- or under-confidence in one glance. For LLM generation, token probability is not “the answer is correct.” Multiplying token \(p\) does not yield sentence correctness. Write the event in one sentence first:

- extraction: this span exists in the document
- refusal: this question may be answered
- retrieval: this chunk contains the gold span

Do not calibrate fluency. Fluency lasts.

## Temperature scaling is not training

Fitting one scalar \(T\) on a validation set and using softmax of \(z/T\) (Guo et al., 2017) is cheap post-hoc. The model does not change. Shift the domain and \(T\) shifts. Fit \(T\) on the in-house set; do not reuse the public-bench \(T\).

Platt scaling and per-bin isotonic overfit when data is small. On a closed-network 200-item set I do not trust much beyond a scalar \(T\). I set thresholds from **precision on that set**. “Emit above 0.7” does not need to be a calibrated probability; it needs a known false-positive count.

## LLM-specific traps

After instruction tuning, models are confidently wrong. RLHF / DPO raise preferred style and move the meaning of the numbers again. Recalibrate after SFT *and* after DPO. ECE often worsens after DPO. I do not revert generation quality; I retune refusal and extraction thresholds.

A retrieval cosine is not a probability. 0.82 is not “82% correct.” Same embedding, same normalization, then rank and precision-at-threshold only.

## What I inspect

- which event, which score, being calibrated
- whether the val set matches the production prior (contamination is [another note](post.html?slug=eval-contamination&lang=en))
- whether thresholds were reused after DPO or quantization
- if I report ECE, I report bin count and the task

A score you want to treat as a probability is either calibrated, or used only as a rank plus a threshold. The dangerous middle is “it’s 0.9, so we’re fine.”
