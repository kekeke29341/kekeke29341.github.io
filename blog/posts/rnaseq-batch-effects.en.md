RNA-seq models that “predict” prognosis or histology are often predicting **when and on which kit** the library was made. Batch can be as large as biology, or larger. Before a tumor-vs-normal or metastasis-vs-primary classifier, I look at the measurement layers.

A methods note, not a treatment choice. It continues the same preprocessing discipline as RNA-seq work on metastatic microenvironment.

## What counts as batch

- library-kit generation
- flow cell, lane, site
- years since freeze, RIN
- how macrodissection was done
- study id, when public cohorts are concatenated

PC1 is study or kit, not diagnosis. A supervised AUROC will be high. A random split inside the same study stays high. A new cohort drops. Before I name that “domain shift,” I ask whether batch is still in the residual.

## Order of correction

A common path: QC → normalization (TMM / median of ratios, …) → filters → **batch correction** → the learner. Designs that feed the disease label into the correction (some limma / ComBat uses) mix the label into expression. Estimate correction on train only; apply to test. Otherwise it is another leak.

Over-correct and you erase the biology you came for. If site and disease are fully confounded (disease A only at site 1), statistics will not untangle it. Then I do not fit a model; I report the confounding.

Single-cell adds layers: patient, droplet, hash, cell type. Split cells and ignore patient, and the [patient-level leak](post.html?slug=patient-level-split&lang=en) happens at tens of thousands of rows.

## Checks before ML

- the sample table has kit, site, date. If a public set lacks them, study id is a proxy batch
- PCA before/after correction, colored by label *and* by batch
- a classifier that predicts batch: its AUROC should fall after correction
- the downstream model is scored at least once on a **cross-study** split

Do not pour counts into a Transformer or a GBM first. The plots above come first. A biological claim starts after it is separated from a measurement claim.
