A radiology report is text where the image and the reader’s call sit in a fixed shape. When I put word2vec on reports in 2015, the question was whether neighbors captured finding paraphrases: “mass” and “lesion,” what a negation scopes over. Encoders and LLMs still live or die on that structure.

A methods note, not a stand-in for a reader.

## Negation and hedge are half the job

Report sentences are more often negatives and hedges than positives. “No definite mass,” “cannot entirely exclude.” Bag-of-words and a naive embedding mean cannot flip a negation. If the teacher is an imaging finding and the text vector treats “absent” as near “present,” the model memorizes report length and modality.

Eval starts with a small span set: affirmed / negated / uncertain. Large-set ICD or order reasons are weak labels. Same caution as [billing codes](post.html?slug=icd-label-noise&lang=en).

## Time of image vs time of text

The report is written after the study. Using the full text as a teacher for “findings from the image” can be fair (reproduce the read). Claiming you predict findings *at acquisition time* that were not yet written is a leak. Lock the claim in one sentence, then decide whether text enters.

Multimodal (image + report) training that always sees both will drop the day operations have only one. Mix the missing-text condition in train if serve can lack the report.

## Paraphrase and site lexicon

Templates and abbreviations differ by site. “N.C.,” “unremarkable,” “within normal limits.” Word2vec neighbors are still a cheap check for those paraphrases. Whether the embedding leans on site lexicon shows up as site-classification AUROC — the text version of [scanner shift](post.html?slug=scanner-shift-imaging&lang=en).

If you generate an impression, use the same four layers as [talk-to-note](post.html?slug=clinical-text-from-talk&lang=en): added facts, dropped facts, section mix, identifiers. A fluent impression visually takes a responsibility that is still the reader’s. Eval is whether you pretended otherwise.

## What I inspect

- a negation-span eval
- the imaging claim and the time the report is used agree
- paraphrase neighbors that survive a site change
- who signs a generated impression, under what responsibility. No demo if that is empty

Report NLP looks like a vocabulary problem. It is negation, time, and responsibility.
