# 📚 ML Study Library

A personal, open-source collection of interactive ML study materials — built as a React + Vite web app. Currently features a full 30-chapter course on **Agentic ML System Design**, with more modules planned.

> Designed for ML Engineers who want depth: real architecture decisions, production trade-offs, cost math, security threat models, and interview frameworks — not just theory.

## 📖 Current Content

### 🤖 Agentic ML System Design — 30 Chapters

A complete course for enterprise ML engineers covering the full lifecycle: design → build → test → deploy → operate.

| Section | Chapters | Topics |
|---|---|---|
| **Foundations** | 4 | What Makes an Agent, LLM Mechanics, Context Engineering, Harness Engineering |
| **Design** | 5 | Agent Patterns, Multi-Agent Systems, Memory Systems, RAG at Scale, MCP & A2A Protocols |
| **Engineering** | 5 | Prompt Engineering, Orchestration & State, Error Handling, Infrastructure, Deployment Patterns |
| **Security** | 3 | Security & Threats, Auth & Multi-Tenancy, Governance |
| **Quality** | 3 | Evaluation & Testing, Agent Benchmarks, Observability |
| **Optimization** | 3 | Cost Optimization, Latency Optimization, Data Flywheel |
| **Walkthroughs** | 4 | Support Agent, Contract Pipeline, SOC Agent, Research System |
| **Interview Prep** | 3 | Interview Framework, Decision Flowchart, Tech Stack Reference |

Each chapter includes architecture diagrams, code snippets, comparison tables, callouts, and production-grade design patterns.

## ⚙️ Getting Started

### Prerequisites

- Node.js v20 or higher
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ML-Study-Library.git
cd ML-Study-Library

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.




## 🚀 Deployment

### Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your `ML-Study-Library` repo
4. Click **Deploy** — live in ~1 minute

### Netlify

1. Go to [netlify.com](https://netlify.com) → **Add New Site** → **Import from Git**
2. Select your repo
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Click **Deploy**

### GitHub Pages

```bash
npm run build
# Deploy the /dist folder to your gh-pages branch
```

## 🤝 Contributing

Contributions are welcome. If you want to add a new study module or improve existing content:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-module-name`
3. Add your content following the existing component patterns (`Code`, `Diagram`, `Table`, `Callout`, `FlowBox`)
4. Open a pull request with a description of what you added

