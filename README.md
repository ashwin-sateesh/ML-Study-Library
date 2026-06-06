# ML Study Library

Interactive ML study materials built with React + Vite — designed for engineers who want production depth, not just theory.

## Courses

### [Agentic ML System Design](docs/agentic-ml-systems-course.md) — 30 Chapters
Full lifecycle coverage: design → build → test → deploy → operate. Covers agent patterns, multi-agent systems, RAG at scale, MCP & A2A protocols, security threat models, evaluation, and four end-to-end project walkthroughs.

### [GPU Inference Deep Dive](docs/gpu-inference-deep-dive.md) — 10 Modules
Ground-up course on how LLM inference runs on an H100 — from hardware architecture to tokens, with exact specs, data flow diagrams, and real latency numbers. Covers quantization, KV cache, continuous batching, tensor/pipeline parallelism, and a full end-to-end request trace.

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

Deploy instantly on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — no config needed beyond setting build command `npm run build` and publish directory `dist`.

## Contributing

PRs welcome. Add new modules following the existing component patterns (`Code`, `Diagram`, `Table`, `Callout`, `FlowBox`), register the route in `App.jsx`, and include a doc file under `docs/`.
