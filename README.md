# ML Study Library

Interactive ML study materials built with React + Vite — designed for engineers who want production depth, not just theory.

**Live:** [https://ashwin-sateesh.github.io/ML-Study-Library](https://ashwin-sateesh.github.io/ML-Study-Library)

## Courses

### [Agentic ML System Design](docs/agentic-ml-systems-course.md) — 30 Chapters
Full lifecycle coverage: design → build → test → deploy → operate. Covers agent patterns, multi-agent systems, RAG at scale, MCP & A2A protocols, security threat models, evaluation, and four end-to-end project walkthroughs.

### [GPU Inference Deep Dive](docs/gpu-inference-deep-dive.md) — 10 Modules
Ground-up course on how LLM inference runs on an H100 — from hardware architecture to tokens, with exact specs, data flow diagrams, and real latency numbers. Covers quantization, KV cache, continuous batching, tensor/pipeline parallelism, and a full end-to-end request trace.

### [Production Agent Infrastructure](docs/production-agent-infrastructure.md) — 9 Chapters
Enterprise-grade deployment of multi-agent systems on OpenShift. Covers every infrastructure component from edge load balancers to disaster recovery — two-tier load balancing, API gateway pipelines, LangGraph state management, two-loop multi-agent orchestration (supervisor + ReAct), CI/CD with canary deployment, scaling from 10 to 2M users, observability internals (OTel/Prometheus/Grafana), the complete evaluation metrics taxonomy (system health + AI quality + business), and a 4-agent wealth management walkthrough with parallel execution and full timing breakdown.

### [Architecture Flowchart](public/agent-architecture-flowchart.html)
Zoomable, pannable black-and-white flowchart of the complete enterprise agent architecture — from client request through every tier (external LB, internal LB, API gateway, multi-agent orchestration with supervisor outer loop and sub-agent ReAct inner loops, parallel fan-out, LLM gateway with fallback chain, MCP tool APIs, state store, observability + evaluation pipeline, CI/CD, and disaster recovery). View within the app at `/#/flowchart`.

## Getting Started

```bash
git clone https://github.com/ashwin-sateesh/ML-Study-Library.git
cd ML-Study-Library
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and use the nav bar to switch between courses.

**Stack:** React 19 · React Router 7 · Vite 8 · Node.js v20+

## Deployment

### GitHub Pages (current)

```bash
npm run deploy
```

In your repo go to Settings → Pages → Source: `feat-gh-pages` branch.

Live at: `https://ashwin-sateesh.github.io/ML-Study-Library`

### Vercel / Netlify (alternative)

Deploy instantly on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — connect your GitHub repo, set build command `npm run build` and publish directory `dist`. If using Vercel or Netlify, remove the `base` field from `vite.config.js` (it's only needed for GitHub Pages subdirectory hosting).

## Contributing

PRs welcome. Add new modules following the existing component patterns (`Lead`, `PullQuote`, `Aside`, `Def`, `Code`, `Diagram`, `Table`, `Callout`, `FlowBox`), register the route in `App.jsx`, and include a doc file under `docs/`.
