The teacher for “diagnose from the chart” is often **billing ICD**. What the team is treating and what was coded for payment are allowed to differ: suspected, ruled out, history, primary vs secondary. Force that into a clean multiclass problem and the model learns the billing office.

A label and eval note, not a replacement for coding staff.

## What the noise looks like

- **missing**: written in the note, never billed (transient symptoms, another service’s findings)
- **extra**: attached for risk adjustment or a bundle
- **time**: a discharge code supervising an admission note (time leak)
- **grain**: unspecified parents mixed with later digits

Usable as weak labels. Not usable as “diagnostic accuracy” without saying so. Gold, if you need it, is clinician span annotation or a registry (cancer registry, …). Billing codes are named as weak labels.

## What you assume when you train

If noise were random, a bigger model and more data would average it out. Billing noise is not random. It leans by site, service, and year. Learn the lean and you drop at the next hospital. Mitigations:

- split by patient, site, year ([splits](post.html?slug=patient-level-split&lang=en), time)
- weight the loss by code confidence (primary > secondary, suspected flags)
- call the output “billing-code prediction,” not clinical diagnosis

Decide primary-only vs multilabel first. Primary-only looks cleaner and can miss the actual question (“does this note mention heart failure”). Write the question in one sentence first.

## Eval

Using billing codes as test gold reproduces billing. That can be a real operations task. It cannot carry an early-warning or diagnostic-support claim. If I run two rungs:

1. large set: billing codes (weak)
2. small set: human spans (strong)

I report both. If the second drops, I do not hire on the first.

When I read an NLP “disease classification” paper, I look at teacher: code or annotation. If code, the score is a coding score.
