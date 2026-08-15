When a local model has to sound like the company, the recipe is usually **SFT, then a preference method (DPO and friends)**. The names look like one spell. They are not. SFT moves a distribution. DPO puts an order between two outputs for the same input. Skip a step and both break.

## What SFT does

Supervised fine-tuning raises the likelihood of a desired \(y\) given \(x\):

$$
\max_\theta \; \mathbb{E}_{(x,y)} \big[ \log p_\theta(y \mid x) \big]
$$

The model copies that style. In-house templates, honorifics, citation shape, tool-call JSON — those go here. It also walks away from the pretraining distribution. Too narrow a set and it silently forgets general knowledge. Catastrophic forgetting happens with LoRA too. It is not free.

SFT can fix **format and facts that appear in the data**. "Infer the policy and refuse" for a rule you never wrote down does not stabilize on SFT alone.

## What DPO does

Direct Preference Optimization (Rafailov et al., 2023) skips a separate reward model and updates the policy from pairs \((y^+, y^-)\). The short reading is RLHF's Bradley–Terry, closed form, with a KL tether to a reference \(p_{\mathrm{ref}}\).

One intuition: for the same \(x\), raise likelihood of the chosen answer and lower the rejected one, without wandering too far from the reference. SFT says "say the answer." DPO says "this, not that."

So **weak pairs teach nothing**. If \(y^-\) is garbage and \(y^+\) is a normal gold answer, the model learns "don't emit garbage." The differences you want in production are closer than that:

- correct, but no citation
- correct, but mixed with department B's document
- fluent, but steps into a forbidden topic
- correct, but the tone is not the manual

To teach refusal, put a plausible lie in \(y^-\) and "I don't know / escalate" in \(y^+\). Both polite. If politeness decides the pair, you keep honorifics and lose refusal.

## What happens if you skip the order

DPO on an under-SFT base overfits the pair style. Broken JSON, missing citation brackets, answers that only know how to be short — that is the usual wreck. The other failure: grow "safety" with SFT alone, clone a pile of refusals, and the model goes quiet on questions it can answer.

The order I use:

1. Freeze the eval set first (answer / refuse / cite)
2. Stabilize format with SFT
3. DPO with that SFT as the reference
4. Revert if eval drops. Inspect pair quality before adding DPO steps

PPO with a separate reward model still earns its keep when pairs are noisy. When pairs are clean and the run is mid-size, DPO is cheaper to operate. On an air-gapped network I also count the extra GPU and the extra leak surface of a reward model.

## Decide the order before the algorithm

Preference quality is **what you marked as win and loss**, not the optimizer. The labeling guide gets one line each:

- wrong facts lose, even if the tone is good
- claims outside the source documents lose
- touching a forbidden topic loses
- after that, shorter-wins is optional

DPO labeled "seems good" talks well and cannot be audited. I do not ship an unauditable update to a closed-network production box.
