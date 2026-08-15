The cheapest way to inflate an EHR model is to **split rows at random**. The same patient’s stays land in train and test. Lab habits, note style, and comorbidity bundles leak, and it looks like generalization. The first split unit in medical ML is the **patient**, not the row.

This is a methods note. It is not for diagnosis or treatment.

## What leaks

Notes, orders, waveforms, images — “one row, one sample” is easy to shuffle. One patient shares

- the same lab’s reference ranges and missingness pattern
- the same physician’s templates
- nearby records of the same disease

Train on a January 2024 admission and test on the March readmission, and the model memorizes **the person**, not the disease. Papers that report 0.9 AUROC on encounter splits and drop 0.1 on patient splits are not rare.

Imaging is the same. Slices from one patient on both sides leak scanner noise and body habitus. Pathology tiles are split by patient (or block), not by tile.

## How to cut

1. Group by patient id
2. Keep patients disjoint across train / val / test
3. If there is a timeline, put that patient’s **entire** span in one split. Train on the first half and test on the rest is still the same person
4. If you have multiple sites, split by site when you can (shift, later)

Stratify at the patient level. Stratify rare outcomes on rows and you split the same patient again. When a patient has several labels, write the rule first (e.g. stratify on the most severe).

## Temporal validation

A patient split is generalization to *other people in the same era*. Generalization to next year’s deployment is closer to a **time cut**: train 2019–2021, test 2022–2023. Panels change, documentation rules change, pre/post COVID moves the distribution. Do not relax after a patient split. If you can report both, report both.

## What I inspect

- split code uses `groupby(patient_id)` — `GroupShuffleSplit` / `GroupKFold`
- test patients did not enter preprocessing statistics (means, IDF)
- the retrieval index does not contain eval patients’ notes
- a table with a huge encounter count and a small patient count

Before I write “it was accurate” in a medical setting, I write how many *people* the split used. Row count comes after.
