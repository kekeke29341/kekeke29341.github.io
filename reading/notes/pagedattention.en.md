## What I took

The core of vLLM. KV cache is paged like virtual memory so fragmentation drops. After this paper, a serving estimate that assumes contiguous KV is incomplete.

## Where I use it

I compute KV bytes from concurrency and max length first. That is what runs out before the weights. Paging changes batch size on the same GPU.

## What I doubt

Paging is about packing, not about making the matmul faster. I do not mix it with a FLOPS table.
