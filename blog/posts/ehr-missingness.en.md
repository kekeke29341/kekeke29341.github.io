Missingness in the EHR is not only “we did not measure.” The reason it was not measured *is* the state. Mild cases have fewer labs; severe cases have more. Impute with the mean and you erase a severity signal, or you invent one. Do not put a clinical table through generic tabular preprocessing.

A methods note, not a case interpretation.

## Missing is often MNAR

In missing-data language, the chart is not MCAR. No order, patient declined, last value was stable, deferred in resus, no outpatient draw — all correlate with the label (worsening, admission, death).

Mean or median imputation copies the *observed* distribution onto unobserved rows. Fill a severe missingness pattern with a mild mean and the model sees a calm value. Train without a missingness flag and it mixes “more orders ⇒ more measured ⇒ sicker” into the lab values themselves.

## What to keep

At minimum, keep a mask: **was this observed**. For continuous items I keep

- last observed value and time since
- or a window summary (median, slope) and the count of observations in the window

If a sequence model (LSTM, Transformer) reads the series, value and mask are channels. EHR sequence models in the mid-2010s already looked like this. On a GBM I decide native missing vs an explicit mask, try both, and report both.

Normalization statistics come from observed values, train patients only. Do not update impute parameters after seeing the test missingness pattern.

## Confounding with the label

“Many labs were ordered” can be a strong outcome predictor. That may be a true clinical path (we measure because it is severe) or a site habit. If feature importance is led by **order counts**, not values, I write that path in the text. Skip it and the score dies when the next site orders differently.

Filling missing with zero collides with a true zero. Separate physiological out-of-range from missing and from error.

## What I inspect

- observation rates that differ sharply by label (if they do, argue whether that may be a feature)
- imputation from train statistics only
- “last value” that does not cross prediction time ([time leak](post.html?slug=ehr-temporal-leakage&lang=en))
- observation-rate tables that look like the train site, or do not

Missingness handling is not the tail of preprocessing. It is a model of the clinical process. Average it away and the score loses its meaning.
