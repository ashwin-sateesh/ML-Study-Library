# Production Agent Infrastructure — Course Reference

**9 chapters** · Enterprise-grade deployment of multi-agent systems · Covers every component from edge to disaster recovery, with exact timings, code, and architecture decisions

---

## VOCABULARY (Ch. 0)

**Ch. 0 — Infrastructure Vocabulary**
Every term from scratch — containers, Kubernetes objects, networking, databases, resilience patterns, observability, CI/CD, and agent-specific terms. 40+ definitions across six categories, each explained at the level of "explain it to someone who has never deployed anything."

- Containers & Orchestration: Container, Docker Image, Container Registry, Kubernetes, OpenShift, Pod, Deployment, Service, Ingress/Route, ConfigMap, Secret, HPA, DaemonSet, CronJob, Init Container, Sidecar Container
- Networking & Security: L4 vs L7, TLS, TLS termination, mTLS, Certificate (public vs internal), JWT, OIDC, DDoS, DMZ
- Databases & Caching: PostgreSQL, pgvector, Redis, Cache-Aside Pattern, TTL
- Resilience Patterns: Circuit Breaker (3-state machine), Exponential Backoff with Jitter, Idempotency Key, Dead Letter Queue, Graceful Degradation
- Observability: OpenTelemetry, Trace, Metric, Span, Prometheus, Grafana, Tempo, Loki, Alloy, Langfuse
- CI/CD: CI, CD, Canary Deployment, Rolling Update, Harness
- Agent-Specific: LLM Gateway, MCP, ReAct, LangGraph

---

## INFRASTRUCTURE (Ch. 1–2)

**Ch. 1 — Enterprise Architecture — Every Component and Why It Exists**
Maps every component in the production stack, explains why it exists, and shows how they connect. Running example: banking customer service agent on OpenShift.

- Full architecture diagram: Client → External LB (F5, DDoS/TLS) → Internal LB (K8s Ingress, L7 routing) → API Gateway (FastAPI, 6-step pipeline) → Agent Pods (LangGraph, stateless, HPA) → LLM Gateway (LiteLLM) → Tool APIs (MCP) → State Store (PostgreSQL + Redis)
- Two-tier load balancing: external (F5/Akamai — DDoS, TLS termination, IP whitelist, geographic routing) + internal (K8s Ingress — L7 path routing, health checks)
- API Gateway 6-step pipeline: JWT validation → Rate limiting (Redis sliding window) → Request validation (Pydantic) → Trace ID (OTel) → Audit log (async) → Forward to agent
- Agent pods: stateless, 500m CPU / 1Gi memory, 80–160 concurrent requests, HPA on `http_requests_in_flight` (not CPU)
- LLM Gateway as separate service: 5 reasons (rate limit aggregation, circuit breakers, budget enforcement, provider abstraction, compliance logging)
- MCP tool architecture: dynamic discovery at startup, per-tool credentials via Vault, principle of least privilege
- State store: PostgreSQL (source of truth) + Redis (cache), cache-aside pattern, why write order matters (PG first → Redis second)
- Technology comparison table: why PostgreSQL over MongoDB, pgvector over Pinecone, Redis over Memcached, MCP over hardcoded tools, FastAPI over Flask
- Health check contract: what /healthz checks (PG, Redis, LangGraph, DistilBERT) and what it does NOT check (MCP tools, LLM providers)

**Ch. 2 — The Complete Request Flow — End-to-End with Timings**
Traces a single request from browser to response through every layer with millisecond-level timing at each hop.

- Example: Priya asks "What's the current balance for account 12345?"
- Step-by-step trace: authentication (JWT via Keycloak) → External LB (+5ms) → Internal LB (+2ms) → Gateway 6-step pipeline (+8ms) → Agent pod: hydrate state (+9ms, Redis miss → PG) → DistilBERT intent classify (+2ms) → RAG retrieval (skipped) → Construct prompt (+1ms) → LLM call #1 via gateway (+2,500ms, tool_call response) → MCP tool call (+300ms) → LLM call #2 (+2,000ms, text response) → PII scan (+5ms) → Dual write (+10ms) → Response return (+3ms)
- Total: ~4,845ms. LLM calls = 93% of total time. Tool call = 6%. Everything else = 1%.
- Complete observability capture: 15 spans (Tempo), 6 metrics updated (Prometheus), 12 log lines (Loki), 2 LLM traces (Langfuse), 1 audit row (PostgreSQL)
- Debugging workflow: latency spike → exemplar trace → Tempo waterfall → Loki logs → root cause

---

## STATE & ORCHESTRATION (Ch. 3–4)

**Ch. 3 — Multi-Agent State Management**
The single shared state dictionary — how it flows, how it grows, how it persists, and how checkpointing enables crash recovery.

- ONE state dictionary (Python TypedDict), not separate states per agent. All agents in ONE pod, ONE process
- LangGraph merge: nodes return partial updates, LangGraph does `dict.update()` — existing fields never removed
- State growth traced step-by-step: 2 KB (init) → 2.1 KB (supervisor) → 4.5 KB (tool agent) → 4.6 KB (guardrails). Garbage collected after response sent.
- In-memory state vs persisted state: working copy (3–6 seconds in RAM) vs saved copy (PostgreSQL + Redis, months/years). Sync at request start (hydrate) and end (persist).
- Normal persistence: messages table — individual rows (user, tool_call, tool_result, assistant) written ONCE at end of request
- Checkpointing: checkpoints table — full state JSON blob written 2–3 times DURING request after expensive steps (RAG, tool calls, LLM calls). NOT after fast steps (PII scan).
- Crash recovery: new pod loads checkpoint → deserializes full state → resumes from last completed step. Idempotency keys prevent duplicate tool calls.
- CronJob cleanup: nightly at 3 AM, deletes checkpoints older than 24 hours

**Ch. 4 — Routing & Orchestration — The Two-Loop Architecture**
The outer loop routes between sub-agents (supervisor LLM). The inner loop decides which tool to call (sub-agent ReAct). Two different mechanisms, nested.

- Outer loop (supervisor): Claude Haiku (~150ms), called BETWEEN every sub-agent, sees query + completed results, can change plan dynamically based on actual results
- Why LLM for routing (not if/else): supervisor needs to understand MEANING of results — "balance is $0, skip discount" requires reasoning, not flag-checking
- Inner loop (ReAct per sub-agent): each sub-agent's own LLM with scoped tools only. Reason → Act (tool_call) → Observe → Reason again. Exits when LLM returns text instead of tool_call. Safety limit: max 5 iterations.
- Tool scoping: account agent sees ONLY account tools, RAG agent sees ONLY RAG tools. Security boundary + less LLM confusion.
- LangGraph code: conditional edges create both loops. `add_edge("account_agent", "supervisor")` creates the outer loop return. `add_conditional_edge("acct_llm", check_response, {"tool_call": "acct_tool", "final_answer": "acct_done"})` creates the inner loop.
- Hub-and-spoke pattern: every sub-agent returns to supervisor after completing. Supervisor is always the hub.
- Dynamic plan changes: supervisor re-evaluates after every sub-agent. Balance is $0 → skip discount. RAG finds no policy → adjust notification. Tool fails → route to error handler.
- Cost analysis: supervisor calls ~$0.004 total (Haiku). Sub-agent calls ~$0.03–0.05 total (Sonnet). Supervisor overhead: ~10% of cost, ~8% of latency.
- Optimization: DistilBERT for simple intents (80% of traffic), full supervisor LLM only for complex compound intents (20%)

---

## DEPLOYMENT (Ch. 5)

**Ch. 5 — CI/CD & Deployment Lifecycle**
From empty cluster to production — Day 0 (manual bootstrap) and Day 1+ (fully automated pipeline).

- Day 0 bootstrap: Terraform (provision cluster, PG, Redis, registry, DNS, LB) → SQL migrations (5 tables) → K8s Secrets (from Vault) → First image build → Manual `kubectl apply` → Configure automation (CI triggers, Harness CD)
- Day 1+ automated pipeline: `git push` → webhook → CI (lint/mypy → unit tests → integration tests with mock LLM → build Docker image → Trivy security scan → push to registry) → CD (Harness: dev → staging with smoke tests → prod canary 5% → continuous verification 10 min → ramp 100% or auto-rollback)
- What Harness does to K8s: updates image field in existing Deployment (v1.2.0 → v1.3.0). Kubernetes does rolling update: create new pod → /healthz → ready → kill old pod. Zero downtime.
- Independent deployments: gateway, agent, LLM gateway, each tool service — all separate pipelines. Updating account-tools does NOT require redeploying the agent.
- Database migrations: init-containers. Must be backward-compatible (add columns, never rename/drop) for canary coexistence.
- Config vs code vs secret changes: code = full CI/CD (~35 min). Config (system prompt, model, MCP URLs) = ConfigMap update + pod restart (~30 sec). Secret = Vault sync, zero-downtime.

---

## SCALING (Ch. 6)

**Ch. 6 — Scaling & Capacity Planning — 10 Users to 2 Million**
Auto-scaling (seconds, automatic) vs capacity planning (weeks/months, manual). Both necessary.

- What auto-scales: gateway pods, agent pods, tool pods (HPA), K8s nodes (Cluster Autoscaler). What does NOT: Redis, PostgreSQL write scaling, LLM provider rate limits, observability stack.
- Stage 1 (10–50K users): single region, auto-scaling handles it. Bump HPA maxReplicas and node pool as trends grow.
- Stage 2 (50K–200K): optimize single region before going multi-region. PgBouncer (5–10× more pods sharing DB), LLM response caching (15–30% fewer LLM calls), PG read replicas (3–5× read throughput), table partitioning (10× query speed), aggressive Redis caching.
- Stage 3 (200K–2M): multi-region active-active. Identical K8s clusters in us-east-1 + us-west-2. Route 53 latency-based routing, failover < 60s. PG streaming replication, Redis cross-region sync.
- Prometheus alerts for capacity: HPA hitting maxReplicas (days), nodes > 80% (hours), PG connections > 80% (days–weeks), LLM rate limit > 70% (weeks), p95 latency increasing (months).
- Latency optimization playbook (ranked by impact): parallel agent execution (-2–4s), right-size models (-1–2s), skip unnecessary LLM calls (-1–2s), reduce prompt tokens (-0.5–1s), LLM response caching (2s per hit), streaming (perceived -4s), RAG tuning (-100–200ms), tool optimization (-50–200ms). Combined: ~10s → ~4–5s.

---

## OBSERVABILITY (Ch. 7)

**Ch. 7 — Observability Internals**
Three independent pipelines (traces, metrics, logs) linked by trace_id, plus the complete evaluation metrics taxonomy.

- Three pipelines: OTel SDK → Collector sidecar → Tempo (traces) | Prometheus scrapes /metrics (metrics) | Alloy DaemonSet → Loki (logs) | Langfuse (LLM traces) | PostgreSQL (audit)
- Auto-instrumented spans: FastAPI (HTTP), httpx (outbound), SQLAlchemy (PG), Redis — zero manual code
- Manual spans: business logic (supervisor.classify_intent, rag_agent.retrieval, tool_agent.execute) with custom attributes
- Combined span tree: 35+ spans per multi-agent request, auto + manual in one Tempo waterfall
- Trace propagation: traceparent header injected automatically across all service-to-service HTTP calls
- Prometheus metrics catalog: 16 specific metrics across gateway (3), agent (4), LLM gateway (4), tools (2), K8s (3) — with types (counter/histogram/gauge) and what each tells you
- Structured logging: JSON to stdout with automatic trace_id injection via custom OTel formatter
- Debugging workflow: alert fires → Grafana metrics dashboard → exemplar trace_id → Tempo waterfall → Loki logs → root cause → fix

**The Three Metric Categories:**

*System Health Metrics — "Is the infrastructure running?"*
- p50/p95/p99 latency (histogram, target: p95 < 10s), error rate / 5xx (counter, target: < 0.5%), uptime/availability (target: 99.9%), cache hit rate (target: 85–95% conversation, 15–30% LLM response), throughput (requests/sec), token consumption rate, pod restart count

*AI Quality Metrics — "Is the intelligence correct?"*
- Faithfulness (RAGAS, reference-free, target: > 0.85), answer relevancy (RAGAS, reference-free, target: > 0.8), context precision (retrieval ranking quality, target: > 0.75), context recall (retrieval completeness, target: > 0.8), hallucination rate (LLM judge, target: < 5%), tool selection accuracy (vs gold-standard trajectory, target: > 90%), task completion rate (LLM judge + human review, target: > 85%), answer correctness (semantic + factual F1 composite), safety score (classifier, target: 99.9%+)

*Business Metrics — "Is the product working?"*
- Cost per task (LLM tokens + tools + infra, target depends on human-equivalent cost), user satisfaction / CSAT (thumbs up-down or 5-point scale, target: > 4.0/5), deflection rate (agent-resolved vs human-escalated, target: 70–85%), escalation rate (with "why" distribution), time to resolution (agent-only vs agent+human)

- Evaluation pipeline: 100% traces → Langfuse → 1–5% sampled → async RAGAS + LLM-as-judge + safety classifier + deterministic tool chain checks → scores to Langfuse + Grafana. Weekly: human review of bottom 10%.
- Eval tooling: RAGAS (RAG-specific), DeepEval (pytest-style CI assertions), LangSmith (LangChain ecosystem), Arize Phoenix (trace-linked eval), Braintrust (experiment tracking)
- Data flywheel: low-score trace → human review → root cause → fix → add to eval dataset → CI gate. Dataset grows 100 → 500 → 1000+ battle-tested cases. Regression structurally impossible.
- LLM-as-Judge: limitations (verbosity bias, non-deterministic, expensive). Mitigation: multiple runs + averaging, structured rubrics, combine with deterministic checks.

---

## WALKTHROUGH (Ch. 8)

**Ch. 8 — Wealth Management AI Advisory Platform**
Assembles every concept into one end-to-end example: 4-agent wealth management system with parallel execution.

- Use case: advisor Priya asks to rebalance client Rajesh's portfolio — requires portfolio lookup, market research, compliance check, and client email
- Four sub-agents: Portfolio Agent (get_holdings, get_allocation), Research Agent / RAG (search_market_outlook, pgvector), Compliance Agent (get_risk_profile, check_suitability), Communication Agent (draft_email, get_preferences)
- Parallel fan-out: portfolio + research run simultaneously (saves 2.8s). Compliance runs after (needs portfolio data). Communication runs last (needs everything).
- Complete timing: 10.2 seconds total. Sub-agent LLM calls (Sonnet): 79%. Supervisor calls (Haiku): 8%. Tool calls (MCP): 10%. Everything else: 2%.
- State growth: 2 KB (init) → 5 KB (portfolio) → 7 KB (research) → 8.5 KB (compliance) → 10 KB (communication + guardrails)
- Observability: 35+ spans, 6800+ tokens (Sonnet) + 520 (Haiku), 8 tool calls, cost: $0.042
- Five resilience scenarios: Claude outage (circuit breaker → GPT-4o, +4s), pod crash (checkpoint resume, +3s), portfolio DB down (partial result), Redis down (PG fallback, slightly slower), region failure (Route 53 failover < 60s)
- Cost: $0.042/request. At 50K requests/month: ~$2,100. Human advisor equivalent: impossible at this volume.
- Interview summary: requirements → architecture → key decisions (parallel fan-out, Haiku supervisor, tool scoping, checkpointing) → operational (3 observability pipelines, canary deployment, 5 resilience scenarios) → cost
- Complete tech stack reference table: Edge, Gateway, Agent, LLM, Tools, Data, Observability, CI/CD, DR — technology at every layer
