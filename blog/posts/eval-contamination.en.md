A high public-bench score is a poor synonym for “smart.” Part of the score is **eval text in the training mix**, or, without literal overlap, **paraphrases of the same distribution**. Contamination and ordinary shift are different conversations.

## What counts as contamination

Narrowly: the test item, or its choices, sat in pretraining or SFT. Broadly:

- a translation, or the same item with numbers swapped
- the bench’s construction notes leaked onto blogs and GitHub, and only that recipe scores
- the eval prompt matches the instruction template used at train

The last two are overfitting a *shape*, not cheating from memory. The fix differs. The first you can suspect with overlap checks (n-grams, embedding neighbors). The last two are invisible until you own **your own set**.

## Why public points vanish on the floor

MMLU and public Japanese sets have been crawled to death. In-house forms, refusals, and SKUs have not. A public score is evidence of fit to the former, not the latter. If the only A/B after quantization or DPO is a public bench, you will hear “nothing broke” while proper nouns die.

Medicine and law are blunter. A guideline sentence in the crawl fills that cloze. Yesterday’s ward protocol does not. Even if you mechanically drop the paper’s official split from the corpus, **other phrasings of the same disease** remain. An exclusion list is necessary and not sufficient.

## Building a set that is harder to soil

- keep a created-on date and the sources
- do not copy public items; borrow structure, swap the private values
- periodically add twenty items from new production data (version the set)
- items a generator wrote as “similar questions” are not eval for that generator

As a self-check I look up 8-grams of the stem against the in-house corpus used for training. Hits move to the practice split. Zero hits is not cleanliness. Paraphrases remain — and the set is still more trustworthy than a public one.

## How I write the report

I do not hire from “MMLU 72” alone. Next to it I put

- the in-house set (answer / refuse)
- n-gram overlap with the train corpus
- deltas before/after quantization and DPO

Public points are a coarse ranking against other models. Do not outsource the definition of “smart” to a set that can be soiled.
