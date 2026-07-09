# Nakano et al. — Reconstructed Papers

Full papers written for the four entries in `paper_list.txt`, each in the authentic
LaTeX style of its venue/year and using only methods available at the time.

Author: **Teppei Nakano** (keiohigh2nd@gmail.com), Keio University School of Medicine,
Tokyo, Japan. The two 2017 ICML papers are co-authored with Kenji Ikeda.

Each paper is written to make three things explicit — **the dataset** (provenance,
cohort/corpus characteristics, splits), **the methods** (with their era-appropriate
justification), and **the medical value** (what the result is worth clinically:
decision-curve net benefit for HRS, documentation-burden reduction for note
generation, prognostic accessibility for one-shot heterogeneity, and treatment-course
interpretation for dynamic flow).

| Year | Venue | Title | Source | PDF |
|------|-------|-------|--------|-----|
| 2015 | NIPS Clinical Workshop | Early Detection of Hepatorenal Syndrome from Medical Records | `papers/p4_hrs/hrs.tex` | 7 pp |
| 2016 | NIPS Workshop on ML for Health | Generating Clinical Texts from Conversation | `papers/p3_clinical_text/clintext.tex` | 6 pp |
| 2017 | ICML Workshop on Computational Biology | Predicting Cancer Heterogeneity from One-shot Biopsy | `papers/p1_cancer_oneshot/oneshot.tex` | 5 pp |
| 2017 | ICML Workshop on Computational Biology | Visualizing Cancer Heterogeneity with Dynamic Flow | `papers/p2_cancer_flow/flow.tex` | 4 pp |

Final PDFs are collected in `pdf/`.

## Era-appropriate methods (no anachronisms)

- **2015 (HRS):** LSTM over irregularly-sampled EHR series with explicit missingness
  masks, vs. L1 logistic regression and gradient-boosted trees. No transformers/LLMs.
- **2016 (Clinical text):** attentional seq2seq (BiLSTM encoder–decoder, Bahdanau
  attention) with a copy mechanism (CopyNet / Pointing-the-unknown-words, 2016).
- **2017 (One-shot biopsy):** Dirichlet-process mixture deconvolution of VAFs
  (PyClone/SciClone lineage) + a learned, uncertainty-propagating calibration to
  multi-region ground truth; ResNet image features.
- **2017 (Dynamic flow):** joint t-SNE embedding + entropic optimal transport
  (Sinkhorn, Cuturi 2013) rendered as a kernel-smoothed velocity field.

All references predate each paper's year.

## Rebuilding

Requires [`tectonic`](https://tectonic-typesetting.github.io/) (self-contained LaTeX):

```sh
cd papers/p4_hrs        && tectonic -X compile hrs.tex
cd papers/p3_clinical_text && tectonic -X compile clintext.tex
cd papers/p1_cancer_oneshot && tectonic -X compile oneshot.tex
cd papers/p2_cancer_flow    && tectonic -X compile flow.tex
```

The conference style files (`nips15submit_e.sty`, `nips_2016.sty`, `icml2017.sty` +
`algorithm*.sty`, `fancyhdr.sty`) are vendored into each paper directory and also
kept in `styles/`.
