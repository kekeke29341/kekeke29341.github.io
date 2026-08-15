Rare outcomes — in-hospital deterioration, a narrow adverse drug event, a tightly defined syndrome such as HRS — still lead the table with **AUROC alone**. AUROC is the chance a random positive ranks above a random negative. Prevalence 1% or 50% can share the same number. The floor wants “how many alerts, how many hits.”

A methods note, not a screening policy.

## What it hides

AUROC sweeps every threshold. Operations pick one (or a few). A high AUROC with 5% precision at the working threshold is 19 misses per 20 pages. The rarer the event, the worse precision at the same sensitivity.

$$
\mathrm{PPV} = \frac{\mathrm{sens} \cdot \pi}{\mathrm{sens} \cdot \pi + (1-\mathrm{spec})(1-\pi)}
$$

When \(\pi\) is small, even a “high” specificity of 0.95 fills the denominator with false pages. AUROC 0.88 is not a license to write “usable.”

A PR curve (or average precision) looks at ranking on the positive side. For rare events I put that first. I still put precision, recall, and alerts/day at the operating point on the same table.

## Do not hide imbalance in the score

Training on undersampled data, reporting AUROC, serving at production prevalence — a common mix-up. Change train \(\pi\) and the threshold changes meaning. Calibration moves; [ECE](post.html?slug=calibration-ece&lang=en) is redone after.

Class weights and focal loss are optimizer conveniences. The curves I report are drawn on a set with **near-production prevalence**. Synthetic rare cases do not stay in the test split.

## The next clinical number

If an alert costs physician time, 1/precision is “misses per hit.” Write it next to prevalence. A decision curve (net benefit) compares against treat-none and treat-all across threshold probabilities. For early-warning claims (HRS and similar) this is often closer to the claim than AUROC. If I plot it, I add one sentence for what the threshold *means* (“consult above this probability”).

## What I inspect

- a leading AUROC and no prevalence
- fewer than two-digit positives in test — that AUROC is mostly noise
- a confusion matrix in *people* at the threshold (patient level)
- both a high-sensitivity and a precision-preserving operating point

“High discrimination” on a rare outcome is, at best, an intermediate. The adoption sentence is written in alert counts and misses.
