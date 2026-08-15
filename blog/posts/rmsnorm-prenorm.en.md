Open a decoder after Llama and you find **RMSNorm** around attention, residuals in **pre-norm** order, and **SwiGLU** instead of GELU. These are not fashion. They are how you stack a deep Transformer without it falling over. A note so "it has many layers" is not the end of the architecture discussion.

## Why BatchNorm is a poor fit for sequences

Image BatchNorm normalizes across the batch. In sequence models

- lengths inside a batch do not match
- inference is often batch 1
- the mean depends on the other sentences in *this* minibatch

so train and serve statistics drift. LayerNorm (Ba et al., 2016) looks only along the **feature axis**, independent of length and batch. That is the Transformer premise.

## LayerNorm vs RMSNorm

LayerNorm subtracts the mean, then divides by the standard deviation:

$$
\mathrm{LN}(x) = \frac{x - \mu}{\sqrt{\sigma^2 + \varepsilon}} \odot \gamma + \beta
$$

RMSNorm (Zhang & Sennrich, 2019) does not subtract a mean. It uses only the root mean square:

$$
\mathrm{RMSNorm}(x) = \frac{x}{\sqrt{\mathrm{mean}(x^2) + \varepsilon}} \odot \gamma
$$

Most implementations also drop \(\beta\). Less work, stable training — that is the report that landed in Llama. A short reading: you match **magnitude**, not centering. Attention scale is less likely to explode through depth. That is the practical win.

If \(\varepsilon\) sits inside vs. outside the root, or \(\gamma\) is not initialized at 1, the same checkpoint yields different numbers. When an engine swap makes "logits small across the board," I read the Norm formula before I touch quantization.

## Pre-norm vs post-norm

The original Transformer is post-norm: Norm **after** the residual add. Fine when the stack is shallow. Deeper, Norm sits in series on the residual path and gradients pick a per-layer scale.

Pre-norm applies Norm **before** the sublayer and adds the output to the residual:

$$
x_{l+1} = x_l + F(\mathrm{Norm}(x_l))
$$

The residual stays an identity, so gradients survive a deep stack. Current decoder LLMs are almost all this shape. Reproducing a post-norm paper with a Llama learning rate, then watching it diverge, is a common mix-up.

## Why SwiGLU stayed

Replacing \(W_2\,\sigma(W_1 x)\) with a gated

$$
(W_1 x \odot \mathrm{SiLU}(W_g x))\, W_2
$$

improved quality at similar parameter count in the PaLM / LLaMA neighborhood. GLU-style layers make the "how much to pass" depend on the input. A clone that keeps GELU is not the public Llama weights.

## What I inspect

- whether `input_layernorm` / `post_attention_layernorm` are RMS or Layer
- under pre-norm, that Norm is not applied twice to the residual
- that \(\gamma\) is often left out of quantization (AWQ usually keeps it)
- learning rate and warmup borrowed for *this* Norm. Do not paste a post-norm recipe onto pre-norm

Call everything "a Transformer" and these differences vanish. When a weight port breaks, it is often Norm before Attention.
