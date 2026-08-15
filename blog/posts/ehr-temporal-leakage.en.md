Outcome models for an admission still sometimes eat the discharge summary, or labs drawn after the outcome is known. A time-blind table mixes the future. After patient splits, the most expensive leak in medical ML is **time**.

A methods note, not a stand-in for clinical judgment.

## Common mixes

- label is “AKI during the stay,” but the dialysis order after the fact is a feature
- prediction time is admission, but day-3 notes are in the bag of words
- the image model is conditioned on a report written after the study time
- normalization uses the mean over the *whole* stay

All of these raise the score. They are not prediction. They are **restating what already happened**. Outcomes whose definition *is* a time series of labs and procedures — HRS, sepsis — invite this mix. Put the defining items in as features and you have built a definition-matcher.

## Freeze prediction time first

One sentence: each sample keeps **only what was observed by that instant**.

- prediction time \(t\): 6h after admission, first finalized note, …
- features: labs, vitals, orders, text with time \(\le t\)
- label: an event that is *determined after* \(t\) (name the window, e.g. within 7 days)

Events outside the window are censored. Force them into a classifier and early discharges become “negatives,” which biases wards that keep sicker people. When a survival frame is the natural one, use it.

## Text is the worst offender

A discharge summary is a recap. Use it for an admission-time prediction and almost every token is the future. Progress notes often have a date only in the header. A failed parse treats every note as pre-\(t\). I put a pipeline test: **zero post-\(t\) document ids in the feature table**.

If you summarize with an LLM then classify, check the summarizer did not see future notes. If you RAG, cut the index with `as_of` at query time.

## What I inspect

- an assert `timestamp <= prediction_time` on every feature
- codes that define the label are out of the features — or left in on purpose and documented
- note datetime parse failures are not a silent majority
- when a score is “clinically too good,” I suspect time before I suspect the model

Separate prediction from reconstructing the chart. The latter can be interesting NLP. It is not an early-warning claim.
