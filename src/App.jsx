import { HashRouter, Routes, Route, Link } from "react-router-dom";
import AgenticCourse from "./agentic-ml-systems-course";
import AgenticInfraCourse from "./agentic-ml-infrastructure";
import GPUCourse from "./gpu-inference-deep-dive";

function Nav() {
  return (
    <nav style={{ padding: "1rem", background: "#1a1a2e", display: "flex", gap: "2rem" }}>
      <Link to="/" style={{ color: "#00d4ff", textDecoration: "none" }}>
        Home
      </Link>
      <Link to="/gpu" style={{ color: "#00d4ff", textDecoration: "none" }}>
        GPU Inference Deep Dive
      </Link>
      <Link to="/agentic" style={{ color: "#00d4ff", textDecoration: "none" }}>
        Agentic ML Systems
      </Link>
      <Link to="/infra" style={{ color: "#00d4ff", textDecoration: "none" }}>
        Agentic ML Infrastructure
      </Link>
      <Link to="/flowchart" style={{ color: "#00d4ff", textDecoration: "none" }}>
        Agentic ML Infra Architecture
      </Link>
    </nav>
  );
}

function Flowchart() {
  return (
    <iframe
      src="/agent-architecture-flowchart.html"
      style={{ width: "100%", height: "calc(100vh - 52px)", border: "none" }}
      title="Agent Architecture Flowchart"
    />
  );
}

function Home() {
  return (
    <div style={{ padding: "3rem", background: "#080c14", minHeight: "100vh", color: "#e2e8f0", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>ML Study Library</h1>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <Link to="/gpu" style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "2rem", color: "#e2e8f0", textDecoration: "none", width: "280px" }}>
          <div style={{ color: "#f472b6", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.5rem" }}>GPU & Inference</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>GPU Inference Deep Dive</div>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Transformer architecture, KV cache, Quantization, and GPU Inference Mechanics.</div>
        </Link>
        <Link to="/agentic" style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "2rem", color: "#e2e8f0", textDecoration: "none", width: "280px" }}>
          <div style={{ color: "#60a5fa", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.5rem" }}>Agentic Systems</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Agentic ML System Design</div>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Multi-agent architectures, RAG, MCP, Evaluation, Context Engineering.</div>
        </Link>
        <Link to="/infra" style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "2rem", color: "#e2e8f0", textDecoration: "none", width: "280px" }}>
          <div style={{ color: "#fb923c", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.5rem" }}>Infrastructure</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Production Agent Infrastructure</div>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Kubernetes, LangGraph, CI/CD, Observability, Scaling, Evaluation metrics.</div>
        </Link>
        <Link to="/flowchart" style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "2rem", color: "#e2e8f0", textDecoration: "none", width: "280px" }}>
          <div style={{ color: "#4ade80", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.5rem" }}>Reference</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Architecture Flowchart</div>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Zoomable end-to-end flowchart: Client → Load Balancer→ API gateway → Multi-Agent Pod → DR.</div>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gpu" element={<GPUCourse />} />
        <Route path="/agentic" element={<AgenticCourse />} />
        <Route path="/infra" element={<AgenticInfraCourse />} />
        <Route path="/flowchart" element={<Flowchart />} />
      </Routes>
    </HashRouter>
  );
}