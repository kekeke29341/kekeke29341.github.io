A medical-image model that scores high at the training hospital and drops next door is often not a disease shift. It is **scanner and protocol**. CT kernel, MRI field and sequence, stain and slide scanner, ultrasound depth. I suspect this layer before I talk “image quality.”

A methods note, not a stand-in for a reader. Unsupervised features (a 2014-era problem) fail the same way in front of shift.

## What changes

- vendor, reconstruction, slice thickness, contrast timing
- pathology: stain lot, scanner, compression
- label rules (threshold for “positive,” the findings lexicon)
- population (referral center vs primary)

An internal random split tests another slice from the same device. The score contains a device fingerprint. Eval includes at least one **cross-device or cross-site** split. Patient split first, then site. One site: split by year or by a protocol change.

## Correction and augmentation

Intensity norms, histogram matching, stain norms shrink appearance gaps. Overdo them and you shrink the finding too. Do not re-estimate train-only correction on test (leak). Matching to test-site statistics is “on-site calibration” in operations, not a zero-shot paper claim.

Augmentation (windows, noise, color) mimics some of the shift. It cannot mimic label rules or population. Those are data.

## Look in the embedding

If a site classifier has high AUROC on the image embedding, the downstream disease model can use site. Same check as [RNA-seq batch](post.html?slug=rnaseq-batch-effects&lang=en). I often refuse to trust the disease AUROC until the site AUROC falls.

Foundation models (large medical self-supervision) still lean on pretrain sites. Fine-tune on a device that was absent and you plateau early. Keep device metadata on the sample table.

## What I inspect

- unseen device / site in the test split
- preprocessing that did not peek at test statistics
- errors concentrated on one sequence or on non-contrast
- a report that is only internal CV

“Generalization” for imaging is written as disease generalization *and* device generalization. A number that did not measure the second will not replay on the next scanner.
