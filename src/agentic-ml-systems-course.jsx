import { useState, useEffect, useRef } from "react";

const CHAPTERS = [
  { id: "intro", title: "Welcome", section: "START" },
  { id: "ch1", title: "What Makes an Agent", section: "FOUNDATIONS" },
  { id: "ch2", title: "LLM Mechanics", section: "FOUNDATIONS" },
  { id: "ch3", title: "Context Engineering", section: "FOUNDATIONS" },
  { id: "ch4", title: "Harness Engineering", section: "FOUNDATIONS" },
  { id: "ch5", title: "Agent Patterns", section: "DESIGN" },
  { id: "ch6", title: "Multi-Agent Systems", section: "DESIGN" },
  { id: "ch7", title: "Memory Systems", section: "DESIGN" },
  { id: "ch8", title: "RAG at Scale", section: "DESIGN" },
  { id: "ch9", title: "MCP & A2A Protocols", section: "DESIGN" },
  { id: "ch10", title: "Prompt Engineering", section: "ENGINEERING" },
  { id: "ch11", title: "Orchestration & State", section: "ENGINEERING" },
  { id: "ch12", title: "Error Handling", section: "ENGINEERING" },
  { id: "ch13", title: "Infrastructure", section: "ENGINEERING" },
  { id: "ch14", title: "Deployment Patterns", section: "ENGINEERING" },
  { id: "ch15", title: "Security & Threats", section: "SECURITY" },
  { id: "ch16", title: "Auth & Multi-Tenancy", section: "SECURITY" },
  { id: "ch17", title: "Governance", section: "SECURITY" },
  { id: "ch18", title: "Evaluation & Testing", section: "QUALITY" },
  { id: "ch19", title: "Agent Benchmarks", section: "QUALITY" },
  { id: "ch20", title: "Observability", section: "QUALITY" },
  { id: "ch21", title: "Cost Optimization", section: "OPTIMIZATION" },
  { id: "ch22", title: "Latency Optimization", section: "OPTIMIZATION" },
  { id: "ch23", title: "Data Flywheel", section: "OPTIMIZATION" },
  { id: "ch24", title: "Design: Support Agent", section: "WALKTHROUGHS" },
  { id: "ch25", title: "Design: Contract Pipeline", section: "WALKTHROUGHS" },
  { id: "ch26", title: "Design: SOC Agent", section: "WALKTHROUGHS" },
  { id: "ch27", title: "Design: Research System", section: "WALKTHROUGHS" },
  { id: "ch28", title: "Interview Framework", section: "INTERVIEW" },
  { id: "ch29", title: "Decision Flowchart", section: "INTERVIEW" },
  { id: "ch30", title: "Tech Stack Reference", section: "INTERVIEW" },
];

const SECTION_COLORS = {
  START: "#6366f1",
  FOUNDATIONS: "#8b5cf6",
  DESIGN: "#0ea5e9",
  ENGINEERING: "#10b981",
  SECURITY: "#ef4444",
  QUALITY: "#f59e0b",
  OPTIMIZATION: "#06b6d4",
  WALKTHROUGHS: "#ec4899",
  INTERVIEW: "#84cc16",
};

function Code({ children, lang }) {
  return (
    <pre style={{
      background: "#0d1117", color: "#c9d1d9", padding: "20px",
      borderRadius: "8px", overflow: "auto", fontSize: "13px",
      lineHeight: 1.6, border: "1px solid #21262d", margin: "16px 0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      textAlign: "left"
    }}>
      {lang && <div style={{ color: "#8b949e", fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{lang}</div>}
      <code>{children}</code>
    </pre>
  );
}

function Diagram({ children, title }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      border: "1px solid #334155", borderRadius: 12, padding: 24,
      margin: "20px 0", fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13, lineHeight: 1.5, color: "#a5b4fc", overflow: "auto",
      textAlign: "left"
    }}>
      {title && <div style={{ color: "#818cf8", fontWeight: 700, marginBottom: 12, fontSize: 14, letterSpacing: 0.5 }}>{title}</div>}
      <pre style={{ margin: 0, whiteSpace: "pre", color: "#c4b5fd" }}>{children}</pre>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflow: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>{headers.map((h, i) => (
            <th key={i} style={{ padding: "12px 16px", background: "#1e293b", color: "#94a3b8", textAlign: "left", borderBottom: "2px solid #334155", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.3)" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "10px 16px", borderBottom: "1px solid #1e293b", color: "#cbd5e1" }}>{cell}</td>
            ))}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Callout({ type, children }) {
  const colors = { key: "#6366f1", warn: "#f59e0b", danger: "#ef4444", tip: "#10b981" };
  const labels = { key: "KEY CONCEPT", warn: "IMPORTANT", danger: "CRITICAL", tip: "TIP" };
  return (
    <div style={{
      borderLeft: `4px solid ${colors[type]}`, background: `${colors[type]}11`,
      padding: "16px 20px", margin: "16px 0", borderRadius: "0 8px 8px 0",
    }}>
      <div style={{ color: colors[type], fontWeight: 700, fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>{labels[type]}</div>
      <div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function FlowBox({ items, color = "#6366f1" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "16px 0" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: `${color}22`, border: `1px solid ${color}66`, color: color,
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
          }}>{item}</div>
          {i < items.length - 1 && <span style={{ color: "#475569", fontSize: 18 }}>→</span>}
        </div>
      ))}
    </div>
  );
}

// ─── CHAPTER CONTENT ───────────────────────────────────────

function ChIntro() {
  return (<>
    <h1 style={{ fontSize: 36, background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>Agentic ML System Design</h1>
    <p style={{ color: "#94a3b8", fontSize: 18, marginBottom: 32 }}>A complete course for enterprise ML engineers. 30 chapters covering design → build → test → deploy → operate.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
      {Object.entries(SECTION_COLORS).filter(([k]) => k !== "START").map(([section, color]) => (
        <div key={section} style={{ background: `${color}15`, border: `1px solid ${color}33`, borderRadius: 12, padding: 16 }}>
          <div style={{ color, fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>{section}</div>
          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
            {CHAPTERS.filter(c => c.section === section).length} chapters
          </div>
        </div>
      ))}
    </div>
    <Callout type="tip">Navigate using the sidebar. Each chapter is self-contained but builds on previous ones. Start from Chapter 1 for the full learning path, or jump to any chapter for reference.</Callout>
  </>);
}

function Ch1() {
  return (<>
    <h1>What Makes an Agent an Agent</h1>
    <p>The fundamental distinction between traditional ML and agents:</p>
    <Diagram title="Traditional ML vs Agent">{`Traditional ML:   Input ──► Model ──► Output     (one shot, done)

Agent:            Input ──► [ Reason ──► Act ──► Observe ──► Reason ──► ... ]* ──► Output
                              └──────── The Control Loop ────────────┘

* The number of iterations is NON-DETERMINISTIC`}</Diagram>
    <Callout type="key">The asterisk is the entire point. You cannot predict compute cost, latency, or API calls per request. Every architecture decision flows from this property.</Callout>
    <h2>Agent = Four Components</h2>
    <FlowBox items={["LLM (reasoning)", "Tools (actions)", "Control Loop (iteration)", "Memory (state)"]} color="#8b5cf6" />
    <p>A chatbot answers questions. An agent <strong>completes tasks</strong> — it reasons about what to do, executes actions via tools, observes results, and iterates until the goal is met or a termination condition triggers.</p>
    <h2>Agent Taxonomy</h2>
    <Table headers={["Level", "Pattern", "Description"]}
      rows={[
        ["0", "Simple LLM Call", "Single prompt → single completion. No tools, no loop. NOT an agent."],
        ["1", "ReAct Agent", "Alternates Thought → Action → Observation. The workhorse pattern."],
        ["2", "Plan-and-Execute", "Planner generates full plan, executor runs each step, replanner adjusts."],
        ["3", "Multi-Agent", "Multiple specialized agents collaborate (supervisor, hierarchical, swarm)."],
        ["4", "Autonomous Agent", "Persists across sessions, long-term memory, proactive actions. Frontier."],
      ]} />
  </>);
}

function Ch2() {
  return (<>
    <h1>LLM Mechanics That Drive Architecture</h1>
    <h2>Inference: Two Phases</h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
      <div style={{ background: "#0ea5e922", border: "1px solid #0ea5e944", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#0ea5e9", fontWeight: 700, marginBottom: 8 }}>Prefill</div>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Reads all input tokens <strong style={{color:"#e2e8f0"}}>in parallel</strong>. Compute-bound. Scales with input length. One-time cost (cacheable).</div>
      </div>
      <div style={{ background: "#f59e0b22", border: "1px solid #f59e0b44", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>Decode</div>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Generates tokens <strong style={{color:"#e2e8f0"}}>one at a time</strong>. Memory-bandwidth-bound. Cannot be parallelized. Dominates latency.</div>
      </div>
    </div>
    <Callout type="warn">Agent loops multiply decode cost: a 10-step agent = 10× decode operations. This is why streaming is essential for perceived responsiveness.</Callout>
    <h2>Context Window Management</h2>
    <p>Every agent step appends to history. After 20 steps, you hit 50K+ tokens easily. Four strategies:</p>
    <Table headers={["Strategy", "How", "Trade-off"]}
      rows={[
        ["Sliding window", "Keep last N messages", "Loses early context"],
        ["Summarization", "LLM periodically summarizes old messages", "Lossy, costs an LLM call"],
        ["Retrieval-based", "Store all in vector DB, retrieve relevant", "Complex, most scalable"],
        ["Hierarchical", "Original query + current step full, summarize middle", "Good balance"],
      ]} />
    <h2>Tool Use / Function Calling</h2>
    <p>Define tools as JSON schemas. LLM outputs structured tool calls. You execute and feed results back.</p>
    <Code lang="json">{`{
  "name": "search_orders",
  "description": "Search customer orders by ID. Returns status, date, total.
                  Use when customer asks about order status or history.",
  "parameters": {
    "type": "object",
    "properties": {
      "customer_id": { "type": "string", "description": "Unique customer ID" },
      "status_filter": {
        "type": "string",
        "enum": ["all", "active", "shipped", "delivered", "cancelled"]
      }
    },
    "required": ["customer_id"]
  }
}`}</Code>
    <Callout type="danger">15+ tools degrades LLM accuracy. Use a tool-selection router to narrow to 5-10 relevant tools per query. Tool descriptions directly impact agent accuracy — be specific.</Callout>
    <h2>Model Routing</h2>
    <p>60-80% of agent steps are routine. Route them to cheaper models for 40-70% cost savings.</p>
    <Table headers={["Complexity", "Model Tier", "Cost/M tokens", "Use For"]}
      rows={[
        ["Simple", "Haiku / GPT-4o-mini / Flash", "$0.10-$1.00", "Classify, route, format"],
        ["Standard", "Sonnet / GPT-4o", "$3.00-$10.00", "Tool calling, RAG, code gen"],
        ["Complex", "Opus / o3", "$5.00-$25.00", "Multi-step reasoning, legal/financial analysis"],
      ]} />
  </>);
}

function Ch3() {
  return (<>
    <h1>Context Engineering</h1>
    <p style={{ color: "#a5b4fc", fontStyle: "italic", fontSize: 16 }}>"Deciding how you organize your context layer is one of the single most important things you can do in 2026." — Andrej Karpathy</p>
    <Callout type="key">Coined by Phil Schmid at Google DeepMind. Gartner identified it as the breakout AI capability of 2026. Most agent failures are context failures, not model failures.</Callout>
    <h2>The Evolution</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0" }}>
      {[
        { year: "2022-2024", name: "Prompt Engineering", q: '"What words should I use?"', desc: "Crafting the instruction text", color: "#94a3b8" },
        { year: "2025", name: "Context Engineering", q: '"What information environment should the model operate in?"', desc: "System instructions + tools + memory + retrieved docs + state", color: "#8b5cf6" },
        { year: "2026", name: "Harness Engineering", q: '"What environment should the agent operate in?"', desc: "Everything OUTSIDE the agent: linters, rules, feedback loops, CI checks", color: "#6366f1" },
      ].map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          <div style={{ minWidth: 80, color: e.color, fontWeight: 700, fontSize: 13, paddingTop: 12 }}>{e.year}</div>
          <div style={{ width: 3, background: e.color, borderRadius: 2, flexShrink: 0 }} />
          <div style={{ background: `${e.color}15`, border: `1px solid ${e.color}33`, borderRadius: 12, padding: 16, flex: 1 }}>
            <div style={{ color: e.color, fontWeight: 700, fontSize: 15 }}>{e.name}</div>
            <div style={{ color: "#e2e8f0", fontSize: 13, marginTop: 4, fontStyle: "italic" }}>{e.q}</div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{e.desc}</div>
          </div>
        </div>
      ))}
    </div>
    <h2>Context Window Architecture</h2>
    <p>Static content at top (cached by provider), dynamic at bottom. Most relevant info closest to the end.</p>
    <Diagram title="Context Window Layout">{`┌─────────────────────────────────────────────────┐
│  STATIC CONTEXT (cached — 90% cost reduction)   │
│                                                  │
│  1. Role & Identity (who, expertise, tone)       │
│  2. Core Instructions (rules, constraints)       │
│  3. Tool Definitions (JSON schemas + guidance)   │
│  4. Output Format Rules                          │
│  5. Guardrails (what NOT to do)                  │
│  6. Few-Shot Examples (2-5 correct demos)        │
│  ────────── Cache Boundary ──────────            │
│  DYNAMIC CONTEXT (changes per request)           │
│                                                  │
│  7. Retrieved Memories (relevant long-term)      │
│  8. Retrieved Documents (RAG results)            │
│  9. Application State (user profile, datetime)   │
│  10. Conversation History                        │
│  11. Current User Message                        │
└─────────────────────────────────────────────────┘`}</Diagram>
    <h2>What Context Engineering Covers</h2>
    <Table headers={["Dimension", "Question", "Impact"]}
      rows={[
        ["What to include", "Which docs, memories, tools for THIS step?", "Too much = distraction, too little = hallucination"],
        ["When to include", "Dynamically at each step, not statically", "Right info at the right time"],
        ["How much", "Token budget per context type", "Models degrade as context grows"],
        ["In what format", "Structured vs prose, ordering", "Recency bias in attention mechanisms"],
        ["What to exclude", "Irrelevant context actively hurts", "Precision > volume"],
      ]} />
  </>);
}

function Ch4() {
  return (<>
    <h1>Harness Engineering</h1>
    <p>The 2026 evolution. Coined by Mitchell Hashimoto (HashiCorp co-founder) in February 2026. Validated by OpenAI and Anthropic.</p>
    <Callout type="key">"Agents aren't hard; the harness is hard." The harness is everything OUTSIDE the agent that constrains, validates, and repairs its behavior. Constraining an agent's solution space paradoxically increases its reliability and productivity.</Callout>
    <h2>What Is an Agent Harness?</h2>
    <p>The harness is the total environment the agent operates within — not the prompt, not the context window, but the external infrastructure that surrounds the agent and ensures quality.</p>
    <Diagram title="Agent vs Harness">{`┌─────────────────────────────────────────────────────────┐
│                    THE HARNESS                           │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Project Files │  │   Linters    │  │  Automated   │   │
│  │ CLAUDE.md     │  │ Code style   │  │  Tests       │   │
│  │ AGENTS.md     │  │ Format check │  │ Unit + E2E   │   │
│  │ .cursorrules  │  │ Schema valid │  │ Run after    │   │
│  │               │  │              │  │ each output  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Guardrails   │  │  Feedback    │  │  Audit Log   │   │
│  │ Policy engine │  │  Loops       │  │ Immutable    │   │
│  │ Deterministic │  │ Prod → Eval  │  │ record of    │   │
│  │ rules between │  │ → Prompt     │  │ all actions  │   │
│  │ think & act   │  │ refinement   │  │ & decisions  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│         ┌──────────────────────────────────┐              │
│         │          THE AGENT               │              │
│         │  ┌────────────────────────────┐  │              │
│         │  │  LLM + Tools + Memory      │  │              │
│         │  │  (operates WITHIN          │  │              │
│         │  │   the harness constraints) │  │              │
│         │  └────────────────────────────┘  │              │
│         └──────────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘`}</Diagram>
    <h2>The Six Components of a Harness</h2>
    <Table headers={["Component", "What It Does", "Example"]}
      rows={[
        ["Project instruction files", "Conventions the agent reads at startup", "CLAUDE.md, AGENTS.md, .cursorrules — coding standards, architecture rules"],
        ["Linters & validators", "Catch mistakes deterministically", "ESLint for code agents, JSON Schema for data agents, format checks"],
        ["Automated tests", "Verify correctness after each agent output", "Unit tests run post-generation, integration tests on tool outputs"],
        ["Guardrails", "Deterministic policy enforcement", "Policy engine between LLM decision and tool execution (OPA, Cedar)"],
        ["Feedback loops", "Production results improve agent", "Traces → eval scores → prompt updates → canary deploy"],
        ["Audit logging", "Immutable record of all decisions", "Append-only log of every tool call, LLM input/output, decision rationale"],
      ]} />
    <Callout type="danger">Anthropic research finding: Models cannot reliably evaluate their own work. Self-critique (Reflection pattern) helps but is insufficient. External validation via the harness is essential for production reliability.</Callout>
    <h2>Why the Harness Matters More Than the Model</h2>
    <p>Research from GAIA benchmark (2026): The same Claude Opus model scores 64.9% in one agent framework and 57.6% in another. That 7-point gap comes entirely from the orchestration and harness — not the model. Enterprise performance shows a 37% gap between lab benchmark scores and real deployment performance.</p>
    <Callout type="tip">In a system design interview, always describe the harness around your agent — not just the agent itself. Mention: what validates outputs, what catches errors, what improves the system over time, what provides the audit trail.</Callout>
    <h2>Harness vs Context vs Prompt</h2>
    <Table headers={["Concept", "Scope", "Who Controls It", "When It Acts"]}
      rows={[
        ["Prompt Engineering", "The instruction text sent to the LLM", "Developer writes it", "At LLM call time"],
        ["Context Engineering", "Everything the LLM sees: prompt + tools + memory + docs + state", "System assembles it dynamically", "At LLM call time"],
        ["Harness Engineering", "Everything outside the LLM: linters, tests, guardrails, feedback, audit", "Platform team builds it", "Before, during, and after LLM calls"],
      ]} />
  </>);
}

function Ch5() {
  return (<>
    <h1>Agent Patterns — All Five</h1>
    <h2>Pattern 1: ReAct (Reasoning + Acting)</h2>
    <Diagram title="ReAct Control Loop">{`System Prompt + Tools + History
        │
   ┌────▼─────┐
   │ LLM Call │◄──────────────┐
   └────┬─────┘               │
        │                     │
   ┌────▼──────┐         ┌────┴─────┐
   │Text only? │── Yes ──►│  STOP    │
   │ or Tool?  │         └──────────┘
   └────┬──────┘
        │ Tool call
   ┌────▼──────┐
   │ Execute   │──► Append result to history ──► Loop back
   │ Tool      │
   └───────────┘`}</Diagram>
    <p><strong>Termination conditions (memorize all 5):</strong></p>
    <FlowBox items={["Natural text (no tool)", "Max iterations (25)", "Token budget exceeded", "Timeout (120s)", "3 consecutive errors"]} color="#ef4444" />

    <h2>Pattern 2: Plan-and-Execute</h2>
    <FlowBox items={["User Query", "Planner (LLM)", "Plan [steps]", "Executor (cheaper model)", "Replanner", "Final Output"]} color="#0ea5e9" />
    <p>Use when: 5+ steps, parallelizable subtasks, need auditable plan before execution.</p>

    <h2>Pattern 3: Reflection / Self-Critique</h2>
    <FlowBox items={["Agent output", "Critic evaluates", "If flawed → revise", "Max 2-3 iterations"]} color="#f59e0b" />

    <h2>Pattern 4: Evaluator-Optimizer</h2>
    <FlowBox items={["Doer produces", "Evaluator scores", "Below threshold?", "Optimizer adjusts", "Doer retries"]} color="#10b981" />

    <h2>Pattern 5: Multi-Agent — see next chapter</h2>
    <Table headers={["Pattern", "Best For", "Weakness"]}
      rows={[
        ["ReAct", "1-5 steps, conversational", "Sequential, no planning"],
        ["Plan-and-Execute", "5+ steps, parallelizable", "Plan can go stale"],
        ["Reflection", "High-stakes outputs", "Adds 1-2 LLM calls"],
        ["Evaluator-Optimizer", "Code gen, content, analysis", "Most expensive"],
        ["Multi-Agent", "Multiple domains, 15+ tools", "Complexity overhead"],
      ]} />
  </>);
}

function Ch6() {
  return (<>
    <h1>Multi-Agent Systems</h1>
    <h2>Four Topologies</h2>
    <Diagram title="Supervisor (Orchestrator-Worker)">{`              ┌──────────────────┐
 User ───────►│    Supervisor    │  Decides which worker,
              │    Agent         │  aggregates results
              └──┬───┬───┬──────┘
                 │   │   │
         ┌───────┘   │   └───────┐
         ▼           ▼           ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Worker A │ │ Worker B │ │ Worker C │
   │ (5 tools)│ │ (5 tools)│ │ (5 tools)│
   └──────────┘ └──────────┘ └──────────┘`}</Diagram>
    <h2>Workflow Graph Patterns</h2>
    <Diagram title="Five Fundamental Patterns">{`SEQUENTIAL:          PARALLEL (fan-out/fan-in):
A → B → C → END     A ──┬──► B ──┐
                         │        ├──► D → END
                         └──► C ──┘

CONDITIONAL:              MAP-REDUCE:
A ──┬─ if X ──► B        A → [B₁, B₂, ...Bₙ] → C
    └─ if Y ──► C             (dynamically spawned)

LOOP (with exit):
A → B → C ──┬─ done? ──► END
             └─ not done ──► B`}</Diagram>
    <h2>When to Use Multi-Agent</h2>
    <Table headers={["Signal", "Why Multi-Agent Helps"]}
      rows={[
        ["15+ tools needed", "Single agent accuracy drops with tool overload"],
        ["Context window pressure", "Specialized agents = focused, smaller contexts"],
        ["Different model needs", "Coding: Opus. Formatting: Haiku."],
        ["Trust/isolation boundaries", "Financial agent shouldn't see HR data"],
        ["Failure isolation", "One failing agent doesn't bring down others"],
      ]} />
  </>);
}

function Ch7() {
  return (<>
    <h1>Memory Systems</h1>
    <Table headers={["Type", "Scope", "Storage", "Example"]}
      rows={[
        ["Short-term", "Within session", "Context window", "Conversation history"],
        ["Long-term", "Across sessions", "Vector store + DB", "\"Customer prefers email\""],
        ["Working", "Within a task", "Scratchpad (key-value)", "Intermediate results"],
      ]} />
    <h2>Long-Term Memory Sub-Types</h2>
    <Table headers={["Sub-Type", "What It Stores", "How It's Retrieved"]}
      rows={[
        ["Episodic", "Specific past interactions", "By time/event query"],
        ["Semantic", "Accumulated knowledge", "By embedding similarity"],
        ["Procedural", "Learned rules/procedures", "Injected into system prompt"],
      ]} />
    <Diagram title="Memory Retrieval Flow">{`User query → Embed → Vector search memory store → Top-K relevant
                                                        │
Prompt = System + Retrieved memories + History + Query → LLM`}</Diagram>
    <Callout type="warn">What to remember: Only memory-worthy facts (preferences, decisions). When to forget: TTL or explicit updates. Privacy: Every memory attributable to a user and deletable (GDPR).</Callout>
  </>);
}

function Ch8() {
  return (<>
    <h1>RAG at Enterprise Scale</h1>
    <Diagram title="Full Hybrid RAG Pipeline">{`Query → Query Rewriting (HyDE, expansion)
          │
          ├─► Dense Retrieval (embedding similarity) ──► Top-K₁
          │
          └─► Sparse Retrieval (BM25 keywords) ────────► Top-K₂
                                                            │
                    Reciprocal Rank Fusion (RRF) ◄──────────┘
                    score = Σ 1/(k + rank)
                                │
                    Cross-Encoder Reranker
                    (scores query-doc pairs)
                                │
                    Final Top-5 chunks ──► LLM Generation`}</Diagram>
    <h2>Chunking Strategies</h2>
    <Table headers={["Strategy", "Best For", "Size"]}
      rows={[
        ["Fixed-size + overlap", "Unstructured text", "512 tok / 50 overlap"],
        ["Semantic", "Narrative documents", "Variable"],
        ["Structure-aware", "HTML, Markdown, docs", "Heading-delimited"],
        ["Parent-child", "Best precision + context", "Small retrieve, large return"],
      ]} />
    <h2>Data / Indexing Pipeline</h2>
    <FlowBox items={["Sources (Confluence, S3)", "CDC or Batch", "Parse & Clean", "Chunk", "Embed", "Store (pgvector + BM25)"]} color="#0ea5e9" />
    <h2>RAGAS Evaluation Metrics</h2>
    <Table headers={["Metric", "What It Catches"]}
      rows={[
        ["Faithfulness", "Hallucination — answer claims not in retrieved context"],
        ["Answer Relevancy", "Off-topic — answer doesn't address the question"],
        ["Context Precision", "Bad ranking — relevant docs ranked below irrelevant"],
        ["Context Recall", "Missing retrieval — needed docs not retrieved"],
      ]} />
  </>);
}

function Ch9() {
  return (<>
    <h1>MCP & A2A Protocols</h1>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "16px 0" }}>
      <div style={{ background: "#6366f122", border: "1px solid #6366f144", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#6366f1", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>MCP — Agent ↔ Tool</div>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>Anthropic, 2024. JSON-RPC. 97M+ downloads. Adopted by all major providers. Analogy: <strong style={{color:"#e2e8f0"}}>USB</strong></div>
      </div>
      <div style={{ background: "#10b98122", border: "1px solid #10b98144", borderRadius: 12, padding: 16 }}>
        <div style={{ color: "#10b981", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>A2A — Agent ↔ Agent</div>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>Google, April 2025. Agent Cards at /.well-known/agent.json. 150+ supporters. Linux Foundation. Analogy: <strong style={{color:"#e2e8f0"}}>HTTP</strong></div>
      </div>
    </div>
    <Diagram>{`Agent A ──(A2A)──► Agent B
  │                  │
  │(MCP)             │(MCP)
  ▼                  ▼
Tool 1             Tool 2
Tool 3             Tool 4`}</Diagram>
    <p>A2A task lifecycle: <code>submitted → working → input-required → completed/failed</code></p>
  </>);
}

function Ch10() { return (<><h1>Prompt Engineering for Agents</h1>
  <h2>System Prompt Structure</h2>
  <Code lang="text">{`1. ROLE & IDENTITY    ← Static (cached)
2. CORE INSTRUCTIONS
3. TOOL DEFINITIONS (JSON schemas + when/how to use)
4. OUTPUT FORMAT RULES
5. GUARDRAILS (what NOT to do)
6. FEW-SHOT EXAMPLES (2-5 correct demos)
─── Cache Boundary ───
7. DYNAMIC CONTEXT (memories, user profile, date)  ← Dynamic
8. CONVERSATION HISTORY
9. USER MESSAGE`}</Code>
  <h2>Rules</h2>
  <Code lang="prompt — bad vs good">{`BAD:  "Help the customer with their issue."

GOOD: "When the customer asks about an order, ALWAYS call search_orders
       first before responding. Never guess order status.
       If search_orders returns no results, ask the customer
       to verify their order number.
       After 3 failed tool calls, apologize and escalate to human.
       Never attempt more than 15 tool calls per conversation."`}</Code>
  <Callout type="tip">Few-shot examples showing correct Thought → Action → Observation → Response sequences are the single most effective technique for consistent agent behavior.</Callout>
  <h2>Prompt Versioning</h2>
  <p>Treat prompts as <strong>immutable versioned artifacts</strong>. Every change via PR + automated eval as CI check. Deploy via canary. Feature flags for instant rollback. Every trace logs prompt version.</p>
</>); }

function Ch11() { return (<><h1>Orchestration & State Management</h1>
  <h2>LangGraph</h2>
  <p>Dominant framework. Stateful directed graphs. Nodes = agents/functions. Edges = transitions. State = typed object.</p>
  <Code lang="python">{`class AgentState(TypedDict):
    messages: list[BaseMessage]      # Conversation history
    plan: list[str]                  # Current plan steps
    current_step: int
    results: dict[str, Any]          # Accumulated results
    error_count: int                 # Circuit breaker
    total_tokens: int                # Budget tracking
    metadata: dict                   # user_id, session_id, prompt_version`}</Code>
  <h2>Checkpointing</h2>
  <p>State persisted to PostgreSQL/SQLite at every step. Enables: resume after crash, time-travel debugging, human-in-the-loop pause/resume.</p>
  <h2>Human-in-the-Loop Patterns</h2>
  <Table headers={["Pattern", "When", "How"]}
    rows={[
      ["Approval gate", "High-risk actions (payment, delete)", "Checkpoint → notify → resume on approval"],
      ["Escalation", "Low confidence, policy violation", "Transfer to human with full context"],
      ["Feedback loop", "After agent responds", "Human rates → feeds eval + fine-tuning"],
      ["Interrupt", "Anytime", "Human corrects direction mid-task"],
    ]} />
</>); }

function Ch12() { return (<><h1>Error Handling & Resilience</h1>
  <Diagram title="Agent Resilience Stack">{`Request
   │
   ▼
┌──────────────────────┐
│ 1. RETRY + BACKOFF   │  1s → 2s → 4s → 8s (± jitter)
│    Max 3 attempts    │  Prevents synchronized retries
└──────────┬───────────┘
           │ All retries failed
┌──────────▼───────────┐
│ 2. FALLBACK CHAIN    │  Claude Sonnet → GPT-4o → Gemini Flash
└──────────┬───────────┘
           │ All fallbacks failed
┌──────────▼───────────┐
│ 3. CIRCUIT BREAKER   │  CLOSED → OPEN (5 failures)
│                      │  → HALF-OPEN (test after 60s)
│                      │  → CLOSED (if test passes)
└──────────┬───────────┘
           │ All circuits open
┌──────────▼───────────┐
│ 4. GRACEFUL          │  Cached response / partial result /
│    DEGRADATION       │  escalate to human / "unavailable"
└──────────────────────┘`}</Diagram>
  <h2>Agent-Specific Failure Modes</h2>
  <Table headers={["Failure", "Cause", "Handling"]}
    rows={[
      ["Rate limit (429)", "Requests/tokens exceeded", "Retry + backoff + jitter"],
      ["Context overflow", "History too long", "Summarize, trim tool outputs"],
      ["Infinite loop", "No progress", "Max iterations + loop detection"],
      ["Invalid tool call", "Bad params from LLM", "Validate → error to LLM → self-corrects"],
      ["Hallucinated tool", "LLM invents tool", "Validate against registry"],
      ["Provider outage", "Entire provider down", "Multi-provider fallback chain"],
    ]} />
</>); }

function Ch13() { return (<><h1>Infrastructure & Deployment</h1>
  <Diagram title="Production Architecture">{`Client → Load Balancer (L7) → API Gateway (auth, rate limit)
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
              Agent Pod 1        Agent Pod 2        Agent Pod N
              (stateless)        (stateless)        (stateless)
                    │
                    ├─► LLM Gateway (LiteLLM/Portkey)
                    │       → LLM Provider APIs
                    ├─► Vector Store (pgvector)
                    ├─► Tool APIs (microservices)
                    ├─► State Store (Postgres + Redis)
                    └─► Observability (Langfuse)`}</Diagram>
  <Callout type="key">Containers are stateless — all state externalized. NOT serverless (agents run 30+ sec). LLM Gateway for multi-provider routing, rate limiting, key management, cost tracking.</Callout>
  <h2>API Design</h2>
  <Table headers={["Mode", "Method", "Use When"]}
    rows={[
      ["Synchronous + SSE", "POST /chat → stream", "Interactive conversation"],
      ["Async + polling", "POST /tasks → 202 + task_id", "Long-running tasks (reports, analysis)"],
      ["WebSocket", "Bidirectional channel", "Real-time with client interrupts"],
    ]} />
</>); }

function Ch14() { return (<><h1>Deployment Patterns</h1>
  <Callout type="danger">A prompt change can silently degrade quality without affecting any infrastructure metrics. You need agent-specific deployment patterns.</Callout>
  <Diagram title="Canary Deployment for Agents">{`Production Traffic (100%)
         │
    ┌────▼─────┐
    │ Splitter │
    └──┬────┬──┘
   95% │    │ 5%
       ▼    ▼
  Stable   Canary
  v1.2.0   v1.3.0
              │
      ┌───────▼────────┐
      │ Quality Monitor │  ← Eval scores, NOT just CPU/errors
      │ (completion     │  ← Prompt regression won't show
      │  rate, CSAT,    │     in infra dashboards
      │  cost, hallu.)  │
      └───────┬────────┘
         Pass → promote
         Fail → auto-rollback`}</Diagram>
  <Table headers={["Pattern", "How", "Use When"]}
    rows={[
      ["Canary", "5% traffic to new version, quality-monitored", "Standard prompt/model changes"],
      ["Shadow testing", "New version runs in parallel, users see production only", "Major prompt rewrites, model swaps"],
      ["Feature flags", "Deploy everywhere, activate per user", "Instant rollback without redeploy"],
    ]} />
  <h2>Automated Rollback Triggers</h2>
  <FlowBox items={["Completion rate ↓ 5%", "Hallucination ↑ 2%", "Cost ↑ 30%", "Error rate threshold"]} color="#ef4444" />
</>); }

function Ch15() { return (<><h1>Security — Threat Model & Defenses</h1>
  <h2>The Lethal Trifecta (Simon Willison)</h2>
  <div style={{ display: "flex", gap: 12, margin: "16px 0", flexWrap: "wrap" }}>
    {["Access to private data", "Exposure to untrusted tokens", "Exfiltration vector"].map((t, i) => (
      <div key={i} style={{ background: "#ef444422", border: "1px solid #ef444466", borderRadius: 8, padding: "8px 16px", color: "#fca5a5", fontWeight: 600, fontSize: 14 }}>{i+1}. {t}</div>
    ))}
  </div>
  <Callout type="danger">All three present → vulnerable to data exfiltration via prompt injection. Period.</Callout>
  <h2>Defense-in-Depth (6 Layers)</h2>
  <Table headers={["Layer", "Defense", "Implementation"]}
    rows={[
      ["1", "Input Validation", "ML classifier + rules (NeMo, LlamaFirewall)"],
      ["2", "Least Privilege", "Allowlist of tools per agent"],
      ["3", "Output Validation", "Deterministic code validates tool params"],
      ["4", "Architectural Isolation", "Policy engine between thinking & acting"],
      ["5", "Human Approval", "Irreversible actions require confirmation"],
      ["6", "Monitoring", "Log all tool calls, alert on anomalies"],
    ]} />
  <h2>OWASP LLM Top 10 (2025)</h2>
  <Table headers={["#", "Risk"]} rows={[["01","Prompt Injection"],["02","Sensitive Info Disclosure"],["03","Supply Chain"],["04","Data Poisoning"],["05","Improper Output Handling"],["06","Excessive Agency"],["07","System Prompt Leakage"],["08","Vector/Embedding Weaknesses"],["09","Misinformation"],["10","Unbounded Consumption"]]} />
  <h2>OWASP Agentic Top 10 (Dec 2025)</h2>
  <Table headers={["#", "Risk"]} rows={[["ASI-01","Excessive Agency & Privilege"],["ASI-02","Uncontrolled Tool Execution"],["ASI-03","Insufficient Workflow Validation"],["ASI-04","Unmonitored Autonomy"],["ASI-05","Insecure Memory & State"],["ASI-06","Inadequate Multi-Agent Trust"],["ASI-07","I/O Manipulation Across Agents"],["ASI-08","Lack of Audit Trail"],["ASI-09","Supply Chain Risk"],["ASI-10","Insufficient Human Oversight"]]} />
</>); }

function Ch16() { return (<><h1>Authentication, Authorization & Multi-Tenancy</h1>
  <h2>Zero-Trust Agent Identity (ZTAI)</h2>
  <Callout type="key">2026 enterprise standard: every agent call must be authenticated, authorized, and audited independently.</Callout>
  <Diagram title="Agent Auth Flow">{`User authenticates (SSO/OAuth)
        │
   ┌────▼────────────┐
   │ Token Service    │  Issues ephemeral JWT:
   │                  │  - user_id, tenant_id
   │                  │  - allowed_tools
   │                  │  - max_actions, expiry (minutes)
   └────────┬────────┘
            │
   ┌────────▼────────┐      ┌─────────────────┐
   │ Agent Runtime    │─────►│ Policy Engine   │
   │                  │      │ (OPA / Cedar)   │
   │ Before EVERY     │      │                 │
   │ tool call:       │◄─────│ Is this tool    │
   │ "Can this user   │      │ allowed? On     │
   │  do this action  │      │ this tenant's   │
   │  on this data?"  │      │ data? Within    │
   └─────────────────┘      │ quotas?         │
                             └─────────────────┘`}</Diagram>
  <h2>Multi-Tenancy Isolation Layers</h2>
  <Table headers={["Layer", "What", "How"]}
    rows={[
      ["Identity", "Every request carries tenant_id", "Enforced at API gateway"],
      ["Data", "Tenant A can't see Tenant B's data", "Separate DB schemas OR shared + row-level security. Vector store: namespace or metadata filter"],
      ["Compute", "Noisy neighbor protection", "K8s namespaces OR per-tenant rate limits/quotas"],
      ["Encryption", "Data at rest + in transit", "Per-tenant encryption keys (KMS)"],
    ]} />
  <Callout type="danger">RAG isolation is non-negotiable: filter by tenant_id BEFORE similarity search. Without this, Tenant A's agent can retrieve Tenant B's documents.</Callout>
</>); }

function Ch17() { return (<><h1>Governance & Compliance</h1>
  <Table headers={["Component", "Owner", "Change Process"]}
    rows={[
      ["System prompts", "ML Engineering", "PR + eval CI gate"],
      ["Tool definitions", "Platform Engineering", "PR + API tests"],
      ["Guardrails/policies", "Security + Legal", "PR + compliance review"],
      ["Model selection", "ML Engineering", "A/B test + cost analysis"],
      ["RAG data index", "Data Engineering", "Pipeline CI"],
      ["Production config", "SRE/DevOps", "IaC + review"],
    ]} />
  <h2>Compliance</h2>
  <Table headers={["Framework", "Key Requirements"]}
    rows={[
      ["EU AI Act (Aug 2026)", "Risk assessments, transparency, human oversight, audit trails. Up to 7% global turnover penalty."],
      ["NIST AI RMF", "Four functions: Govern, Map, Measure, Manage"],
      ["SOC 2", "Log all AI decisions, data handling controls, 90-day retention"],
    ]} />
</>); }

function Ch18() { return (<><h1>Evaluation & Testing</h1>
  <Diagram title="Testing Pyramid">{`         ┌───────────────┐
         │  End-to-End   │  Full agent runs (few, expensive)
         ├───────────────┤
         │  Integration  │  Tool + LLM interaction (moderate)
         ├───────────────┤
         │  Unit Tests   │  Tools, parsers, validators (many, fast)
         └───────────────┘`}</Diagram>
  <h2>Evaluation Metrics</h2>
  <Table headers={["Metric", "Measures", "Method"]}
    rows={[
      ["Task completion rate", "Goal accomplished?", "Human or LLM judge"],
      ["Tool selection accuracy", "Right tools, right order?", "Gold standard comparison"],
      ["Faithfulness", "Grounded in tool outputs?", "RAGAS"],
      ["Hallucination rate", "Made up info?", "LLM judge + spot check"],
      ["Safety", "Harmful outputs?", "Safety classifier"],
      ["Latency (p50/p90/p99)", "Speed", "Traces"],
      ["Cost per task", "Expense", "Tokens × pricing"],
    ]} />
  <h2>CI/CD for Agents</h2>
  <FlowBox items={["Eval dataset (100-500 cases)", "PR changes prompt/tools", "Run eval suite", "Gate on metrics", "Canary deploy"]} color="#f59e0b" />
  <Callout type="tip">Trace-to-eval workflow: Production failure → convert to test case → add to eval suite → same failure never recurs.</Callout>
</>); }

function Ch19() { return (<><h1>Agent Benchmarks</h1>
  <Table headers={["Benchmark", "Tests", "State of Art (2026)"]}
    rows={[
      ["GAIA", "General assistant: web browsing + file parsing + multi-doc reasoning", "Humans 92%, top agents ~75%"],
      ["SWE-bench Verified", "Software engineering: real GitHub issues", "Top models ~80% (5-15pt inflation from leakage)"],
      ["OSWorld", "Computer use: full-stack OS control", "Frontier research"],
      ["WebArena", "Browser: 812 long-horizon web tasks", "Active benchmark"],
      ["τ-bench", "Policy adherence: customer service with business rules", "Tests rule-following, not just helpfulness"],
      ["METR HCAST", "Long-horizon: tasks requiring hours of sustained work", "Capability doubles every 4-7 months"],
      ["AgentBench", "Multi-environment: 8 different environments", "Tests breadth across domains"],
    ]} />
  <Callout type="key">Enterprise performance ≠ benchmark performance. 37% gap between lab scores and real deployment. Same model scores differ by 7 points across different scaffolds/harnesses. The harness matters as much as the model.</Callout>
</>); }

function Ch20() { return (<><h1>Observability</h1>
  <Callout type="warn">Agent can return 200 OK, normal latency, and a completely hallucinated answer. Monitor behavioral quality, not just operational health.</Callout>
  <Diagram title="Structured Trace Example">{`Trace: conversation_123
├── Span: user_message ("What's our Q4 revenue?")
├── Span: llm_call_1 (sonnet, 1200/150 tok, 1.2s, prompt_v1.2)
│   └── Decision: call query_financial_db
├── Span: tool_call (query_financial_db, 0.3s)
│   └── Result: {revenue: 12500000}
├── Span: llm_call_2 (sonnet, 1400/80 tok, 0.8s)
└── Span: response ("Q4 revenue was $12.5M")
Total: 2.3s, 2830 tokens, $0.009`}</Diagram>
  <h2>Four Pillars</h2>
  <Table headers={["Pillar", "What", "Tools"]}
    rows={[
      ["Tracing", "Every step as structured span with tokens, latency, cost, prompt version", "Langfuse, LangSmith, Arize Phoenix"],
      ["Online Eval", "Score production traces: hallucination, toxicity, faithfulness", "Custom classifiers + LLM-as-judge"],
      ["Analytics", "Dashboards: completion rate, cost, latency, tool usage", "Grafana, built-in tool dashboards"],
      ["Alerting", "Hallucination spike, cost over budget, latency SLA, loop detection", "PagerDuty, Datadog"],
    ]} />
</>); }

function Ch21() { return (<><h1>Cost Optimization & Caching</h1>
  <h2>Pricing (2026)</h2>
  <Table headers={["Model", "Input $/M", "Output $/M"]}
    rows={[
      ["Gemini 2.0 Flash", "$0.10", "$0.40"],
      ["GPT-4o-mini", "$0.15", "$0.60"],
      ["Claude Haiku 4.5", "$1.00", "$5.00"],
      ["GPT-4o", "$2.50", "$10.00"],
      ["Claude Sonnet 4.6", "$3.00", "$15.00"],
      ["Claude Opus 4.6", "$5.00", "$25.00"],
    ]} />
  <h2>Five Optimization Levers</h2>
  <Table headers={["Lever", "Savings", "How"]}
    rows={[
      ["Model routing", "40-70%", "Simple steps → cheap models (60-80% of steps are routine)"],
      ["Prompt caching", "Up to 90%", "Static prefix cached by provider"],
      ["Context compaction", "50-70%", "Summarize history, trim tool outputs, compress prompts"],
      ["Semantic caching", "Variable", "Cache responses for similar queries (cosine > 0.95). Non-personalized only."],
      ["Batching", "~50%", "Batch API for non-real-time (eval suites, bulk processing)"],
    ]} />
  <h2>Caching Architecture (4 Layers)</h2>
  <Table headers={["Layer", "What", "TTL", "Danger"]}
    rows={[
      ["1. Prompt cache", "Provider caches static prefix KV computation", "5-60 min (provider)", "None — always beneficial"],
      ["2. Semantic cache", "Cache LLM responses for similar queries", "Hours-days", "Only non-personalized queries!"],
      ["3. Tool result cache", "Cache tool outputs for identical inputs", "30s-1hr by data type", "Stale data for dynamic sources"],
      ["4. Embedding cache", "Cache embedding vectors for repeated text", "Long (model-stable)", "Invalidate on model change"],
    ]} />
</>); }

function Ch22() { return (<><h1>Latency Optimization</h1>
  <p>5-step agent: ~1.5s LLM + ~0.3s tool per step = ~9s total sequential.</p>
  <Table headers={["Strategy", "Impact", "How"]}
    rows={[
      ["Streaming", "Perceived → 0.5s", "Send tokens as generated"],
      ["Parallel tool calls", "Eliminate sequential waits", "Execute independent tools simultaneously"],
      ["Faster intermediate models", "-30-50% LLM time", "Haiku for reasoning, Sonnet for final"],
      ["Reduce steps", "-40% (3 vs 5)", "Better prompts = fewer iterations"],
      ["Connection pooling", "-100-300ms/call", "Keep HTTP connections open"],
      ["Prompt caching", "Faster prefill", "Static prefix skips recomputation"],
      ["Context compaction", "Faster prefill", "Smaller prompts = less to process"],
    ]} />
</>); }

function Ch23() { return (<><h1>The Data Flywheel</h1>
  <Callout type="key">Without continuous improvement, agents decay. NVIDIA demonstrated: data flywheel enabled replacing a 70B model with a fine-tuned 8B at 94-96% accuracy — 98% cost savings, 70x lower latency.</Callout>
  <Diagram title="MAPE Continuous Improvement Loop">{`┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ MONITOR  │───►│ ANALYZE  │───►│  PLAN    │───►│ EXECUTE  │
│          │    │          │    │          │    │          │
│ Traces   │    │ Failure  │    │ Prompt   │    │ Implement│
│ Evals    │    │ patterns │    │ updates  │    │ changes  │
│ User     │    │ Quality  │    │ Tool     │    │ Run eval │
│ feedback │    │ drift    │    │ changes  │    │ suite    │
│ Cost     │    │ Cost     │    │ Model    │    │          │
│          │    │ anomalies│    │ swap     │    │          │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
     ▲                                              │
     │              ┌──────────┐                    │
     └──────────────│ DEPLOY   │◄───────────────────┘
                    │ Canary + │
                    │ eval gate│
                    └──────────┘`}</Diagram>
  <h2>Six Flywheel Components</h2>
  <Table headers={["Component", "What It Does"]}
    rows={[
      ["Trace mining", "Extract low-quality conversations → convert to eval test cases"],
      ["User feedback", "Thumbs up/down, CSAT surveys → feed quality scoring"],
      ["Automated eval", "RAGAS + LLM-judge + safety classifiers on all production traces"],
      ["Prompt refinement", "Analyze failures → update prompts → eval gate → canary"],
      ["KB refresh", "Monitor 'I don't know' → identify gaps → update RAG index"],
      ["Model distillation", "Fine-tune smaller models on production data → lower cost"],
    ]} />
</>); }

function WalkthroughSupport() { return (<><h1>Design: Customer Support Agent</h1>
  <p><strong>Setup:</strong> SaaS, 50K customers, 2M tickets/year, 10K KB articles. 90% L1 resolution, {"<"}30s, SOC 2, 500 concurrent.</p>
  <Diagram title="Architecture">{`Chat Widget → API Gateway → Orchestrator (K8s, 10-100 pods)
                                    │
                           Intent Router (Haiku — fast, cheap)
                           ┌────┬────┬────┐
                           ▼    ▼    ▼    ▼
                         FAQ  Order Billing Escalation
                        (Sonnet)(Sonnet)(Sonnet  (ticket +
                        +RAG    +APIs  +HITL    notify)
                         KB            refunds
                                       >$500)`}</Diagram>
  <Table headers={["Aspect", "Detail"]}
    rows={[
      ["Pattern", "Supervisor + specialized workers (5 tools each vs 20 combined)"],
      ["RAG", "Structure-aware chunking → pgvector + BM25 → RRF → Rerank → Top-5"],
      ["Scaling", "500 × 1 LLM/5s = 100 req/min. Stateless pods. Postgres + Redis state."],
      ["Cost", "$0.075/conversation. 2M/year = $150K (vs $2M+ human)"],
      ["Latency", "Router 0.3s + RAG 0.5s + Tool 0.3s + LLM 1.5s + Validation 0.2s = 2.8s"],
      ["Security", "PII redaction, input/output guardrails, least privilege, 90-day audit"],
      ["Deploy", "Canary 5% with quality monitoring. Feature flags for rollback."],
    ]} />
</>); }

function WalkthroughContract() { return (<><h1>Design: Contract Processing Pipeline</h1>
  <p><strong>Setup:</strong> Financial services, 500 contracts/day, 30 pages avg. Extract, classify, risk-flag, summarize, route.</p>
  <Diagram>{`PDF → Ingestion (OCR) → Extraction Agent (Opus — accuracy critical)
                              │
                        Classification (Haiku — simple)
                              │
                   ┌──────────┼──────────┐
                   ▼          ▼          ▼
              NDA Review  MSA Review  SOW Review
              (Sonnet+RAG)(Sonnet+RAG)(Sonnet+RAG)
                   └──────────┼──────────┘
                              ▼
                    Risk Assessment → Summary → Route`}</Diagram>
  <p><strong>Queue-based:</strong> 500 × 5min = 42 worker-hours. 10 workers → ~4.2 hours.</p>
  <p><strong>Cost:</strong> ~$0.45/contract = $82K/year.</p>
</>); }

function WalkthroughSOC() { return (<><h1>Design: SOC Security Agent</h1>
  <p><strong>Setup:</strong> 10K alerts/day, 95% false positives. Reduce analyst workload 80%.</p>
  <Diagram>{`SIEM Alerts → Alert Queue → Tiered Triage:
  Tier 0 (rules, no LLM): Known FPs → auto-close      │ 70%
  Tier 1 (Haiku):         Simple classify → auto-close  │ 20%
  Tier 2 (Sonnet/Opus):   Full investigation            │ 10%
         ├─ Auto-remediate (low-risk, logged)
         ├─ Create incident (JIRA)
         └─ Escalate to human (PagerDuty)`}</Diagram>
  <p><strong>Cost:</strong> $110/day = $40K/year (replaces 3-5 analysts at $300-500K/year).</p>
  <Callout type="danger">Lethal Trifecta mitigation: No arbitrary external requests — only pre-defined APIs via proxy. Outputs sanitized. Auto-remediation of user accounts requires human approval.</Callout>
</>); }

function WalkthroughResearch() { return (<><h1>Design: Distributed Research System</h1>
  <p><strong>Setup:</strong> Competitive intelligence. Question → multi-source → structured report. 30 min vs 2-3 analyst days.</p>
  <Diagram>{`Question → Planner → ┬─ Market Agent     ──┐
                      ├─ Competitor Agent  ──┤  PARALLEL
                      ├─ Regulatory Agent  ──┤  (5 min vs 20 min)
                      └─ Technology Agent  ──┘
                                │
                      Synthesis Agent (merges, resolves conflicts)
                                │
                      Editor Agent (citations, quality)
                                │
                           Final Report`}</Diagram>
  <p>Four agents in parallel (fan-out/fan-in). Structured findings with source + confidence. Synthesis resolves conflicts. Editor validates every claim has citation.</p>
</>); }

function Ch28() { return (<><h1>Interview Framework (45 Minutes)</h1>
  <Table headers={["Minutes", "Phase", "What To Do"]}
    rows={[
      ["0-3", "Clarify Requirements", "User? Read/write? Latency? Scale? Compliance? Budget?"],
      ["3-10", "High-Level Architecture", "System diagram. Agent pattern + justification."],
      ["10-25", "Deep Dive", "Agent graph, tool design, context engineering, RAG, memory, HITL"],
      ["25-35", "Non-Functional", "Scaling, latency, cost (do math!), security, auth, resilience"],
      ["35-42", "Observability & Deployment", "Tracing, eval, canary, data flywheel"],
      ["42-45", "Trade-offs & Extensions", "What trade-offs? How to extend for 10x?"],
    ]} />
  <h2>12 Common Mistakes</h2>
  <Table headers={["#", "Mistake"]}
    rows={[
      ["1","Jumping to implementation without clarifying requirements"],
      ["2","Multi-agent when single-agent suffices"],
      ["3","Ignoring cost — always calculate per-task cost"],
      ["4","Ignoring security — prompt injection is #1 risk"],
      ["5","Assuming LLM is always right"],
      ["6","No observability — agents fail silently"],
      ["7","Over-engineering — start simple"],
      ["8","No error handling / resilience patterns"],
      ["9","No deployment strategy — canary is essential"],
      ["10","Not versioning prompts"],
      ["11","Ignoring auth / multi-tenancy in enterprise"],
      ["12","No continuous improvement plan (data flywheel)"],
    ]} />
</>); }

function Ch29() { return (<><h1>Architecture Decision Flowchart</h1>
  <Diagram>{`Single step, no tools?         ──► Simple LLM call (not an agent)
        │ No
Tools needed?                  ──► No ──► Chain-of-thought prompt
        │ Yes
1-3 clear steps?               ──► Yes ──► ReAct (single agent)
        │ No
5+ steps, parallelizable?     ──► Yes ──► Plan-and-Execute
        │ No
Multiple domains / 15+ tools / ──► Yes ──► Multi-Agent (Supervisor)
isolation needed?
        │ No
ReAct with Reflection`}</Diagram>
</>); }

function Ch30() { return (<><h1>Technology Stack Reference</h1>
  <Table headers={["Component", "Options"]}
    rows={[
      ["Agent Framework", "LangGraph · CrewAI · OpenAI SDK · Google ADK"],
      ["LLM Provider", "Anthropic Claude · OpenAI GPT · Google Gemini"],
      ["LLM Gateway", "LiteLLM · Portkey · Bifrost"],
      ["Vector Store", "pgvector · Pinecone · Weaviate · Qdrant"],
      ["Embedding", "text-embedding-3-large · Cohere Embed v3 · BGE"],
      ["Reranker", "Cohere Rerank · BGE Reranker · ColBERT"],
      ["State Store", "PostgreSQL · Redis"],
      ["Queue", "Pub/Sub · SQS · RabbitMQ"],
      ["Observability", "Langfuse · LangSmith · Arize Phoenix · Datadog"],
      ["Guardrails", "NeMo Guardrails · LlamaFirewall · Guardrails AI"],
      ["Auth/Policy", "OPA · Cedar · WorkOS FGA"],
      ["Deployment", "Kubernetes · Cloud Run · ECS"],
      ["Evaluation", "RAGAS · DeepEval · Braintrust"],
      ["Benchmarks", "GAIA · SWE-bench · τ-bench · WebArena · OSWorld"],
      ["Agent-Tool", "MCP (Model Context Protocol)"],
      ["Agent-Agent", "A2A (Agent2Agent Protocol)"],
      ["Resilience", "PyBreaker · Resilience4j · Polly"],
    ]} />
</>); }

const CHAPTER_COMPONENTS = {
  intro: ChIntro, ch1: Ch1, ch2: Ch2, ch3: Ch3, ch4: Ch4, ch5: Ch5, ch6: Ch6, ch7: Ch7, ch8: Ch8, ch9: Ch9,
  ch10: Ch10, ch11: Ch11, ch12: Ch12, ch13: Ch13, ch14: Ch14, ch15: Ch15, ch16: Ch16, ch17: Ch17, ch18: Ch18,
  ch19: Ch19, ch20: Ch20, ch21: Ch21, ch22: Ch22, ch23: Ch23,
  ch24: WalkthroughSupport, ch25: WalkthroughContract, ch26: WalkthroughSOC, ch27: WalkthroughResearch,
  ch28: Ch28, ch29: Ch29, ch30: Ch30,
};

export default function App() {
  const [active, setActive] = useState("intro");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contentRef = useRef(null);
  const ActiveChapter = CHAPTER_COMPONENTS[active];
  let lastSection = "";

  useEffect(() => { contentRef.current?.scrollTo(0, 0); }, [active]);

  const currentIdx = CHAPTERS.findIndex(c => c.id === active);
  const prev = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
  const next = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0e1a", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      {sidebarOpen && (
        <nav style={{ width: 260, minWidth: 260, background: "#0f1629", borderRight: "1px solid #1e293b", overflowY: "auto", padding: "16px 0" }}>
          <div style={{ padding: "8px 20px 20px", fontSize: 15, fontWeight: 700, color: "#818cf8", letterSpacing: 0.5 }}>📐 Agentic ML Systems</div>
          {CHAPTERS.map((ch) => {
            const showSection = ch.section !== lastSection;
            lastSection = ch.section;
            return (
              <div key={ch.id}>
                {showSection && <div style={{ padding: "16px 20px 4px", fontSize: 10, fontWeight: 700, color: SECTION_COLORS[ch.section], letterSpacing: 1.5 }}>{ch.section}</div>}
                <button
                  onClick={() => setActive(ch.id)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                    padding: "8px 20px", fontSize: 13,
                    background: active === ch.id ? `${SECTION_COLORS[ch.section]}22` : "transparent",
                    color: active === ch.id ? "#e2e8f0" : "#64748b",
                    borderLeft: active === ch.id ? `3px solid ${SECTION_COLORS[ch.section]}` : "3px solid transparent",
                    fontWeight: active === ch.id ? 600 : 400,
                    fontFamily: "inherit",
                  }}
                >{ch.title}</button>
              </div>
            );
          })}
        </nav>
      )}
      <main ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "40px 48px 80px", maxWidth: 860, lineHeight: 1.7, fontSize: 15 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ position: "fixed", top: 12, left: sidebarOpen ? 270 : 10, zIndex: 10, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
          {sidebarOpen ? "◀" : "▶"}
        </button>
        <ActiveChapter />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "1px solid #1e293b" }}>
          {prev ? <button onClick={() => setActive(prev.id)} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← {prev.title}</button> : <div />}
          {next && <button onClick={() => setActive(next.id)} style={{ background: "#6366f122", border: "1px solid #6366f144", color: "#a5b4fc", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>{next.title} →</button>}
        </div>
      </main>
    </div>
  );
}
