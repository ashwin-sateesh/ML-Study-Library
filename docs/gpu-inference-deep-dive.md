# GPU Inference Deep Dive — Course Reference

**10 modules** · Ground-up course on how LLM inference actually runs on an H100 · Built for ML engineers who want to reason about latency, throughput, and hardware bottlenecks from first principles

---

## Module 1 — Foundations: Building Your Vocabulary
*Every term explained from scratch, so nothing in this course is a mystery*

**What Is a "Core" on a Chip?**
A core is the smallest unit of computation — a circuit that can fetch an instruction, execute an arithmetic operation, and write a result. GPU cores are simpler and far more numerous than CPU cores (H100: 16,896 CUDA cores vs a CPU's 8–64). They are optimized for one thing: running the same operation on thousands of numbers simultaneously (SIMD).

**Clock Speed, FLOPS, and Throughput**
- Clock speed (GHz): how many instruction cycles per second
- FLOPS: floating-point operations per second — the standard measure of raw compute
- H100 SXM: 989 TFLOPS (FP16), 3,958 TFLOPS (FP8 with sparsity)
- Throughput vs latency: throughput = work per second (GPU's strength); latency = time for one request (GPU's weakness at batch size 1)

**Types of Memory — Registers, Cache, SRAM, HBM, VRAM**
Five levels, each faster and smaller than the one below:
| Level | Size | Latency | Bandwidth |
|---|---|---|---|
| Registers | 256 KB / SM | 1 cycle | ~19.5 TB/s aggregate |
| L1 / Shared SRAM | 228 KB / SM | ~28 cycles | ~19.5 TB/s aggregate |
| L2 Cache | 50 MB (shared) | ~200 cycles | ~12 TB/s |
| HBM3 (VRAM) | 80 GB | ~400 cycles | 3.35 TB/s |
| CPU DRAM | hundreds of GB | thousands of cycles | ~100 GB/s |

**Memory Bandwidth and Arithmetic Intensity**
- Bandwidth = how fast data moves (GB/s); the bottleneck for most LLM ops
- Arithmetic intensity = FLOPS per byte of memory access — the key ratio that determines whether an operation is compute-bound or memory-bound
- LLM decode is almost always memory-bandwidth-bound (intensity ~1); matrix multiplications during prefill are compute-bound

**Matrix Operations — GEMM and GEMV**
- GEMM (General Matrix-Matrix Multiply): the core operation of transformer layers; compute-bound; parallelizes perfectly across thousands of GPU cores
- GEMV (General Matrix-Vector Multiply): what happens during decode (one token at a time); memory-bandwidth-bound; the fundamental reason decode is slow

**Key GPU Architecture Terms**
- SM (Streaming Multiprocessor): the fundamental execution unit; H100 has 132 SMs
- Warp: 32 threads that execute in lockstep (SIMT); the atomic scheduling unit
- Warp scheduler: dispatches warps to execution units; hides memory latency by switching to a ready warp
- Tensor Core: specialized matrix-multiply units on each SM; handle FP16/BF16/INT8/FP8; provide most of the H100's headline TFLOPS
- CUDA Core: general-purpose FP32/INT32 arithmetic
- Thread block / CTA: a group of warps assigned to one SM; shares SRAM

**Number Formats — FP32, FP16, BF16, INT8, INT4, FP8**
| Format | Bits | Range | Notes |
|---|---|---|---|
| FP32 | 32 | Full | Training default; rarely used for inference |
| FP16 | 16 | Moderate | Good accuracy; can overflow on large activations |
| BF16 | 16 | Same exponent as FP32 | Preferred for inference; no overflow risk |
| INT8 | 8 | Integer | 2× bandwidth vs FP16; requires calibration |
| INT4 | 4 | Integer | 4× bandwidth vs FP16; noticeable quality loss without careful quantization |
| FP8 | 8 | Floating-point | Best of both worlds; native H100 support |

**Inference-Specific Terms**
- Prefill: processing the input prompt; parallel; compute-bound
- Decode: generating output tokens one at a time; sequential; memory-bandwidth-bound
- KV Cache: storing past key/value tensors to avoid recomputing attention on every decode step
- Batch size: number of requests processed simultaneously; larger batch = better GPU utilization
- Continuous batching: dynamically adding/removing requests from the batch mid-generation
- Token budget: max tokens (prompt + output) a request is allowed to consume

---

## Module 2 — GPU Architecture for ML Engineers
*The H100's hardware, component by component, with exact specifications*

**The Full H100 Architecture — Every Component**
Complete SVG architecture diagram tracing every level: CUDA cores → sub-partitions → SMs → GPCs → L2 cache → memory crossbar → HBM3 stacks → NVLink/PCIe.

- 132 SMs organized into 8 GPCs (~16 SMs each)
- Each SM: 4 sub-partitions, each with 32 CUDA cores + 1 Tensor Core + 1 warp scheduler
- Total: 16,896 CUDA cores · 528 Tensor Cores · 256 KB register file per SM · 228 KB shared memory/L1 per SM
- 50 MB L2 cache shared across all SMs (bandwidth: ~12 TB/s, latency: ~200 cycles)
- 80 GB HBM3 across 5 stacks (3.35 TB/s, 400-cycle latency)
- NVLink 4.0: 900 GB/s bidirectional to other GPUs (used for tensor parallelism AllReduce)
- PCIe Gen5 x16: 128 GB/s bidirectional to CPU (used for model loading)

**Why GPUs and Not CPUs?**
CPUs optimize for latency on sequential tasks (deep pipelines, branch prediction, large caches). GPUs optimize for throughput on parallel tasks (thousands of simple cores, high memory bandwidth, explicit parallelism). Transformer attention and feed-forward layers are pure GEMM — they parallelize trivially across thousands of cores. A single H100 delivers ~2,000× the matrix-multiply throughput of a high-end CPU.

**Inside a Streaming Multiprocessor**
- 4 sub-partitions, each independently scheduled
- Each sub-partition: 32 CUDA cores (FP32), 1 Tensor Core (matrix ops), 1 warp scheduler, 16K registers
- Shared memory / L1: 228 KB total per SM, software-configurable split (e.g. 164 KB shared + 64 KB L1)
- Register file: 256 KB per SM — the single largest on-chip resource; register pressure determines max active warps

---

## Module 3 — Loading a Model into GPU Memory
*The complete data path from disk to VRAM, byte by byte*

**What Is Inside the Model File**
A model checkpoint is a serialized dictionary of tensors (weights). For a 70B parameter model in BF16: 70B × 2 bytes = 140 GB. Modern formats (safetensors, GGUF) allow memory-mapped loading and per-layer precision metadata.

- Weights only (no activations, no KV cache) at load time
- Layer structure: embedding table → N × transformer layers (attention weights + FFN weights + norms) → LM head
- Typical 7B BF16: ~14 GB. 70B BF16: ~140 GB. 70B INT4: ~35 GB.

**The Transfer Pipeline: Disk to CPU to GPU**
```
NVMe SSD → (PCIe Gen4: ~7 GB/s) → CPU DRAM → (PCIe Gen5: ~64 GB/s unidirectional) → GPU VRAM
```
- Bottleneck is almost always CPU→GPU PCIe bandwidth for large models
- Loading 70B BF16 (140 GB) over PCIe Gen5: ~2–3 minutes cold; production systems keep models resident in VRAM
- Multi-GPU: each GPU loads its shard; NVLink used for weight synchronization (tensor parallelism) after load

**VRAM Layout — Where Everything Lives**
At inference time, H100's 80 GB is split between:
| Region | Contents | Typical Size |
|---|---|---|
| Model weights | All layer tensors | 14 GB (7B BF16) |
| KV cache | Attention keys/values for all active requests | 20–40 GB (batch-dependent) |
| Activations | Intermediate tensors during forward pass | 1–2 GB |
| Framework overhead | CUDA context, buffers | 1–2 GB |

KV cache dominates for long-context, high-concurrency workloads — the primary constraint on how many requests you can batch.

---

## Module 4 — The Inference Forward Pass
*Tracing data through every GPU operation in one transformer layer*

**Tokenization and Embedding Lookup**
- Input text → tokenizer (BPE/sentencepiece) → token IDs (integers)
- Embedding lookup: each token ID maps to a row in the embedding matrix (vocab_size × d_model); this is a gather operation, not a GEMM
- Output: a (seq_len × d_model) activation tensor; this is what flows through all subsequent layers

**One Complete Transformer Layer — Data Flow**
```
Input (seq_len × d_model)
  │
  ├─ LayerNorm
  ├─ Q, K, V projections (3 GEMMs: d_model → d_model)
  ├─ Scaled dot-product attention (QKᵀ / √d_k → softmax → ×V)
  ├─ Output projection (GEMM: d_model → d_model)
  ├─ Residual add
  │
  ├─ LayerNorm
  ├─ FFN up-projection (GEMM: d_model → 4×d_model)
  ├─ Activation (GELU / SiLU)
  ├─ FFN down-projection (GEMM: 4×d_model → d_model)
  └─ Residual add → Output (seq_len × d_model)
```
Each layer's dominant cost: the four GEMMs (Q/K/V projection + output) and the two FFN GEMMs — all Tensor Core operations.

**FlashAttention — How It Avoids the NxN Problem**
Standard attention materializes a (seq_len × seq_len) matrix → O(N²) memory. For seq_len=8K, that's 64M elements per layer, per head — exceeding SRAM, forcing slow HBM reads.

FlashAttention computes attention in tiles that fit in SRAM, fusing the QKᵀ, softmax, and ×V operations into a single kernel. Result: O(N) HBM reads, ~3× faster attention, enables long-context without OOM.

**From Last Layer to Next Token**
- Final layer output (1 × d_model for the last token during decode)
- LM head: GEMM against the unembedding matrix (d_model × vocab_size) → logit vector (1 × vocab_size)
- Sampling: apply temperature, top-p/top-k filtering, sample from distribution → next token ID
- Append token to sequence, feed back into next decode step

---

## Module 5 — Prefill vs Decode — Two Completely Different Regimes
*Why prompt processing is 355× faster per token than generation*

**The Fundamental Asymmetry**
| | Prefill | Decode |
|---|---|---|
| Input | Full prompt (N tokens) | 1 new token |
| Operation | GEMM (matrix × matrix) | GEMV (matrix × vector) |
| Bound | Compute (Tensor Cores) | Memory bandwidth (HBM reads) |
| GPU utilization | ~80–90% | ~10–20% |
| Speed (H100, Llama-70B) | ~3,500 tokens/sec | ~10 tokens/sec |
| Latency per token | ~0.3 ms | ~100 ms |

The 355× gap is fundamental, not an optimization failure. Decode reads the entire model weight matrix from HBM for every single output token — at 3.35 TB/s, a 70B BF16 model (140 GB) takes ~42 ms just for the weight reads per step.

**The Roofline Model — Visualizing the Bottleneck**
The roofline plots FLOPS/byte (arithmetic intensity) against achievable performance. Operations left of the ridge point are memory-bandwidth-bound (decode); right of the ridge are compute-bound (prefill). The ridge point for H100: ~989 TFLOPS ÷ 3.35 TB/s ≈ 295 FLOPS/byte.

- Decode arithmetic intensity: ~1–2 FLOPS/byte → deeply memory-bound
- Prefill arithmetic intensity (large batch): ~hundreds of FLOPS/byte → compute-bound
- Implication: to speed up decode, you need more memory bandwidth (bigger HBM) or less data to move (quantization)

---

## Module 6 — Quantization — Shrinking Weights to Move Faster
*The bandwidth argument for INT8, INT4, and FP8*

**Why Quantize? The Bandwidth Argument**
Decode is memory-bandwidth-bound. If you halve weight size, you halve the bytes read from HBM per step, directly doubling decode throughput (at the same batch size). Quality is the cost; bandwidth is the payoff.

- BF16 → INT8: 2× bandwidth improvement, <1% quality loss with calibration
- BF16 → INT4: 4× bandwidth improvement, 2–5% quality loss (model-dependent)
- BF16 → FP8: 2× bandwidth improvement, minimal quality loss (H100 native support)

**INT8 Quantization — Worked Example**
For a weight tensor W (BF16): find scale = max(|W|) / 127; quantized value = round(W / scale). At inference: dequantize on-the-fly during the GEMM, keeping activations in BF16. Per-channel scaling (one scale per output neuron) dramatically improves accuracy over per-tensor.

LLM.int8() (Dettmers et al.): handles outlier activations by keeping a small fraction of multiplications in FP16, mixing precision within the same layer.

**INT4 (GPTQ and AWQ) — Pushing the Limits**
- GPTQ: post-training quantization using second-order gradient information to compensate for quantization error layer-by-layer
- AWQ (Activation-aware Weight Quantization): protects the ~1% of weights that correspond to large activations; 4-bit with near-BF16 quality on most models
- Practical: INT4 with groupsize=128 (one scale per 128 weights) is the current sweet spot for quality/compression

---

## Module 7 — The KV Cache — Trading Memory for Speed
*How caching past computations makes autoregressive decode feasible*

**Why the KV Cache Exists**
At decode step T, attention requires keys and values for all T previous tokens. Without caching: recompute all T−1 K/V tensors every step — O(T²) total work. With KV cache: compute K/V for the new token only, append to cache, attend over the full cache — O(T) total work per step.

KV cache size per token: `2 × num_layers × num_heads × head_dim × bytes_per_element`
For Llama-3 70B (BF16): 2 × 80 × 8 × 128 × 2 = 327 KB per token. At 4K context: ~1.3 GB per request.

At 50 concurrent requests with 4K context: 65 GB KV cache — nearly the entire H100's VRAM. This is the primary concurrency constraint.

**PagedAttention — Virtual Memory for KV Cache**
vLLM's PagedAttention applies OS virtual memory paging to KV cache:
- KV cache divided into fixed-size pages (blocks of K, typically 16 tokens)
- A page table maps logical token positions to physical GPU memory blocks
- Pages allocated on demand; freed when a request completes
- Benefit: near-zero internal fragmentation, enables 2–4× more concurrent requests vs pre-allocated contiguous KV buffers
- Enables KV cache sharing across requests with common prefixes (system prompt caching)

---

## Module 8 — Batching and Scheduling — Keeping the GPU Busy
*How serving systems turn the single-request bottleneck into high throughput*

**Static vs Continuous Batching**
| | Static Batching | Continuous Batching |
|---|---|---|
| Batch composition | Fixed at request start | Dynamic — requests join/leave mid-generation |
| GPU utilization | Low (batch waits for slowest request) | High (GPU always has work) |
| Latency | Unpredictable (padding waste) | More predictable |
| Implementation | Simple | Complex (iteration-level scheduling) |

Continuous batching (used by vLLM, TGI, TensorRT-LLM): at every decode step, the scheduler can evict completed requests and insert new ones. GPU utilization goes from ~30–40% (static) to ~70–80%.

**Speculative Decoding — Guessing Ahead**
Problem: decode is sequential — you can't parallelize generating token T+1 until you have token T. Speculative decoding breaks this:

1. A small draft model (e.g. 7B) generates K candidate tokens cheaply and in parallel
2. The large target model (e.g. 70B) verifies all K tokens in a single forward pass (parallel = fast)
3. Accept the longest prefix of tokens the target model agrees with; reject the rest
4. Net result: 2–3× decode throughput with identical output distribution (mathematically guaranteed)

Effective when draft model acceptance rate is high (>70%) — works best for predictable continuations (code, structured text).

---

## Module 9 — Multi-GPU Inference — Scaling Beyond One Card
*How to fit 70B+ models and serve them fast across multiple GPUs*

**Tensor Parallelism — Splitting Layers Across GPUs**
Each matrix multiplication is split column-wise (or row-wise) across N GPUs. Each GPU holds 1/N of every weight matrix and computes 1/N of the output. After each layer, an AllReduce over NVLink sums the partial results.

- Splits within a layer — all GPUs work on every token simultaneously
- Requires fast interconnect: NVLink 4.0 at 900 GB/s bidirectional; PCIe (128 GB/s) is too slow for TP at scale
- Scaling: 8-way TP on H100 SXM (NVLink) reduces decode latency ~6–7× (not 8× due to AllReduce overhead)
- Used when: a single model layer doesn't fit in one GPU's VRAM, or you need minimum latency

Tensor Parallelism diagram:
```
GPU 0: W[:, :d/2]  →  partial output 0 ─┐
GPU 1: W[:, d/2:]  →  partial output 1 ─┤─ AllReduce (NVLink) → full output
```

**Pipeline Parallelism — Splitting by Layers**
Different GPUs hold different layers. A request flows sequentially through GPUs: GPU 0 runs layers 0–19, GPU 1 runs layers 20–39, etc. Micro-batching fills the pipeline to hide the bubble (idle time while waiting for the previous stage).

- Splits across layers — each GPU holds a complete layer subset
- Lower interconnect bandwidth requirement (only activations between adjacent GPUs, not AllReduce)
- Higher latency than TP (pipeline depth adds to per-request latency)
- Used when: model is too large to fit in memory even per-layer, or cost > latency is the priority

**When to combine them:**
Large deployments (GPT-4 class, 8+ GPUs) use both: TP within a node (NVLink), PP across nodes (InfiniBand/Ethernet). The combination is called "3D parallelism" when data parallelism (replicas) is also included.

---

## Module 10 — End-to-End Request Trace
*A single request, from HTTP to token, with exact timings on H100*

**Full Lifecycle of a Chat Request**

```
[Client]  HTTP POST /v1/chat/completions
    ↓  network (~1ms)
[Load Balancer / Router]  select least-loaded GPU worker
    ↓  ~0.5ms
[Tokenizer]  text → token IDs  (CPU, ~0.1ms)
    ↓
[Scheduler]  assign to batch, allocate KV cache pages  (~0.5ms)
    ↓
[PREFILL]  forward pass over full prompt
           H100 compute: ~3,500 tok/s → 100-token prompt ≈ 29ms
           bottleneck: compute (Tensor Cores fully utilized)
    ↓
[KV CACHE]  store K/V tensors for all prompt tokens  (~1ms write)
    ↓
[DECODE LOOP]  repeat until stop condition:
    - 1 forward pass (new token only, attend over KV cache)
    - H100: ~10 tok/s for 70B BF16 → ~100ms/token
    - bottleneck: HBM bandwidth (reading 140GB weights per step)
    - stream token to client via SSE
    ↓
[DETOKENIZER]  token IDs → text  (CPU, ~0.1ms)
    ↓
[Client]  receives streamed response
```

**Typical latency breakdown (70B BF16, 100-token prompt, 200-token output, H100 SXM):**
| Phase | Time |
|---|---|
| Network + routing | ~2ms |
| Tokenization + scheduling | ~1ms |
| Prefill (100 tokens) | ~30ms |
| Decode (200 tokens at 100ms/tok) | ~20,000ms |
| **Total (time to last token)** | **~20 seconds** |
| Time to first token (TTFT) | ~33ms |

Decode dominates. Every optimization that reduces decode time (quantization, speculative decoding, continuous batching, KV cache efficiency) directly improves the user-visible latency.
