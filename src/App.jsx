import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AgenticCourse from "./agentic-ml-systems-course";
import GPUCourse from "./gpu-inference-deep-dive";

function Nav() {
  return (
    <nav style={{ padding: "1rem", background: "#1a1a2e", display: "flex", gap: "2rem" }}>
      <Link to="/" style={{ color: "#00d4ff", textDecoration: "none" }}>
        Agentic ML Systems
      </Link>
      <Link to="/gpu" style={{ color: "#00d4ff", textDecoration: "none" }}>
        GPU Inference Deep Dive
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<AgenticCourse />} />
        <Route path="/gpu" element={<GPUCourse />} />
      </Routes>
    </BrowserRouter>
  );
}