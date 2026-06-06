# Agentic ML System Design — Course Reference

**30 chapters** · Field manual for enterprise ML engineers · Covers design → build → test → deploy → operate

---

## FRONT MATTER

**Welcome** — How to use this book. Each chapter stands alone but cross-references assume you've read Foundations. If you're preparing for a system-design interview, read Ch. 28 first, then work the four walkthroughs.

---

## FOUNDATIONS (Ch. 1–4)

**Ch. 1 — What Makes an Agent an Agent**
The mechanical definition that actually matters for system design: an LLM deciding at runtime what to do next, in a loop. Covers the four components (LLM, tools, control loop, memory), the five-level agent taxonomy (Level 0 single call → Level 4 autonomous), and why the non-deterministic loop count is the root cause of every hard architectural problem in the book.

- An agent is four components: LLM, tools, control loop, memory
- Agent taxonomy: Level 0 (LLM call) → Level 1 (ReAct) → Level 2 (Plan-and-Execute) → Level 3 (Multi-Agent) → Level 4 (Autonomous)
- The asterisk is the point: non-deterministic iteration count drives every cost, latency, and reliability constraint

**Ch. 2 — LLM Mechanics That Drive Architecture**
Three mechanical facts that determine cost and latency more than any prompt: two-phase inference (prefill vs decode), the finite context window as a budget, and tool use as a structured contract. Includes model-tier routing and why an agent loop multiplies decode cost.

- Two-phase inference: prefill (compute-bound) vs decode (memory-bandwidth-bound)
- Context window strategies: sliding window, summarization, selective retention — each with trade-offs
- Tool selection accuracy degrades past ~15 tools; use a router to narrow to 5–10 per query
- Model-tier routing: match task complexity to model cost (frontier / mid-tier / fast)

**Ch. 3 — Context Engineering**
Curating the entire information environment the model reasons inside — not just prompt wording but what to include, exclude, order, and compress. Most agent failures are context failures, not model failures.

- Four failure modes: overflow, staleness, contradiction, distraction
- Operator toolkit: Write, Select, Compress, Isolate
- Five dimensions: relevance, recency, density, position, cache alignment
- Keep static prefix byte-for-byte stable — one changed character before the cache boundary triples prefill cost

**Ch. 4 — Harness Engineering**
Everything surrounding the agent: linters, tests, guardrails, project rules, feedback loops, audit logs. The agent is the engine; the harness is the chassis, seatbelts, and crash barriers.

- Six harness components: input validator, output validator, tool sandbox, iteration budget, error handler, audit logger
- Models cannot reliably evaluate their own work — external deterministic validation is non-negotiable
- Three layers: pre-call (linting), post-call (validation), async (eval + improvement loop)
- In interviews: name all four — what validates, what catches errors, what improves over time, what audits

---

## DESIGN (Ch. 5–9)

**Ch. 5 — Agent Patterns — All Five**
The five patterns that cover the overwhelming majority of production agents, with control-flow diagrams, stopping conditions, and the token cost of each step up from plain ReAct.

- ReAct: Thought → Action → Observation loop; stopping conditions: natural exit, max iterations (~25), token budget, timeout (~120s), 3 consecutive errors
- Plan-and-Execute: planner (smart model) writes plan; executor (cheaper model) runs steps; replanner adjusts
- Reflection / Self-Critique: agent produces → critic evaluates → revise if flawed (cap at 2–3 iterations)
- Evaluator-Optimizer: doer produces → evaluator scores → optimizer adjusts → retry
- Multi-Agent: supervisor, hierarchical, or swarm topology

**Ch. 6 — Multi-Agent Systems**
When to use multi-agent (and when not to). Context isolation is the real win; coordination is the real cost. Covers four topologies, two communication models, five graph patterns, and the ~15× token multiple you pay for parallelism.

- Four topologies: supervisor (orchestrator-worker), hierarchical, sequential pipeline, swarm
- Two handoff models: agent-as-tool (synchronous) vs direct handoff (async)
- Communication models: shared state, message passing, blackboard
- Five graph patterns: sequential, parallel fan-out/fan-in, conditional branch, loop, map-reduce
- Canonical example: Anthropic research system — lead decomposes, sub-agents search in parallel, lead synthesizes

**Ch. 7 — Memory Systems**
Four memory types across three time horizons, five memory operations, and how memory becomes a threat surface for poisoning and privacy violations.

- Three time horizons: in-context (ephemeral), external short-term (session), external long-term (persistent)
- Long-term sub-types: episodic, semantic, procedural, user preferences
- Five operations: store, retrieve, update, forget, summarize
- Storage backends: vector DB (semantic search), relational (structured facts), key-value (fast lookup), graph (relationships)
- Framework landscape: Mem0 (managed layer), Letta/MemGPT (OS-style paging), Zep (temporal graph), LangMem (LangGraph primitives)
- Memory poisoning: treat writes as untrusted, validate extracted facts, strict tenant isolation

**Ch. 8 — RAG at Enterprise Scale**
From "embed, search, stuff" to a full hybrid pipeline with query rewriting, fusion, reranking, and RAGAS evaluation. Most production RAG failures trace to retrieval, not generation.

- Full pipeline: query rewriting (HyDE, expansion, decomposition) → hybrid retrieval (BM25 + vector) → fusion → cross-encoder reranking → context assembly → generation
- Chunking strategies: fixed-size, sentence-boundary, semantic, hierarchical — each with trade-offs
- Indexing pipeline: Sources (Confluence, S3) → CDC/batch → parse & clean → chunk → embed → store (pgvector + BM25)
- RAGAS metrics: context recall (retriever) vs faithfulness (generator) — low recall = fix chunking; good recall but low faithfulness = fix prompt

**Ch. 9 — MCP & A2A — The Interoperability Protocols**
MCP standardizes agent-to-tool communication (vertical); A2A standardizes agent-to-agent communication (horizontal). Complementary, not competing.

- MCP solves M×N → M+N: one server exposes tools/resources/prompts; any host connects via the protocol
- MCP lifecycle: initialize (capability handshake) → discover → invoke → shutdown
- MCP risks: tool poisoning, prompt injection through resources, confused-deputy, token theft; remote servers must use OAuth 2.1
- A2A concepts: Agent Card (capability advertisement), Task, Artifact, push/pull updates
- Mental model: MCP is vertical (agent→tools); A2A is horizontal (agent↔agent as equals, internal opaque)

---

## ENGINEERING (Ch. 10–14)

**Ch. 10 — Prompt Engineering for Agents**
Writing the operating manual for an autonomous worker, not a clever question. Precision and few-shot trajectories matter more than eloquence.

- System prompt anatomy: identity, scope, tools (with *when* to use each), output format, constraints, worked examples
- Highest-leverage technique: 2–5 few-shot trajectories showing full Thought → Action → Observation → Response — the model imitates the shape of good reasoning
- Techniques: chain-of-thought, self-consistency, structured outputs, meta-prompting
- Prompts are code: version-control them, review them, enforce them with evals

**Ch. 11 — Orchestration & State Management**
An agent is a long-running, stateful, occasionally-crashing process. The orchestration layer makes it durable: holds state, drives transitions, survives restarts, enables human-in-the-loop.

- Graphs, not chains: conditional branching, loops, and parallel fan-out require a graph framework (LangGraph, Temporal)
- State design: what lives in the graph vs external store vs context window
- Checkpointing: persist state to DB so any pod can resume; enables interrupt-and-resume
- Human-in-the-loop patterns: interrupt-for-approval, interrupt-for-correction, async review with timeout

**Ch. 12 — Error Handling & Resilience**
A stack of layers, each catching what the above missed. The deepest layer — feeding errors back to the model for self-repair — is unique to agents.

- Resilience stack: idempotent tool calls → retry with exponential backoff → fallback tools → model self-repair → graceful degradation → human escalation
- Failure taxonomy: tool errors (transient/permanent), model errors (hallucination, refusal, format), orchestration errors (timeout, budget), external errors (API down)
- Beware the error loop: model gets vague error, retries identically, burns iteration budget — return specific, actionable errors and count consecutive errors as a hard stop

**Ch. 13 — Infrastructure**
Long-running workloads that fan out to expensive external APIs, scaled on concurrency not CPU.

- Architecture: Client → L7 Load Balancer → API Gateway (auth, rate limit) → Agent Pods (stateless) → [Postgres + Redis + LLM Gateway + Vector DB + Tool APIs]
- Three rules: stateless pods (state lives in Postgres/Redis), not serverless (agents run 30s+, cold starts kill streaming), LLM gateway centralizes routing/rate-limiting/cost
- API surface: synchronous REST (short tasks), streaming SSE (user-facing), async webhook (long-running background)

**Ch. 14 — Deployment Patterns**
A prompt change can silently halve quality while every infra dashboard stays green. Agent deployment monitors quality, not just operational health.

- Quality-gated canary: route 5% traffic to new version → measure eval scores → promote or rollback
- Three patterns: blue-green (instant cutover), canary (gradual quality-gated), shadow (parallel run, no user impact)
- Automated rollback triggers: completion rate ↓5%, hallucination ↑2%, cost ↑30%, error rate over SLA
- Operational rules: pin model versions explicitly; A/B test prompts on outcomes (resolution rate), not vibes

---

## SECURITY (Ch. 15–17)

**Ch. 15 — Security — Threat Model & Defences**
The agent as an adversarial surface. The lethal trifecta plus defence-in-depth across six layers.

- Lethal trifecta: tool access + external data reads + user-controlled input — together they enable full prompt injection chains
- Two injection types: direct (user input) and indirect (content retrieved from external sources)
- Six defence layers: input sanitization, output validation, tool sandboxing, least-privilege tool permissions, content security policy for retrieved data, audit logging
- OWASP LLM Top 10 and Agentic AI Top 10 — know both lists

**Ch. 16 — Authentication, Authorization & Multi-Tenancy**
Zero-trust agent identity and four isolation layers so one tenant can never touch another's data.

- Zero-trust: every agent call carries a signed identity token; no implicit trust from being "inside the perimeter"
- Four isolation layers: network (VPC), data (row-level security), compute (separate pods per tenant), audit (per-tenant logs)
- Change control by component: model updates, prompt updates, tool updates, infra updates — each has its own approval gate

**Ch. 17 — Governance & Compliance**
The frameworks you will be measured against in enterprise deals: GDPR, CCPA, SOC 2, EU AI Act.

- Data lineage: every retrieved document traceable to its source and the agent run that used it
- Right to erasure: agent memory must be attributable and deletable per user on request
- Audit trail: immutable log of every tool call, every model invocation, every decision

---

## QUALITY (Ch. 18–20)

**Ch. 18 — Evaluation & Testing**
The testing pyramid applied to agents, with the trace as the unit of truth.

- Testing pyramid: unit (tool mocks) → integration (component handoffs) → end-to-end (full traces against golden datasets)
- Offline vs online evaluation: offline = eval harness on curated datasets; online = production sampling + human review
- LLM-as-Judge: powerful but biased — calibrate against human labels, use structured rubrics, never trust raw scores
- Component metrics: retrieval (recall@K, MRR), generation (faithfulness, answer relevance), end-to-end (task completion rate, trajectory efficiency)
- CI/CD for agents: eval suite runs on every PR; merge gates on score regression

**Ch. 19 — Agent Benchmarks**
Standard benchmarks and what they actually measure (and miss) for production readiness.

**Ch. 20 — Observability**
The trace is the unit of truth. Four pillars of agent observability: traces, metrics, logs, evals.

- Trace a full agent run: every LLM call, tool call, and state transition as a linked span
- Key metrics: token consumption per run, iteration count distribution, tool error rates, cost per session
- Eval integration: run lightweight eval checks on sampled production traces; feed failures back to the eval suite

---

## OPTIMIZATION (Ch. 21–23)

**Ch. 21 — Cost Optimization & Caching**
Token economics and five levers, plus a four-layer caching stack.

- Five levers: model routing (right-size the model), context compression, prompt caching, result caching, batch processing
- Caching stack: prompt cache (provider-side) → semantic cache (embedding similarity) → result cache (exact-match KV) → tool-output cache (memoize expensive tool calls)
- Token economics: frontier tokens cost ~100× fast tokens; routing 60% of traffic to a fast model can cut cost by 50–70%

**Ch. 22 — Latency Optimization**
Where the time goes and the MAPE loop for continuous improvement.

- Time breakdown: network + prefill + decode × N iterations + tool round-trips
- Highest-leverage levers: reduce iteration count (better prompts/tools), streaming (perceived latency), speculative decoding, parallel tool calls
- MAPE loop: Measure → Analyze → Plan → Execute, continuously

**Ch. 23 — The Data Flywheel**
Using production agent traces to improve the system over time: retrieval, prompts, models, and tools.

---

## WALKTHROUGHS (Ch. 24–27)

Full end-to-end system designs. Each walkthrough covers: requirements, architecture diagram, component decisions, failure modes, cost estimate, and eval strategy.

**Ch. 24 — Project: Customer-Support Agent**
Tier-1 ticket routing and resolution. ReAct agent with CRM tool, KB retrieval, escalation path, and human-in-the-loop for edge cases.

**Ch. 25 — Project: Contract-Analysis Pipeline**
Multi-step document intelligence. Plan-and-Execute with specialized extraction agents, cross-encoder reranking over clause chunks, and structured output validation.

**Ch. 26 — Project: Security-Operations Triage Agent**
High-stakes, low-latency SOC alert triage. Supervisor + specialist sub-agents, strict tool sandboxing, immutable audit trail, zero-trust identity.

**Ch. 27 — Project: Distributed Research System**
Long-horizon research synthesis. Lead agent decomposes query → parallel sub-agents search → lead synthesizes. The canonical ~15× token-multiple trade-off, justified by research quality over cost.

---

## INTERVIEW (Ch. 28–30)

**Ch. 28 — The System-Design Interview Framework**
A 45-minute clock with six phases and twelve mistakes that sink otherwise strong candidates. Read this chapter first if you're interview-prepping; use the walkthroughs as practice runs.

**Ch. 29 — The Architecture Decision Flowchart**
A decision tree for the most common agent design choices: single vs multi-agent, retrieval strategy, memory type, model tier, deployment pattern.

**Ch. 30 — Technology Stack Reference**
Opinionated defaults across every layer: orchestration, memory, retrieval, vector DB, LLM gateway, observability, deployment.
