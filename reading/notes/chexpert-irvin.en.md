## What I took

A large chest X-ray set and uncertain labels mined from reports. The label function is the ceiling of the image model.

## Where I use it

I decide before training whether uncertain becomes positive, dropped, or its own class. A comparison that only prints AUROC without that decision is a different dataset.

## What I doubt

A report-mined label is not image gold. I put radiologist agreement on the same table.
