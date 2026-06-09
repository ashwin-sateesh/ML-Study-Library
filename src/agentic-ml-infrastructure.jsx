import { useState, useEffect, useRef, useCallback } from "react";

const CHAPTERS = [
  { id: "ch0", title: "Infrastructure Vocabulary", section: "VOCABULARY" },
  { id: "ch1", title: "Enterprise Architecture", section: "INFRASTRUCTURE" },
  { id: "ch2", title: "The Complete Request Flow", section: "INFRASTRUCTURE" },
  { id: "ch3", title: "Multi-Agent State Mgmt", section: "STATE & ORCHESTRATION" },
  { id: "ch4", title: "Routing & Orchestration", section: "STATE & ORCHESTRATION" },
  { id: "ch5", title: "CI/CD & Deployment", section: "DEPLOYMENT" },
  { id: "ch6", title: "Scaling & Capacity", section: "SCALING" },
  { id: "ch7", title: "Observability Internals", section: "OBSERVABILITY" },
  { id: "ch8", title: "Wealth Mgmt Walkthrough", section: "WALKTHROUGH" },
];

const SECTION_COLORS = {
  VOCABULARY: "#f59e0b",
  INFRASTRUCTURE: "#60a5fa",
  "STATE & ORCHESTRATION": "#a78bfa",
  DEPLOYMENT: "#4ade80",
  SCALING: "#f472b6",
  OBSERVABILITY: "#38bdf8",
  WALKTHROUGH: "#fb923c",
};

function Lead({ children }) {
  return <p className="lead">{children}</p>;
}
function PullQuote({ children, cite }) {
  return (<blockquote className="pullquote"><span className="pq-mark">"</span><span className="pq-text">{children}</span>{cite && <cite>— {cite}</cite>}</blockquote>);
}
function Aside({ title = "In the margin", children }) {
  return (<aside className="aside"><div className="aside-label">{title}</div><div className="aside-body">{children}</div></aside>);
}
function Def({ term, children }) {
  return (<div className="def"><span className="def-term">{term}</span><span className="def-body">{children}</span></div>);
}
function Code({ children, lang }) {
  return (<pre className="code">{lang && <div className="code-lang">{lang}</div>}<code>{children}</code></pre>);
}
function Diagram({ children, title, fig }) {
  return (<figure className="figure">{(title || fig) && (<figcaption className="fig-cap">{fig && <span className="fig-num">Figure {fig}</span>}{title && <span className="fig-title">{title}</span>}</figcaption>)}<pre className="diagram">{children}</pre></figure>);
}
function Table({ headers, rows, caption }) {
  return (<figure className="table-wrap">{caption && <figcaption className="fig-cap"><span className="fig-title">{caption}</span></figcaption>}<table className="book-table"><thead><tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => (<tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>))}</tbody></table></figure>);
}
function Callout({ type, children }) {
  const labels = { key: "Key Concept", warn: "Take Note", danger: "Caution", tip: "Practical Tip" };
  return (<div className={`callout callout-${type}`}><div className="callout-label">{labels[type]}</div><div className="callout-body">{children}</div></div>);
}
function FlowBox({ items, color = "#60a5fa" }) {
  return (<div className="flow">{items.map((item, i) => (<span key={i} className="flow-step"><span className="flow-pill" style={{ borderColor: color, color }}>{item}</span>{i < items.length - 1 && <span className="flow-arrow">→</span>}</span>))}</div>);
}

// ═══════════════════════════════════════════════════════════════
// CHAPTER 0: INFRASTRUCTURE VOCABULARY
// ═══════════════════════════════════════════════════════════════

function Ch0() {
  return (<>
    <h1>Infrastructure Vocabulary — Every Term From Scratch</h1>
    <Lead>Before you can design a production agent system, you need to speak the language of the infrastructure it runs on. This chapter defines every term — from containers to circuit breakers — at the level of "explain it to someone who has never deployed anything." If you already know Kubernetes, skim the table and move on. If these terms are new, read every definition — they appear in every chapter that follows.</Lead>

    <h2>Containers & Orchestration</h2>
    <p>These are the building blocks of how your agent code actually runs on servers.</p>

    <Def term="Container">A lightweight, isolated package that contains your application code, its dependencies (Python, pip packages), and a minimal operating system. Think of it as a shipping container: no matter what ship (server) carries it, the contents are the same. Unlike a virtual machine (which emulates an entire computer), a container shares the host's OS kernel and starts in milliseconds. Your agent's FastAPI app, LangGraph code, and all Python libraries are packaged into one container image.</Def>

    <Def term="Docker Image">The blueprint for a container. A Dockerfile describes how to build it: start with a Python 3.11 base, copy your source code, install pip dependencies, set the startup command. The image is immutable — once built, it never changes. You build it once in CI, push it to a registry, and every server that runs it gets the exact same environment. Image v1.3.0 behaves identically whether it runs on your laptop, in staging, or in production.</Def>

    <Def term="Container Registry">A storage service for Docker images, like a library for container blueprints. When CI builds a new image, it pushes to the registry (e.g., Amazon ECR, Harbor, Docker Hub). When Kubernetes needs to create a pod, it pulls the image from the registry. The registry stores every version — you can always roll back to v1.2.0 if v1.3.0 has a bug.</Def>

    <Def term="Kubernetes (K8s)">An orchestration platform that manages containers across a cluster of servers. You tell Kubernetes "I want 5 copies of my agent running" and it handles: which servers to put them on, restarting them if they crash, scaling up if traffic increases, routing network traffic to them, and rolling out new versions without downtime. You interact with K8s by writing YAML files that describe your desired state, and K8s continuously works to make reality match your description.</Def>

    <Def term="OpenShift">Red Hat's enterprise distribution of Kubernetes. It adds: built-in container registry, stricter security defaults (pods run as non-root by default), an integrated CI/CD pipeline, and the OpenShift Router (HAProxy-based ingress). When we say "OpenShift" in this course, mentally substitute "Kubernetes with enterprise features." Everything K8s does, OpenShift does — plus extras.</Def>

    <h2>Kubernetes Objects — The Building Blocks</h2>
    <p>Kubernetes uses YAML files to describe what you want. Each YAML file creates a "K8s object" — a record in the cluster's database describing a desired state. Here are the ones that matter for agent infrastructure:</p>

    <Def term="Pod">The smallest deployable unit in Kubernetes. A pod contains one or more containers that share the same network (localhost) and can share filesystem volumes. Your agent pod typically has one main container (your FastAPI app) and 1-3 sidecar containers (OTel collector, Vault agent, Envoy proxy). When we say "agent pod," we mean the pod that runs your agent application. Pods are ephemeral — they're created, they run, they die. New pods replace dead ones automatically.</Def>

    <Def term="Deployment">A K8s object that manages a set of identical pods. You write a Deployment YAML saying "I want 5 replicas of my agent image v1.3.0 with these resource limits." Kubernetes creates 5 pods. If one crashes, the Deployment controller creates a replacement. If you change the image to v1.4.0, the Deployment does a rolling update — creating new pods and killing old ones gradually so there's zero downtime. The Deployment is what's permanent; pods come and go.</Def>

    <Def term="Service">A K8s object that gives a stable network endpoint to a set of pods. Pods have random IP addresses that change every time they restart. A Service provides one fixed internal DNS name (e.g., agent-service.namespace.svc.cluster.local) that load-balances across all healthy pods in the Deployment. When the gateway calls the agent service, it calls this DNS name — it never needs to know which specific pod handles the request.</Def>

    <Def term="Ingress / Route">A K8s object that defines how external traffic enters the cluster and reaches internal Services. An Ingress rule says: "requests to /v1/agent should go to agent-service, requests to /v1/admin should go to admin-service." In OpenShift, this is called a Route. The Ingress Controller (a running pod — HAProxy, NGINX, or Envoy) reads these rules and does the actual routing.</Def>

    <Def term="ConfigMap">A K8s object that stores non-sensitive configuration as key-value pairs. Your agent's system prompt text, model settings, MCP server URLs, and feature flags go here. Mounted into pods as environment variables or files. Changing a ConfigMap doesn't require rebuilding the Docker image — you just update the ConfigMap and restart the pods.</Def>

    <Def term="Secret">Like a ConfigMap but for sensitive data — database passwords, API keys, TLS certificates. Stored encrypted in the K8s database. Referenced in pod specs via secretKeyRef so the value is injected as an environment variable at runtime. Never put secrets in code, ConfigMaps, or Docker images.</Def>

    <Def term="HPA (Horizontal Pod Autoscaler)">A K8s object that automatically adjusts the number of pod replicas based on a metric. You configure: "minimum 3 pods, maximum 20 pods, target 15 requests in flight per pod." When the average exceeds 15, HPA tells the Deployment to create more pods. When it drops below 5, HPA removes pods. This is how your agent infrastructure scales automatically with traffic.</Def>

    <Def term="DaemonSet">A K8s object that ensures one pod runs on every node (server) in the cluster. Used for infrastructure agents like Grafana Alloy (log collector) that need to run everywhere. When a new node is added to the cluster, the DaemonSet automatically puts a pod on it.</Def>

    <Def term="CronJob">A K8s object that runs a pod on a schedule — like a cron job on Linux. Used for maintenance tasks: cleaning up expired checkpoints, refreshing caches, generating reports. The pod runs, completes its task, and exits. Kubernetes creates a new pod at the next scheduled time.</Def>

    <Def term="Init Container">A container that runs before the main container starts and must complete successfully. Used for database migrations: the init container connects to Postgres, applies schema changes, then exits. Only then does the main agent container start. If the init container fails, the main container never launches — which is exactly the safety guarantee you want.</Def>

    <Def term="Sidecar Container">An additional container that runs alongside the main container in the same pod. Shares the same network (localhost) and can share filesystem volumes. Common sidecars: OTel collector (receives traces on localhost:4317), Vault agent (refreshes secrets into a shared volume), Envoy proxy (handles mTLS transparently). The main container is your code; sidecars are infrastructure helpers provided by the platform team.</Def>

    <h2>Networking & Security</h2>
    <p>How traffic gets from a user's browser to your agent pod, and how it stays secure along the way.</p>

    <Def term="L4 vs L7 (OSI Layers)">L4 (Layer 4, Transport) sees only IP addresses and port numbers — it forwards TCP packets blindly without reading their content. L7 (Layer 7, Application) understands HTTP — it can read URL paths, headers, cookies, and make routing decisions based on them. Your ingress controller must be L7 because it needs to route /v1/agent to one service and /v1/admin to another. An L4 load balancer could only say "all traffic on port 443 goes to one place."</Def>

    <Def term="TLS (Transport Layer Security)">The encryption protocol that makes HTTPS work. When Priya's browser connects to your API, TLS encrypts all data in transit so anyone intercepting the network traffic sees gibberish. TLS uses certificates to prove identity: the server presents its certificate to prove it's really agent-api.bank.com, and the client verifies this against a trusted Certificate Authority.</Def>

    <Def term="TLS Termination">The point where encrypted HTTPS traffic gets decrypted. The load balancer "terminates" TLS — it has the private key matching the certificate, so it can decrypt the traffic and read the HTTP content inside. This is necessary because the LB needs to read the URL path to make routing decisions.</Def>

    <Def term="mTLS (Mutual TLS)">Regular TLS: only the server proves its identity. mTLS: both sides prove identity. The server shows its certificate to the client, AND the client shows its certificate to the server. Used for internal service-to-service communication at banks. When the load balancer forwards to the K8s cluster, both sides verify each other's identity. This prevents a rogue machine on the internal network from impersonating a legitimate service.</Def>

    <Def term="Certificate">A digital file that proves identity, issued by a Certificate Authority (CA). External certificates (from DigiCert, Let's Encrypt) prove your server's identity to the public internet. Internal certificates (from the bank's private CA) prove identity between internal services. Think of external certificates as passports (recognized everywhere) and internal certificates as employee badges (only valid within the company).</Def>

    <Def term="JWT (JSON Web Token)">A self-contained authentication token. When a user logs in through SSO, the auth server issues a JWT containing the user's identity (user_id, team, roles) and a cryptographic signature. The user's browser attaches this token to every request. Your API gateway can verify the token using the auth server's public key — without calling the auth server on every request. The signature proves the token wasn't forged or tampered with.</Def>

    <Def term="OIDC (OpenID Connect)">The standard protocol for authentication. Built on top of OAuth 2.0. Your SSO provider (Keycloak, Azure AD, Okta) implements OIDC. The flow: user redirects to SSO login page → enters credentials → SSO issues a JWT → user's app stores the JWT → attaches it to API requests. The JWKS endpoint (/.well-known/jwks.json) publishes the public keys your gateway uses to verify JWTs.</Def>

    <Def term="DDoS (Distributed Denial of Service)">An attack where thousands of compromised computers flood your servers with fake traffic, overwhelming them so real users can't get through. The F5/Akamai external load balancer sits in front of your infrastructure specifically to absorb these attacks — it can handle millions of connections that would crash your application servers. It detects attacks using: requests per source IP, behavioral patterns, geographic anomalies, and JavaScript challenges.</Def>

    <Def term="DMZ (Demilitarized Zone)">The network zone between the public internet and the private network where your servers live. The external load balancer sits in the DMZ. The K8s cluster sits in the private network behind it. This separation means an attacker who compromises the DMZ still can't directly reach your application servers — defense in depth.</Def>

    <h2>Databases & Caching</h2>

    <Def term="PostgreSQL">An open-source relational database. Stores structured data in tables with rows and columns. In your agent architecture, it stores: conversation messages, audit logs, document chunks (with pgvector for embeddings), and checkpoints. PostgreSQL is the "source of truth" — durable, ACID-compliant, survives crashes. The Crunchy Data Operator manages PostgreSQL on Kubernetes: automated failover, backups, and streaming replication.</Def>

    <Def term="pgvector">A PostgreSQL extension that adds vector similarity search. Stores embedding vectors (arrays of 1536 floats) alongside your regular data. Supports cosine similarity, L2 distance, and inner product search with HNSW or IVFFlat indexes. Why pgvector over Pinecone/Weaviate: it runs inside your existing Postgres (already approved, encrypted, compliant) — no separate vector DB to provision and secure.</Def>

    <Def term="Redis">An in-memory data store — all data lives in RAM, not on disk. Sub-millisecond reads. Used for: conversation cache (TTL 30 min), rate limit counters (sliding window), circuit breaker state (shared across pods), and LLM response cache. Redis is NOT the source of truth — if it crashes, data is lost. That's fine because PostgreSQL has everything. Redis is a speed optimization, not a storage system.</Def>

    <Def term="Cache-Aside Pattern">The read/write strategy between Redis and PostgreSQL. Read: check Redis first (fast) → if miss, query PostgreSQL (slower) → populate Redis for next time. Write: PostgreSQL first (source of truth) → Redis second (cache update). Postgres-first write order is critical: if Redis fails, data is safe in Postgres. If Postgres failed and you wrote Redis first, cache ≠ truth.</Def>

    <Def term="TTL (Time To Live)">An expiration timer on a cached value. When you SET a key in Redis with TTL 1800 (30 minutes), Redis automatically deletes it after 30 minutes. This prevents stale data from living forever and keeps Redis memory bounded. Active conversations get their TTL reset on every access, so they stay cached as long as they're active.</Def>

    <h2>Resilience Patterns</h2>

    <Def term="Circuit Breaker">A pattern that prevents calling a service you already know is down. Three states: CLOSED (normal — requests flow through, failures counted), OPEN (tripped after N failures — all requests skip this service immediately, no retries wasted), HALF-OPEN (after a cooldown timer, one probe request is allowed through; if it succeeds, circuit closes; if it fails, circuit reopens). State stored in Redis so all pods see the same breaker state.</Def>

    <Def term="Exponential Backoff with Jitter">A retry strategy: wait 1s, then 2s, then 4s, then 8s between retries (exponential). Add ±30% random jitter so that if 15 pods all fail at the same moment, they don't all retry at exactly 1s/2s/4s — that "thundering herd" would hammer the provider. Jitter spreads retries across time.</Def>

    <Def term="Idempotency Key">A unique identifier attached to a side-effecting operation (like "charge the card" or "send the email") so that retrying the operation is safe. If the agent retries a tool call with the same idempotency key, the tool service checks: "I already processed this key — return the cached result instead of executing again." Prevents double-charging, double-emailing, duplicate actions.</Def>

    <Def term="Dead Letter Queue (DLQ)">A queue where failed messages go after exhausting all retries. If a request fails through all resilience layers (retry, fallback, circuit breaker, degradation), it lands in the DLQ. A consumer process polls the DLQ periodically: when providers recover, it reprocesses the failed requests. Maximum retention: typically 4-24 hours (older messages are stale).</Def>

    <Def term="Graceful Degradation">When all providers are down and no retries will help, the system doesn't crash — it degrades gracefully. Options in order: return a cached response (stale but better than nothing), return a partial result (what you have so far), queue the request for later processing (DLQ), or return an honest error message ("Service temporarily unavailable, please retry in 5 minutes"). Never silently fail.</Def>

    <h2>Observability</h2>

    <Def term="OpenTelemetry (OTel)">A library (not a database, not a dashboard) added to your application code that collects three types of data: traces, metrics, and logs. It ships them to storage backends (Tempo, Prometheus, Loki). Think of OTel as the postal service — it picks up your data and delivers it. It doesn't store or visualize anything.</Def>

    <Def term="Trace">A record of one specific request's journey across all services. Each service creates a "span" (a timed segment) under the same trace_id. In Grafana Tempo, you search by trace_id and see a waterfall: gateway (15ms) → agent pod (5.3s) → LLM call (2.5s) → tool call (300ms). This is how you debug "why was this request slow?"</Def>

    <Def term="Metric">An aggregate number about the system overall — not about one specific request. Examples: p95 latency (seconds), error rate (percentage), tokens consumed (count), active conversations (gauge). Prometheus scrapes these from each pod's /metrics endpoint every 15 seconds. Grafana draws dashboards from them.</Def>

    <Def term="Span">One timed segment within a trace. A span records: operation name, start time, end time, and attributes (like model_used, token_count, tool_name). Spans nest: the "agent_request" span contains child spans for "llm_call_1", "tool_execution", "llm_call_2". The tree of spans IS the trace.</Def>

    <Def term="Prometheus">A time-series database that stores metrics. It PULLS data from your pods (scrapes /metrics every 15 seconds) rather than having pods push to it. Configured via ServiceMonitor objects in K8s. Stores values over time so you can ask: "what was the p95 latency at 3 AM last Tuesday?"</Def>

    <Def term="Grafana">A dashboard UI that reads from Prometheus (metrics), Tempo (traces), and Loki (logs). One unified interface to visualize all three signal types. You build dashboards with line charts, gauges, heatmaps, and configure alerts that fire when thresholds breach.</Def>

    <Def term="Grafana Tempo">A database specifically for storing traces. You search by trace_id and see the full span waterfall. Stores millions of traces indexed by trace ID, service name, and duration.</Def>

    <Def term="Grafana Loki">A database for storing logs. Lightweight, indexed by labels (service name, pod name, log level). You search: "show me all ERROR logs from agent-service in the last hour" or "show me all logs with trace_id = 4bf92f35..."</Def>

    <Def term="Grafana Alloy">A collection agent that runs as a DaemonSet (one per K8s node). Captures stdout logs from all containers on that node and ships to Loki. Replaces what used to need three separate agents (Fluent Bit for logs, OTel Collector for traces, Prometheus node exporter for system metrics) in one.</Def>

    <Def term="Langfuse">A separate observability system specifically for LLM behavior. Captures exact prompts, completions, token counts, costs, and tool call chains. "Grafana tells you the system is slow. Langfuse tells you the AI is wrong." Completely independent from infrastructure observability.</Def>

    <h2>CI/CD & Deployment</h2>

    <Def term="CI (Continuous Integration)">Automated pipeline triggered by git push: lint → type check → unit tests → integration tests → build Docker image → security scan → push to registry. If any step fails, the pipeline stops and the developer is notified. The output is a tested, scanned, ready-to-deploy container image.</Def>

    <Def term="CD (Continuous Delivery/Deployment)">Automated pipeline triggered by a new image in the registry: deploy to dev → staging (with smoke tests) → production (canary). Harness, ArgoCD, and Spinnaker are CD tools. The key feature: canary deployment with continuous verification — deploy to 5% of traffic, watch metrics, auto-rollback if quality degrades.</Def>

    <Def term="Canary Deployment">Routing a small percentage (5%) of production traffic to the new version while 95% stays on the old version. If the canary's error rate or latency is worse than the baseline, automatic rollback occurs — no human needed. This limits the blast radius: even if the new version has a bug, only 5% of users are affected briefly.</Def>

    <Def term="Rolling Update">Kubernetes replaces pods one at a time during a deployment. Create one new pod (v1.3.0), wait for it to be healthy, kill one old pod (v1.2.0). Repeat until all pods are new. At no point are zero pods running — zero downtime.</Def>

    <Def term="Harness (the CD tool)">A Continuous Delivery platform that orchestrates deployments. Its killer feature: continuous verification. After deploying the canary, Harness connects to your Grafana/Datadog metrics and watches for 10 minutes. It statistically compares the canary's performance against the baseline. If the canary is worse, Harness automatically rolls back. No human watches dashboards at 2 AM.</Def>

    <h2>Agent-Specific Terms</h2>

    <Def term="LLM Gateway">A separate service (like LiteLLM or Portkey) that sits between your agent pods and LLM providers. All agent pods call the gateway; the gateway calls providers. Why separate: centralized rate limit aggregation (all pods share one view of provider quotas), budget enforcement (per-team monthly limits), fallback chain (Claude → GPT-4o → Llama), circuit breakers, and compliance logging.</Def>

    <Def term="MCP (Model Context Protocol)">A standard protocol (by Anthropic) for connecting agents to tools. Each tool is a microservice with an MCP server. At startup, the agent connects to MCP servers and discovers available tools dynamically. Adding a new tool = deploy a new microservice + add the MCP URL to config. The agent code never changes. Think of it as USB-C for AI — one connector, any tool.</Def>

    <Def term="ReAct (Reasoning + Acting)">The core agent loop: the LLM reasons about what to do ("I need the balance"), acts by calling a tool (lookup_balance), observes the result ($14,532.67), then reasons again ("Now I have enough to answer"). This loop repeats until the LLM returns a text response (final answer) instead of a tool call. The number of iterations is decided by the LLM at runtime, not by the programmer — this non-determinism is what makes agents different from regular software.</Def>

    <Def term="LangGraph">A framework for building agent state machines as directed graphs. Nodes are Python functions (LLM calls, tool executions, routing decisions). Edges define transitions (some conditional). A typed state dictionary flows along the edges. LangGraph handles: the execution loop, conditional routing, parallel branches, checkpointing, and human-in-the-loop pause/resume.</Def>

    <Callout type="tip">You now have the vocabulary for every chapter that follows. If a term appears and you've forgotten it, come back to this chapter — it's your reference glossary. Every term defined here will be used repeatedly in the infrastructure, state management, and observability chapters.</Callout>
  </>);
}

// ═══════════════════════════════════════════════════════════════
// CHAPTER 1: ENTERPRISE INFRASTRUCTURE DEEP-DIVE
// ═══════════════════════════════════════════════════════════════

function Ch1Content() {
  return (<>
    <h1>Enterprise Agent Infrastructure — Every Component and Why It Exists</h1>
    <Lead>A production agent is not just a Python script that calls an LLM. It is a distributed system with load balancers, gateways, orchestrators, databases, caches, tool services, observability pipelines, and deployment automation — each component serving a specific purpose that cannot be removed without breaking a guarantee. This chapter maps every component, explains why it exists, and shows how they connect. The running example throughout is a banking customer service agent deployed on OpenShift at a financial institution.</Lead>

    <h2>The Full Architecture at a Glance</h2>
    <Diagram fig="1.1" title="Production agent architecture — edge to data">{`Client (web / API / Slack)
    │ HTTPS + JWT + JSON
    ▼
External Load Balancer (F5 / Akamai)  ← DDoS, TLS termination, IP whitelist
    │ mTLS (internal certs)
    ▼
Internal Load Balancer (K8s Ingress — HAProxy / NGINX / Envoy)
    │ L7 routing by URL path, health checks /healthz every 10-15s
    ▼
API Gateway (FastAPI) — 3-5 pods
    │ JWT validation → Rate limiting (Redis) → Request validation
    │ → Trace ID (OTel) → Audit log (Postgres) → Forward
    ▼
Agent Pods (FastAPI + LangGraph) — 3-20 pods (HPA)
    │ Stateless. All state in Redis + Postgres.
    ├──► LLM Gateway (LiteLLM) — 2-3 pods
    │       → Budget check → Rate limit aggregation
    │       → Claude (primary) → GPT-4o (fallback) → Llama (last resort)
    │       → Circuit breaker per provider
    ├──► Tool APIs (FastAPI + MCP) — 1-5 pods each
    │       → Account tools, Transaction tools, Escalation tools
    │       → Each with own credentials (least privilege)
    ├──► Vector Store (pgvector in Postgres)
    │       → RAG: embed → HNSW search → cross-encoder rerank
    ├──► State Store
    │       → PostgreSQL (source of truth — conversations, messages, audit)
    │       → Redis (cache — session, rate limits, circuit breakers)
    └──► Observability
            → OTel Collector (sidecar) → Grafana Tempo (traces)
            → Prometheus (scrapes /metrics) → Grafana (dashboards)
            → Grafana Alloy (DaemonSet) → Loki (logs)
            → Langfuse (LLM-specific tracing)`}</Diagram>

    <h2>Tier 0: The Client — What Gets Sent Over the Wire</h2>
    <p>The client (web app, Slack bot, or API consumer) sends an HTTPS request with three parts: the URL and method (<strong>POST /v1/agent</strong>), headers including the JWT token in the Authorization header (<strong>Bearer eyJhbG...</strong>), and a JSON body containing the <strong>conversation_id</strong> (UUID linking this message to a conversation), the <strong>message</strong> (the user's text), and optional metadata.</p>
    <p>The JWT was issued earlier when the user logged in through SSO (Keycloak / Azure AD). The token contains the user's identity (user_id, team, roles, expiration) and a cryptographic signature proving the bank's auth server issued it. The client stores this token and attaches it to every request. The gateway verifies the token — the client never sends a password.</p>

    <h2>Tier 1: Edge — Two-Tier Load Balancing</h2>

    <h3>External Load Balancer (F5 / Akamai)</h3>
    <p>Sits in the DMZ, outside the Kubernetes cluster. Managed by the network team, not the platform team. It does four things that Kubernetes should not handle:</p>
    <Table headers={["Function", "What it does", "Why it's here and not in K8s"]}
      rows={[
        ["DDoS protection", "Absorbs volumetric attacks (millions of requests/sec) using specialized hardware", "K8s pods would crash under this load. The F5 is purpose-built to handle it."],
        ["TLS termination", "Decrypts HTTPS using the bank's public SSL certificate. Now it can read the HTTP content.", "The certificate management is owned by the security team, not platform."],
        ["IP whitelist", "Only allows requests from approved corporate network IP ranges", "Enterprise security perimeter — first line of defense."],
        ["Geographic routing", "Routes to the nearest data center (us-east-1 or us-west-2) via Route 53 DNS", "Multi-region failover lives at the DNS/LB layer, not inside K8s."],
      ]} />
    <p>After decrypting, the F5 <strong>re-encrypts</strong> with internal mTLS certificates before forwarding to the K8s cluster. Financial regulators require encryption in transit everywhere, even on internal networks. This "re-encrypt" mode means traffic is never in plain text between any two points.</p>

    <h3>Internal Load Balancer (K8s Ingress Controller)</h3>
    <p>Runs inside the K8s cluster as a pod (HAProxy, NGINX, or Envoy). It decrypts the internal mTLS, reads the HTTP request, and routes based on URL path: <strong>/v1/agent → gateway-service</strong>, <strong>/v1/admin → admin-service</strong>. It also runs health checks — every 10-15 seconds, it sends HTTP GET to <strong>/healthz</strong> on every gateway pod. Non-200 response → pod removed from rotation within one check interval.</p>

    <Callout type="key">This is an L7 (Layer 7) load balancer. L7 understands HTTP — it can read URLs, headers, and hostnames. An L4 (Layer 4) load balancer only sees TCP packets and could not route by URL path. The ability to route by path, inject headers (X-Request-ID), and do HTTP-level health checks is why L7 is required here.</Callout>

    <h2>Tier 2: API Gateway — The 6-Step Security Pipeline</h2>
    <p>A separate FastAPI Deployment (3-5 pods) that every request must pass through. Separate from agent pods for two reasons: independent scaling (gateway absorbs burst traffic without affecting agent performance) and clean security boundary.</p>

    <Diagram fig="1.2" title="The 6-step gateway pipeline">{`Request arrives
    │
    ▼
① JWT Token Validation ─── invalid ──► 401 Unauthorized
    │ Extract user_id, team, roles from token claims
    │ Verify signature against cached JWKS public keys
    │ (cached locally, refreshed every 5-10 min)
    ▼
② Rate Limit Check (Redis) ─── over limit ──► 429 Too Many Requests
    │ Sliding window per user AND per team in Redis
    │ Why Redis: multiple gateway pods need shared counters
    ▼
③ Request Validation (Pydantic) ─── malformed ──► 422 Unprocessable
    │ Schema check: conversation_id (UUID), message (string, <10K chars)
    │ Payload size limit: reject > 1MB
    ▼
④ Trace ID Generation (OpenTelemetry)
    │ Create OTel span → unique trace_id
    │ Inject W3C traceparent header → propagates to ALL downstream
    ▼
⑤ Audit Log (async, fire-and-forget)
    │ Write to PostgreSQL audit_log table: user, action, trace_id, IP
    │ Does NOT block the request. If write fails → alert fires.
    ▼
⑥ Forward to Agent Pod
    │ K8s Service round-robins to healthy agent pods
    │ Sends: conversation_id + message + user claims
    └──► Agent Pod handles the actual AI logic`}</Diagram>

    <h2>Tier 3: Agent Pods — The Compute Layer</h2>
    <p>Stateless pods running FastAPI + LangChain + LangGraph. Resources: 500m CPU, 1Gi memory per pod (I/O bound, not CPU bound — pods spend 90% of time waiting on LLM calls). Concurrency: 4 Uvicorn workers × 20-40 async connections = 80-160 concurrent requests per pod.</p>
    <p>Scaling: HPA watches <strong>http_requests_in_flight</strong> (a custom Prometheus metric), NOT CPU. CPU-based scaling is too slow for I/O-bound workloads — by the time CPU spikes, you're already dropping requests. Config: min=3, max=20, target=15 in-flight per pod.</p>
    <p>The internal flow (LangGraph state machine) is covered in detail in Chapter 2. The key point here: pods are stateless. Every bit of conversation state lives in Redis (cache) and PostgreSQL (source of truth). Any pod can handle any request — the load balancer's round-robin works because no pod has special knowledge.</p>

    <h2>Tier 4: LLM Gateway — Why It's a Separate Service</h2>
    <p>LiteLLM or Portkey running as its own Deployment (2-3 pods). All agent pods call it instead of calling LLM providers directly. Five things it does that a library inside each pod cannot:</p>

    <Table headers={["Function", "Why it requires centralization"]}
      rows={[
        ["Rate limit aggregation", "Provider gives 300K tokens/min total. 15 pods each thinking they have 300K = 4.5M total → 429 errors. Gateway maintains one global counter."],
        ["Circuit breaker per provider", "If Claude fails 5x, gateway opens the breaker. ALL pods instantly skip Claude → GPT-4o. Without centralization, each pod independently discovers Claude is down (wasting 15s of retries each)."],
        ["Budget enforcement", "Per-team monthly spend limits ($20K/month for customer service). Gateway tracks cumulative spend across all pods. Hard-stop at limit, warn at 80%."],
        ["Provider abstraction", "Switch models by changing gateway config. Zero agent code changes. Zero redeployments of agent pods."],
        ["Compliance logging", "Every prompt + completion logged to Langfuse + PostgreSQL. One centralized logging point, not 15 separate pod log streams to aggregate."],
      ]} />

    <Callout type="key">The fallback chain: Claude (primary) → GPT-4o (fallback) → self-hosted Llama on vLLM (last resort). Each provider has its own circuit breaker. If Claude's circuit is OPEN, requests skip directly to GPT-4o — saving the retry time. The agent pod doesn't know which provider served the response. Full abstraction.</Callout>

    <h2>Tier 5: Tool APIs + MCP — The Agent's Hands</h2>
    <p>Each tool is a separate FastAPI microservice with its own MCP server, own K8s Deployment, own scaling, own secrets, own database credentials. The agent discovers tools dynamically at startup by connecting to MCP server endpoints listed in config.</p>

    <Diagram fig="1.3" title="MCP tool discovery and execution">{`AT STARTUP (tool discovery):
  Agent pod boots → connects to each MCP server URL from config
    → MCP server 1: advertises [lookup_balance, get_account_type]
    → MCP server 2: advertises [get_transactions, search_by_amount]
    → MCP server 3: advertises [escalate_to_human, create_ticket]
  Agent now knows 6 tools. Code never changed.

AT RUNTIME (tool execution):
  LLM returns: tool_call(lookup_balance, {account_id: "12345"})
  Agent → MCP protocol → account-tools-svc pod → banking DB → result
  Agent feeds result back to LLM
  
ADDING A NEW TOOL:
  Deploy new microservice with MCP server
  Add MCP URL to agent config (ConfigMap)
  Restart agent pods (or config reload)
  Agent discovers new tool. Zero code changes.`}</Diagram>

    <p><strong>Security — Principle of Least Privilege:</strong> The agent pod has NO direct database credentials. The account-tools service has credentials ONLY to the accounts database. The escalation service has credentials ONLY to the ticketing system. Each tool service has only what it needs. Credentials stored in K8s Secrets backed by HashiCorp Vault, rotated on schedule.</p>
    <p><strong>Resilience per tool call:</strong> 5-10 second timeout (don't let a slow banking DB hang the agent). Circuit breaker per tool (5 failures → 30s cooldown). 1 retry with 500ms backoff for 5xx only. If a tool is down, the LLM gets a tool_error response and can choose an alternate action or inform the user.</p>

    <h2>Tier 6: State Store — PostgreSQL + Redis</h2>

    <Diagram fig="1.4" title="The read/write pattern between Redis and PostgreSQL">{`READ PATH (when agent needs conversation history):
  Agent → Redis GET conv:{id}
    ├── HIT (< 1ms) → return cached messages directly
    └── MISS → Query PostgreSQL (5-20ms)
              → Store result in Redis (TTL 30 min)
              → Return messages

WRITE PATH (after agent produces a response):
  Agent has new messages to save
    ├── Step 1: INSERT into PostgreSQL (source of truth FIRST)
    │   → If this fails → return error, don't touch Redis
    └── Step 2: UPDATE Redis cache (SECOND)
        → If this fails → no data loss, just stale cache
        → Cache self-heals on next miss

WHY THIS ORDER:
  PostgreSQL first = data is safe on disk even if Redis fails
  Redis first (wrong) = cache has data that Postgres doesn't
  → If Redis key expires, data is LOST. Nightmare to debug.`}</Diagram>

    <Table headers={["Store", "What lives there", "Format", "Retention"]}
      rows={[
        ["PostgreSQL", "Conversations, messages, audit log, document chunks (pgvector), checkpoints", "Individual rows in relational tables", "Months/years"],
        ["Redis", "Conversation cache, rate limit counters, circuit breaker state, LLM response cache", "JSON blobs keyed by conversation_id", "30 min TTL (auto-expire)"],
      ]} />

    <h2>Why Each Technology Was Chosen</h2>
    <Table headers={["Choice", "Why this and not the alternative"]}
      rows={[
        ["PostgreSQL over MongoDB", "JSONB gives document flexibility. pgvector avoids a separate vector DB. Streaming replication for DR. Mature K8s operators (Crunchy Data). Banks already have Postgres expertise."],
        ["pgvector over Pinecone", "Financial data can't go to external SaaS. pgvector runs inside existing Postgres — already approved, encrypted, meets data residency. No new infra to provision/secure/get compliance for."],
        ["Redis over Memcached", "Sorted sets for sliding window rate limiting. TTL for automatic cache expiry. Pub/sub for real-time features. Sentinel/Cluster for HA."],
        ["MCP over hardcoded tools", "Dynamic discovery. Plugin architecture. Different teams build tools independently. Adding a tool never requires agent code changes or redeployment."],
        ["LiteLLM as separate service", "Centralized rate limits, circuit breakers, budget enforcement, provider abstraction. Can't achieve these with a library in each pod."],
        ["FastAPI over Flask/Django", "Async I/O (critical for I/O-bound LLM workloads). Pydantic validation. OpenAPI docs auto-generated. WebSocket support for streaming."],
        ["OpenTelemetry over custom tracing", "Vendor-neutral standard. Auto-instrumentation for HTTP, DB, Redis. W3C traceparent propagation across services. Huge ecosystem."],
      ]} />

    <Aside title="The health check contract">Every pod exposes /healthz. The check verifies: PostgreSQL connection alive, Redis connection alive, LangGraph compiled and in memory, DistilBERT classifier loaded. It does NOT check MCP tool servers (one tool down shouldn't kill the pod) or LLM providers (handled by the LLM gateway's fallback chain — killing all pods because Claude has a blip would cause a total outage).</Aside>
  </>);
}

// ═══════════════════════════════════════════════════════════════
// CHAPTER 2: THE COMPLETE REQUEST FLOW
// ═══════════════════════════════════════════════════════════════

function Ch2Content() {
  return (<>
    <h1>The Complete Request Flow — End-to-End with Timings</h1>
    <Lead>Everything in Chapter 1 exists to serve one purpose: processing a user's request and returning a response. This chapter traces a single request — from the moment the user hits send to the moment they see the answer — through every layer, every component, every decision point. The example: bank advisor Priya asks "What's the current balance for account 12345?" We track every millisecond.</Lead>

    <h2>Step 0: Authentication (Before Any Request)</h2>
    <p>Priya logged into the bank's wealth management app earlier today. The app redirected her to Keycloak (the bank's SSO). She entered employee ID + password + MFA code. Keycloak verified her identity and issued a JWT containing: user_id=priya.sharma, team=wealth_management, role=senior_advisor, exp=1 hour from now, plus a cryptographic signature. The web app stores this token in memory and attaches it to every API request.</p>

    <h2>Step 1: The HTTP Request Leaves Priya's Browser</h2>
    <Code lang="the actual HTTPS request">{`POST https://agent-api.bank.com/v1/agent
Headers:
  Authorization: Bearer eyJhbGciOiJSUzI1NiIs...  ← JWT token
  Content-Type: application/json
  X-Request-ID: 7f3a2b1c-...
Body:
  {
    "conversation_id": "conv-a1b2c3d4",
    "message": "What's the current balance for account 12345?"
  }

Encrypted with TLS 1.3. Travels over the bank's internal network.`}</Code>

    <h2>Step 2: External Load Balancer — +5ms</h2>
    <p>DDoS check passes (normal rate from corporate IP). IP whitelist passes (10.0.4.52 is in the approved range). TLS termination: F5 decrypts using the bank's public SSL certificate's private key. Re-encrypts with internal mTLS certificates. Forwards to the K8s cluster.</p>

    <h2>Step 3: Internal Load Balancer — +2ms</h2>
    <p>K8s Ingress Controller decrypts internal mTLS. Reads URL: /v1/agent → routes to gateway-service. Round-robins to a healthy gateway pod (health checks already removed any unhealthy pods in the background).</p>

    <h2>Step 4: API Gateway — 6 Steps, +8ms Total</h2>

    <Diagram fig="2.1" title="Gateway pipeline processing Priya's request">{`① JWT Validation (+3ms)
   JWKS keys cached from https://auth.bank.com/.well-known/jwks.json
   Signature: VALID. Expiry: 45 min remaining. Issuer: correct.
   Extracted: user_id=priya.sharma, team=wealth_mgmt, role=senior_advisor
   
② Rate Limit (+1ms)
   Redis ZRANGEBYSCORE rate:priya.sharma {now-60s} {now}
   → 12 requests in last 60 seconds. Limit: 100/min → ALLOWED

③ Request Validation (+1ms)
   conversation_id: UUID ✓. message: 52 chars (<10K) ✓. Payload: 189 bytes (<1MB) ✓

④ Trace ID Generation (+0.5ms)
   OTel span created → trace_id: 4bf92f3577b34da6
   traceparent header injected → propagates to ALL downstream services

⑤ Audit Log (+0ms — async, fire-and-forget)
   INSERT INTO audit_log (user_id, action, trace_id, ip, ts)
   VALUES ('priya.sharma', 'agent_query', '4bf92f35...', '10.0.4.52', NOW())

⑥ Forward to Agent Pod (+2ms)
   K8s Service round-robin → Pod 2 selected`}</Diagram>

    <h2>Step 5: Agent Pod — The Multi-Step Orchestration</h2>

    <h3>5.1: Hydrate Conversation State — +9ms</h3>
    <p>Redis GET conv:conv-a1b2c3d4 → MISS (first message of the day, key expired). Fall back to PostgreSQL: SELECT role, content FROM messages WHERE conversation_id = 'conv-a1b2c3d4' ORDER BY created_at → returns 8 messages from yesterday. Populate Redis: SET conv:conv-a1b2c3d4 → [8 messages] TTL 1800s.</p>

    <h3>5.2: Intent Classification — +2ms</h3>
    <p>DistilBERT classifier (running locally in the pod, ~50MB model loaded at startup) classifies: "What's the current balance for account 12345?" → <strong>needs_tool</strong> (confidence 0.94). This costs zero LLM tokens and takes 2ms. If the message had been "Hi, how are you?" → greeting → template response, skip LLM entirely.</p>

    <h3>5.3: RAG Retrieval — SKIPPED</h3>
    <p>Balance lookup doesn't need document retrieval. If the question had been "What's the wire transfer limit?" → embed query → pgvector cosine similarity → top 5 chunks → cross-encoder rerank → inject into prompt.</p>

    <h3>5.4: Construct LLM Prompt — +1ms</h3>
    <p>Assembly: system prompt (340 tokens) + tool definitions from MCP (520 tokens) + conversation history from Redis (890 tokens) + user message (52 tokens) = 1,802 tokens total. Tool definitions injected dynamically — discovered from MCP at startup.</p>

    <h3>5.5: Call LLM via LLM Gateway — +2,500ms</h3>
    <p>Agent calls http://llm-gw-svc:8000/v1/chat/completions. Gateway: budget check ($4,200 of $20K monthly limit — OK), rate limit check (180K of 300K tokens/min — OK), circuit breaker for Claude (CLOSED — healthy). Forwards to Azure OpenAI Claude endpoint. Claude reads the prompt, sees available tools, and decides: "I need to call lookup_balance with account_id 12345." Returns a tool_call response, not a text response. Took 2.5 seconds.</p>

    <h3>5.6: Execute Tool via MCP — +300ms</h3>
    <p>Agent calls account-tools-svc via MCP protocol. Tool service validates the request, queries the core banking database. Returns:<code>{`{balance: "$14,532.67", as_of: "2026-06-02T09:31:40Z", account_type: "checking", status: "active"}`}</code>.Timeout was set to 10 seconds — response came in 287ms.</p>

    <h3>5.7: Call LLM Again — +2,000ms</h3>
    <p>Agent feeds the tool result back to the LLM. Claude now sees the question AND the balance. Generates: "The current balance for account 12345 is $14,532.67 as of today. This is a checking account in active status." This second LLM call took 2 seconds.</p>

    <h3>5.8: PII Scan — +5ms</h3>
    <p>Regex patterns check for SSN (XXX-XX-XXXX), credit cards (16 digits). spaCy NER checks for names, addresses, phone numbers. Account number "12345" is present but user-requested — allowed. No unexpected PII detected.</p>

    <h3>5.9: Dual Write — +10ms</h3>
    <p><strong>PostgreSQL FIRST:</strong> INSERT 4 rows into messages table (user message, tool_call, tool_result, assistant response). Data is now safe on disk. <strong>Redis SECOND:</strong> Update conv:conv-a1b2c3d4 cache with 4 new messages, reset TTL to 30 minutes.</p>

    <h2>Step 6: Response Returns to Priya — +3ms</h2>
    <p>Agent pod → gateway (PII filter on response path) → internal LB → external LB (TLS encrypt) → Priya's browser.</p>

    <h2>Complete Timing Summary</h2>
    <Diagram fig="2.2" title="Where every millisecond went">{`Step 1:  Client sends request                          0ms
Step 2:  External LB (DDoS, TLS, mTLS)               +5ms
Step 3:  Internal LB (L7 routing)                     +2ms
Step 4:  Gateway (JWT, rate limit, validate, trace)   +8ms
Step 5.1: Hydrate state (Redis miss → PG)             +9ms
Step 5.2: Intent classify (DistilBERT)                +2ms
Step 5.3: RAG retrieval — skipped                     +0ms
Step 5.4: Construct prompt                            +1ms
Step 5.5: LLM call #1 (Claude → tool_call)         +2,500ms
Step 5.6: Tool call (MCP → banking DB)               +300ms
Step 5.7: LLM call #2 (Claude → text answer)       +2,000ms
Step 5.8: PII scan                                    +5ms
Step 5.9: Dual write (PG + Redis)                    +10ms
Step 6:  Response return path                         +3ms
                                              ─────────────
TOTAL:                                        ~4,845ms (~5s)

BREAKDOWN:
  LLM calls: 4,500ms (93% of total)
  Tool call:   300ms (6%)
  Everything else: 45ms (1%)

The LLM is the bottleneck. Always.`}</Diagram>

    <Callout type="key">Optimizing Redis, PostgreSQL, or the PII scanner saves milliseconds. Optimizing LLM calls saves seconds. The three highest-impact optimizations: (1) use a smaller model for simple tasks like routing (Haiku: 150ms vs Sonnet: 500ms), (2) cache LLM responses for repeated questions (0ms on cache hit), (3) run independent sub-agents in parallel to eliminate sequential waits.</Callout>

    <h2>What Observability Captured During This Request</h2>
    <p>All three signal types were collected silently during the request, linked by trace_id 4bf92f35...</p>

    <Table headers={["Signal", "What was captured", "Where it went"]}
      rows={[
        ["Traces (15 spans)", "Gateway span (8ms), agent root span (4.8s), Redis GET (0.3ms miss), PG SELECT (8ms), LLM call #1 (2.5s), MCP tool call (300ms), LLM call #2 (2s), PII scan (5ms), PG INSERT (5ms), Redis SET (0.5ms)", "OTel Collector sidecar → Grafana Tempo"],
        ["Metrics (6 counters/histograms updated)", "agent_request_duration: 4.845s observation. llm_tokens_total: +1883. tool_calls_total: +1. agent_requests_in_flight: +1/-1. cache_hits_total: miss. gateway_requests_total: +1", "Prometheus scraped from /metrics"],
        ["Logs (12 structured JSON lines)", "State hydrated (miss), intent classified, LLM call started/completed, tool executed, PII scan clean, state persisted, request complete — each with trace_id=4bf92f35", "Grafana Alloy → Loki"],
        ["Langfuse (2 LLM traces)", "Full prompt #1 (1802 tokens), Claude's tool_call response, full prompt #2 (with tool result), Claude's text response, token counts, cost ($0.003)", "Langfuse API → Langfuse UI"],
        ["Audit log (1 row)", "user=priya.sharma, action=agent_query, trace_id=4bf92f35, ip=10.0.4.52, pii_detected=false", "PostgreSQL audit_log table"],
      ]} />

    <Aside title="The debugging workflow">Grafana dashboard shows a latency spike at 2 AM. You click the spike → see exemplar trace IDs from that time. Click a trace → Tempo shows the waterfall: LLM call #1 took 25 seconds (normally 2.5s). Click "show logs" → Loki shows: "Claude timeout after 25s, falling back to GPT-4o." Root cause: Claude had an outage. Auto-recovery: circuit breaker tripped → subsequent requests went to GPT-4o automatically. Three independent pipelines, linked by one trace_id, telling the complete story.</Aside>
  </>);
}

// ─── CHAPTER COMPONENT MAP ─────────────────────────────────────────
// Chapters 3-8 are in Part 2 and Part 3 files
// For this file, we show a placeholder for navigation

// ═══════════════════════════════════════════════════════════════
// CHAPTER 3: MULTI-AGENT STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function Ch3Content() {
    return (<>
      <h1>Multi-Agent State Management — The Single Shared Dictionary</h1>
      <Lead>State management is the most misunderstood topic in multi-agent systems. People assume each agent has its own state, that agents pass messages between themselves, or that state is stored in a file. None of these are true. In LangGraph, state is a single Python dictionary in RAM that every agent reads from and writes to. Understanding this mechanism — how the dictionary flows, how it grows, and how it persists — is the foundation of everything else in agent orchestration.</Lead>
  
      <h2>What Is "State" in a Multi-Agent System?</h2>
      <p>State is everything the system needs to remember across steps and across agents during one request. It is not just conversation history — it is the full context of what is happening right now: which agent is running, what tools have been called, what results came back, what the LLM decided, and where in the process we are. Every piece of information that any agent might need lives in this one object.</p>
  
      <Callout type="key">There is ONE state dictionary, not separate ones per agent. And everything runs in ONE agent pod, in ONE Python process. When the supervisor node finishes and the RAG node starts, there is no file transfer, no HTTP call, no serialization. LangGraph simply calls the next Python function and passes the same dictionary object. It is function calls in a loop, with a dictionary being passed and updated between each call.</Callout>
  
      <h2>The State Schema — Defined Once, Used by All Agents</h2>
      <Code lang="python — the typed state definition">{`class AgentState(TypedDict):
      # === Input (set at the start of the request) ===
      conversation_id: str
      user_message: str
      user_id: str
      conversation_history: list[dict]    # loaded from Redis/Postgres
  
      # === Routing (written by supervisor) ===
      intent: str                         # needs_rag, needs_tool, greeting
      target_agent: str                   # rag_agent, tool_agent, greeting_agent
      confidence: float                   # intent classification confidence
      supervisor_reasoning: str           # why this routing decision
  
      # === RAG agent writes here ===
      retrieved_chunks: list[dict]        # top 3-5 document chunks
      rag_query: str                      # the query sent to pgvector
      rag_source_docs: list[str]          # source document names
  
      # === Tool agent writes here ===
      tool_calls: list[dict]              # [{name, args, result, latency_ms}]
      tool_call_count: int                # iteration counter for safety limit
  
      # === LLM synthesis writes here ===
      llm_response: str                   # final text response to user
      llm_model_used: str                 # which model served the response
      llm_tokens: dict                    # {input: N, output: M}
  
      # === Guardrails write here ===
      pii_detected: bool                  # did PII scan find anything?
      pii_redacted_response: str | None   # cleaned response if PII found
  
      # === Shared metadata ===
      trace_id: str                       # OpenTelemetry trace ID
      current_step: str                   # which node is currently executing
      error: str | None                   # if something failed
      checkpoint_id: str | None           # for crash recovery`}</Code>
  
      <p>Every agent reads the fields it needs and writes the fields it produces. The RAG agent reads <code>user_message</code> and writes <code>retrieved_chunks</code>. The tool agent reads <code>user_message</code> AND <code>retrieved_chunks</code> (from the RAG agent) and writes <code>tool_calls</code>. The notification agent reads <code>tool_calls</code> results to compose a message. No agent calls another agent directly — the graph routes between them, and they communicate entirely through shared state fields.</p>
  
      <h2>How LangGraph Passes State Between Nodes</h2>
      <p>Each node in LangGraph is a regular Python function. It takes the state dictionary as its argument, does its work, and returns only the fields it wants to update. LangGraph then merges those returned fields into the existing state. The next node receives the merged state.</p>
  
      <Code lang="python — what a LangGraph node actually looks like">{`def classify_intent(state: AgentState) -> dict:
      """
      Receives the FULL state dictionary.
      Reads what it needs, does its work.
      Returns ONLY the fields it wants to update.
      LangGraph merges these into the existing state.
      """
      # READ from state (these fields already exist)
      message = state["user_message"]
  
      # Do the work (DistilBERT classifier, ~2ms, zero LLM cost)
      intent = distilbert_classifier.predict(message)
  
      # RETURN only the new/updated fields
      return {
          "intent": "needs_tool",
          "target_agent": "account_agent",
          "confidence": 0.94,
          "current_step": "classify_done"
      }
      # The node does NOT return the full state.
      # It returns a PARTIAL dict. LangGraph handles the merge.`}</Code>
  
      <Callout type="key">The merge is like Python's <code>dict.update()</code>. If the state had 15 fields before, and the node returns 4 fields, the state now has all 15 original fields plus the 4 new/updated ones. Existing fields are never removed — they persist through the entire request. This is why the state grows at each step: each agent adds its results on top of what was already there.</Callout>
  
      <h2>Watching State Grow Step by Step</h2>
      <p>Let us trace how the state dictionary changes as Priya's request passes through each agent. The key insight: the state starts small and grows as each agent adds its results. But it is always ONE dictionary, flowing through ONE process.</p>
  
      <Diagram fig="3.1" title="State growth through the agent pipeline">{`AFTER INIT (~2 KB):
    conversation_id: "a1b2c3d4"
    user_message: "What's the balance for 12345?"
    user_id: "priya.sharma"
    conversation_history: [8 messages from yesterday]  ← ~1.5 KB
    intent: None                    ← not yet set
    retrieved_chunks: []            ← empty
    tool_calls: []                  ← empty
    llm_response: None              ← empty
    trace_id: "4bf92f35..."
  
  AFTER SUPERVISOR (~2.1 KB — added ~50 bytes):
    ... all above unchanged ...
    intent: "needs_tool"            ← SUPERVISOR WROTE
    target_agent: "account_agent"   ← SUPERVISOR WROTE
    confidence: 0.94                ← SUPERVISOR WROTE
    current_step: "classify_done"   ← SUPERVISOR WROTE
  
  AFTER TOOL AGENT (~4.5 KB — added ~2.4 KB):
    ... all above unchanged ...
    tool_calls: [                   ← TOOL AGENT WROTE
      { name: "lookup_balance",
        args: { account_id: "12345" },
        result: { balance: "$14,532.67", type: "checking" },
        latency_ms: 287 }
    ]
    tool_call_count: 1              ← TOOL AGENT WROTE
    llm_response: "The balance..."  ← TOOL AGENT'S LLM WROTE
    llm_model_used: "claude-sonnet" ← TOOL AGENT WROTE
    llm_tokens: { input: 1802, output: 45 }
  
  AFTER GUARDRAILS (~4.6 KB — added ~100 bytes):
    ... all above unchanged ...
    pii_detected: false             ← GUARDRAILS WROTE
    checkpoint_id: "chk_final"      ← GUARDRAILS WROTE
  
  Total growth: 2 KB → 4.6 KB across the entire request.
  This is TINY. The pod has 1 GB of memory.
  State is < 0.5% of available RAM.`}</Diagram>
  
      <h2>State Does Not Grow Forever</h2>
      <p>Each request creates a fresh state dictionary. It lives in RAM for the 3-6 seconds that the request is being processed. When the response is sent, Python's garbage collector frees the memory. The next request creates a brand new dictionary. State does not accumulate across requests.</p>
      <p>The <code>conversation_history</code> field could get large over many messages (50 messages × 200 tokens each = maybe 50 KB). But you cap it — only load the last 20-30 messages from Redis into state, not the entire history. Older messages stay in PostgreSQL for reference but are not loaded into the in-memory state.</p>
  
      <h2>In-Memory State vs Persisted State — Two Different Things</h2>
      <p>This distinction is critical and trips up most people. The in-memory state (the Python dictionary) and the persisted state (PostgreSQL + Redis) are completely different things that sync at two specific moments.</p>
  
      <Table headers={["", "In-Memory State", "Persisted State"]}
        rows={[
          ["What it is", "A Python dictionary in the pod's RAM", "Rows in PostgreSQL + a JSON blob in Redis"],
          ["Lifetime", "3-6 seconds (one request)", "Days, months, years"],
          ["Contains", "Everything: intent, chunks, tool results, LLM response, routing decisions", "Only conversation messages (user msgs, tool calls, assistant responses)"],
          ["Created when", "Request arrives", "End of each request (persist step)"],
          ["Destroyed when", "Response sent (garbage collected)", "Never (PostgreSQL) / 30 min TTL (Redis)"],
          ["Purpose", "Working copy for this request's computation", "Saved copy for future requests"],
        ]} />
  
      <Diagram fig="3.2" title="How in-memory and persisted state connect">{`Request starts:
    hydrate_state loads conversation history
    FROM Redis/PostgreSQL INTO the in-memory state dict
  
  Request runs:
    Agents add to the in-memory state
    (intent, chunks, tool results, LLM response)
    These intermediate fields are NOT in PostgreSQL.
    They exist only in RAM during this request.
  
  Request ends:
    persist_state extracts conversation MESSAGES
    FROM the in-memory state TO PostgreSQL + Redis
    In-memory state is garbage collected.
  
  Next request:
    Fresh state dict created
    hydrate_state loads UPDATED history from Redis
    (includes messages from the previous request)
    Cycle continues.
  
  The in-memory state is the WORKING COPY.
  The persisted state is the SAVED COPY.
  They sync at the start and end of each request.`}</Diagram>
  
      <h2>Normal Persistence — What Gets Saved to PostgreSQL</h2>
      <p>At the END of the request, the <code>persist_state</code> node extracts conversation messages from the state and writes them as individual rows in the <code>messages</code> table. It does NOT dump the entire state dictionary. It extracts the meaningful conversation data: user message, tool calls, tool results, and the assistant response.</p>
  
      <Code lang="sql — what the persist_state node writes">{`-- 4 rows inserted into the messages table:
  
  INSERT INTO messages (id, conversation_id, role, content, metadata, created_at)
  VALUES
    (uuid, 'a1b2c3d4', 'user',
     'What''s the balance for account 12345?',
     '{"intent": "needs_tool"}',
     '2026-06-02T09:31:40Z'),
  
    (uuid, 'a1b2c3d4', 'tool_call',
     '{"name": "lookup_balance", "args": {"account_id": "12345"}}',
     '{"latency_ms": 287}',
     '2026-06-02T09:31:43Z'),
  
    (uuid, 'a1b2c3d4', 'tool_result',
     '{"balance": "$14,532.67", "type": "checking"}',
     NULL,
     '2026-06-02T09:31:43Z'),
  
    (uuid, 'a1b2c3d4', 'assistant',
     'The current balance for account 12345 is $14,532.67.',
     '{"model": "claude-sonnet", "tokens": {"in": 1802, "out": 45}}',
     '2026-06-02T09:31:45Z');
  
  -- Individual rows. Each one is a clear, readable message.
  -- Not a state dump. Structured conversation data.`}</Code>
  
      <p>Redis gets the same messages but in a different format — one JSON array under a single key:</p>
      <Code lang="redis — what the persist_state node caches">{`SET conv:a1b2c3d4 '[
    {"role": "user", "content": "What''s the balance..."},
    {"role": "tool_call", "content": "{\\"name\\": \\"lookup_balance\\"...}"},
    {"role": "tool_result", "content": "{\\"balance\\": \\"$14,532.67\\"...}"},
    {"role": "assistant", "content": "The current balance is..."}
  ]'
  EXPIRE conv:a1b2c3d4 1800   -- TTL 30 minutes`}</Code>
  
      <h2>Checkpointing — A Completely Different Mechanism</h2>
      <p>Checkpointing is about crash recovery, not conversation history. It saves the ENTIRE in-memory state dictionary — including intermediate fields like <code>retrieved_chunks</code>, <code>confidence</code>, <code>supervisor_reasoning</code> — as one JSON blob in a separate <code>checkpoints</code> table. These fields would NOT go in the messages table because they are not conversation messages. They are internal processing state.</p>
  
      <Table headers={["", "Normal Persistence (messages table)", "Checkpointing (checkpoints table)"]}
        rows={[
          ["When written", "ONCE, at the END of the request", "2-3 times DURING the request (after expensive steps)"],
          ["What's stored", "Conversation messages only (user, tool_call, tool_result, assistant)", "The ENTIRE state dictionary as one JSON blob"],
          ["Format", "Individual rows with role, content, metadata columns", "One JSONB column containing the full serialized state"],
          ["Purpose", "So the NEXT request can load conversation history", "So a CRASHED request can resume from mid-point"],
          ["Retention", "Months/years", "24 hours (cleaned up by a nightly CronJob)"],
          ["When read", "Every request (hydrate_state loads history)", "Only on crash recovery (rare)"],
        ]} />
  
      <p>Checkpoints happen after <strong>expensive</strong> steps — RAG retrieval (200ms), tool calls (300ms), LLM calls (2.5s). Not after fast steps like PII scan (5ms). The logic: if the pod crashes after RAG, you don't want to re-embed the query and re-search pgvector. If it crashes after a 5ms PII scan, re-doing 5ms of work is cheaper than the database write for a checkpoint.</p>
  
      <Diagram fig="3.3" title="Checkpoint timing during a multi-agent request">{`supervisor runs (fast, 2ms)         — NO checkpoint (too cheap)
  RAG agent runs (200ms, burns tokens) — CHECKPOINT ✓ (expensive)
  tool call executes (300ms, external) — CHECKPOINT ✓ (can't redo cheaply)
  LLM call #2 (2s, burns tokens)      — CHECKPOINT ✓ (expensive)
  PII scan (5ms)                       — NO checkpoint (too cheap)
  persist to PG + Redis (10ms)         — NO checkpoint (normal persist)
  
  Typically: 2-3 checkpoints per request, not 8.`}</Diagram>
  
      <h2>Crash Recovery Using Checkpoints</h2>
      <p>The pod crashes after the RAG agent finishes but before the tool call completes. The gateway detects the timeout and retries to a different pod. The new pod's <code>hydrate_state</code> node checks: "Is there a checkpoint for this request ID?"</p>
  
      <Code lang="sql — loading the checkpoint for crash recovery">{`-- New pod checks for an existing checkpoint:
  SELECT state_json, step FROM checkpoints
  WHERE request_id = 'req-uuid-789'
  ORDER BY created_at DESC LIMIT 1;
  
  -- Result: step='rag_done', state_json='{...full state...}'
  
  -- The new pod deserializes:
  import json
  state = json.loads(row['state_json'])
  # state now has ALL fields populated up to rag_done:
  #   conversation_history: loaded ✓
  #   intent: classified ✓
  #   retrieved_chunks: [3 chunks] ✓  ← RAG work preserved!
  #   tool_calls: []  ← not yet done
  #   current_step: 'rag_done'
  
  # Resume from tool_agent (the step AFTER rag_done):
  graph.invoke(state, start_node='tool_agent')
  
  # The RAG work is NOT redone. Saved 200ms + tokens.
  # Idempotency key on tool call prevents duplicates.`}</Code>
  
      <Callout type="tip">Checkpointing is a design decision, not a requirement. For simple requests (one LLM call, one tool call, 3-5 seconds total), retrying the whole request from scratch on crash is cheaper than the overhead of 2-3 PostgreSQL writes per request. Only implement checkpointing when your requests are long-running (10+ seconds), involve expensive tool calls (external APIs that charge per call), or have tool calls with side effects (transferring money, sending emails) where a retry would cause duplicates.</Callout>
  
      <h2>Checkpoint Cleanup — The Nightly CronJob</h2>
      <p>After a request completes successfully, its checkpoints are no longer needed. They are insurance that was not claimed. But we don't delete them immediately (edge cases with retries in flight). A Kubernetes CronJob runs at 3 AM daily:</p>
      <Code lang="sql">{`DELETE FROM checkpoints WHERE created_at < NOW() - INTERVAL '24 hours';
  -- Removes ~15,000 stale rows per day at 500 concurrent users.
  -- Without cleanup: 10.8 million dead rows per month.`}</Code>
      <p>The CronJob YAML lives in your Git repository alongside all other K8s manifests. It uses the same agent Docker image but runs a different command (the cleanup script instead of the web server). Kubernetes creates a pod at 3 AM, runs the script, the pod exits. No human involvement.</p>
  
      <Aside title="Why ONE state and ONE pod for multi-agent">Three reasons. First, shared context: the notification agent needs the balance (from the account agent) and the policy info (from the RAG agent). With separate states, you'd copy data between them — fragile and error-prone. With one state, the notification agent just reads state["balance"]. Second, latency: separate pods mean network calls between agents (2-5ms per hop × 7 hops = 35ms overhead). Same pod = function calls = 0ms overhead. Third, failure complexity: more pods = more failure modes. One pod = one failure mode. Checkpoint + retry handles it cleanly.</Aside>
    </>);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 4: MULTI-AGENT ROUTING & ORCHESTRATION
  // ═══════════════════════════════════════════════════════════════
  
  function Ch4Content() {
    return (<>
      <h1>Multi-Agent Routing &amp; Orchestration — The Two-Loop Architecture</h1>
      <Lead>How does the system decide which sub-agent runs next? How does each sub-agent decide which tool to call? These are two different decisions made by two different mechanisms. The outer loop routes between sub-agents — the supervisor LLM decides "go to the RAG agent next." The inner loop, inside each sub-agent, decides which tool to call — the sub-agent's own LLM reasons through the ReAct pattern. Understanding these two nested loops is the core of multi-agent orchestration.</Lead>
  
      <h2>The Two Loops — Outer and Inner</h2>
      <Diagram fig="4.1" title="The two-loop architecture">{`┌── OUTER LOOP (between sub-agents) ──────────────────────┐
  │                                                          │
  │  Supervisor LLM                                          │
  │    → Decides WHICH AGENT runs next                      │
  │    → Called BETWEEN every sub-agent                     │
  │    → Sees: original query + results so far              │
  │    → Can change the plan based on results               │
  │                                                          │
  │  ┌── INNER LOOP (inside each sub-agent) ──────────────┐ │
  │  │                                                      │ │
  │  │  Sub-agent's own LLM (ReAct pattern)                │ │
  │  │    → Decides WHICH TOOL to call                     │ │
  │  │    → Sees: ONLY this agent's scoped tools           │ │
  │  │    → Reason → Act → Observe → Reason again          │ │
  │  │    → Loops until LLM returns text (not tool_call)   │ │
  │  │    → Safety limit: max 5 iterations                 │ │
  │  │                                                      │ │
  │  └──────────────────────────────────────────────────────┘ │
  │                                                          │
  │  Each sub-agent has its own inner loop.                   │
  │  Each inner loop has its own scoped tools.                │
  │  The outer loop connects them via shared state.           │
  └──────────────────────────────────────────────────────────┘`}</Diagram>
  
      <h2>Why the Outer Loop Needs an LLM (Not Just If/Else)</h2>
      <p>A simple Python routing function can check flags: "Is account_agent done? → move to rag_agent." But it cannot understand the <em>meaning</em> of results. Consider: the account agent found the balance is $0. Should we still apply the loyalty discount? A Python function would need explicit rules for every possible scenario. The supervisor LLM can reason: "Balance is zero. Discount requires minimum $1,000. Skip discount, adjust the notification message to explain why."</p>
  
      <Callout type="key">The supervisor LLM is called MULTIPLE TIMES throughout the request — not just once at the start. After each sub-agent finishes, the supervisor evaluates the results and decides what's next. It can change the plan dynamically based on what actually happened, not what was predicted.</Callout>
  
      <h2>The Supervisor LLM — What It Sees and Returns</h2>
      <Code lang="python — supervisor LLM call (runs between every sub-agent)">{`def call_supervisor_llm(state: AgentState) -> dict:
      response = llm.invoke(
          model="claude-haiku",  # Fast, cheap for routing (~150ms)
          system="""You are a routing supervisor for a banking agent.
          Available sub-agents:
            - account_agent: balance, transactions, discounts
            - rag_agent: policy lookup, FAQ search
            - notification_agent: email, SMS, tickets
  
          Based on the user's request and completed work,
          decide: which agent next, or is the task done?
          Respond in JSON only.""",
          messages=[
              {"role": "user", "content": state["user_message"]},
              {"role": "assistant", "content":
                  summarize_completed_steps(state)}
          ],
          response_format={"type": "json_object"}
      )
      decision = json.loads(response.content)
      return {
          "next_agent": decision["next_agent"],
          "supervisor_reasoning": decision["reasoning"]
      }
  
  # Supervisor response example:
  # {
  #   "status": "continue",
  #   "next_agent": "rag_agent",
  #   "reasoning": "Balance retrieved ($14,532.67).
  #     Now need to check fee waiver policy for Premium accounts."
  # }`}</Code>
  
      <p>Note: the supervisor uses <strong>Claude Haiku</strong>, not Sonnet. Routing is a simple classification task — Haiku handles it at 150ms and a fraction of the cost. The more expensive Sonnet is reserved for the sub-agents that need complex reasoning about tool selection and arguments.</p>
  
      <h2>Each Sub-Agent Has Its OWN Scoped Tools</h2>
      <p>The RAG agent's LLM only sees RAG tools. The account agent's LLM only sees account tools. They never see each other's tools. This scoping is critical for two reasons: it reduces tool-selection confusion (the LLM picks from 3-4 relevant tools instead of 12), and it enforces security boundaries (the account agent physically cannot call the email-sending tool).</p>
  
      <Diagram fig="4.2" title="Tool scoping per sub-agent">{`ACCOUNT AGENT sees only:
    • lookup_balance(account_id)
    • get_account_type(account_id)
    • get_transactions(account_id, days)
    • apply_loyalty_discount(account_id, balance)
  
  RAG AGENT sees only:
    • search_policies(query)
    • search_faq(query)
    • get_document(doc_id)
  
  NOTIFICATION AGENT sees only:
    • send_email(to, subject, body)
    • send_sms(phone, message)
    • create_ticket(category, description)
  
  The account agent's LLM has NO IDEA that send_email exists.
  The notification agent's LLM has NO IDEA that lookup_balance exists.
  Tool scoping = security boundary + less LLM confusion.`}</Diagram>
  
      <h2>The Inner ReAct Loop — How Each Sub-Agent Picks Tools</h2>
      <p>Inside each sub-agent, the LLM uses the ReAct pattern: Reason ("I need the balance"), Act (call lookup_balance), Observe (result: $14,532.67), then Reason again ("Now I can apply the discount"). This loop repeats until the LLM returns a text response instead of a tool call.</p>
  
      <Diagram fig="4.3" title="The ReAct loop inside the account agent">{`ITERATION 1:
    LLM REASONS: "Need balance first to apply discount later."
    LLM ACTS: tool_call(lookup_balance, {account_id: "12345"})
    EXECUTE: MCP → account-tools-svc → banking DB → result
    OBSERVE: { balance: "$14,532.67" }
    → Add tool result to conversation. Call LLM again.
  
  ITERATION 2:
    LLM REASONS: "Got balance. Now apply discount."
    LLM ACTS: tool_call(apply_loyalty_discount, {id: "12345", balance: 14532.67})
    EXECUTE: MCP → account-tools-svc → result
    OBSERVE: { discount_applied: true, new_rate: "0.5%" }
    → Add tool result to conversation. Call LLM again.
  
  ITERATION 3:
    LLM REASONS: "Balance checked, discount applied. Done."
    LLM ACTS: returns TEXT (not a tool_call!)
      "Your balance is $14,532.67. Loyalty discount applied, new rate 0.5%."
    → Inner loop EXITS. Results written to shared state.
    → Outer loop: supervisor LLM decides next sub-agent.`}</Diagram>
  
      <Callout type="warn">The LLM decides which tool to call — not a routing function, not a rule engine. The LLM sees the user's request, the available tools (only this agent's scoped tools), and the results of any previous tool calls. It reasons about what to do next. This is the "intelligence" in the system. The routing functions and the graph provide the loop mechanism and safety limits. The LLM provides the reasoning.</Callout>
  
      <h2>The Graph Edges That Create the Loops</h2>
      <Code lang="python — LangGraph definition creating both loops">{`# === OUTER LOOP: Supervisor routes between agents ===
  
  graph.add_node("supervisor", call_supervisor_llm)
  graph.add_node("account_agent", account_agent_subgraph)
  graph.add_node("rag_agent", rag_agent_subgraph)
  graph.add_node("notification_agent", notif_agent_subgraph)
  graph.add_node("guardrails", run_guardrails)
  
  # After EVERY sub-agent, control returns to supervisor
  graph.add_edge("account_agent", "supervisor")
  graph.add_edge("rag_agent", "supervisor")
  graph.add_edge("notification_agent", "supervisor")
  
  # Supervisor decides what's next
  graph.add_conditional_edge(
      "supervisor",
      parse_supervisor_decision,  # reads state["next_agent"]
      {
          "account_agent": "account_agent",
          "rag_agent": "rag_agent",
          "notification_agent": "notification_agent",
          "done": "guardrails"
      }
  )
  
  # === INNER LOOP: Each sub-agent's ReAct loop ===
  
  # Inside account_agent_subgraph:
  sg.add_node("acct_llm", call_llm_with_account_tools)
  sg.add_node("acct_tool", execute_account_tool)
  
  sg.add_conditional_edge(
      "acct_llm",
      check_llm_response,
      {
          "tool_call": "acct_tool",    # LLM wants a tool → execute
          "final_answer": "acct_done"  # LLM is done → exit
      }
  )
  sg.add_edge("acct_tool", "acct_llm")  # loop back after tool
  
  # This creates a SELF-LOOP on acct_llm:
  #   acct_llm → tool_call? → acct_tool → acct_llm (loop)
  #   acct_llm → text? → acct_done (exit inner loop)
  #   acct_llm → iteration >= 5? → force exit (safety)`}</Code>
  
      <h2>The Flow Pattern: Hub-and-Spoke Through the Supervisor</h2>
      <p>The supervisor is the hub. After every sub-agent finishes its inner ReAct loop and writes results to state, control returns to the supervisor. The supervisor evaluates the updated state and routes to the next agent (or declares "done").</p>
  
      <Diagram fig="4.4" title="The hub-and-spoke execution pattern">{`supervisor → account_agent (inner loop: 2 LLM calls, 2 tools)
       ↑            ↓
       └──── return to supervisor ────→ evaluates results
                                            ↓
       ┌──── supervisor routes to rag_agent
       ↓
  rag_agent (inner loop: 2 LLM calls, 2 RAG tools)
       ↓
       └──── return to supervisor ────→ evaluates results
                                            ↓
       ┌──── supervisor routes to notification_agent
       ↓
  notification_agent (inner loop: 1 LLM call, 1 tool)
       ↓
       └──── return to supervisor ────→ "all done"
                                            ↓
                                       guardrails → persist → response`}</Diagram>
  
      <h2>The Plan Can Change Dynamically</h2>
      <p>The supervisor doesn't commit to a fixed plan at the start. It re-evaluates after every sub-agent. If the account agent finds the balance is $0, the supervisor might skip the discount step. If the RAG agent finds no policy exists, the supervisor adjusts the notification message. The plan is dynamic because the supervisor sees actual results and reasons about them.</p>
  
      <Table headers={["Scenario", "What happens"]}
        rows={[
          ["Balance is $0", "Supervisor skips discount agent (requires min $1,000). Routes directly to notification with adjusted message: 'Your balance is $0, discount cannot be applied.'"],
          ["RAG finds no policy", "Supervisor adjusts notification: 'No fee waiver policy exists for your account type.' Instead of 'You qualify for a fee waiver.'"],
          ["Tool call fails", "Supervisor routes to error_handler or sends partial results with explanation: 'I couldn't access your transaction history right now.'"],
          ["User's intent changes mid-conversation", "Supervisor re-classifies and routes to a different agent chain entirely."],
        ]} />
  
      <h2>The Cost of Supervisor LLM Calls</h2>
      <p>Each supervisor call: ~300 tokens input, ~50 tokens output, ~150ms latency (Claude Haiku), ~$0.001 cost. For a 3-agent request (4 supervisor calls): +600ms latency, +$0.004 cost. Compare to sub-agent costs: ~$0.03-0.05 total. Supervisor overhead: ~10% of cost, ~8% of latency. Worth it for the dynamic routing intelligence.</p>
  
      <Callout type="tip"><strong>Practical optimization:</strong> Use DistilBERT intent classification for simple intents (80% of traffic — "What's my balance?" → route directly to account_agent, skip supervisor LLM). Use the full supervisor LLM only for complex compound intents (20% — "Check balance, find policy, text me"). This saves 80% of supervisor LLM costs while keeping dynamic reasoning for cases that need it.</Callout>
    </>);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 5: CI/CD & DEPLOYMENT LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  function Ch5Content() {
    return (<>
      <h1>CI/CD &amp; Deployment Lifecycle — From Empty Cluster to Production</h1>
      <Lead>How does your agent code go from a Python file on your laptop to running pods serving real users? This chapter covers two phases: Day 0 (the first-ever deployment, when nothing exists yet) and Day 1+ (the automated pipeline that handles every subsequent change). Understanding both is essential because Day 0 is manual and Day 1+ is automatic — and the gap between them is where most confusion lives.</Lead>
  
      <h2>Day 0 — Building the House (Manual, One-Time)</h2>
      <p>Before any agent code can run, someone must create the infrastructure. This is a one-time bootstrap that involves manual steps and typically takes days or weeks at a bank (because of approval processes).</p>
  
      <Diagram fig="5.1" title="Day 0 — the bootstrapping sequence">{`PHASE 1: Provision infrastructure (Terraform)
    terraform apply →
      K8s cluster (EKS/OpenShift) — empty, no pods
      PostgreSQL (Crunchy Operator / RDS) — empty, no tables
      Redis (Sentinel / ElastiCache) — empty, no keys
      Container registry (ECR / Harbor) — empty, no images
      DNS entry (Route 53 → load balancer)
      External load balancer (F5 / ALB)
  
  PHASE 2: Database setup
    Run SQL migrations against PostgreSQL:
      001_create_conversations.sql
      002_create_messages.sql
      003_create_document_chunks.sql
      004_create_audit_log.sql
      005_create_checkpoints.sql
    Result: tables exist but are empty.
    pgvector extension enabled, HNSW index created.
  
  PHASE 3: Create K8s Secrets
    kubectl create secret generic db-credentials ...
    kubectl create secret generic redis-credentials ...
    kubectl create secret generic llm-api-keys ...
    kubectl create secret generic oidc-secrets ...
    (In production: synced from HashiCorp Vault, not manual)
    These MUST exist before any pod can start.
  
  PHASE 4: First build
    CI builds image v1.0.0, pushes to registry.
    The image contains: Python code, dependencies, Uvicorn.
    It does NOT contain: secrets, data, state.
  
  PHASE 5: First deployment (manual kubectl apply)
    kubectl apply -f infra/openshift/agent/deployment.yaml
    kubectl apply -f infra/openshift/agent/service.yaml
    kubectl apply -f infra/openshift/agent/hpa.yaml
    kubectl apply -f infra/openshift/gateway/
    kubectl apply -f infra/openshift/llm-gateway/
    kubectl apply -f infra/openshift/tools/
  
    K8s reads Deployment → creates pods → pulls image →
    boots containers → readiness probe /healthz → 200 OK →
    pods marked Ready → Service has endpoints → traffic flows.
  
  PHASE 6: Configure automation (one-time setup)
    Set up CI trigger: git push → LightSpeed pipeline
    Set up CD trigger: new image tag → Harness pipeline
    Connect Harness to K8s cluster + Grafana metrics
    
    From this point: Day 0 never repeats.`}</Diagram>
  
      <Callout type="key">On Day 0, kubectl apply is NOT automatic. You run it manually because there's nothing deployed to receive an automated pipeline — it's the chicken-and-egg problem. Harness can't deploy to a Deployment that doesn't exist yet. You create the Deployment objects manually, then configure Harness to manage them going forward.</Callout>
  
      <h2>Day 1+ — The Automated Pipeline (git push → Production)</h2>
      <p>After the one-time setup, every code change follows the same automated path. You push code and go get coffee. Everything else happens without human intervention.</p>
  
      <Diagram fig="5.2" title="The automated CI/CD pipeline">{`YOU: git push origin main
      │
      │ Git webhook fires automatically
      ▼
  CI (LightSpeed) — triggered by webhook
      ├── Lint + type check (ruff, mypy)           ~5s
      ├── Unit tests (pytest, mocked LLM + DB)     ~25s
      ├── Integration tests                        ~45s
      │   (real Postgres + Redis in CI,
      │    mock LLM with predetermined responses,
      │    mock MCP servers)
      ├── Build container image (Dockerfile)        ~30s
      ├── Security scan (Trivy — CVE + secrets)    ~15s
      │   FAIL if HIGH/CRITICAL vulnerability found
      └── Push image to registry: v1.3.0            ~10s
      │
      │ Registry event fires automatically
      ▼
  CD (Harness) — triggered by new image tag
      ├── Deploy to DEV (full rollout)              ~60s
      │   K8s rolling update: create new pods,
      │   wait for /healthz, kill old pods.
      │
      ├── Deploy to STAGING                         ~5min
      │   Full rollout + smoke tests.
      │   Smoke tests: real LLM calls against
      │   staging provider. Verify: auth works,
      │   LLM responds, tool calls succeed,
      │   state persists across messages.
      │
      └── Deploy to PROD (canary)                   ~30min
          ├── 5% traffic to v1.3.0
          │   95% stays on v1.2.0
          │
          ├── CONTINUOUS VERIFICATION (10 min)
          │   Harness watches Grafana metrics:
          │   Compare canary vs baseline:
          │     Error rate: 0.1% vs 0.1% → SAME ✓
          │     p95 latency: 5.2s vs 5.1s → OK ✓
          │     5xx count: 0 vs 0 → SAME ✓
          │
          ├── PASS → ramp: 5% → 25% → 50% → 100%
          │   Old v1.2.0 pods terminated.
          │
          └── FAIL → AUTO-ROLLBACK
              Canary pod killed. All traffic to v1.2.0.
              PagerDuty alert: "Deploy v1.3.0 rolled back"
              Zero production impact (only 5% briefly affected).
  
  TOTAL: ~35 minutes from git push to 100% production.
  You did ONE thing: git push. Everything else was automatic.`}</Diagram>
  
      <h2>What Harness Actually Does to the K8s Objects</h2>
      <p>A crucial distinction: on Day 0, you CREATE Kubernetes objects (the Deployment, Service, HPA). On Day 1+, Harness UPDATES the existing Deployment — specifically, it changes the image field from v1.2.0 to v1.3.0. Everything else stays the same: replicas (managed by HPA), secrets (still mounted), resources (still 500m CPU, 1Gi memory), health checks (still /healthz).</p>
  
      <Code lang="what Harness does under the hood">{`# Harness effectively runs:
  kubectl set image deployment/agent-service \\
    agent=registry.bank.com/agent-service:v1.3.0
  
  # This changes ONE field in the existing Deployment:
  #   Before: image: registry.bank.com/agent-service:v1.2.0
  #   After:  image: registry.bank.com/agent-service:v1.3.0
  
  # Kubernetes sees the change and starts a rolling update:
  #   Create Pod agent-svc-new-1 (v1.3.0)...
  #     → Pull image... Start container... /healthz → 200 ✓
  #     → Pod Ready. Added to Service endpoints.
  #   Kill Pod agent-svc-old-1 (v1.2.0)...
  #     → Stops receiving new requests
  #     → Finishes in-flight requests (graceful shutdown)
  #     → Terminated.
  #   Repeat for remaining pods.
  #   Zero downtime throughout.`}</Code>
  
      <h2>Independent Deployments — Each Service Has Its Own Pipeline</h2>
      <p>The gateway, agent service, LLM gateway, and each tool microservice deploy independently through their own CI/CD pipelines. Updating the account-tools microservice does NOT require redeploying the agent. The agent discovers tools dynamically via MCP, so a new tool version with different behavior "just works" as long as the MCP interface contract doesn't change.</p>
  
      <Table headers={["Service", "Deployed by", "Trigger"]}
        rows={[
          ["API Gateway", "Its own Harness pipeline", "Changes to gateway code"],
          ["Agent Service", "Its own Harness pipeline", "Changes to agent/LangGraph code"],
          ["LLM Gateway (LiteLLM)", "Its own Harness pipeline", "Changes to model config, fallback rules"],
          ["Account Tools", "Its own Harness pipeline (owned by accounts team)", "Changes to account lookup logic"],
          ["Transaction Tools", "Its own Harness pipeline (owned by txn team)", "Changes to transaction search logic"],
          ["Escalation Service", "Its own Harness pipeline (owned by support team)", "Changes to escalation flow"],
        ]} />
  
      <h2>Database Migrations in the Pipeline</h2>
      <p>Schema changes (adding columns, creating indexes) run as init-containers: a container that executes before the main agent container starts. If the migration fails, the main container never launches. Schema changes must be backward-compatible (add columns, never rename or drop) so old and new pods can coexist during the canary rollout — the old v1.2.0 pods don't know about the new column, but that's fine because it has a default value.</p>
  
      <h2>Config Changes vs Code Changes</h2>
      <Table headers={["Type", "What changes", "How it's deployed"]}
        rows={[
          ["Code change", "Python logic, new node in LangGraph, new tool executor", "Full CI/CD: build image → test → canary. Takes ~35 minutes."],
          ["Config change", "System prompt text, model selection, temperature, MCP URLs, feature flags", "Update ConfigMap → restart pods. Takes ~30 seconds. No CI needed."],
          ["Secret change", "API keys rotated, DB password changed", "Vault syncs to K8s Secret → Vault agent sidecar picks up new value. Zero downtime. No restart needed."],
        ]} />
  
      <Callout type="tip">Putting the system prompt in a ConfigMap (not baked into the image) means you can tweak the agent's personality, rules, and tool guidance in 30 seconds without running CI. This is the difference between "we can iterate on the prompt 20 times today" and "each prompt change takes 35 minutes and a full deploy." At banks, prompt changes in a ConfigMap still require a review (it affects behavior), but the review + deploy cycle is minutes, not hours.</Callout>
  
      <Aside title="What if I change the YAML files themselves?">If you increase the memory limit or add an environment variable, you push the YAML change to Git alongside any code change. Harness applies the full YAML (not just the image update). For infrastructure changes at banks, YAML modifications to production usually require a separate approval process because they're infrastructure changes, not just code changes. Some teams use ArgoCD (GitOps) where any YAML change in the repo is automatically applied to the cluster.</Aside>
    </>);
  }
  
  // ─── CHAPTER COMPONENT MAP ─────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 6: SCALING & CAPACITY PLANNING
  // ═══════════════════════════════════════════════════════════════
  
  function Ch6Content() {
    return (<>
      <h1>Scaling &amp; Capacity Planning — 10 Users to 2 Million</h1>
      <Lead>Scaling an agent system is not one thing — it is two completely different activities operating on different timescales. Auto-scaling handles traffic spikes within a region in seconds. Capacity planning prepares infrastructure weeks or months ahead as your user base grows. Both are necessary, and confusing them is how teams either over-provision (wasting money) or get caught unprepared (outage). This chapter covers both, plus the latency optimization playbook that makes each request faster within whatever capacity you have.</Lead>
  
      <h2>What Auto-Scales and What Does Not</h2>
      <Table headers={["Component", "Auto-scales?", "How", "Human involvement"]}
        rows={[
          ["Gateway pods", "Yes", "HPA adds/removes pods based on http_requests_in_flight", "None — fully automatic in 30-60 seconds"],
          ["Agent pods", "Yes", "HPA adds/removes pods based on http_requests_in_flight", "None — fully automatic in 30-60 seconds"],
          ["Tool microservice pods", "Yes", "HPA per service, independent scaling", "None — fully automatic"],
          ["K8s cluster nodes", "Yes (EKS)", "Cluster Autoscaler adds servers when pods can't be scheduled", "None — 3-5 minutes per new node"],
          ["External load balancer", "Depends", "AWS ALB auto-scales behind the scenes. F5 is fixed hardware.", "F5: manual provision. ALB: automatic."],
          ["Redis", "No", "Add cluster nodes manually, Redis redistributes hash slots", "Human provisions — capacity planning"],
          ["PostgreSQL", "Partially", "Read replicas can be added. Write scaling requires partitioning.", "Human provisions replicas, architects partitioning"],
          ["LLM provider rate limits", "No", "Fixed by your enterprise contract with the provider", "Human negotiates higher limits — takes weeks"],
          ["Observability stack", "No", "Prometheus, Tempo, Loki backends must be provisioned", "Human provisions — capacity planning"],
        ]} />
  
      <Callout type="key">Stateless services (gateway, agent pods, tool pods) scale linearly by adding pods — this is automatic and fast. Stateful services (PostgreSQL, Redis) scale sub-linearly and require architectural changes at each order of magnitude — this is manual and slow. LLM provider rate limits are a hard external constraint that doesn't auto-scale at all — you scale it through commercial relationships.</Callout>
  
      <h2>The Three Stages of Growth</h2>
  
      <h3>Stage 1: 10 → 50,000 Users — Single Region, Auto-Scaling Handles It</h3>
      <p>One K8s cluster in one region. HPA auto-scales pods from 3 to 20 as traffic grows. Cluster Autoscaler adds nodes when existing nodes are full. PostgreSQL handles writes fine with one primary. Redis handles cache load with one cluster. LLM provider rate limit is sufficient. You watch dashboards and occasionally bump up config values (HPA maxReplicas, node pool max, Redis memory) as trend lines grow.</p>
  
      <h3>Stage 2: 50,000 → 200,000 Users — Optimize the Single Region</h3>
      <p>Before jumping to multi-region (expensive, complex), you optimize what you have. Each optimization extends your single-region runway significantly:</p>
      <Table headers={["Optimization", "What it does", "Capacity gain"]}
        rows={[
          ["PgBouncer (connection pooler)", "50 pods × 10 connections = 500 (hitting PG limit). PgBouncer pools: 50 pods → PgBouncer → 50 actual DB connections.", "5-10x more pods can share the DB"],
          ["LLM response caching", "Hash the prompt → check Redis → cache hit returns in 1ms, costs $0. 15-30% hit rate on repeated questions.", "15-30% fewer LLM calls"],
          ["PostgreSQL read replicas", "Agent pods read conversation history from replicas, write only to primary.", "3-5x read throughput"],
          ["Table partitioning", "Messages table partitioned by month. Queries scan current partition, not 500M rows.", "10x query speed on large tables"],
          ["Aggressive Redis caching", "Cache tool results for read-only queries (balance lookups) for 60 seconds.", "Fewer tool calls to backend systems"],
        ]} />
  
      <h3>Stage 3: 200,000 → 2 Million Users — Multi-Region</h3>
      <p>You've exhausted single-region optimizations. Metrics show: latency creeping up, LLM quota insufficient for one region, west coast users experiencing higher latency. Now you plan the second region — typically a 2-4 month project at a bank.</p>
      <Diagram fig="6.1" title="Multi-region architecture">{`us-east-1 (primary):                 us-west-2 (secondary):
    K8s cluster                          K8s cluster (identical)
    PostgreSQL primary ───streaming──→   PostgreSQL replica
    Redis cluster ────cross-region──→   Redis cluster
    All services deployed                All services deployed
  
  Route 53 (DNS):
    Latency-based routing → users go to nearest region
    Health checks every 10s → if east fails, DNS routes to west
    Failover in < 60 seconds
  
  Each region auto-scales independently within itself.
  Either region can handle 100% of traffic alone if the other fails.
  Combined capacity: ~2M users.`}</Diagram>
  
      <h2>How You Know You're Approaching Limits (Prometheus Alerts)</h2>
      <p>You don't suddenly discover you need more capacity. Prometheus metrics show growth trends weeks and months in advance.</p>
      <Table headers={["Alert", "What it means", "Action", "Timeline"]}
        rows={[
          ["HPA frequently hitting maxReplicas", "You're at the auto-scaling ceiling", "Increase maxReplicas or add nodes", "Days"],
          ["Cluster nodes > 80% CPU/memory", "Servers are nearly full", "Add more nodes to node pool", "Hours (Cluster Autoscaler) or days"],
          ["PostgreSQL connections > 80% of max", "DB approaching connection limit", "Add PgBouncer or read replicas", "Days to weeks"],
          ["LLM rate limit utilization > 70%", "Approaching provider quota", "Negotiate higher limits or add provider", "Weeks (contract negotiation)"],
          ["Single-region p95 latency increasing", "Users far from data center are slow", "Plan second region", "Months"],
        ]} />
  
      <h2>The Latency Optimization Playbook</h2>
      <p>Within whatever capacity you have, these optimizations make each individual request faster. Ranked by impact:</p>
  
      <Diagram fig="6.2" title="Where the time goes in a typical multi-agent request">{`LLM calls:        ████████████████████████████████████████  93%
  Tool calls:        ███                                       6%
  Everything else:   █                                          1%
                     (state, routing, PII scan, persist)
  
  Optimizing Redis saves milliseconds.
  Optimizing LLM usage saves SECONDS.
  Focus on the 93% first.`}</Diagram>
  
      <Table headers={["Optimization", "Saves", "How it works"]}
        rows={[
          ["Parallel agent execution", "2-4 seconds", "Run independent sub-agents simultaneously. If account lookup and policy search don't depend on each other, run them at the same time. LangGraph supports parallel branches: supervisor → [agent_A, agent_B] → join → agent_C."],
          ["Right-size models per task", "1-2 seconds", "Claude Haiku (150ms) for supervisor routing instead of Sonnet (500ms). Templates for greetings (0ms). DistilBERT for intent classification (2ms). Save the expensive model for complex reasoning only."],
          ["Skip unnecessary LLM calls", "1-2 seconds", "DistilBERT replaces supervisor LLM for 80% of simple intents. FAQ cache returns instantly for repeated questions. Greeting templates skip the LLM entirely."],
          ["Reduce prompt token count", "0.5-1 second", "Summarize old conversation history instead of sending all 30 messages. Send 2-3 RAG chunks instead of 5. Remove tools from prompt once they've been used. Every token removed makes the LLM respond faster."],
          ["LLM response caching", "2s per hit", "Hash the prompt → check Redis. If the same question was asked recently, return the cached response in 0.5ms instead of calling the LLM (2s). 15-30% hit rate at scale. Only for non-personalized queries."],
          ["Streaming", "Perceived: -4s", "User sees first token in 200ms instead of waiting 5s for the full response. Total time unchanged, but perceived wait drops dramatically. Ship this first — cheapest win."],
          ["RAG pipeline tuning", "100-200ms", "Local embedding model instead of API call (5ms vs 40ms). Tuned HNSW index (ef_search=40). Skip reranking when top result score > 0.95. Smaller cross-encoder model."],
          ["Tool call optimization", "50-200ms", "Connection pooling (keep MCP connections alive). Tool result caching in Redis. Parallel tool calls when independent. Combined tool definitions (one call instead of two)."],
        ]} />
  
      <Callout type="tip">Combined, these optimizations take a typical multi-agent request from ~10 seconds to ~4-5 seconds — a 50-60% reduction without changing your LLM provider or needing GPUs. The biggest wins come from parallel execution (architectural) and right-sizing models (configuration), not from micro-optimizing database queries.</Callout>
  
      <h2>What Happens When 2 Million Users Show Up Unexpectedly?</h2>
      <p>The system degrades. Auto-scaling helps but has limits — you can't spin up 100 pods if the cluster only has 10 nodes. The LLM provider rate limit is the hardest wall. The graceful degradation layer kicks in: cached responses for common questions, DLQ queuing for later processing, honest error messages. This is why Black Friday planning exists — if you KNOW a spike is coming, you pre-scale everything before the traffic arrives: more nodes, higher HPA max, higher rate limits, extra LLM provider endpoints.</p>
  
      <Aside title="Auto-scaling vs capacity planning — the summary">Auto-scaling is the thermostat (reacts to temperature). Capacity planning is buying a bigger house (planned move). You need both. Auto-scaling handles daily ups and downs (Monday morning spike, evening quiet). Capacity planning handles the growth curve (adding 10K users per month). Capacity planning ensures there's enough headroom for auto-scaling to operate within.</Aside>
    </>);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 7: OBSERVABILITY INTERNALS
  // ═══════════════════════════════════════════════════════════════
  
  function Ch7Content() {
    return (<>
      <h1>Observability Internals — How Every Signal Gets Captured</h1>
      <Lead>Observability is three independent pipelines (traces, metrics, logs) that collect different types of data from the same running services, store them in different backends, and are linked together by one identifier: the trace ID. This chapter covers the exact mechanics — how the OTel SDK instruments your code, what auto-instrumented vs manual spans look like, what specific metrics each service exposes, how logs automatically include trace IDs, and the debugging workflow that ties all three together.</Lead>
  
      <h2>The Three Pipelines — Independent but Linked</h2>
      <Diagram fig="7.1" title="Three independent observability pipelines">{`YOUR APPLICATION CODE (every service)
    │
    ├── OTel SDK generates TRACES (spans with timing)
    │     → OTel Collector sidecar (localhost:4317)
    │       → Grafana Tempo (trace storage)
    │         → Grafana UI (waterfall diagrams)
    │
    ├── OTel SDK / Prometheus client exposes METRICS
    │     → Prometheus PULLS from /metrics every 15s
    │       → Grafana UI (dashboards, charts, alerts)
    │
    ├── App writes structured JSON LOGS to stdout
    │     → Grafana Alloy (DaemonSet, 1 per node)
    │       → Grafana Loki (log storage)
    │         → Grafana UI (log search)
    │
    ├── LangChain callback sends LLM details
    │     → Langfuse (LLM-specific tracing)
    │       → Langfuse UI (prompt/completion viewer)
    │
    └── Gateway writes AUDIT entry (async)
          → PostgreSQL audit_log table
            → Compliance dashboards / regulator reports
  
  ALL LINKED BY: trace_id = 4bf92f3577b34da6
    Traces have it (every span).
    Logs include it (every log line).
    Audit log records it (for compliance linking).
    Langfuse captures it (for LLM behavior linking).`}</Diagram>
  
      <h2>Traces — Auto-Instrumented vs Manual Spans</h2>
      <p>When your FastAPI app starts, the OTel SDK initializes and auto-instruments HTTP calls, database queries, and Redis calls. You add a few lines at startup:</p>
  
      <Code lang="python — OTel initialization (runs once at pod startup)">{`from opentelemetry import trace
  from opentelemetry.sdk.trace import TracerProvider
  from opentelemetry.sdk.trace.export import BatchSpanProcessor
  from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
  from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
  from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
  from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
  from opentelemetry.instrumentation.redis import RedisInstrumentor
  
  # Send spans to OTel Collector sidecar on localhost
  provider = TracerProvider()
  provider.add_span_processor(
      BatchSpanProcessor(OTLPSpanExporter(endpoint="localhost:4317"))
  )
  trace.set_tracer_provider(provider)
  
  # Auto-instrument everything:
  FastAPIInstrumentor.instrument_app(app)   # every HTTP request → span
  HTTPXClientInstrumentor().instrument()     # every outbound HTTP call → span
  SQLAlchemyInstrumentor().instrument()      # every PostgreSQL query → span
  RedisInstrumentor().instrument()            # every Redis call → span
  
  # From now on, ZERO manual code needed for these spans.`}</Code>
  
      <p><strong>Auto spans</strong> capture every HTTP request, database query, Redis call, and outbound HTTP call automatically. <strong>Manual spans</strong> add business context the SDK can't see — "this is the supervisor routing step" or "this is the RAG retrieval step":</p>
  
      <Code lang="python — manual spans inside LangGraph nodes">{`tracer = trace.get_tracer("agent-service")
  
  def classify_intent(state):
      with tracer.start_as_current_span("supervisor.classify_intent") as span:
          span.set_attribute("user_message", state["user_message"][:100])
          intent = distilbert_classifier.predict(state["user_message"])
          span.set_attribute("intent", intent)
          span.set_attribute("confidence", 0.91)
          return {"intent": intent, "target_agent": "account_agent"}
  
  def run_rag_retrieval(state):
      with tracer.start_as_current_span("rag_agent.retrieval") as span:
          chunks = pgvector_search(state["user_message"])
          span.set_attribute("chunks_found", len(chunks))
          span.set_attribute("top_score", chunks[0]["score"])
          return {"retrieved_chunks": chunks}
  
  def execute_tool(state):
      with tracer.start_as_current_span("tool_agent.execute") as span:
          tool = state["pending_tool"]
          span.set_attribute("tool_name", tool["name"])
          result = mcp_client.call(tool["name"], tool["args"])
          span.set_attribute("tool_success", not result.get("error"))
          span.set_attribute("tool_latency_ms", result["latency_ms"])
          return {"tool_calls": state["tool_calls"] + [result]}`}</Code>
  
      <p>In Grafana Tempo, you see both types combined in one waterfall — auto spans showing the HTTP/DB mechanics, manual spans showing the business logic:</p>
  
      <Diagram fig="7.2" title="Combined span tree in Grafana Tempo">{`trace_id: 4bf92f3577b34da6
  
  ├─ POST /v1/agent (auto — FastAPI)                       8700ms
  │  ├─ supervisor.classify_intent (manual)                    2ms
  │  │  attributes: intent=needs_tool, confidence=0.94
  │  ├─ supervisor.route (manual)                            450ms
  │  │  ├─ HTTP POST llm-gw-svc (auto — httpx)              450ms
  │  │  attributes: next_agent=account_agent, model=haiku
  │  ├─ account_agent.react_loop (manual)                   3700ms
  │  │  ├─ account_agent.llm_call_1 (manual)                2000ms
  │  │  │  ├─ HTTP POST llm-gw-svc (auto)                   2000ms
  │  │  │  attributes: model=claude-sonnet, tokens_in=1200
  │  │  ├─ account_agent.tool_exec (manual)                   200ms
  │  │  │  ├─ HTTP POST acct-tools-svc/mcp (auto)            200ms
  │  │  │  attributes: tool=lookup_balance, success=true
  │  │  ├─ account_agent.llm_call_2 (manual)                 1500ms
  │  │  │  ├─ HTTP POST llm-gw-svc (auto)                   1500ms
  │  ├─ supervisor.route (manual)                             150ms
  │  ├─ guardrails.pii_scan (manual)                            5ms
  │  ├─ persist.dual_write (manual)                            10ms
  │  │  ├─ PostgreSQL INSERT (auto — sqlalchemy)                5ms
  │  │  ├─ Redis SET (auto — redis)                           0.5ms
  
  Each service's internal spans visible.
  Auto + manual combined give both technical AND business view.`}</Diagram>
  
      <h2>Trace Propagation Across Services</h2>
      <p>When the agent pod calls the LLM gateway or a tool service, the OTel SDK automatically injects the <code>traceparent</code> header into the HTTP request. The receiving service reads it and creates child spans under the same trace_id. One trace shows spans from ALL services — gateway, agent pod, LLM gateway, tool services, even the database queries inside the tool service.</p>
  
      <h2>Metrics — What Each Service Exposes</h2>
      <p>Prometheus metrics are aggregate numbers about the system overall. Four types: Counters (only go up — count events), Gauges (go up and down — current state), Histograms (distributions — latency percentiles), Summaries (similar to histograms, less common).</p>
  
      <Table headers={["Service", "Key metrics", "Type", "What it tells you"]}
        rows={[
          ["Gateway", "gateway_requests_total {method, path, status}", "Counter", "Requests per second, error rates by status code"],
          ["Gateway", "gateway_auth_failures_total {reason}", "Counter", "JWT validation failures — security monitoring"],
          ["Gateway", "gateway_rate_limit_rejections_total {user, team}", "Counter", "Who is hitting rate limits"],
          ["Agent", "agent_request_duration_seconds {intent}", "Histogram", "End-to-end latency (p50/p95/p99). THE most important metric."],
          ["Agent", "agent_llm_tokens_total {model, direction, agent}", "Counter", "Token consumption by model, by agent. Feeds cost calculations."],
          ["Agent", "agent_tool_calls_total {tool, agent, status}", "Counter", "Which tools called most, which failing"],
          ["Agent", "agent_requests_in_flight", "Gauge", "Current concurrent requests. HPA autoscaler watches this."],
          ["Agent", "agent_active_conversations", "Gauge", "Conversations active in last 30 min"],
          ["LLM GW", "llm_circuit_breaker_state {provider}", "Gauge", "0=closed, 1=open, 2=half-open per provider"],
          ["LLM GW", "llm_budget_remaining_dollars {team}", "Gauge", "Budget remaining this month. Alert at 20%."],
          ["LLM GW", "llm_fallbacks_total {from, to}", "Counter", "How often fallback chain activates"],
          ["LLM GW", "llm_cost_dollars_total {provider, team}", "Counter", "Actual dollar spend per team per provider"],
          ["Tools", "tool_request_duration_seconds {tool}", "Histogram", "Tool latency — detects slow backends"],
          ["Tools", "tool_backend_errors_total {tool, backend}", "Counter", "External system failures vs tool code bugs"],
          ["K8s", "kube_deployment_status_ready_replicas", "Gauge", "Are all desired pods running?"],
          ["K8s", "container_memory_working_set_bytes {pod}", "Gauge", "Memory usage per pod — approaching limit = OOM risk"],
        ]} />
  
      <p>Prometheus scrapes every pod's <code>/metrics</code> endpoint every 15 seconds. The response is plain text with all current metric values. Over time this builds a time-series: the value of each metric at every 15-second interval.</p>
  
      <h2>Logs — Structured JSON with Automatic Trace IDs</h2>
      <p>At each important step, your code writes a structured JSON log line to stdout. The OTel context automatically injects <code>trace_id</code> into every log line through a custom formatter — you don't manually pass the trace ID around:</p>
  
      <Code lang="python — logging setup with automatic trace_id injection">{`import logging, json
  from opentelemetry import trace
  
  class OTelFormatter(logging.Formatter):
      def format(self, record):
          span = trace.get_current_span()
          ctx = span.get_span_context()
          return json.dumps({
              "timestamp": record.created,
              "level": record.levelname,
              "service": "agent-service",
              "trace_id": format(ctx.trace_id, "032x") if ctx.trace_id else None,
              "span_id": format(ctx.span_id, "016x") if ctx.span_id else None,
              "message": record.getMessage(),
              **(record.__dict__.get("extra_data", {}))
          })
  
  # Now every log call automatically gets trace_id:
  logger.info("Intent classified", extra={"extra_data": {
      "intent": "needs_tool", "confidence": 0.91
  }})
  # Output: {"timestamp": ..., "trace_id": "4bf92f35...",
  #          "message": "Intent classified", "intent": "needs_tool"}`}</Code>
  
      <p>Grafana Alloy (DaemonSet on every K8s node) captures these from stdout and ships to Loki. In Loki, search by trace_id to see all logs for one request:</p>
      <Code lang="example log lines during Priya's request (all have trace_id)">{`INFO  trace_id=4bf92f35  State hydrated. cache=miss, messages=8
  INFO  trace_id=4bf92f35  Intent classified. intent=needs_tool, conf=0.91
  INFO  trace_id=4bf92f35  Supervisor routing. next=account_agent
  INFO  trace_id=4bf92f35  LLM call started. agent=account, model=sonnet
  INFO  trace_id=4bf92f35  LLM responded. type=tool_call, tool=lookup_balance
  INFO  trace_id=4bf92f35  Tool executing. tool=lookup_balance, ms=287
  INFO  trace_id=4bf92f35  LLM call #2. agent=account, type=text, tokens=45
  INFO  trace_id=4bf92f35  PII scan. detected=false
  INFO  trace_id=4bf92f35  State persisted. pg_rows=4, redis=updated
  INFO  trace_id=4bf92f35  Request complete. total_ms=4845, tokens=1883`}</Code>
  
      <h2>The Debugging Workflow — How You Use All Three Together</h2>
      <p>An alert fires at 2 AM: "agent_request_duration_seconds p95 exceeded 15 seconds for 5 minutes." Here is exactly how you debug it:</p>
  
      <Diagram fig="7.3" title="The debugging workflow — metrics → traces → logs">{`1. ALERT fires (Prometheus → Alertmanager → PagerDuty)
     "p95 latency > 15s for 5 min starting at 01:47 AM"
     You open Grafana.
  
  2. METRICS DASHBOARD (Prometheus → Grafana)
     Latency spike started at 01:47 AM.
     Filter by label: which agent is slow?
     → rag_agent shows p95 = 12 seconds (normally 2.5s)
     → Other agents look normal.
     CONCLUSION: RAG agent is the problem.
  
  3. EXEMPLAR TRACES (Prometheus → Tempo link)
     Click the latency spike on the chart.
     Grafana shows exemplar trace_ids from that window.
     Click: trace_id = "abc789def..."
  
  4. TRACE WATERFALL (Grafana Tempo)
     Full span tree for this request.
     rag_agent.retrieval span: 11,500ms (normally 90ms) ← THE CULPRIT
     Inside it: PostgreSQL SELECT ... ORDER BY embedding: 11,200ms
     → The pgvector query is extremely slow.
  
  5. LOGS (Tempo → Loki link)
     Click "Show logs for this trace."
     Grafana queries Loki: {trace_id="abc789def"}
     You see:
     WARN  trace_id=abc789  pgvector query slow. rows_scanned=2847291
     WARN  trace_id=abc789  HNSW index not used. sequential scan.
     → THE ROOT CAUSE: HNSW index was dropped!
  
  6. FIX
     Someone ran a migration that accidentally dropped the HNSW index.
     pgvector fell back to sequential scan (2.8M rows).
     Recreate: CREATE INDEX ON document_chunks
       USING hnsw (embedding vector_cosine_ops);
     After rebuild: rag_agent p95 drops from 12s to 2.5s. ✓
  
     Time from alert to fix: 15 minutes.
     Without observability: hours of guessing.`}</Diagram>
  
      <h2>The Three Metric Categories — System, AI, and Business</h2>
      <p>Traditional software only needs system health metrics (is the server running?). Agent systems need three categories because an agent can return 200 OK, have sub-second latency, and deliver a completely hallucinated answer. System metrics tell you the infrastructure is healthy. AI quality metrics tell you the intelligence is correct. Business metrics tell you the product is working. You need all three. Miss one category and you have a blind spot.</p>
  
      <h3>Category 1: System Health Metrics — "Is the infrastructure running?"</h3>
      <p>These are the traditional infrastructure metrics that any production service needs. They answer: is the system up, fast enough, and not dropping requests? Collected by Prometheus, visualized in Grafana, alerted via Alertmanager.</p>
  
      <Def term="p50 / p95 / p99 Latency">The time from request-received to response-sent at different percentiles. p50 (median) tells you the typical experience. p95 tells you what 1 in 20 users experience. p99 tells you what 1 in 100 experience — this is where the outliers hide. For agents: p50 should be under 5 seconds, p95 under 10 seconds, p99 under 15 seconds. If p50 is fine but p99 is terrible, you have a long-tail problem — likely one sub-agent or tool call timing out intermittently. Prometheus metric: <code>agent_request_duration_seconds</code> (histogram). You read percentiles with <code>histogram_quantile(0.95, ...)</code>.</Def>
  
      <Def term="Error Rate (5xx Rate)">Percentage of requests that return server errors (500, 502, 503, 504). Target: below 0.5% at all times. Above 1% for 2 minutes → PagerDuty alert. Important nuance for agents: a 200 response with a hallucinated answer is NOT counted here — that's an AI quality problem, not a system error. Error rate catches infrastructure failures: pod crashes, database timeouts, LLM provider outages. Prometheus metric: <code>rate(gateway_requests_total{'{'}status=~"5.."{'}'}[5m]) / rate(gateway_requests_total[5m])</code>.</Def>
  
      <Def term="Uptime / Availability">Percentage of time the service is responding to requests. Measured as: <code>(total_time - downtime) / total_time × 100</code>. Target: 99.9% (three nines) = maximum 8.76 hours downtime per year. For financial services: 99.95% is common contractual SLA. Measured by synthetic health checks from an external monitoring service (not self-reported). If the health check fails 3 consecutive times from 2+ regions → declared down.</Def>
  
      <Def term="Cache Hit Rate">Percentage of Redis lookups that return data (hit) vs needing a PostgreSQL fallback (miss). Two caches matter: conversation cache (target: 85-95% hit rate — most messages are within active conversations) and LLM response cache (target: 15-30% hit rate — depends on how repetitive your queries are). Formula: <code>cache_hits / (cache_hits + cache_misses) × 100</code>. Low hit rate → Redis TTL too short, or cache not being populated correctly, or traffic pattern changed. Prometheus metrics: <code>cache_hits_total</code> and <code>cache_misses_total</code> (counters).</Def>
  
      <Def term="Throughput (Requests Per Second)">How many agent requests the system processes per second. Baseline establishes normal traffic patterns (Monday morning spike, weekend quiet). Sudden drops → potential upstream issue (client not sending). Sudden spikes → potential DDoS or viral usage. Used for capacity planning: if you're at 80% of max throughput, start planning scale-up. Prometheus metric: <code>rate(gateway_requests_total[1m])</code>.</Def>
  
      <Def term="Token Consumption Rate">Tokens consumed per minute/hour/day, broken down by model and team. This is both a system metric (are you approaching provider rate limits?) and a cost metric (are you on budget?). A sudden spike in tokens per request means something changed — maybe the prompt grew, maybe the LLM is calling more tools than expected, maybe context windows are filling up. Prometheus metric: <code>llm_tokens_total{'{'}model, direction, team{'}'}</code> (counter).</Def>
  
      <Def term="Pod Restart Count">How many times pods have crashed and been restarted by Kubernetes. Zero restarts is normal. Frequent restarts → memory leak (OOMKilled), unhandled exceptions, or a dependency failing at startup. Kubernetes metric: <code>kube_pod_container_status_restarts_total</code>. Alert if any pod restarts more than 3 times in 10 minutes.</Def>
  
      <h3>Category 2: AI Quality Metrics — "Is the intelligence correct?"</h3>
      <p>These metrics answer: is the agent giving correct, grounded, relevant answers? They cannot be measured by Prometheus — they require an LLM judge, RAGAS evaluation, or human review. Collected by Langfuse, scored asynchronously, dashboarded separately from system metrics. This is the category that most teams miss entirely, and it is the category that interviewers will ask about most.</p>
  
      <Def term="Faithfulness">Does the answer stay grounded in the context it was given (tool outputs, retrieved documents), or does it add information that was never provided? Formula: <code>supported_claims / total_claims_in_answer</code>. An LLM judge decomposes the answer into individual claims, then checks each claim against the source context. A claim not supported by context is a hallucination. Target: above 0.85. Below 0.7 means your agent is regularly inventing information — dangerous in financial services. Tool: RAGAS faithfulness metric. Note: faithfulness is reference-free — you do NOT need a ground truth answer to compute it, only the context the LLM received.</Def>
  
      <Def term="Answer Relevancy">Is the answer actually about what the user asked, or is it on a tangent? Measured by generating reverse questions from the answer and computing cosine similarity to the original question. Formula: <code>mean(cosine_sim(generated_question_i, original_question))</code>. A factually correct answer about the wrong topic scores low here. Example: user asks "What's my balance?" and the agent responds with a correct but unsolicited explanation of fee structures — faithfulness is high (fees are real) but relevancy is low (user asked about balance). Target: above 0.8. Tool: RAGAS answer relevancy. Also reference-free.</Def>
  
      <Def term="Context Precision">Are the retrieved chunks (from RAG) ranked correctly — relevant chunks at the top, irrelevant ones at the bottom? Formula: <code>Σ(precision@k × relevance_k) / count_relevant_chunks</code>. This measures your retrieval pipeline quality, not the LLM. If you retrieve 5 chunks but the useful one is buried at position 5, context precision is low. Fixing this means tuning your embedding model, BM25 weights, or cross-encoder reranker. Target: above 0.75. Tool: RAGAS context precision. Requires ground truth answers to evaluate.</Def>
  
      <Def term="Context Recall">Does the retrieved context contain ALL the information needed to construct a correct answer? Formula: <code>GT_sentences_attributed_to_context / total_GT_sentences</code>. Each sentence in the ground truth answer is checked — can it be traced to at least one retrieved chunk? Low context recall means your retrieval is missing relevant documents — the information exists in your knowledge base but your search isn't finding it. Target: above 0.8. Tool: RAGAS context recall. Requires ground truth answers.</Def>
  
      <Def term="Hallucination Rate">Percentage of responses that contain fabricated information — facts, numbers, or claims not present in the source data. This is the inverse view of faithfulness but measured differently: an LLM judge or human reviewer flags each response as hallucinated or not. Formula: <code>hallucinated_responses / total_responses × 100</code>. Target: below 5% for enterprise, below 2% for financial advice. Measured via: LLM-as-judge on sampled production traces (1-5% sample) plus periodic human spot checks on the lowest-scoring responses.</Def>
  
      <Def term="Tool Selection Accuracy">Did the agent call the right tools in the right order? Measured by comparing the actual tool call sequence against a gold-standard trajectory for test cases. Formula: <code>correct_tool_sequences / total_evaluated_sequences</code>. This catches cases where the agent reaches the right answer but through a reckless path — calling 8 tools when 2 would do, or calling a destructive write tool it didn't need. Measured against an eval dataset of 100-500 curated test cases with expected tool sequences. Target: above 90%. Tool: custom eval comparing actual vs expected tool chains.</Def>
  
      <Def term="Task Completion Rate">Did the agent actually accomplish the user's goal? Not just "did it respond?" but "did the user get what they needed?" The most important AI quality metric but the hardest to measure. Methods: (1) LLM-as-judge — a stronger model reviews the conversation and scores whether the goal was met. (2) Human review — domain experts score a sample of conversations. (3) Implicit signals — user asked a follow-up rephrasing the same question (= not completed) vs user said "thanks" and moved on (= completed). Target: above 85%. Below 70% means your agent is failing users more than it's helping them.</Def>
  
      <Def term="Answer Correctness (Composite)">Combines semantic similarity and factual F1 overlap between the generated answer and a ground truth answer. Formula: <code>w₁ × semantic_similarity + w₂ × factual_F1</code>. Catches two failure modes that the individual metrics miss: an answer can be semantically similar but factually wrong ("heart attack" vs "stroke" — close in embedding space, completely different medically), or factually correct but phrased so differently that semantic similarity is low. Requires ground truth. Tool: RAGAS answer correctness.</Def>
  
      <Def term="Safety Score">Does the output contain harmful, toxic, biased, or inappropriate content? A safety classifier (separate from the main agent LLM) scores every response. For financial services: also checks for unauthorized financial advice, misleading claims, and regulatory violations. Measured as: <code>safe_responses / total_responses × 100</code>. Target: 99.9%+. Any safety violation → immediate alert + human review. Tool: safety classifiers (Anthropic content filter, custom fine-tuned classifier, or rule-based checks for domain-specific compliance).</Def>
  
      <h3>Category 3: Business Metrics — "Is the product working?"</h3>
      <p>These metrics answer: is the agent delivering value to the organization? They bridge the gap between technical performance and business outcomes. Reported to product managers and executives, not just engineers.</p>
  
      <Def term="Cost Per Task">Total cost to handle one user request, including LLM tokens (primary cost driver), tool call overhead, and infrastructure amortized per request. Formula: <code>(input_tokens × input_price + output_tokens × output_price) + tool_costs + infra_cost_per_request</code>. Track per-agent breakdown: supervisor calls (Haiku, cheap) vs sub-agent calls (Sonnet, expensive) vs tool calls. Target depends on what you're replacing — if a human advisor costs $300/hour and handles 4 requests/hour, $0.05/request is extraordinary ROI. Spike in cost per task → prompt bloat, unnecessary tool calls, or model configuration change.</Def>
  
      <Def term="User Satisfaction (CSAT / Thumbs Up-Down)">Direct user feedback on agent quality. Two common methods: (1) Thumbs up/down after each response — binary, high volume, low signal. (2) CSAT survey (1-5 scale) triggered periodically or after escalations — richer signal, lower volume. Target: 4.0+ average on 5-point scale, or 80%+ thumbs-up rate. Correlate with AI quality metrics: low CSAT + high faithfulness = the answers are correct but the delivery is bad (too verbose, wrong tone). Low CSAT + low faithfulness = the answers are wrong.</Def>
  
      <Def term="Deflection Rate">Percentage of requests the agent handles without escalating to a human. Formula: <code>agent_resolved / (agent_resolved + human_escalated) × 100</code>. Target: 70-85% for customer service, 50-70% for complex advisory. Below 50% means the agent isn't useful enough — users are better off going directly to humans. Above 95% is suspicious — either the agent is handling things it shouldn't, or escalation is broken.</Def>
  
      <Def term="Escalation Rate">The inverse of deflection — what percentage of requests require human intervention? Track WHY: tool failure, low confidence, user requested, safety flag, compliance flag. The "why" distribution matters more than the number. If 80% of escalations are "low confidence on financial advice" → that's a prompt engineering fix. If 80% are "tool timeout" → that's an infrastructure fix.</Def>
  
      <Def term="Time to Resolution">How long from the user's first message to the issue being resolved — either by the agent or after escalation. Agent-only resolution: typically 30-60 seconds. Agent + human escalation: minutes to hours. Track separately. If agent resolution is fast but human escalation adds 2 hours, the business case is clear: every percentage point of deflection improvement saves significant human time.</Def>
  
      <Table caption="The Complete Metrics Taxonomy — What to Monitor in Production"
        headers={["Category", "Metric", "Target", "Measured By", "Alert Threshold"]}
        rows={[
          ["System", "p95 latency", "< 10s", "Prometheus histogram", "> 15s for 5 min"],
          ["System", "p99 latency", "< 15s", "Prometheus histogram", "> 25s for 5 min"],
          ["System", "Error rate (5xx)", "< 0.5%", "Prometheus counter", "> 1% for 2 min"],
          ["System", "Uptime", "> 99.9%", "External synthetic monitor", "3 consecutive failures"],
          ["System", "Cache hit rate", "> 85%", "Prometheus counter", "< 70% for 15 min"],
          ["System", "Token consumption", "Within budget", "Prometheus counter", "> 80% of monthly quota"],
          ["AI Quality", "Faithfulness", "> 0.85", "RAGAS (async, sampled)", "< 0.7 avg over 1 hour"],
          ["AI Quality", "Answer relevancy", "> 0.8", "RAGAS (async, sampled)", "< 0.65 avg over 1 hour"],
          ["AI Quality", "Hallucination rate", "< 5%", "LLM judge + spot check", "> 10% over 1 hour"],
          ["AI Quality", "Tool selection accuracy", "> 90%", "Eval dataset comparison", "< 80% on CI eval run"],
          ["AI Quality", "Task completion", "> 85%", "LLM judge / human review", "< 70% over 1 day"],
          ["AI Quality", "Safety score", "> 99.9%", "Safety classifier", "ANY violation → immediate"],
          ["Business", "Cost per task", "< $0.05", "Token counts × pricing", "> 2× baseline for 1 hour"],
          ["Business", "CSAT", "> 4.0/5", "User feedback", "< 3.5 avg over 1 day"],
          ["Business", "Deflection rate", "> 70%", "Escalation tracking", "< 50% over 1 day"],
        ]} />
  
      <h2>The Evaluation Pipeline — How AI Quality Metrics Are Actually Computed</h2>
      <p>System metrics are real-time (Prometheus scrapes every 15 seconds). AI quality metrics are NOT real-time — they are computed asynchronously on a sample of production traces. Scoring every single response with an LLM judge would cost more than the responses themselves. Instead:</p>
  
      <Diagram fig="7.4" title="The evaluation pipeline — from production trace to quality score">{`PRODUCTION TRAFFIC (100% of requests)
      │
      ▼
  LANGFUSE captures every trace
    (prompt, completion, tools, tokens, cost)
      │
      ├── 100% → Langfuse UI (available for manual inspection)
      │
      ├── 1-5% SAMPLE → Async Evaluation Queue
      │     │
      │     ├── RAGAS metrics (faithfulness, relevancy)
      │     │   Run on sampled traces using a judge LLM
      │     │   Cost: ~$0.01 per evaluation
      │     │   Latency: 5-15 seconds per sample (async, not blocking)
      │     │
      │     ├── LLM-as-Judge (task completion, correctness)
      │     │   A stronger model scores the output on rubrics:
      │     │   correctness (1-5), completeness (1-5),
      │     │   helpfulness (1-5), safety (pass/fail)
      │     │
      │     ├── Safety classifier (toxicity, compliance)
      │     │   Runs on EVERY response (not sampled — safety is 100%)
      │     │
      │     └── Deterministic checks (tool call validation)
      │         Compare actual tool sequence to business rules
      │         "Did the agent check suitability BEFORE drafting advice?"
      │
      └── SCORES → Langfuse annotations + Grafana dashboard
            Alert if any metric drifts below threshold for 30 min
  
  WEEKLY: Human review of bottom 10% (lowest-scoring traces)
    Domain experts review and correct → feeds back into eval dataset`}</Diagram>
  
      <h3>The Evaluation Tooling Landscape</h3>
      <Table headers={["Tool", "Style", "Best for"]}
        rows={[
          ["RAGAS", "Reference-free RAG metrics", "Faithfulness, relevancy, context precision/recall — the RAG-specific evaluation suite. No ground truth needed for faithfulness and relevancy."],
          ["DeepEval", "Pytest-style, code-first", "Unit tests for LLMs: assert on metrics in CI. Ships G-Eval (custom rubric metrics), hallucination detection, answer relevancy. Integrates into your test suite."],
          ["LangSmith", "Eval inside LangChain ecosystem", "Dataset management, online eval on traces, tight LangGraph integration. Good if you're already using LangChain."],
          ["Arize Phoenix", "Open-source observability + eval", "Trace-linked evaluation, drift detection, root-cause analysis. Connects quality scores back to specific spans."],
          ["Braintrust", "Hosted eval + experiment tracking", "Comparing prompt/model versions across runs with a UI and scoring functions. Good for A/B testing prompts."],
        ]} />
  
      <Callout type="tip"><strong>The standout for engineers is DeepEval</strong>: it reframes evaluation as testing. You write assertions — "faithfulness must exceed 0.8," "no hallucination," "this trajectory called search before respond" — as pytest cases, and they run in CI exactly like unit tests. On every PR that changes prompts, tools, or model configuration → run the eval suite → block the PR if any metric drops below threshold. This is the CI/CD for AI quality.</Callout>
  
      <h2>The Data Flywheel — How Production Traces Improve the System</h2>
      <p>The most valuable output of your observability pipeline is not dashboards — it is the feedback loop that makes the system better over time.</p>
  
      <Diagram fig="7.5" title="The data flywheel — production failures become test cases">{`PRODUCTION
    │
    ├── Trace scored LOW by eval pipeline
    │   (faithfulness < 0.5, or task not completed)
    │     │
    │     ▼
    │   HUMAN REVIEWS the trace in Langfuse
    │   "The RAG agent retrieved irrelevant chunks about
    │    corporate bonds when user asked about personal savings."
    │     │
    │     ▼
    │   ROOT CAUSE identified:
    │   Embedding model confuses "bonds" in different contexts.
    │     │
    │     ├── FIX: Improve chunking strategy for bond documents
    │     │   Add metadata filtering: document_type=personal_savings
    │     │
    │     └── ADD TO EVAL DATASET:
    │         {
    │           input: "What are my savings bond options?",
    │           expected_tools: ["search_personal_products"],
    │           expected_output_contains: ["savings", "personal"],
    │           NOT_expected: ["corporate bonds", "fixed income"]
    │         }
    │
    └── THIS FAILURE NEVER RECURS
        The eval dataset grows from 100 → 200 → 500 cases
        Each case was a REAL production failure
        Every PR runs against this growing dataset
        Regression is structurally impossible
  
  THE FLYWHEEL:
    Production traces → Score → Review → Fix → Test case → CI gate
    → Prevents regression → Better production → Better traces → ...`}</Diagram>
  
      <Callout type="key">The eval dataset is your most valuable asset after the model itself. It starts at 100 curated cases (70% common queries, 20% edge cases, 10% adversarial). Every production failure becomes a new test case. After 6 months, you have 500+ battle-tested cases. After a year, 1000+. Each one represents a real user scenario that your system once got wrong and now structurally cannot get wrong again.</Callout>
  
      <h2>LLM-as-Judge — How It Works and Its Limitations</h2>
      <p>For metrics like task completion and correctness, you use a separate (often stronger) LLM to score agent outputs against rubrics. The judge LLM receives: the original user query, the agent's full response, optionally the tool call chain, and a structured rubric defining what 1-5 means for each dimension.</p>
      <p><strong>Limitations to know for interviews:</strong> LLM judges are biased toward verbose responses (longer ≠ better). They are non-deterministic (same input can get different scores). They are expensive at scale. Mitigation: run multiple evaluations and average, use structured rubrics with concrete examples for each score level, combine LLM judge with deterministic checks (did the tool call sequence match?), and periodically calibrate against human judgments.</p>
  
      <h2>Langfuse — The LLM-Specific Observability Layer</h2>
      <p>Grafana answers: "Is the system healthy?" Langfuse answers: "Is the AI behaving correctly?" They are completely separate systems collecting different data. Langfuse captures: exact prompts (every token the LLM saw), exact completions (every token the LLM generated), token counts and costs, tool call chains (which tools the LLM requested in what order), and per-agent breakdowns. You use Langfuse when: the system is fast and healthy but the AI gives wrong answers — then you open Langfuse, find the trace, and see exactly what the LLM saw and decided. Langfuse also serves as the storage layer for evaluation scores — when the async evaluation pipeline scores a trace, those scores are written back to Langfuse as annotations, creating a scored corpus you can filter and analyze.</p>
  
      <h2>The Audit Log — Separate from Everything</h2>
      <p>The audit_log in PostgreSQL is for compliance, not debugging. It records: who made the request (user_id), what they did (action), when (timestamp), the trace_id (for linking to engineering traces if needed), and whether PII was detected. Retained for 7 years (regulatory requirement). Tamper-proof (write-once, access-controlled). The trace_id field is the bridge — an auditor can ask about a specific request, you look up the trace_id in the audit log, then use that trace_id to find the engineering traces in Tempo for technical details.</p>
  
      <Callout type="key">Observability and evaluation are the same data viewed twice. The trace you capture for debugging is the trace you score for online evaluation is the trace you convert into a regression test case. Build the tracing layer well once, and three problems — debugging, quality monitoring, and continuous improvement — are solved by the same pipe.</Callout>
    </>);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 8: WEALTH MANAGEMENT WALKTHROUGH
  // ═══════════════════════════════════════════════════════════════
  
  function Ch8Content() {
    return (<>
      <h1>Walkthrough — Wealth Management AI Advisory Platform</h1>
      <Lead>This chapter assembles everything from the entire course into one end-to-end example: a multi-agent wealth management system where an advisor's single query triggers four specialized sub-agents running in parallel, each with their own tools via MCP, orchestrated by a supervisor LLM, with full observability, resilience, and compliance. Every concept from every previous chapter appears here — infrastructure, state management, routing, CI/CD, scaling, and observability — applied to a realistic enterprise use case.</Lead>
  
      <PullQuote cite="The design principle">The model is one component. The system you build around it — the harness, the retrieval, the state management, the operational discipline — is the engineering.</PullQuote>
  
      <h2>The Use Case</h2>
      <p>A major bank deploys an AI platform for its wealth management division. Financial advisors use it to serve high-net-worth clients. Advisor Priya asks:</p>
      <Callout type="key">"My client Rajesh Kumar wants to rebalance his portfolio. Check his current holdings, find our latest market outlook on emerging markets, verify his risk tolerance profile, and draft a summary email to him with recommendations."</Callout>
      <p>This single query requires <strong>four specialized sub-agents</strong>, each with their own MCP tools:</p>
  
      <Table headers={["Sub-Agent", "MCP Tools", "What it does"]}
        rows={[
          ["Portfolio Agent", "get_holdings, get_asset_allocation, get_performance_history", "Queries the portfolio management system for Rajesh's current positions and allocation"],
          ["Research Agent (RAG)", "search_research_reports, get_report_detail, search_market_outlook", "Searches the bank's research database using hybrid RAG (BM25 + pgvector + cross-encoder rerank)"],
          ["Compliance Agent", "get_risk_profile, check_suitability, get_regulatory_flags", "Verifies that the proposed rebalancing is suitable for Rajesh's risk tolerance"],
          ["Communication Agent", "draft_email, get_client_preferences, schedule_followup", "Composes a professional email to Rajesh with the recommendations"],
        ]} />
  
      <h2>The Architecture in Action</h2>
      <Diagram fig="8.1" title="Multi-agent execution with parallel fan-out">{`Priya's query
      │
      ▼
  Supervisor LLM call #1 (Haiku, 450ms)
    "Portfolio and research are independent. Run them in parallel.
     Compliance needs holdings. Communication needs everything."
      │
      ├─────────────── PARALLEL ───────────────┐
      ▼                                        ▼
  Portfolio Agent (3.2s)               Research Agent (2.8s)
    Inner ReAct loop:                    Inner ReAct loop:
    LLM → get_holdings → LLM            LLM → search_market_outlook
    → get_allocation → LLM → text       → get_report_detail → LLM → text
      │                                        │
      └──────────── BOTH DONE ────────────────┘
                      │
                CHECKPOINT saved (state has portfolio + research)
                      │
      Supervisor LLM call #2 (Haiku, 150ms)
      "Both done. Compliance needs holdings data. Route next."
                      │
                      ▼
            Compliance Agent (2.1s)
              Inner ReAct loop:
              LLM → get_risk_profile → LLM
              → check_suitability → LLM → text
                      │
                CHECKPOINT saved
                      │
      Supervisor LLM call #3 (Haiku, 150ms)
      "Compliance passed. Draft the email."
                      │
                      ▼
          Communication Agent (1.8s)
            Inner ReAct loop:
            LLM → get_client_preferences → LLM
            → draft_email → LLM → text
                      │
                CHECKPOINT saved
                      │
      Supervisor LLM call #4 (Haiku, 100ms)
      "All done."
                      │
                      ▼
                Guardrails (PII scan + persist)
                      │
                      ▼
                Response to Priya`}</Diagram>
  
      <h2>The Complete Timing Breakdown</h2>
      <Diagram fig="8.2" title="Where every millisecond goes">{`Step                                              Time
  ─────────────────────────────────────────────────────────
  Client → External LB → Internal LB → Gateway        15ms
  Gateway: JWT + rate limit + validate + trace + audit  8ms
  Hydrate state (Redis miss → PostgreSQL)               9ms
  Supervisor plan (Haiku)                             450ms
  PARALLEL PHASE:                                    3200ms
    Portfolio agent (3.2s):
      LLM call #1 (Sonnet): tool_call → get_holdings  2000ms
      MCP → portfolio-tools-svc                         180ms
      LLM call #2: tool_call → get_allocation           800ms
      MCP → portfolio-tools-svc                         120ms
      LLM call #3: final text                          1200ms
    Research agent (2.8s — runs simultaneously):
      LLM call #1: tool_call → search_market_outlook   1500ms
      MCP → research-tools-svc → pgvector search        150ms
      LLM call #2: tool_call → get_report_detail        800ms
      MCP → research-tools-svc                          100ms
      LLM call #3: final text                          1200ms
    PARALLEL SAVES: 2.8s (research runs during portfolio)
  Checkpoint #1                                          5ms
  Supervisor route #2 (Haiku)                          150ms
  Compliance agent (2.1s):
    LLM call #1: tool_call → get_risk_profile          1200ms
    MCP → compliance-tools-svc                          150ms
    LLM call #2: tool_call → check_suitability          600ms
    MCP → compliance-tools-svc                          100ms
    LLM call #3: final text                             800ms
  Checkpoint #2                                          5ms
  Supervisor route #3 (Haiku)                          150ms
  Communication agent (1.8s):
    LLM call #1: tool_call → get_client_preferences     600ms
    MCP → communication-tools-svc                       100ms
    LLM call #2: tool_call → draft_email                800ms
    MCP → communication-tools-svc                       150ms
    LLM call #3: final text                             500ms
  Checkpoint #3                                          5ms
  Supervisor done (Haiku)                              100ms
  PII scan                                               5ms
  Persist (PostgreSQL + Redis)                          15ms
  Response return path                                   3ms
  ─────────────────────────────────────────────────────────
  TOTAL:                                           ~10,200ms
  
  BREAKDOWN:
    Sub-agent LLM calls (Sonnet): ~8,100ms   (79%)
    Supervisor LLM calls (Haiku):   ~850ms   (8%)
    Tool calls (MCP):             ~1,050ms   (10%)
    Everything else:                ~200ms   (2%)
  
  WITHOUT parallel execution:                  ~13,000ms
  WITH parallel execution:                     ~10,200ms
    SAVED: 2,800ms (the entire research agent's time)`}</Diagram>
  
      <h2>The State Dictionary at Each Stage</h2>
      <p>One state dictionary flows through all four agents plus the supervisor. Let me show the key additions at each stage:</p>
  
      <Table headers={["After stage", "Key new fields in state", "Size"]}
        rows={[
          ["Init", "conversation_id, user_message, user_id, conversation_history (12 msgs)", "~2 KB"],
          ["Supervisor #1", "intent='multi_agent_compound', execution_plan={parallel_first: [portfolio, research], then: [compliance, communication]}", "~2.1 KB"],
          ["Portfolio agent", "tool_calls += [{get_holdings, result: {AAPL: 500, VWO: 2000, ...}}, {get_allocation, result: {equities: 45%, bonds: 35%}}], portfolio_summary='$2.4M total...'", "~5 KB"],
          ["Research agent", "retrieved_chunks=[3 EM outlook chunks], research_summary='Q2 2026 EM outlook cautiously bullish...', rag_source_docs=['RPT-2026-Q2-EM']", "~7 KB"],
          ["Compliance agent", "tool_calls += [{get_risk_profile, result: {tolerance: 'moderate-aggressive'}}, {check_suitability, result: {suitable: true}}], compliance_summary='Risk profile supports...'", "~8.5 KB"],
          ["Communication agent", "tool_calls += [{get_client_preferences, result: {name: 'Mr. Kumar', style: 'formal'}}, {draft_email, result: {draft_id: 'draft-789'}}], email_draft_id='draft-789'", "~9.5 KB"],
          ["Guardrails", "pii_detected=false, llm_response='I've completed the analysis for Rajesh...'", "~10 KB"],
        ]} />
  
      <h2>Observability Captured During This Request</h2>
      <Table headers={["Signal", "What was captured", "Where"]}
        rows={[
          ["Traces (35+ spans)", "Gateway (8ms), agent root (10.2s), 4 supervisor calls, 3+3+3+3 sub-agent LLM calls, 8 MCP tool calls, 3 PG queries, 5 Redis calls — all under one trace_id", "OTel Collector → Tempo"],
          ["Metrics", "agent_request_duration: 10.2s. llm_tokens_total: +6,800 (Sonnet) + 520 (Haiku). tool_calls_total: +8. llm_cost_dollars_total: +$0.04 (Sonnet) + $0.002 (Haiku)", "Prometheus → Grafana"],
          ["Logs (25+ lines)", "Every supervisor routing decision, every LLM call start/complete, every tool execute/result, PII scan, persist — all with trace_id", "Alloy → Loki"],
          ["Langfuse", "13 LLM calls with full prompts + completions. Per-agent breakdown. Tool chain visualization. Total cost: $0.042", "Langfuse API"],
          ["Audit log", "user=priya.sharma, action=advisor_query, client=rajesh-5678, trace_id=..., pii=false", "PostgreSQL audit_log"],
        ]} />
  
      <h2>What Happens When Things Break — Resilience Scenarios</h2>
  
      <Table headers={["Scenario", "What happens", "User impact"]}
        rows={[
          ["Claude has a 30s outage", "LLM gateway retries (1s → 2s → 4s with jitter). All fail. Fallback to GPT-4o. Circuit breaker trips → subsequent requests skip Claude entirely. After 60s: HALF-OPEN → probe → CLOSED.", "+4s latency on first affected request. No manual intervention."],
          ["Pod crashes after compliance agent", "Gateway detects timeout. Retries to different pod. New pod loads checkpoint (step=parallel_done + compliance_done). Resumes from supervisor call #3 → communication agent. Portfolio + research + compliance work preserved.", "+3s extra (communication redone). No data loss."],
          ["Portfolio database is down", "portfolio-tools-svc tool call times out (10s). Circuit breaker trips. LLM gets tool_error. Priya told: 'I couldn't access portfolio data. I can still provide research outlook and compliance info.'", "Partial result instead of total failure."],
          ["Redis is down", "State hydration: Redis GET fails → fall back to PostgreSQL (slower). Rate limiting: fail-open (allow requests, log WARNING, fire alert). Agent continues functioning, slightly slower.", "No user-facing impact. Self-heals when Redis recovers."],
          ["Entire us-east-1 region fails", "Route 53 health check detects failure < 60s. DNS routes ALL traffic to us-west-2. PostgreSQL replica promoted to primary. Redis cache cold but self-heals from PG.", "~60s of failed requests during DNS switchover. Full service after."],
        ]} />
  
      <h2>The Cost Math</h2>
      <Diagram fig="8.3" title="Per-request cost breakdown">{`Supervisor calls (4 × Haiku):
    Input: 4 × 300 tokens = 1,200 tokens × $1.00/M = $0.0012
    Output: 4 × 50 tokens = 200 tokens × $5.00/M  = $0.0010
  
  Sub-agent calls (12 × Sonnet):
    Input: ~5,200 tokens total × $3.00/M            = $0.0156
    Output: ~1,600 tokens total × $15.00/M           = $0.0240
  
  TOTAL per request: ~$0.042
  
  At 50,000 requests/month: ~$2,100/month
  Human wealth advisor time equivalent: $300+/hour
  One advisor handling 50K requests manually: impossible
  ROI: enormous.`}</Diagram>
  
      <h2>How This System Was Deployed</h2>
      <p>The same CI/CD pipeline from Chapter 5:</p>
      <FlowBox items={["Developer pushes code", "CI: lint → test → build → scan", "Harness CD: dev → staging → prod canary", "Continuous verification (Grafana metrics)", "Pass → ramp 100% | Fail → auto-rollback"]} color="#4ade80" />
      <p>Each of the four tool services (portfolio, research, compliance, communication) deploys independently. The accounts team can update portfolio-tools-svc without touching the agent. The agent discovers updated tools via MCP on next pod restart. Independent teams, independent release cycles, one unified system.</p>
  
      <h2>Interview Summary — How to Present This System</h2>
      <Callout type="tip">When presenting this system in an interview, structure it as: (1) Requirements: multi-domain, parallel-capable, compliance-mandatory, latency-tolerant. (2) Architecture: supervisor-worker multi-agent with 4 specialists, justified by tool overload (20+ tools) and domain isolation. (3) Key decisions: parallel fan-out for independent agents (saves 2.8s), Haiku for supervisor (saves 1.5s vs Sonnet), tool scoping per agent (security + accuracy), checkpointing after expensive steps (crash recovery). (4) Operational: three observability pipelines linked by trace_id, canary deployment with quality gates, five resilience scenarios handled automatically. (5) Cost: $0.042/request replacing hours of human advisor time. Name the technologies at every layer — this demonstrates production experience.</Callout>
  
      <Table headers={["Layer", "Technology choices"]}
        rows={[
          ["Edge", "F5 / Akamai (DDoS, TLS) → K8s Ingress (HAProxy, L7 routing)"],
          ["Gateway", "FastAPI (6-step pipeline: JWT via Keycloak, Redis rate limiting, Pydantic validation, OTel tracing, PostgreSQL audit, K8s Service forwarding)"],
          ["Agent", "FastAPI + LangChain + LangGraph (supervisor + 4 sub-agent ReAct loops, typed AgentState, HPA on http_requests_in_flight)"],
          ["LLM", "LiteLLM gateway (budget enforcement, Claude→GPT-4o→Llama fallback, per-provider circuit breakers, Langfuse logging)"],
          ["Tools", "FastAPI microservices + MCP (dynamic discovery, per-tool credentials via Vault, 5-10s timeouts, circuit breakers)"],
          ["Data", "PostgreSQL + Crunchy Operator (messages, audit, pgvector for RAG) + Redis Sentinel (session cache, rate limits, circuit breaker state)"],
          ["Observability", "OTel SDK → Collector sidecar → Tempo (traces) | Prometheus → Grafana (metrics) | Alloy → Loki (logs) | Langfuse (LLM traces) | PostgreSQL (audit)"],
          ["CI/CD", "LightSpeed CI (lint, test, build, Trivy scan) → Harness CD (dev → staging → prod canary with continuous verification, auto-rollback)"],
          ["DR", "Route 53 DNS failover, PostgreSQL streaming replication, multi-region active-active, LangGraph checkpointing, DLQ reprocessing"],
        ]} />
  
      <PullQuote cite="The thesis of this course">The model is one component. The infrastructure, the harness, the state management, the observability, the resilience, the deployment discipline, and the evaluation loop are the rest. An agent that cannot be deployed, monitored, debugged, and improved is a demo. An agent wrapped in the right system is a product.</PullQuote>
    </>);
  }
  
  // ─── CHAPTER COMPONENT MAP ─────────────────────────────────────────
  const CHAPTER_COMPONENTS = {
    ch0: Ch0,
    ch1: Ch1Content,
    ch2: Ch2Content,
    ch3: Ch3Content,
    ch4: Ch4Content,
    ch5: Ch5Content,
    ch6: Ch6Content,
    ch7: Ch7Content,
    ch8: Ch8Content,
  };
  
  // ─── CONTENT CSS ────────────────────────────────────────────────
const CONTENT_CSS = `
:root{--paper:#0f1830;--paper-deep:#0a1020;--ink:#eaf0fb;--ink-soft:#aab8d4;--ink-faint:#6d7b9c;--rule:#243353;--rule-soft:#1a2742;--accent:#60a5fa;--accent-2:#38bdf8}
.content-body{font-family:'Spectral',Georgia,serif;color:var(--ink);font-size:17px;line-height:1.72}
.content-body p{color:var(--ink-soft);margin:0 0 16px;text-align:justify;hyphens:auto}
.content-body strong{color:var(--ink);font-weight:600}.content-body em{font-style:italic;color:#c6d2ec}
.content-body code{font-family:'JetBrains Mono',monospace;font-size:.86em;background:rgba(96,165,250,.13);color:#9fc4ff;padding:1px 5px;border-radius:3px}
.content-body h1{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:36px;line-height:1.1;color:var(--ink);margin:0 0 24px;letter-spacing:-.5px}
.content-body h2{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:22px;line-height:1.25;color:var(--ink);margin:38px 0 12px;padding-bottom:6px;border-bottom:1px solid var(--rule-soft)}
.content-body h3{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:18px;color:var(--ink);margin:28px 0 10px}
.lead{font-size:18px!important;line-height:1.7!important;color:var(--ink)!important;margin-bottom:22px!important}
.lead::first-letter{font-family:'Fraunces',Georgia,serif;font-weight:600;float:left;font-size:60px;line-height:.78;padding:6px 10px 0 0;color:var(--accent)}
.pullquote{margin:34px 8px;padding:8px 0 4px;text-align:center;border-top:1px solid var(--accent);border-bottom:1px solid var(--accent)}
.pq-mark{font-family:'Fraunces',serif;font-size:40px;color:var(--accent);line-height:0;vertical-align:-12px;margin-right:4px}
.pq-text{font-family:'Fraunces',Georgia,serif;font-style:italic;font-size:21px;line-height:1.45;color:var(--ink)}
.pullquote cite{display:block;margin-top:12px;font-family:'Spectral',serif;font-style:normal;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-faint)}
.aside{background:rgba(56,189,248,.07);border-left:3px solid var(--accent-2);padding:14px 18px;margin:22px 0;border-radius:0 4px 4px 0}
.aside-label{font-family:'Spectral',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--accent-2);font-weight:600;margin-bottom:6px}
.aside-body{font-size:15px;line-height:1.6;color:var(--ink-soft)}
.def{margin:16px 0;padding-left:16px;border-left:2px solid var(--rule)}.def-term{font-family:'Fraunces',serif;font-weight:600;color:var(--ink);margin-right:8px}.def-body{color:var(--ink-soft)}
.code{background:var(--paper-deep);border:1px solid #20304f;border-radius:5px;padding:18px 20px;margin:20px 0;overflow:auto;box-shadow:0 1px 2px rgba(0,0,0,.3) inset}
.code code{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.65;color:#c3d2ee;background:none;padding:0;white-space:pre}
.code-lang{font-family:'Spectral',serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-faint);margin-bottom:10px}
.figure{margin:26px 0}.fig-cap{font-family:'Spectral',serif;font-size:12px;margin-bottom:8px;display:flex;gap:10px;align-items:baseline}
.fig-num{color:var(--accent);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap}.fig-title{color:var(--ink-soft);font-style:italic}
.diagram{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.5;color:#b6c8ec;background:var(--paper-deep);border:1px solid #20304f;border-radius:5px;padding:20px 22px;margin:0;overflow:auto;white-space:pre}
.table-wrap{margin:24px 0;overflow-x:auto}.book-table{width:100%;border-collapse:collapse;font-family:'Spectral',serif;font-size:14.5px}
.book-table th{text-align:left;padding:9px 14px;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--accent);font-weight:600;border-bottom:1.5px solid var(--accent)}
.book-table td{padding:10px 14px;color:var(--ink-soft);border-bottom:1px solid var(--rule-soft);vertical-align:top;line-height:1.5}
.book-table tr:last-child td{border-bottom:1px solid var(--rule)}
.callout{margin:22px 0;padding:16px 20px;border-radius:0 5px 5px 0;border-left:3px solid var(--accent);background:rgba(96,165,250,.07)}
.callout-label{font-family:'Spectral',serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:7px;color:var(--accent)}
.callout-body{font-size:15.5px;line-height:1.62;color:var(--ink-soft)}.callout-body strong{color:var(--ink)}
.callout-key{border-left-color:var(--accent-2);background:rgba(56,189,248,.08)}.callout-key .callout-label{color:var(--accent-2)}
.callout-tip{border-left-color:#63cf90;background:rgba(99,207,144,.08)}.callout-tip .callout-label{color:#63cf90}
.callout-warn{border-left-color:#e3ad4f;background:rgba(227,173,79,.09)}.callout-warn .callout-label{color:#e3ad4f}
.callout-danger{border-left-color:#ef766d;background:rgba(239,118,109,.10)}.callout-danger .callout-label{color:#ef766d}
.flow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:20px 0}.flow-step{display:inline-flex;align-items:center;gap:8px}
.flow-pill{font-family:'Spectral',serif;font-size:13px;font-weight:600;padding:6px 13px;border:1px solid;border-radius:4px;white-space:nowrap;background:rgba(120,150,210,.08)}
.flow-arrow{color:var(--ink-faint);font-size:16px}
::-webkit-scrollbar{width:9px;height:9px}::-webkit-scrollbar-thumb{background:rgba(120,150,210,.22);border-radius:5px}
`;

// ─── MAIN APP ────────────────────────────────────────────────────
export default function App() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedChapters, setCompletedChapters] = useState(new Set());
  const mainRef = useRef(null);

  const active = CHAPTERS[activeIdx];
  const ActiveChapter = CHAPTER_COMPONENTS[active.id];

  useEffect(() => { mainRef.current?.scrollTo(0, 0); }, [activeIdx]);

  const markComplete = useCallback(() => {
    setCompletedChapters(prev => new Set([...prev, activeIdx]));
  }, [activeIdx]);

  const goNext = useCallback(() => {
    markComplete();
    if (activeIdx < CHAPTERS.length - 1) setActiveIdx(i => i + 1);
  }, [activeIdx, markComplete]);

  const goPrev = useCallback(() => {
    if (activeIdx > 0) setActiveIdx(i => i - 1);
  }, [activeIdx]);

  const navigateTo = useCallback((idx) => {
    setActiveIdx(idx);
    setSidebarOpen(false);
  }, []);

  const totalChapters = CHAPTERS.length;
  const completedCount = completedChapters.size;
  const progressPct = Math.round((completedCount / totalChapters) * 100);
  const isFirst = activeIdx === 0;
  const isLast = activeIdx === CHAPTERS.length - 1;
  const font = "'IBM Plex Sans', -apple-system, sans-serif";

  let lastSection = "";

  return (
    <div style={{ fontFamily: font, background: "#080c14", color: "#e2e8f0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{CONTENT_CSS}</style>

      <header style={{ background: "#0a0f1a", borderBottom: "1px solid #1e293b", padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "1px solid #334155", borderRadius: "6px", color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: "14px", fontFamily: font }}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Production Agent Infrastructure</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Ch {activeIdx}: {active.title} · {active.section}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{progressPct}% complete</div>
          <div style={{ width: "120px", height: "4px", background: "#1e293b", borderRadius: "2px" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "#60a5fa", borderRadius: "2px", transition: "width 0.3s" }} />
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {sidebarOpen && (
          <nav style={{ width: "300px", background: "#0a0f1a", borderRight: "1px solid #1e293b", overflowY: "auto", padding: "16px 0", flexShrink: 0 }}>
            {CHAPTERS.map((ch, i) => {
              const showSection = ch.section !== lastSection;
              lastSection = ch.section;
              const sectionColor = SECTION_COLORS[ch.section];
              const isActive = i === activeIdx;
              const isDone = completedChapters.has(i);
              return (
                <div key={ch.id}>
                  {showSection && (
                    <div style={{ padding: "8px 20px", fontSize: "11px", fontWeight: 700, color: sectionColor, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: i === 0 ? 0 : "4px" }}>
                      {ch.section}
                    </div>
                  )}
                  <button onClick={() => navigateTo(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 20px 6px 32px", background: isActive ? "#60a5fa15" : "transparent", border: "none", borderLeft: isActive ? "2px solid #60a5fa" : "2px solid transparent", color: isActive ? "#e2e8f0" : isDone ? "#64748b" : "#94a3b8", fontSize: "12.5px", cursor: "pointer", fontFamily: font, lineHeight: 1.5 }}>
                    {isDone ? "✓ " : ""}{i}. {ch.title}
                  </button>
                </div>
              );
            })}
          </nav>
        )}

        <main ref={mainRef} style={{ flex: 1, overflowY: "auto", padding: "32px 24px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ background: "#60a5fa18", color: "#60a5fa", padding: "2px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", border: "1px solid #60a5fa33" }}>
                Chapter {activeIdx}
              </span>
              <span style={{ background: `${SECTION_COLORS[active.section]}18`, color: SECTION_COLORS[active.section], padding: "2px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", border: `1px solid ${SECTION_COLORS[active.section]}33` }}>
                {active.section}
              </span>
            </div>
          </div>
          <div className="content-body"><ActiveChapter /></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1e293b" }}>
            <button onClick={goPrev} disabled={isFirst} style={{ padding: "10px 24px", borderRadius: "8px", border: "1px solid #334155", background: isFirst ? "#0d1117" : "#111827", color: isFirst ? "#334155" : "#e2e8f0", cursor: isFirst ? "default" : "pointer", fontSize: "13px", fontWeight: 600, fontFamily: font }}>
              ← Previous
            </button>
            <button onClick={goNext} disabled={isLast} style={{ padding: "10px 24px", borderRadius: "8px", border: "none", background: isLast ? "#1e293b" : "#60a5fa", color: isLast ? "#64748b" : "#080c14", cursor: isLast ? "default" : "pointer", fontSize: "13px", fontWeight: 700, fontFamily: font }}>
              {isLast ? "Course Complete ✓" : "Next →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}