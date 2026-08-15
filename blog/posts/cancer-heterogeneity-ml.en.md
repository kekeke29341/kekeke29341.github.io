A solid tumor is not one lump. Clones sit in space; response varies by region. A biopsy is a piece. How much of the whole diversity can you say from one site’s VAFs or one image — that is the one-shot heterogeneity question. A short restatement of the premises I still use from a 2017 workshop draft.

A research frame, not a treatment plan for a person.

## The observation is partial

Multi-region sequencing is closer to an “answer” when several sites were taken. Clinic is usually one site. I split the target first:

- diversity **inside that biopsy** (VAF spread, histology texture)
- diversity in **regions you did not sample** (true one-shot extrapolation)

The second has no teacher without another site from the same patient. When a public set claims “whole tumor from one slice,” I check the teacher is not another processing of the *same* slice. If it is, that is not extrapolation. It is another view of the same observation.

## Frequency and space are different signals

The VAF histogram is a clue to mixing weights. Classical Dirichlet-process or finite-mixture deconvolution is still a reference for interpretation. Spatial layout (whether neighbors share a clone) is not determined by frequencies alone. Image texture and spatial transcriptomics are that channel. If I add both, I score **which teacher belongs to which channel**. A mixed AUROC hides what was predicted.

Dynamic visualization (transport or flow of clones through time) is a tool for looking at a hypothesis, not a substitute for predictive performance. A clean figure is not a score.

## Leaks and batches

Multiple regions from one patient stay on the same side of a [patient split](post.html?slug=patient-level-split&lang=en). Sequencing batch is the same story as [RNA-seq](post.html?slug=rnaseq-batch-effects&lang=en). A site’s panel design (which genes are deep) *is* the visibility of heterogeneity. I do not merge cohorts with different panels and compare diversity scores.

## If this is used near a clinic

Before “predict diversity,” I lock:

- which decision would change (another biopsy, a line of therapy, trial strata)
- which observation arrives in time (one-site panel, imaging, liquid)
- whether the extrapolation teacher is truly another region

Write the partialness of the observation before the model name. Tumor heterogeneity is also data heterogeneity.
