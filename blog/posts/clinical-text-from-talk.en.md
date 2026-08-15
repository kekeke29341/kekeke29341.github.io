Turn a clinic or ward conversation into a note. The problem I touched with seq2seq in 2016 is now a local-LLM summary. The shape is new; the eval traps are not. A fluent note wins human ratings while still being medically incomplete.

A methods and eval note, not a proposal to auto-file the chart.

## What is being generated

Talk mixes hesitation, repeats, the patient’s words, the family’s, the clinician’s hypotheses. A note is expected to separate

- a recap of the chief concern and course
- findings (what was observed)
- assessment (interpretation)
- plan (next acts)

A model looks “good” just by matching that shape. What it must *not* do is **invent labs that were not spoken** and **drop hypotheses into the findings**.

If the teacher is a finished discharge summary, the model learns information that did not exist minutes after the talk. That is time leak. The teacher is the progress note written right after that conversation. If you use a summary, name the generation time and call it document generation, not prediction.

## Do not stop at BLEU

n-gram overlap rises when a template is reproduced. The eval I want is layered:

1. **Added facts**: drugs, numbers, diagnoses that were not in the talk
2. **Dropped facts**: allergies, stopped meds, danger symptoms that were
3. **Section mix**: the patient’s words landing in objective findings
4. **Identifiers**: names, ids, family names left in (or filed only where the rule allows)

1 is hallucination, 2 is over-summary, 3 is SOAP collapse, 4 is privacy. If an LLM-as-judge is used, these are four prompts. “Is this a good note?” loses to fluency again.

Human review is a checklist on those four, not “would you use it.” Twenty items is enough. Accidents show up before BLEU moves.

## Why local

Audio and raw notes do not leave through an external API. On a hospital box, the [air-gap list](post.html?slug=air-gapped-llm-checklist&lang=en) comes first. ASR errors are “corrected” fluently by the generator. Correction is indistinguishable from hallucination, so low-confidence spans should stay as “unintelligible” in the note. Not cleaning up is the quality.

Talk-to-note is a generation task. It is not an early-diagnosis model. Do not mix them.
