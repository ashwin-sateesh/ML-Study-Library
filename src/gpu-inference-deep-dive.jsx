import { useState, useCallback, useMemo } from "react";

// ─── Utility Components ─────────────────────────────────────────────
const Badge = ({ children, color = "#4ade80" }) => (
  <span style={{ background: color + "18", color, padding: "2px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", border: `1px solid ${color}33` }}>{children}</span>
);

const InfoBox = ({ title, children, color = "#60a5fa" }) => (
  <div style={{ background: "#0a0f1a", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: "8px", padding: "16px 20px", margin: "16px 0" }}>
    {title && <div style={{ color, fontSize: "13px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>}
    <div style={{ color: "#c8d6e5", fontSize: "14px", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const Jargon = ({ term, children }) => (
  <div style={{ background: "#0d1117", border: "1px solid #f59e0b33", borderLeft: "3px solid #f59e0b", borderRadius: "8px", padding: "14px 18px", margin: "14px 0" }}>
    <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, marginBottom: "6px", letterSpacing: "0.5px" }}>{"\ud83d\udcd6"} WHAT IS: {term}</div>
    <div style={{ color: "#d1d5db", fontSize: "14px", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const CodeBlock = ({ children, label }) => (
  <div style={{ margin: "14px 0" }}>
    {label && <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>}
    <pre style={{ background: "#060a12", border: "1px solid #1e293b", borderRadius: "8px", padding: "14px 18px", fontSize: "13px", lineHeight: 1.6, color: "#a5f3fc", overflowX: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>{children}</pre>
  </div>
);

const DiagramBox = ({ children, title }) => (
  <div style={{ background: "#060a14", border: "1px solid #1e3a5f", borderRadius: "10px", padding: "20px", margin: "18px 0", overflowX: "auto" }}>
    {title && <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} {title}</div>}
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "12.5px", lineHeight: 1.6, whiteSpace: "pre", color: "#94a3b8" }}>{children}</div>
  </div>
);

const ExampleBox = ({ title, children }) => (
  <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a0f2e 100%)", border: "1px solid #7c3aed33", borderRadius: "10px", padding: "18px 20px", margin: "16px 0" }}>
    <div style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 700, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px" }}>{"\u26a1"} {title || "Worked Example"}</div>
    <div style={{ color: "#d1d5db", fontSize: "14px", lineHeight: 1.7 }}>{children}</div>
  </div>
);

const AnalogyBox = ({ children }) => (
  <div style={{ background: "#0f1a12", border: "1px solid #22c55e33", borderRadius: "10px", padding: "16px 20px", margin: "14px 0" }}>
    <div style={{ color: "#4ade80", fontSize: "12px", fontWeight: 700, marginBottom: "8px", letterSpacing: "0.5px" }}>{"\ud83d\udd17"} REAL-WORLD ANALOGY</div>
    <div style={{ color: "#d1d5db", fontSize: "14px", lineHeight: 1.7 }}>{children}</div>
  </div>
);

// ─── SVG Architecture Diagrams ──────────────────────────────────────

const GPUFullArchDiagram = () => (
  <div style={{ margin: "20px 0", background: "#040810", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "20px", overflowX: "auto" }}>
    <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} NVIDIA H100 GPU — Full Architecture Diagram</div>
    <svg viewBox="0 0 900 720" style={{ width: "100%", maxWidth: "900px" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="ah" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#4ade80"/></marker>
        <marker id="ab" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#60a5fa"/></marker>
        <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f87171"/></marker>
      </defs>
      <rect x="2" y="2" width="896" height="716" rx="12" fill="#080c14" stroke="#1e3a5f" strokeWidth="2"/>
      <text x="450" y="30" fill="#f1f5f9" fontSize="15" fontWeight="800" textAnchor="middle" fontFamily="monospace">NVIDIA H100 SXM GPU — 80 Billion Transistors</text>

      {/* GPC label */}
      <rect x="20" y="45" width="860" height="380" rx="8" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="6,4"/>
      <text x="40" y="65" fill="#64748b" fontSize="10" fontFamily="monospace">GPC 0 (Graphics Processing Cluster) — H100 has 8 GPCs, each containing ~16 SMs</text>

      {/* SM Grid — show 6 SMs representing the 132 total */}
      {[0,1,2].map(row => [0,1].map(col => {
        const sx = 30 + col * 425;
        const sy = 78 + row * 115;
        return (
          <g key={`sm-${row}-${col}`}>
            <rect x={sx} y={sy} width="410" height="105" rx="6" fill="#0d1520" stroke="#1e3a5f" strokeWidth="1.5"/>
            <text x={sx+8} y={sy+16} fill="#4ade80" fontSize="10" fontWeight="700" fontFamily="monospace">SM {row*2+col} of 132</text>
            {/* 4 Sub-partitions */}
            {[0,1,2,3].map(sp => {
              const spx = sx + 6 + sp * 100;
              return (
                <g key={`sp-${sp}`}>
                  <rect x={spx} y={sy+22} width="95" height="75" rx="4" fill="#111827" stroke="#1f2937" strokeWidth="1"/>
                  <text x={spx+4} y={sy+33} fill="#94a3b8" fontSize="7.5" fontFamily="monospace">Sub-partition {sp}</text>
                  {/* CUDA cores grid */}
                  {Array.from({length: 4}, (_, r) => Array.from({length: 8}, (_, c) => (
                    <rect key={`c-${r}-${c}`} x={spx+3+c*11} y={sy+37+r*9} width="9" height="7" rx="1" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.5"/>
                  )))}
                  <text x={spx+4} y={sy+78} fill="#60a5fa" fontSize="6.5" fontFamily="monospace">32 CUDA cores</text>
                  {/* Tensor Core */}
                  <rect x={spx+62} y={sy+80} width="30" height="12" rx="2" fill="#7c3aed" stroke="#a78bfa" strokeWidth="0.5"/>
                  <text x={spx+64} y={sy+89} fill="#e9d5ff" fontSize="6" fontFamily="monospace">TC</text>
                  {/* Warp Scheduler */}
                  <rect x={spx+3} y={sy+82} width="55" height="10" rx="2" fill="#0f4c3a" stroke="#10b981" strokeWidth="0.5"/>
                  <text x={spx+5} y={sy+89.5} fill="#6ee7b7" fontSize="6" fontFamily="monospace">Warp Sched</text>
                </g>
              );
            })}
          </g>
        );
      }))}

      {/* Shared Memory / L1 bar */}
      <rect x="30" y="428" width="410" height="22" rx="4" fill="#1a0f2e" stroke="#7c3aed55" strokeWidth="1"/>
      <text x="140" y="443" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">Shared Memory / L1 Cache: 228 KB per SM (configurable split)</text>
      <rect x="455" y="428" width="410" height="22" rx="4" fill="#1a0f2e" stroke="#7c3aed55" strokeWidth="1"/>
      <text x="565" y="443" fill="#c084fc" fontSize="9" fontFamily="monospace" textAnchor="middle">Register File: 256 KB per SM (64 KB per sub-partition)</text>

      {/* L2 Cache */}
      <rect x="30" y="462" width="840" height="35" rx="6" fill="#1e1a0a" stroke="#f59e0b44" strokeWidth="1.5"/>
      <text x="450" y="478" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">L2 Cache — 50 MB shared across ALL 132 SMs — Bandwidth: ~12 TB/s — Latency: ~200 cycles</text>
      <text x="450" y="492" fill="#a3882a" fontSize="9" textAnchor="middle" fontFamily="monospace">Acts as a buffer between SMs and HBM. Caches frequently accessed weight tiles and KV cache blocks.</text>

      {/* Arrows SM -> L2 */}
      <line x1="235" y1="453" x2="235" y2="462" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#ah)"/>
      <line x1="660" y1="453" x2="660" y2="462" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#ah)"/>

      {/* Memory Crossbar */}
      <rect x="30" y="505" width="840" height="20" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
      <text x="450" y="519" fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="monospace">Memory Crossbar / NoC (Network on Chip) — Routes data between L2 partitions and HBM controllers</text>

      {/* HBM3 Stacks */}
      <rect x="30" y="535" width="840" height="60" rx="6" fill="#0a1628" stroke="#3b82f6" strokeWidth="2"/>
      <text x="450" y="553" fill="#60a5fa" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">HBM3 (VRAM) — 80 GB Total — Bandwidth: 3.35 TB/s — Latency: ~400 cycles</text>
      {/* HBM stacks */}
      {[0,1,2,3,4].map(i => (
        <g key={`hbm-${i}`}>
          <rect x={60+i*168} y={560} width="130" height="28" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1"/>
          <text x={125+i*168} y={577} fill="#93c5fd" fontSize="8" fontFamily="monospace" textAnchor="middle">HBM3 Stack {i} — 16 GB</text>
          <text x={125+i*168} y={585} fill="#6b8ab0" fontSize="7" fontFamily="monospace" textAnchor="middle">8-hi stack, 1024-bit bus</text>
        </g>
      ))}

      {/* Arrows L2 -> HBM */}
      <line x1="450" y1="497" x2="450" y2="505" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#ab)"/>
      <line x1="450" y1="525" x2="450" y2="535" stroke="#60a5fa" strokeWidth="1.5" markerEnd="url(#ab)"/>

      {/* External Interfaces */}
      <rect x="30" y="608" width="400" height="50" rx="6" fill="#0d0f14" stroke="#f8717155" strokeWidth="1.5"/>
      <text x="230" y="626" fill="#f87171" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">NVLink 4.0 — 18 Links</text>
      <text x="230" y="640" fill="#a88" fontSize="9" textAnchor="middle" fontFamily="monospace">900 GB/s bidirectional to other GPUs</text>
      <text x="230" y="652" fill="#777" fontSize="8" textAnchor="middle" fontFamily="monospace">Used for Tensor Parallelism AllReduce</text>

      <rect x="470" y="608" width="400" height="50" rx="6" fill="#0d0f14" stroke="#a78bfa55" strokeWidth="1.5"/>
      <text x="670" y="626" fill="#a78bfa" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">PCIe Gen5 x16</text>
      <text x="670" y="640" fill="#8b7ab5" fontSize="9" textAnchor="middle" fontFamily="monospace">128 GB/s bidirectional to CPU</text>
      <text x="670" y="652" fill="#777" fontSize="8" textAnchor="middle" fontFamily="monospace">Used for model loading: CPU RAM to VRAM</text>

      {/* Arrows HBM -> External */}
      <line x1="230" y1="595" x2="230" y2="608" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#ar)"/>
      <line x1="670" y1="595" x2="670" y2="608" stroke="#a78bfa" strokeWidth="1.5"/>

      {/* Legend */}
      <rect x="30" y="670" width="840" height="40" rx="6" fill="#0a0e18" stroke="#1e293b" strokeWidth="1"/>
      <rect x="50" y="682" width="12" height="8" rx="1" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.5"/>
      <text x="68" y="690" fill="#94a3b8" fontSize="8" fontFamily="monospace">CUDA Core</text>
      <rect x="145" y="682" width="12" height="8" rx="1" fill="#7c3aed" stroke="#a78bfa" strokeWidth="0.5"/>
      <text x="163" y="690" fill="#94a3b8" fontSize="8" fontFamily="monospace">Tensor Core</text>
      <rect x="245" y="682" width="12" height="8" rx="1" fill="#0f4c3a" stroke="#10b981" strokeWidth="0.5"/>
      <text x="263" y="690" fill="#94a3b8" fontSize="8" fontFamily="monospace">Warp Scheduler</text>
      <rect x="375" y="682" width="12" height="8" rx="1" fill="#1a0f2e"/>
      <text x="393" y="690" fill="#94a3b8" fontSize="8" fontFamily="monospace">SRAM / Cache</text>
      <rect x="490" y="682" width="12" height="8" rx="1" fill="#1e3a5f"/>
      <text x="508" y="690" fill="#94a3b8" fontSize="8" fontFamily="monospace">HBM3 Stack</text>
      <text x="610" y="690" fill="#64748b" fontSize="8" fontFamily="monospace">Total: 16,896 CUDA Cores | 528 Tensor Cores | 132 SMs | 80 GB HBM3</text>
    </svg>
  </div>
);

const MemoryHierarchyDiagram = () => (
  <div style={{ margin: "20px 0", background: "#040810", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "20px", overflowX: "auto" }}>
    <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} Memory Hierarchy — Data Flow with Bandwidth and Latency</div>
    <svg viewBox="0 0 800 480" style={{ width: "100%", maxWidth: "800px" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="adown" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#4ade80"/></marker>
        <marker id="aup" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto-start-reverse"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/></marker>
        <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="800" height="480" rx="10" fill="#080c14"/>

      {/* Speed gradient background */}
      <rect x="20" y="30" width="760" height="400" rx="8" fill="url(#speedGrad)"/>
      <text x="15" y="50" fill="#4ade80" fontSize="9" fontFamily="monospace" transform="rotate(-90 15 180)">FASTER + SMALLER</text>
      <text x="15" y="50" fill="#ef4444" fontSize="9" fontFamily="monospace" transform="rotate(-90 15 380)">SLOWER + LARGER</text>

      {/* Level 1: Registers */}
      <rect x="200" y="40" width="400" height="55" rx="8" fill="#0f2918" stroke="#4ade80" strokeWidth="2"/>
      <text x="400" y="60" fill="#4ade80" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">REGISTERS</text>
      <text x="400" y="75" fill="#a7f3d0" fontSize="9" textAnchor="middle" fontFamily="monospace">256 KB per SM | 1 clock cycle | ~19.5 TB/s aggregate</text>
      <text x="400" y="88" fill="#6ee7b7" fontSize="8" textAnchor="middle" fontFamily="monospace">Inside each core. Holds the number being computed RIGHT NOW.</text>

      {/* Arrow Reg -> L1 */}
      <line x1="400" y1="95" x2="400" y2="115" stroke="#4ade80" strokeWidth="2" markerEnd="url(#adown)"/>
      <text x="420" y="108" fill="#4ade80" fontSize="7" fontFamily="monospace">19.5 TB/s</text>

      {/* Level 2: L1 / SRAM */}
      <rect x="160" y="115" width="480" height="55" rx="8" fill="#1a0f2e" stroke="#a78bfa" strokeWidth="2"/>
      <text x="400" y="135" fill="#a78bfa" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">L1 CACHE / SHARED MEMORY (SRAM)</text>
      <text x="400" y="150" fill="#c4b5fd" fontSize="9" textAnchor="middle" fontFamily="monospace">228 KB per SM | ~28 cycles | ~19.5 TB/s aggregate</text>
      <text x="400" y="163" fill="#a08ed0" fontSize="8" textAnchor="middle" fontFamily="monospace">Shared by all 128 cores in one SM. FlashAttention tiles live here.</text>

      {/* Arrow L1 -> L2 */}
      <line x1="400" y1="170" x2="400" y2="195" stroke="#a78bfa" strokeWidth="2" markerEnd="url(#adown)"/>
      <text x="420" y="185" fill="#a78bfa" fontSize="7" fontFamily="monospace">~19.5 TB/s</text>

      {/* Level 3: L2 */}
      <rect x="120" y="195" width="560" height="55" rx="8" fill="#1e1a0a" stroke="#fbbf24" strokeWidth="2"/>
      <text x="400" y="215" fill="#fbbf24" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">L2 CACHE</text>
      <text x="400" y="230" fill="#fde68a" fontSize="9" textAnchor="middle" fontFamily="monospace">50 MB total (shared by ALL 132 SMs) | ~200 cycles | ~12 TB/s</text>
      <text x="400" y="243" fill="#c9a520" fontSize="8" textAnchor="middle" fontFamily="monospace">Caches hot weight tiles and KV cache blocks. Reduces HBM reads.</text>

      {/* Arrow L2 -> HBM */}
      <line x1="400" y1="250" x2="400" y2="280" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#adown)"/>
      <text x="420" y="268" fill="#fbbf24" fontSize="7" fontFamily="monospace">~12 TB/s</text>

      {/* Level 4: HBM */}
      <rect x="80" y="280" width="640" height="65" rx="8" fill="#0a1628" stroke="#3b82f6" strokeWidth="2"/>
      <text x="400" y="300" fill="#60a5fa" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">HBM3 (VRAM) — THE MAIN MEMORY</text>
      <text x="400" y="315" fill="#93c5fd" fontSize="9" textAnchor="middle" fontFamily="monospace">80 GB total | ~400 cycles | 3.35 TB/s</text>
      <text x="400" y="330" fill="#6b8ab0" fontSize="8" textAnchor="middle" fontFamily="monospace">Model weights, KV cache, activations all live here. THE bottleneck during decode.</text>
      <text x="400" y="340" fill="#4a6a8a" fontSize="7.5" textAnchor="middle" fontFamily="monospace">5 stacks of 16 GB each, physically bonded to GPU die via silicon interposer</text>

      {/* Arrow HBM -> PCIe */}
      <line x1="300" y1="345" x2="300" y2="380" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#adown)"/>
      <text x="320" y="365" fill="#3b82f6" fontSize="7" fontFamily="monospace">3.35 TB/s</text>

      {/* Level 5: Off-chip */}
      <rect x="80" y="380" width="300" height="50" rx="8" fill="#0d0f14" stroke="#f87171" strokeWidth="1.5"/>
      <text x="230" y="400" fill="#f87171" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">CPU RAM (Host Memory)</text>
      <text x="230" y="415" fill="#fca5a5" fontSize="8" textAnchor="middle" fontFamily="monospace">Via PCIe 5.0: 64 GB/s | ~1000+ cycles</text>
      <text x="230" y="425" fill="#b77" fontSize="7" textAnchor="middle" fontFamily="monospace">Model files loaded from here during init</text>

      <rect x="420" y="380" width="300" height="50" rx="8" fill="#0d0f14" stroke="#f87171" strokeWidth="1.5"/>
      <text x="570" y="400" fill="#f87171" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">Other GPUs (via NVLink)</text>
      <text x="570" y="415" fill="#fca5a5" fontSize="8" textAnchor="middle" fontFamily="monospace">NVLink 4.0: 900 GB/s bidirectional</text>
      <text x="570" y="425" fill="#b77" fontSize="7" textAnchor="middle" fontFamily="monospace">AllReduce for tensor parallelism</text>

      {/* Arrow HBM -> NVLink */}
      <line x1="500" y1="345" x2="500" y2="380" stroke="#f87171" strokeWidth="2" markerEnd="url(#adown)"/>

      {/* Key insight box */}
      <rect x="80" y="445" width="640" height="28" rx="6" fill="#1a0a0a" stroke="#ef444444" strokeWidth="1"/>
      <text x="400" y="463" fill="#fca5a5" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">KEY: 5,800x bandwidth gap from Registers to HBM. Every optimization tries to keep data in the upper levels.</text>
    </svg>
  </div>
);

const ForwardPassFlowDiagram = () => (
  <div style={{ margin: "20px 0", background: "#040810", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "20px", overflowX: "auto" }}>
    <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} Forward Pass — Complete Data Flow Through One Transformer Layer</div>
    <svg viewBox="0 0 800 600" style={{ width: "100%", maxWidth: "800px" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="af" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#4ade80"/></marker>
        <marker id="afb" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#60a5fa"/></marker>
      </defs>
      <rect x="0" y="0" width="800" height="600" rx="10" fill="#080c14"/>

      {/* Input */}
      <rect x="300" y="10" width="200" height="35" rx="6" fill="#0f2918" stroke="#4ade80" strokeWidth="2"/>
      <text x="400" y="32" fill="#4ade80" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">Input: [batch, seq, 4096]</text>

      {/* Save for residual */}
      <line x1="400" y1="45" x2="400" y2="60" stroke="#4ade80" strokeWidth="2" markerEnd="url(#af)"/>
      <line x1="500" y1="28" x2="720" y2="28" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3"/>
      <line x1="720" y1="28" x2="720" y2="310" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="725" y="170" fill="#22c55e" fontSize="7" fontFamily="monospace" transform="rotate(90 725 170)">Residual skip connection</text>

      {/* RMSNorm */}
      <rect x="310" y="60" width="180" height="30" rx="5" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="400" y="79" fill="#a78bfa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">RMSNorm (CUDA cores)</text>
      <line x1="400" y1="90" x2="400" y2="108" stroke="#4ade80" strokeWidth="2" markerEnd="url(#af)"/>

      {/* QKV Projection */}
      <rect x="250" y="108" width="300" height="40" rx="6" fill="#0c1a30" stroke="#3b82f6" strokeWidth="2"/>
      <text x="400" y="125" fill="#60a5fa" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">QKV Projection (Tensor Cores)</text>
      <text x="400" y="140" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">input x W_qkv [4096, 12288] = Q, K, V</text>

      {/* Split into Q, K, V */}
      <line x1="320" y1="148" x2="320" y2="168" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="400" y1="148" x2="400" y2="168" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="480" y1="148" x2="480" y2="168" stroke="#60a5fa" strokeWidth="1.5"/>

      <rect x="280" y="168" width="80" height="25" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1"/>
      <text x="320" y="184" fill="#93c5fd" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Q</text>
      <rect x="360" y="168" width="80" height="25" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1"/>
      <text x="400" y="184" fill="#93c5fd" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">K</text>
      <rect x="440" y="168" width="80" height="25" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1"/>
      <text x="480" y="184" fill="#93c5fd" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">V</text>

      {/* Reshape into heads */}
      <text x="400" y="205" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">Reshape: [batch, 32 heads, seq, 128 dim]</text>

      {/* K,V -> cache */}
      <line x1="400" y1="193" x2="400" y2="208" stroke="#60a5fa" strokeWidth="1"/>
      <rect x="560" y="170" width="120" height="30" rx="4" fill="#1a0f2e" stroke="#c084fc" strokeWidth="1.5"/>
      <text x="620" y="189" fill="#c084fc" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">KV Cache (HBM)</text>
      <line x1="520" y1="181" x2="560" y2="181" stroke="#c084fc" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="540" y="175" fill="#c084fc" fontSize="6" fontFamily="monospace">append</text>

      {/* Attention block */}
      <line x1="400" y1="208" x2="400" y2="220" stroke="#60a5fa" strokeWidth="1.5"/>
      <rect x="220" y="220" width="360" height="55" rx="6" fill="#0f1a28" stroke="#38bdf8" strokeWidth="2"/>
      <text x="400" y="240" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">FlashAttention (in SRAM, tiled)</text>
      <text x="400" y="253" fill="#7dd3fc" fontSize="8" textAnchor="middle" fontFamily="monospace">scores = softmax(Q x K^T / sqrt(128)) x V</text>
      <text x="400" y="266" fill="#5eaad0" fontSize="7" textAnchor="middle" fontFamily="monospace">Computed tile-by-tile in 228KB SRAM. NxN matrix NEVER materialized in HBM.</text>

      {/* Output projection */}
      <line x1="400" y1="275" x2="400" y2="290" stroke="#4ade80" strokeWidth="2" markerEnd="url(#af)"/>
      <rect x="270" y="290" width="260" height="30" rx="5" fill="#0c1a30" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="400" y="309" fill="#60a5fa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Output Projection (Tensor Cores)</text>

      {/* Residual add */}
      <line x1="400" y1="320" x2="400" y2="340" stroke="#4ade80" strokeWidth="2"/>
      <line x1="720" y1="310" x2="400" y2="340" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,3"/>
      <circle cx="400" cy="340" r="10" fill="#0f2918" stroke="#22c55e" strokeWidth="2"/>
      <text x="400" y="344" fill="#4ade80" fontSize="12" fontWeight="800" textAnchor="middle">+</text>
      <text x="420" y="350" fill="#22c55e" fontSize="7" fontFamily="monospace">Residual Add</text>

      {/* Save for second residual */}
      <line x1="400" y1="350" x2="400" y2="370" stroke="#4ade80" strokeWidth="2"/>
      <line x1="500" y1="360" x2="740" y2="360" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3"/>
      <line x1="740" y1="360" x2="740" y2="518" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3"/>

      {/* RMSNorm 2 */}
      <rect x="310" y="370" width="180" height="25" rx="5" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="1.5"/>
      <text x="400" y="387" fill="#a78bfa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">RMSNorm (CUDA cores)</text>
      <line x1="400" y1="395" x2="400" y2="412" stroke="#4ade80" strokeWidth="2" markerEnd="url(#af)"/>

      {/* MLP Block */}
      <rect x="200" y="412" width="400" height="100" rx="6" fill="#1a0a18" stroke="#ec4899" strokeWidth="2"/>
      <text x="400" y="432" fill="#f472b6" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">SwiGLU MLP Block (Tensor Cores)</text>
      <text x="300" y="452" fill="#fb7185" fontSize="8" textAnchor="middle" fontFamily="monospace">gate = input x W_gate</text>
      <text x="500" y="452" fill="#fb7185" fontSize="8" textAnchor="middle" fontFamily="monospace">up = input x W_up</text>
      <text x="400" y="470" fill="#fda4af" fontSize="8" textAnchor="middle" fontFamily="monospace">hidden = SiLU(gate) * up</text>
      <text x="400" y="488" fill="#fb7185" fontSize="8" textAnchor="middle" fontFamily="monospace">output = hidden x W_down [11008, 4096]</text>
      <text x="400" y="505" fill="#c2506a" fontSize="7" textAnchor="middle" fontFamily="monospace">Total weight reads: 264 MB from HBM per layer (2x heavier than attention)</text>

      {/* Residual add 2 */}
      <line x1="400" y1="512" x2="400" y2="530" stroke="#4ade80" strokeWidth="2"/>
      <line x1="740" y1="518" x2="400" y2="530" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,3"/>
      <circle cx="400" cy="530" r="10" fill="#0f2918" stroke="#22c55e" strokeWidth="2"/>
      <text x="400" y="534" fill="#4ade80" fontSize="12" fontWeight="800" textAnchor="middle">+</text>

      {/* Output */}
      <line x1="400" y1="540" x2="400" y2="558" stroke="#4ade80" strokeWidth="2" markerEnd="url(#af)"/>
      <rect x="280" y="558" width="240" height="35" rx="6" fill="#0f2918" stroke="#4ade80" strokeWidth="2"/>
      <text x="400" y="575" fill="#4ade80" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Output: [batch, seq, 4096]</text>
      <text x="400" y="588" fill="#6ee7b7" fontSize="7" textAnchor="middle" fontFamily="monospace">Feeds into next layer (repeat 32x)</text>
    </svg>
  </div>
);

const ModelLoadingFlowDiagram = () => (
  <div style={{ margin: "20px 0", background: "#040810", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "20px", overflowX: "auto" }}>
    <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} Model Loading — Data Flow from Disk to GPU VRAM</div>
    <svg viewBox="0 0 800 200" style={{ width: "100%", maxWidth: "800px" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="aml" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#60a5fa"/></marker>
      </defs>
      <rect x="0" y="0" width="800" height="200" rx="10" fill="#080c14"/>

      {/* SSD */}
      <rect x="20" y="50" width="140" height="80" rx="8" fill="#1a1a2e" stroke="#8b5cf6" strokeWidth="2"/>
      <text x="90" y="80" fill="#a78bfa" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">NVMe SSD</text>
      <text x="90" y="95" fill="#c4b5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">safetensors file</text>
      <text x="90" y="108" fill="#8b7ab5" fontSize="8" textAnchor="middle" fontFamily="monospace">13.5 GB (Llama-7B)</text>
      <text x="90" y="120" fill="#6b5a95" fontSize="7" textAnchor="middle" fontFamily="monospace">~7 GB/s read speed</text>

      {/* Arrow SSD -> CPU RAM */}
      <line x1="160" y1="90" x2="200" y2="90" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#aml)"/>
      <text x="180" y="82" fill="#60a5fa" fontSize="7" fontFamily="monospace">~1.9s</text>

      {/* CPU RAM */}
      <rect x="200" y="50" width="140" height="80" rx="8" fill="#0d1628" stroke="#3b82f6" strokeWidth="2"/>
      <text x="270" y="80" fill="#60a5fa" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="monospace">CPU RAM</text>
      <text x="270" y="95" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">(pageable memory)</text>
      <text x="270" y="108" fill="#6b8ab0" fontSize="8" textAnchor="middle" fontFamily="monospace">OS can swap this</text>
      <text x="270" y="120" fill="#5a7a9a" fontSize="7" textAnchor="middle" fontFamily="monospace">to disk at any time</text>

      {/* Arrow -> Pinned */}
      <line x1="340" y1="90" x2="380" y2="90" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#aml)"/>
      <text x="360" y="82" fill="#60a5fa" fontSize="7" fontFamily="monospace">copy</text>

      {/* Pinned Memory */}
      <rect x="380" y="50" width="140" height="80" rx="8" fill="#0f2918" stroke="#22c55e" strokeWidth="2"/>
      <text x="450" y="75" fill="#4ade80" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">Pinned Memory</text>
      <text x="450" y="90" fill="#6ee7b7" fontSize="8" textAnchor="middle" fontFamily="monospace">(page-locked)</text>
      <text x="450" y="103" fill="#4d9a70" fontSize="7" textAnchor="middle" fontFamily="monospace">cudaHostAlloc()</text>
      <text x="450" y="115" fill="#3d8a60" fontSize="7" textAnchor="middle" fontFamily="monospace">Physical addresses</text>
      <text x="450" y="125" fill="#3d8a60" fontSize="7" textAnchor="middle" fontFamily="monospace">won't change — DMA safe</text>

      {/* Arrow -> GPU */}
      <line x1="520" y1="90" x2="590" y2="90" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#aml)"/>
      <text x="540" y="78" fill="#f59e0b" fontSize="8" fontWeight="700" fontFamily="monospace">PCIe 5.0</text>
      <text x="540" y="108" fill="#d97706" fontSize="7" fontFamily="monospace">64 GB/s</text>
      <text x="540" y="120" fill="#b45309" fontSize="7" fontFamily="monospace">DMA engine</text>
      <text x="540" y="130" fill="#92400e" fontSize="6.5" fontFamily="monospace">(no CPU/GPU cores)</text>

      {/* GPU VRAM */}
      <rect x="590" y="35" width="190" height="110" rx="8" fill="#0a1628" stroke="#f59e0b" strokeWidth="2"/>
      <text x="685" y="60" fill="#fbbf24" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">GPU HBM3 (VRAM)</text>
      <text x="685" y="78" fill="#fde68a" fontSize="8" textAnchor="middle" fontFamily="monospace">80 GB total capacity</text>
      <text x="685" y="95" fill="#ca9a2a" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Each weight tensor gets a</text>
      <text x="685" y="107" fill="#ca9a2a" fontSize="7.5" textAnchor="middle" fontFamily="monospace">contiguous VRAM region via</text>
      <text x="685" y="119" fill="#ca9a2a" fontSize="7.5" textAnchor="middle" fontFamily="monospace">CUDACachingAllocator</text>
      <text x="685" y="138" fill="#a3882a" fontSize="7" textAnchor="middle" fontFamily="monospace">Transfer: 13.5GB / 64 = ~0.2s</text>

      {/* Timeline */}
      <rect x="20" y="165" width="760" height="25" rx="4" fill="#0d1117" stroke="#1e293b" strokeWidth="1"/>
      <text x="50" y="181" fill="#64748b" fontSize="8" fontFamily="monospace">Timeline:</text>
      <rect x="120" y="170" width="200" height="15" rx="3" fill="#1e40af55"/>
      <text x="220" y="181" fill="#93c5fd" fontSize="7" fontFamily="monospace" textAnchor="middle">SSD Read: ~1.9 sec (bottleneck)</text>
      <rect x="330" y="170" width="30" height="15" rx="3" fill="#22c55e55"/>
      <text x="345" y="181" fill="#6ee7b7" fontSize="7" fontFamily="monospace" textAnchor="middle">Pin</text>
      <rect x="370" y="170" width="50" height="15" rx="3" fill="#f59e0b55"/>
      <text x="395" y="181" fill="#fbbf24" fontSize="7" fontFamily="monospace" textAnchor="middle">PCIe 0.2s</text>
      <text x="500" y="181" fill="#4ade80" fontSize="8" fontWeight="700" fontFamily="monospace">Total: ~2-3 seconds for 7B FP16</text>
    </svg>
  </div>
);

const PrefillDecodeFlowDiagram = () => (
  <div style={{ margin: "20px 0", background: "#040810", border: "1px solid #1e3a5f", borderRadius: "12px", padding: "20px", overflowX: "auto" }}>
    <div style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{"\u25b8"} Prefill vs Decode — Why One Is 355x Faster Than the Other</div>
    <svg viewBox="0 0 800 320" style={{ width: "100%", maxWidth: "800px" }} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="800" height="320" rx="10" fill="#080c14"/>

      {/* Prefill side */}
      <text x="200" y="25" fill="#4ade80" fontSize="13" fontWeight="800" textAnchor="middle" fontFamily="monospace">PREFILL (Process prompt)</text>
      <rect x="20" y="35" width="360" height="270" rx="8" fill="#0f291820" stroke="#22c55e55" strokeWidth="1"/>

      <rect x="40" y="50" width="130" height="60" rx="4" fill="#0f2918" stroke="#4ade80" strokeWidth="1.5"/>
      <text x="105" y="72" fill="#4ade80" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Input Matrix</text>
      <text x="105" y="85" fill="#6ee7b7" fontSize="8" textAnchor="middle" fontFamily="monospace">[2048 x 4096]</text>
      <text x="105" y="97" fill="#4d9a70" fontSize="7" textAnchor="middle" fontFamily="monospace">All tokens at once</text>

      <text x="190" y="80" fill="#4ade80" fontSize="16" fontWeight="800" fontFamily="monospace">x</text>

      <rect x="210" y="50" width="130" height="60" rx="4" fill="#0c1a30" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="275" y="72" fill="#60a5fa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Weight Matrix</text>
      <text x="275" y="85" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">[4096 x 12288]</text>
      <text x="275" y="97" fill="#6b8ab0" fontSize="7" textAnchor="middle" fontFamily="monospace">96 MB from HBM</text>

      <text x="200" y="130" fill="#4ade80" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">GEMM (Matrix x Matrix)</text>
      <text x="200" y="145" fill="#6ee7b7" fontSize="8" textAnchor="middle" fontFamily="monospace">206 Billion FLOPs</text>

      {/* Utilization bar - prefill */}
      <text x="40" y="170" fill="#94a3b8" fontSize="8" fontFamily="monospace">Tensor Core Utilization:</text>
      <rect x="40" y="178" width="320" height="16" rx="3" fill="#1e293b"/>
      <rect x="40" y="178" width="288" height="16" rx="3" fill="#4ade80"/>
      <text x="200" y="190" fill="#0a0e18" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">~90% Active</text>

      <text x="200" y="215" fill="#4ade80" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Arithmetic Intensity: 2,150 FLOP/byte</text>
      <text x="200" y="230" fill="#6ee7b7" fontSize="8" textAnchor="middle" fontFamily="monospace">(well above 295 breakeven)</text>
      <text x="200" y="250" fill="#22c55e" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">COMPUTE BOUND</text>
      <text x="200" y="268" fill="#4ade80" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">~71,000 tokens/sec</text>
      <text x="200" y="285" fill="#3d8a60" fontSize="8" textAnchor="middle" fontFamily="monospace">GPU is doing useful math on nearly every cycle</text>

      {/* Decode side */}
      <text x="600" y="25" fill="#ef4444" fontSize="13" fontWeight="800" textAnchor="middle" fontFamily="monospace">DECODE (Generate tokens)</text>
      <rect x="420" y="35" width="360" height="270" rx="8" fill="#1a0a0a20" stroke="#ef444455" strokeWidth="1"/>

      <rect x="440" y="50" width="130" height="60" rx="4" fill="#1a0a0a" stroke="#ef4444" strokeWidth="1.5"/>
      <text x="505" y="72" fill="#f87171" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Input Vector</text>
      <text x="505" y="85" fill="#fca5a5" fontSize="8" textAnchor="middle" fontFamily="monospace">[1 x 4096]</text>
      <text x="505" y="97" fill="#b55" fontSize="7" textAnchor="middle" fontFamily="monospace">ONE token only</text>

      <text x="590" y="80" fill="#ef4444" fontSize="16" fontWeight="800" fontFamily="monospace">x</text>

      <rect x="610" y="50" width="130" height="60" rx="4" fill="#0c1a30" stroke="#3b82f6" strokeWidth="1.5"/>
      <text x="675" y="72" fill="#60a5fa" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Weight Matrix</text>
      <text x="675" y="85" fill="#93c5fd" fontSize="8" textAnchor="middle" fontFamily="monospace">[4096 x 12288]</text>
      <text x="675" y="97" fill="#6b8ab0" fontSize="7" textAnchor="middle" fontFamily="monospace">96 MB (SAME!)</text>

      <text x="600" y="130" fill="#f87171" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">GEMV (Matrix x Vector)</text>
      <text x="600" y="145" fill="#fca5a5" fontSize="8" textAnchor="middle" fontFamily="monospace">100 Million FLOPs</text>

      {/* Utilization bar - decode */}
      <text x="440" y="170" fill="#94a3b8" fontSize="8" fontFamily="monospace">Tensor Core Utilization:</text>
      <rect x="440" y="178" width="320" height="16" rx="3" fill="#1e293b"/>
      <rect x="440" y="178" width="4" height="16" rx="1" fill="#ef4444"/>
      <text x="600" y="190" fill="#94a3b8" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">~1% Active (99% IDLE!)</text>

      <text x="600" y="215" fill="#f87171" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Arithmetic Intensity: 1.05 FLOP/byte</text>
      <text x="600" y="230" fill="#fca5a5" fontSize="8" textAnchor="middle" fontFamily="monospace">(way below 295 breakeven)</text>
      <text x="600" y="250" fill="#ef4444" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">MEMORY BOUND</text>
      <text x="600" y="268" fill="#f87171" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">~200 tokens/sec</text>
      <text x="600" y="285" fill="#b55" fontSize="8" textAnchor="middle" fontFamily="monospace">GPU sits idle, waiting for weights from HBM</text>
    </svg>
  </div>
);

const chapters = [
  // CHAPTER 0: FOUNDATIONS
  {
    id: 0,
    title: "Foundations \u2014 Building Your Vocabulary",
    subtitle: "Every term explained from scratch, so nothing in this course is a mystery",
    sections: [
      {
        title: "What Is a \"Core\" on a Chip?",
        content: () => (
          <>
            <p>A <strong>core</strong> is the smallest independent unit on a chip that can execute instructions. It is the thing that actually does math. When someone says "this CPU has 8 cores," they mean there are 8 independent workers inside the chip, each capable of reading an instruction (like "add these two numbers") and carrying it out.</p>

            <AnalogyBox>
              Think of a restaurant kitchen. A <strong>core</strong> is one chef. A CPU with 8 cores is a kitchen with 8 chefs — each chef can independently follow a recipe (a sequence of instructions). A GPU with 16,000 cores is a massive factory floor with 16,000 workers — each worker can only do simple tasks (like chopping one vegetable), but together they can prepare 16,000 ingredients simultaneously.
            </AnalogyBox>

            <p>But not all cores are the same. On an NVIDIA GPU, there are two very different kinds of cores, and understanding the difference between them is essential for understanding inference performance:</p>

            <Jargon term="CUDA Core">
              A <strong>CUDA core</strong> is NVIDIA's name for a general-purpose compute unit on their GPUs. Each CUDA core can do one basic math operation per clock cycle — specifically, a <strong>fused multiply-add (FMA)</strong>: <code>result = a * b + c</code>. That is two floating-point operations (one multiply, one add) in a single step. Think of it as one worker who can do one simple calculation at a time, but very fast — billions of times per second. The H100 GPU has <strong>16,896</strong> of these.
            </Jargon>

            <Jargon term="Tensor Core">
              A <strong>Tensor Core</strong> is a specialized, much more powerful compute unit designed specifically for <strong>matrix math</strong> — the kind of math that dominates neural network inference. While a CUDA core does one multiply-add per cycle (2 operations), a single Tensor Core multiplies two small 16x16 matrices and adds the result to a third 16x16 matrix <strong>all in one clock cycle</strong> — that is 8,192 operations at once. The H100 has <strong>528</strong> Tensor Cores. Even though there are far fewer of them, they do the vast majority of the useful work during inference because neural networks are fundamentally giant chains of matrix multiplications.
            </Jargon>
          </>
        ),
      },
      {
        title: "Clock Speed, FLOPS, and Throughput",
        content: () => (
          <>
            <Jargon term="Clock Speed (GHz)">
              Every chip has an internal clock — an electrical signal that ticks billions of times per second. <strong>1 GHz = 1 billion ticks per second</strong>. The H100 GPU runs at about 1.83 GHz, meaning its internal clock ticks 1.83 billion times per second. Each tick is called a <strong>clock cycle</strong>, and each core can potentially complete one operation per tick.
            </Jargon>

            <Jargon term="FLOPS (Floating-Point Operations Per Second)">
              FLOPS is the standard measure of how much math a chip can do per second. "Floating-point" refers to how computers represent decimal numbers (like 3.14159). One FLOP = one basic math operation (an add or a multiply) on such a number.
              <br/><br/>
              <strong>Scale:</strong> 1 GFLOPS = 1 billion operations/sec. 1 TFLOPS = 1 trillion operations/sec (1,000 GFLOPS). When someone says "H100 does 989 TFLOPS," they mean it can do 989 trillion floating-point operations per second on its Tensor Cores using FP16 numbers.
            </Jargon>

            <ExampleBox title="Calculating H100 FLOPS from First Principles">
              <p><strong>CUDA cores (FP32):</strong> 16,896 cores x 2 ops/cycle x 1.83 GHz = <strong>~61.8 TFLOPS</strong></p>
              <p><strong>Tensor Cores (FP16):</strong> 528 cores x 8,192 ops/cycle x 1.83 GHz = <strong>~989 TFLOPS</strong></p>
              <p>That is a 16x gap. For inference workloads (all matrix multiplications), Tensor Cores do the heavy lifting.</p>
            </ExampleBox>

            <Jargon term="Throughput vs Latency">
              <strong>Latency</strong> = how long ONE task takes start to finish. <strong>Throughput</strong> = how many total tasks you complete per second. A CPU optimizes for latency (each task is fast). A GPU optimizes for throughput (total work done per second is massive, even if each individual task takes longer to start). During inference, latency determines how fast the first token appears; throughput determines how many users you can serve simultaneously.
            </Jargon>
          </>
        ),
      },
      {
        title: "Types of Memory \u2014 Registers, Cache, SRAM, HBM, VRAM",
        content: () => (
          <>
            <p>A GPU has multiple types of memory arranged in a <strong>hierarchy</strong> — small and fast at the top, large and slow at the bottom. This hierarchy is the single most important concept for understanding inference performance, because the speed at which data moves between memory and compute cores is what determines how fast inference actually runs.</p>

            <MemoryHierarchyDiagram />

            <p>Let us walk through each level of this diagram, from top to bottom:</p>

            <Jargon term="Register">
              The fastest and smallest memory, located <strong>directly inside each core</strong>. A register holds one number that a core is actively computing on — like the chef's hands holding the ingredient being cut. Registers are read in <strong>1 clock cycle</strong> (~0.5 nanoseconds). Each SM has 256 KB of register space, split across its 128 cores.
            </Jargon>

            <Jargon term="SRAM / Shared Memory / L1 Cache">
              A small, fast memory bank <strong>shared by all cores within one SM</strong>. On NVIDIA GPUs, the same physical SRAM chip serves as both "Shared Memory" and "L1 Cache" — you can configure how much goes to each. Think of it as the prep counter right next to the chefs. Access time: ~28 clock cycles. The H100 has <strong>228 KB per SM</strong>. This is where FlashAttention does its tiled computation — small enough to fit here, fast enough to avoid the HBM bottleneck.
            </Jargon>

            <Jargon term="L2 Cache">
              A larger, slower cache <strong>shared by ALL 132 SMs</strong> on the entire GPU. The H100 has <strong>50 MB</strong> of L2 cache accessible in ~200 cycles with ~12 TB/s bandwidth. It acts as a buffer between the SMs and HBM — when multiple SMs need the same weight data, the L2 can serve it without going back to the slow HBM.
            </Jargon>

            <Jargon term="HBM (High Bandwidth Memory) / VRAM">
              The GPU's main memory — where model weights, KV cache, and activations actually live. <strong>HBM</strong> stands for High Bandwidth Memory: memory chips physically stacked on top of each other and bonded to the GPU die via a silicon interposer with thousands of tiny through-silicon vias (wires through the chip). This stacking achieves very high bandwidth: the H100 has <strong>80 GB of HBM3</strong> at <strong>3.35 TB/s</strong>. "VRAM" (Video RAM) is the general term. Despite 3.35 TB/s sounding fast, when each generated token requires reading 13.5 GB of weights, HBM becomes the bottleneck.
            </Jargon>

            <AnalogyBox>
              <strong>Registers</strong> = ingredients in the chef's hands (instant, holds almost nothing)<br/>
              <strong>SRAM/L1</strong> = the prep counter next to the chef (very fast, limited space)<br/>
              <strong>L2 Cache</strong> = the shared kitchen pantry (bigger, takes a few steps)<br/>
              <strong>HBM/VRAM</strong> = the walk-in freezer in the basement (huge, takes a while)<br/>
              <strong>CPU RAM</strong> = the grocery store across town (enormous, have to drive there)
            </AnalogyBox>
          </>
        ),
      },
      {
        title: "Memory Bandwidth and Arithmetic Intensity",
        content: () => (
          <>
            <Jargon term="Memory Bandwidth">
              Bandwidth measures how much data you can move per second from memory to compute cores. The H100's HBM3 delivers <strong>3.35 TB/s</strong> — 3.35 terabytes of data every second. This matters because before a core can multiply a number, that number must first be <strong>fetched from memory into a register</strong>. If memory cannot deliver numbers fast enough, the cores sit idle waiting. This state is called being <strong>"memory-bandwidth bound."</strong>
            </Jargon>

            <Jargon term="Arithmetic Intensity (FLOP/byte)">
              The ratio of compute work to data movement. If you load 1 byte from memory and do 100 operations on it, the arithmetic intensity is 100 FLOP/byte. The H100 does 989 TFLOPS but only reads 3.35 TB/s from HBM. The breakeven: 989 / 3.35 = <strong>~295 FLOP/byte</strong>. Below 295: memory-bound (cores idle). Above 295: compute-bound (cores busy). <strong>This number — 295 — is the single most important number for understanding inference performance on H100.</strong>
            </Jargon>

            <ExampleBox title="Why This Is THE Key Insight">
              <p><strong>Processing a 2048-token prompt (prefill):</strong> Input is a matrix [2048 x 4096]. You load 32 MB of weights and do ~167 billion FLOPs. Intensity: ~5,200 FLOP/byte. Way above 295. <strong>Compute bound — Tensor Cores are fully busy.</strong></p>
              <p><strong>Generating one token (decode):</strong> Input is ONE vector [1 x 4096]. You load the same 32 MB of weights but do only ~81 million FLOPs. Intensity: ~2.5 FLOP/byte. Way below 295. <strong>Memory bound — Tensor Cores are 99% idle, waiting for data.</strong></p>
              <p>This single fact explains why generating text is slow. The GPU has more than enough compute power — it just cannot read the model weights from memory fast enough to keep the cores fed.</p>
            </ExampleBox>
          </>
        ),
      },
      {
        title: "Matrix Operations \u2014 GEMM and GEMV",
        content: () => (
          <>
            <Jargon term="GEMM (General Matrix-Matrix Multiply)">
              Multiplying two <strong>matrices</strong> together. You load the weight matrix once but reuse it for every row of the input matrix. More input rows = more reuse = higher arithmetic intensity = better GPU efficiency. This is what happens during prefill — the "good" scenario.
            </Jargon>

            <Jargon term="GEMV (General Matrix-Vector Multiply)">
              Multiplying a matrix by a single <strong>vector</strong>. You still load the <strong>entire weight matrix</strong>, but compute only one vector's worth of results. Same memory cost as GEMM, but 2048x less compute. This is what happens during decode — the "bad" scenario that makes text generation slow.
            </Jargon>

            <PrefillDecodeFlowDiagram />

            <p>The diagram above shows exactly why batching is critical. With batch size 32, you read the weights once but compute 32 tokens — turning the GEMV back into a small GEMM and increasing arithmetic intensity from ~1 to ~32 FLOP/byte. Still memory-bound, but 32x more efficient per byte loaded.</p>
          </>
        ),
      },
      {
        title: "Key GPU Architecture Terms",
        content: () => (
          <>
            <p>These terms describe how the GPU's internal components are organized. The full architecture diagram in Chapter 1 shows exactly where each of these sits physically:</p>

            <Jargon term="SM (Streaming Multiprocessor)">
              The GPU is divided into <strong>Streaming Multiprocessors</strong> — independent mini-processors. The H100 has <strong>132 SMs</strong>. Each SM contains 128 CUDA cores, 4 Tensor Cores, 256 KB of registers, 228 KB of shared memory (SRAM), and 4 warp schedulers. SMs operate independently and can run different kernels simultaneously.
            </Jargon>

            <Jargon term="Warp">
              A group of <strong>32 threads</strong> that execute the <strong>same instruction simultaneously</strong> but on different data. This is called SIMT (Single Instruction, Multiple Threads). Each SM can have up to 64 warps (2,048 threads) resident at once. When one warp waits for memory, the scheduler instantly switches to another ready warp with <strong>zero cost</strong> — this is <strong>latency hiding</strong>.
            </Jargon>

            <Jargon term="Kernel">
              A function that runs on the GPU. When PyTorch executes <code>torch.matmul(A, B)</code>, it launches a "matrix multiply kernel" — a program distributed across all SMs and executed by thousands of threads. Each launch has ~5-10 microsecond overhead, which is why <strong>kernel fusion</strong> (combining operations into one kernel) matters.
            </Jargon>

            <Jargon term="DMA (Direct Memory Access)">
              Hardware that moves data between memory regions <strong>without using CPU or GPU cores</strong>. When weights transfer from CPU RAM to GPU VRAM, a DMA controller handles the copy over PCIe while the CPU and GPU do other work.
            </Jargon>

            <Jargon term="NVLink">
              High-speed direct GPU-to-GPU connection. H100 NVLink 4.0: <strong>900 GB/s bidirectional</strong> — 7x faster than PCIe. Used for tensor parallelism AllReduce (exchanging partial results when a model is split across GPUs).
            </Jargon>

            <Jargon term="PCIe (Peripheral Component Interconnect Express)">
              Standard CPU-to-GPU connection. PCIe 5.0 x16: ~64 GB/s per direction. Used for model loading (CPU RAM to GPU VRAM) and CPU-GPU communication. Much slower than NVLink for GPU-to-GPU.
            </Jargon>
          </>
        ),
      },
      {
        title: "Number Formats \u2014 FP32, FP16, BF16, INT8, INT4, FP8",
        content: () => (
          <>
            <p>The number format determines how many bytes each model weight consumes, which directly controls how much data the GPU must read from HBM per token and therefore how fast inference runs:</p>

            <Jargon term="FP32 (32-bit Floating Point)">
              The standard decimal format: 4 bytes per number, ~7 digits of precision. Default for training, but wasteful for inference — a 7B model in FP32 is 28 GB and would not fit on many GPUs.
            </Jargon>

            <Jargon term="FP16 and BF16 (16-bit formats)">
              <strong>FP16:</strong> 2 bytes, range up to 65,504, ~3.3 digits precision. The standard inference format. Llama-2-7B in FP16: 13.5 GB.<br/>
              <strong>BF16:</strong> Also 2 bytes, but with the same exponent range as FP32 (huge/tiny numbers OK) and less precision (~2.4 digits). Created by Google Brain for deep learning. More stable during training.
            </Jargon>

            <Jargon term="INT8 and INT4 (Integer quantization)">
              <strong>INT8:</strong> 1 byte, values -128 to +127. 2x smaller than FP16, 2x faster decode. Weights are converted from FP16 using scale factors.<br/>
              <strong>INT4:</strong> 0.5 bytes, only 16 possible values. 4x smaller than FP16. Needs careful quantization techniques (GPTQ, AWQ) to preserve quality. Llama-2-7B in INT4: ~3.4 GB.
            </Jargon>

            <Jargon term="FP8 (8-bit floating point)">
              1 byte with floating-point structure (4 exponent + 3 mantissa bits). Available natively on H100 Tensor Cores at 1,979 TFLOPS — 2x the FP16 rate. Often better than INT8 because it preserves the weight distribution shape. Becoming the default for H100 inference.
            </Jargon>
          </>
        ),
      },
      {
        title: "Inference-Specific Terms",
        content: () => (
          <>
            <Jargon term="Inference vs Training">
              <strong>Training:</strong> Teaching the model by adjusting billions of parameters using datasets. Requires both forward pass AND backward pass (gradient computation + weight updates). Extremely expensive.<br/><br/>
              <strong>Inference:</strong> Using the already-trained model to generate output from new input. Only the forward pass. No gradients, no weight updates. Much cheaper per token, but latency matters because real users are waiting.
            </Jargon>

            <Jargon term="Forward Pass">
              The journey of data through every layer of the network: tokens in, probability distribution out. Data enters as token IDs (integers), becomes embedding vectors, passes through each transformer layer (attention + MLP), and exits as logits (scores over the vocabulary). Each layer multiplies by weight matrices and applies non-linear functions.
            </Jargon>

            <Jargon term="Prefill vs Decode">
              <strong>Prefill:</strong> Process the entire input prompt at once — all tokens go through as a matrix. Compute-bound (GEMM, high arithmetic intensity).<br/><br/>
              <strong>Decode:</strong> Generate output tokens one at a time — each is a single vector. Memory-bandwidth-bound (GEMV, low arithmetic intensity). 100-355x slower per token.
            </Jargon>

            <Jargon term="KV Cache">
              Stores previously computed Key and Value vectors so they are not recomputed every decode step. Without it, generating token #1000 would recompute K/V for all 999 prior tokens — quadratic cost. With it: compute K/V for 1 new token, read 999 cached. The tradeoff: KV cache uses VRAM (512 KB/token for Llama-7B, scaling to gigabytes at long contexts).
            </Jargon>

            <Jargon term="Tokenization">
              Converting text to integer IDs. "Hello world" becomes [15496, 995]. Happens on the CPU, takes negligible time compared to GPU computation.
            </Jargon>

            <Jargon term="Quantization">
              Converting weights from higher precision (FP16: 2 bytes) to lower (INT4: 0.5 bytes). Reduces model size, increases inference speed because fewer bytes to read from HBM. Slight quality tradeoff.
            </Jargon>

            <Jargon term="TTFT and TPOT">
              <strong>TTFT (Time To First Token):</strong> Time until the first output token appears — dominated by prefill.<br/>
              <strong>TPOT (Time Per Output Token):</strong> Time for each subsequent token — the "typing speed" you see during streaming.
            </Jargon>

            <InfoBox title="You are ready for the deep dive" color="#4ade80">
              Every term used in the upcoming chapters has been defined here. Chapter 1 starts with the full GPU architecture diagram — showing exactly where each of these components sits physically and how data flows between them.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  // CHAPTER 1: GPU ARCHITECTURE
  {
    id: 1,
    title: "GPU Architecture for ML Engineers",
    subtitle: "The H100's hardware, component by component, with exact specifications",
    sections: [
      {
        title: "The Full H100 Architecture \u2014 Every Component",
        content: () => (
          <>
            <p>The diagram below shows the actual architecture of an NVIDIA H100 SXM GPU. Every box represents a real physical component on the chip. Study it carefully — every chapter that follows refers back to components shown here.</p>

            <GPUFullArchDiagram />

            <p>Let us walk through this diagram from top to bottom, explaining what each component does and why it exists:</p>

            <p>At the top level, the GPU die is organized into <strong>8 GPCs (Graphics Processing Clusters)</strong>, each containing roughly 16 SMs. A GPC is just an organizational grouping — it shares a raster engine (irrelevant for AI inference) and routes data to its SMs. For inference purposes, you can think of the 132 SMs as the fundamental compute units.</p>

            <p>Each <strong>SM</strong> (shown as the large boxes in the diagram) is split into <strong>4 sub-partitions</strong>. Each sub-partition has its own 32 CUDA cores (the blue squares), 1 Tensor Core (the purple rectangle), and 1 warp scheduler (the green bar). The warp scheduler is the traffic controller — it decides which group of 32 threads (a "warp") gets to execute next. When one warp stalls waiting for memory, the scheduler instantly switches to another warp with zero overhead. This is the fundamental mechanism that lets GPUs hide memory latency.</p>

            <p>Below the SM grid, the <strong>L1/Shared Memory</strong> bar represents the 228 KB of fast SRAM that all 4 sub-partitions within one SM share. This is where FlashAttention stores its tiles — small enough to fit, fast enough to avoid the HBM bottleneck.</p>

            <p>The <strong>L2 Cache</strong> (50 MB, yellow) sits below all SMs and is shared by the entire GPU. When multiple SMs need the same weight data, the L2 can serve it without going back to the slow HBM. It is partitioned into slices, each associated with an HBM controller.</p>

            <p>The <strong>Memory Crossbar / NoC</strong> (Network on Chip) is the routing fabric that connects L2 cache partitions to HBM memory controllers. It ensures any SM can access any byte in HBM, though accessing data in a "local" HBM partition (physically close) is faster than a remote one.</p>

            <p>The <strong>HBM3 stacks</strong> (blue, 5 stacks of 16 GB each) are the GPU's main memory. Each stack is a tower of 8 memory dies, physically bonded to the GPU die via a silicon interposer with thousands of through-silicon vias. The wide 1024-bit bus per stack is what achieves the massive 3.35 TB/s aggregate bandwidth.</p>

            <p>At the bottom, <strong>NVLink</strong> and <strong>PCIe</strong> are the off-chip interfaces. NVLink connects directly to other GPUs at 900 GB/s (used for multi-GPU inference). PCIe connects to the CPU at 64 GB/s per direction (used for model loading).</p>
          </>
        ),
      },
      {
        title: "Why GPUs and Not CPUs?",
        content: () => (
          <>
            <p>The architecture diagram above reveals the fundamental difference between CPUs and GPUs: <strong>how they spend their transistor budget</strong>.</p>

            <p>A CPU like the Intel Xeon 8380 has 40 cores running at ~3.4 GHz. Each core dedicates about 60% of its transistors to making that one core incredibly fast at complex, unpredictable tasks: a massive branch predictor that guesses which code path to take next, an out-of-order execution engine that reorders instructions for maximum speed, and large multi-level caches that keep frequently used data nearby. Only ~40% of each core's transistors are actual arithmetic hardware. The result: ~2 TFLOPS FP32.</p>

            <p>The H100 inverts this ratio. ~80% of the transistor budget goes to math units — 16,896 CUDA cores and 528 Tensor Cores. Each individual core has minimal control logic: no branch predictor, no out-of-order engine. Each core can only do simple, repetitive math. But there are thousands of them running in parallel. The result: ~62 TFLOPS on CUDA cores alone, ~989 TFLOPS on Tensor Cores.</p>

            <InfoBox title="Why this maps perfectly to inference" color="#f59e0b">
              A forward pass through Llama-2-70B requires ~140 billion multiply-add operations per token. These operations are regular and predictable (matrix multiplications — the same pattern every time), need no branch prediction, and can be parallelized across thousands of independent elements. This is exactly the workload that GPUs are designed for. At 989 TFLOPS, the H100 can handle the raw arithmetic in ~0.14ms. The actual bottleneck during decode is not compute — it is reading the 140 GB of weights from HBM fast enough.
            </InfoBox>
          </>
        ),
      },
      {
        title: "Inside a Streaming Multiprocessor",
        content: () => (
          <>
            <p>Looking back at the architecture diagram, each SM box contains 4 sub-partitions. Let us zoom in on exactly what sits inside each sub-partition and how the pieces work together:</p>

            <p>The <strong>32 CUDA cores</strong> in each sub-partition (the blue squares in the diagram) are the general-purpose compute units. Each one performs a fused multiply-add (FMA): <code>a * b + c</code> = 2 FLOPs per cycle. These handle element-wise operations like RMSNorm, activation functions (SiLU), and residual additions. For inference, these are less important than Tensor Cores but still necessary for non-matrix operations.</p>

            <p>The <strong>Tensor Core</strong> (the purple rectangle) is the powerhouse. One H100 Tensor Core performs a 16x16x16 matrix multiply-accumulate per cycle: multiply two 16x16 FP16 matrices, accumulate into a 16x16 FP32 matrix. That is 8,192 FLOPs per cycle versus 2 for a CUDA core — a 4,096x advantage per unit. During inference, virtually all the weight-multiplied computation runs on Tensor Cores.</p>

            <p>The <strong>Warp Scheduler</strong> (green bar) is the secret to GPU efficiency. Each SM has 4 warp schedulers (one per sub-partition), and each can have up to 16 warps ready to execute. When warp #3 issues an HBM read (~400 cycles away), the scheduler switches to warp #7 (which has data ready) in the very next cycle — zero switching cost. This is called <strong>latency hiding</strong>. But it only works when enough independent warps exist. During single-batch decode, there are too few warps to hide the memory latency, which is why SM utilization drops to 5-15%.</p>

            <p>The <strong>Register File</strong> (256 KB per SM, 64 KB per sub-partition) holds the values each core is actively computing on. When a Tensor Core performs its 16x16x16 operation, the input tiles and output tiles live in registers. This is the fastest storage on the chip — 19.5 TB/s aggregate bandwidth, 1 cycle access.</p>

            <InfoBox title="SM totals for the full H100" color="#4ade80">
              132 SMs x 128 CUDA cores = <strong>16,896 CUDA cores total</strong><br/>
              132 SMs x 4 Tensor Cores = <strong>528 Tensor Cores total</strong><br/>
              132 SMs x 228 KB SRAM = <strong>~30 MB of L1/Shared Memory total</strong><br/>
              132 SMs x 256 KB registers = <strong>~33 MB of register space total</strong>
            </InfoBox>
          </>
        ),
      },
    ],
  },
  // CHAPTER 2: LOADING A MODEL
  {
    id: 2,
    title: "Loading a Model into GPU Memory",
    subtitle: "The complete data path from disk to VRAM, byte by byte",
    sections: [
      {
        title: "What Is Inside the Model File",
        content: () => (
          <>
            <p>When you download Llama-2-7B from Hugging Face, the weights are stored in <strong>safetensors</strong> format. Unlike pickle files which can execute arbitrary code during loading, safetensors is a simple binary format where the on-disk layout <strong>exactly matches</strong> the in-memory layout — loading means just copying bytes, no deserialization needed.</p>

            <Jargon term="Safetensors">
              A binary file with a small JSON header at the front listing every tensor's name, shape, data type (FP16, FP32, etc.), and byte offset in the file. The actual weight data follows as raw bytes. Because the binary layout matches the memory layout, the GPU can essentially memory-map the file and read directly — no conversion step required. This makes loading fast and safe (no code execution risk).
            </Jargon>

            <CodeBlock label="Weight tensors for Llama-2-7B (32 transformer layers)">
{`# Each of the 32 layers stores these weight matrices:
# --- Attention (4 matrices per layer) ---
model.layers.0.self_attn.q_proj.weight  [4096, 4096]   # 16.8M params
model.layers.0.self_attn.k_proj.weight  [4096, 4096]   # 16.8M params
model.layers.0.self_attn.v_proj.weight  [4096, 4096]   # 16.8M params
model.layers.0.self_attn.o_proj.weight  [4096, 4096]   # 16.8M params

# --- MLP / Feed-Forward (3 matrices per layer) ---
model.layers.0.mlp.gate_proj.weight     [11008, 4096]  # 45.1M params
model.layers.0.mlp.up_proj.weight       [11008, 4096]  # 45.1M params
model.layers.0.mlp.down_proj.weight     [4096, 11008]  # 45.1M params

# --- Normalization (tiny, per layer) ---
model.layers.0.input_layernorm.weight   [4096]          # 4K params

# x 32 layers = 6.48 billion parameters in layers
# + Embedding table:  [32000, 4096] = 131M params
# + LM Head:          [32000, 4096] = 131M params
# Total: ~6.74 billion parameters
# In FP16: 6.74B x 2 bytes = 13.48 GB on disk`}
            </CodeBlock>
          </>
        ),
      },
      {
        title: "The Transfer Pipeline: Disk to CPU to GPU",
        content: () => (
          <>
            <p>When you call <code>model.to("cuda")</code> in PyTorch, a specific sequence of hardware operations moves the 13.5 GB of weights from your SSD through the CPU and into the GPU's HBM. This diagram shows every step in that pipeline and the hardware performing each transfer:</p>

            <ModelLoadingFlowDiagram />

            <p>Let us trace each step in detail:</p>

            <p><strong>Step 1 — SSD to CPU RAM (~1.9 seconds):</strong> The operating system's file system driver reads the safetensors file from your NVMe SSD at ~7 GB/s. The data lands in pageable CPU DRAM — "pageable" means the OS can swap these memory pages to disk at any time if it needs the RAM for something else.</p>

            <p><strong>Step 2 — CPU RAM to Pinned Memory:</strong> The CUDA runtime copies the data to "pinned" (page-locked) memory. Why is this needed? The GPU's DMA engine works with <strong>physical memory addresses</strong>. Normal pageable memory has virtual addresses that can change when the OS swaps pages. Pinned memory is locked at a fixed physical address, so the DMA engine can safely read from it without the OS moving the pages out from under it. <code>cudaHostAlloc()</code> or PyTorch's <code>pin_memory()</code> performs this locking.</p>

            <p><strong>Step 3 — Pinned Memory to GPU VRAM via PCIe DMA (~0.2 seconds):</strong> The GPU's DMA engine autonomously pulls data across the PCIe 5.0 bus at ~64 GB/s. Neither the CPU cores nor the GPU cores are involved — the DMA controller is dedicated hardware that handles the transfer independently. The CPU and GPU are free to do other work during this time.</p>

            <p><strong>Step 4 — VRAM Allocation:</strong> PyTorch's CUDACachingAllocator assigns each weight tensor a contiguous region in VRAM. The tensor metadata (shape, strides, data type) remains on the CPU — only the raw numerical data (the actual weight values) lives on the GPU.</p>
          </>
        ),
      },
      {
        title: "VRAM Layout \u2014 Where Everything Lives",
        content: () => (
          <>
            <p>After loading, the H100's 80 GB of HBM3 is partitioned among several consumers. This is not a hardware-enforced partition — it is managed by the CUDA memory allocator and the serving framework. Here is the actual layout for Llama-2-7B in FP16:</p>

            <DiagramBox title="VRAM Map \u2014 Llama-2-7B FP16 on H100 80GB">
{`+-------------- 80 GB HBM3 ----------------------+
|                                                 |
| MODEL WEIGHTS (static, loaded once): ~13.5 GB   |
|   Embedding: 32000 x 4096 x 2B    = 256 MB     |
|   32 layers x attention (4 matrices each):      |
|     4 x 4096 x 4096 x 2B x 32     = 4.1 GB     |
|   32 layers x MLP (3 matrices each):            |
|     (2x[4096x11008] + [11008x4096])x2Bx32       |
|                                     = 8.5 GB     |
|   Norms + LM head:                 = 0.6 GB     |
|                                                 |
| KV CACHE (dynamic, grows per token): 0 - 60 GB  |
|   Per token per layer:                          |
|     K: 32 heads x 128 dim x 2B = 8 KB          |
|     V: 32 heads x 128 dim x 2B = 8 KB          |
|   Per token total: 16 KB x 32 layers = 512 KB   |
|   1 user, 4096 tokens:  512KB x 4096  = 2 GB    |
|   16 users, 4096 each:  2 GB x 16     = 32 GB   |
|                                                 |
| ACTIVATIONS (temporary): ~1 GB                  |
|   Intermediate results during forward pass.     |
|   Freed after each layer; only 1 layer needed.  |
|                                                 |
| CUDA OVERHEAD: ~1 GB                            |
|   Runtime, cuBLAS workspace, allocator metadata |
|                                                 |
| FREE SPACE: remaining                           |
+-------------------------------------------------+`}
            </DiagramBox>

            <InfoBox title="KV Cache dominates at scale \u2014 not weights" color="#f59e0b">
              Weights are fixed at 13.5 GB. But KV cache scales with (batch_size x context_length x num_layers). At 16 concurrent users with 4096 context, KV cache alone is 32 GB — <strong>more than double the weights</strong>. For 70B models with 80 layers, each token needs 2.6 MB of KV cache. At 128K context that is 333 GB <strong>per sequence</strong>. This is why Grouped Query Attention (GQA) was invented — Llama-2-70B uses 8 KV heads instead of 64 Q heads, reducing KV cache by 8x.
            </InfoBox>
          </>
        ),
      },
    ],
  },

  // CHAPTER 3: THE FORWARD PASS
  {
    id: 3,
    title: "The Inference Forward Pass",
    subtitle: "Tracing data through every GPU operation in one transformer layer",
    sections: [
      {
        title: "Tokenization and Embedding Lookup",
        content: () => (
          <>
            <p>The very first step happens on the <strong>CPU</strong>, not the GPU. The input text is converted into integer token IDs that the model can process:</p>

            <CodeBlock label="Tokenization (runs on CPU)">
{`Input: "The capital of France is"

Tokenizer (SentencePiece BPE, vocabulary: 32,000 tokens):
  "The"     -> token ID 1576
  "capital" -> token ID 7483
  "of"      -> token ID 310
  "France"  -> token ID 3444
  "is"      -> token ID 338

Result: tensor([1576, 7483, 310, 3444, 338])
Shape: [1, 5]  (1 sequence, 5 tokens)
Memory: 5 integers x 4 bytes = 20 bytes
Time: ~0.1 ms (negligible)`}
            </CodeBlock>

            <p>These 5 integer IDs are transferred to the GPU (20 bytes — essentially instant). Then the <strong>embedding lookup</strong> happens — the first actual GPU operation:</p>

            <Jargon term="Embedding Lookup">
              The model stores an embedding table — a matrix of shape [32000, 4096] (256 MB) where each of the 32,000 rows is a 4096-dimensional vector representing one vocabulary token. The embedding lookup takes each token ID and reads the corresponding row from this table. This is a <strong>gather</strong> operation (indexed read), not a matrix multiplication — it only reads the 5 specific rows needed, not the entire 256 MB table. The result: [1, 5, 4096] — five 4096-dimensional vectors, one per token.
            </Jargon>
          </>
        ),
      },
      {
        title: "One Complete Transformer Layer \u2014 Data Flow",
        content: () => (
          <>
            <p>After embedding, the [1, 5, 4096] tensor passes through <strong>32 identical transformer layers</strong>. The diagram below shows the complete data flow through one layer, including every operation, what hardware runs it, and where data moves:</p>

            <ForwardPassFlowDiagram />

            <p>Let us walk through each operation in the diagram:</p>

            <p><strong>RMSNorm</strong> (purple box): Normalizes the input so values do not grow too large or too small across layers. Formula: <code>output = (x / sqrt(mean(x^2) + eps)) * weight</code>. This is element-wise — it reads each value, does ~3 operations, writes the result. Runs on <strong>CUDA cores</strong> (too little work for Tensor Cores). Arithmetic intensity: ~1.5 FLOP/byte — heavily memory-bound. Takes ~3 microseconds.</p>

            <p><strong>QKV Projection</strong> (blue box): This is where the heavy compute begins. Attention requires three vectors per token — Query (what am I looking for?), Key (what do I contain?), and Value (what should I pass along?). These come from multiplying the input by three weight matrices Wq, Wk, Wv (each [4096, 4096]). In practice, these are <strong>fused into one large GEMM</strong>: input x W_qkv where W_qkv is [4096, 12288]. This fusion has three benefits: one kernel launch instead of three (~15 microsecond savings), the input tensor is read from HBM once instead of three times, and the larger matrix makes better use of Tensor Core tiles.</p>

            <p><strong>FlashAttention</strong> (cyan box): Computes <code>softmax(Q x K^T / sqrt(128)) x V</code> entirely in SRAM tiles, never materializing the NxN attention matrix in HBM. We cover this in detail in the next section.</p>

            <p><strong>Output Projection</strong> (blue): Maps the multi-head attention output back to the model's hidden dimension. Another GEMM on Tensor Cores.</p>

            <p><strong>Residual Add</strong> (green + circle): Adds the layer's input directly to the output, bypassing the entire attention block. This "skip connection" is critical — without it, gradients vanish in deep networks and the model cannot train. During inference it is a simple element-wise addition on CUDA cores.</p>

            <p><strong>SwiGLU MLP</strong> (pink box): The feed-forward network. Uses three weight matrices: gate_proj [4096, 11008], up_proj [4096, 11008], and down_proj [11008, 4096]. The gate and up projections run in parallel, then SiLU(gate) * up gives the hidden representation, which down_proj maps back to 4096 dimensions. <strong>The MLP reads 264 MB of weights per layer — 2x more than attention's 128 MB</strong>. This is the biggest bandwidth consumer during decode.</p>

            <p><strong>Second Residual Add</strong>: Same skip connection around the MLP block.</p>
          </>
        ),
      },
      {
        title: "FlashAttention \u2014 How It Avoids the NxN Problem",
        content: () => (
          <>
            <p>The standard attention formula requires computing QxK^T, which produces an [N x N] matrix where N is sequence length. At N=4096: 4096 x 4096 x 2 bytes x 32 heads = <strong>1 GB</strong>. At N=128K: <strong>1 TB</strong>. FlashAttention avoids this entirely:</p>

            <Jargon term="FlashAttention">
              An algorithm (by Tri Dao, Stanford) that computes <strong>exact attention</strong> without ever creating the full NxN matrix. It divides Q, K, V into small tiles (~128 rows each) that fit in the SM's 228 KB SRAM. For each Q tile, it iterates through all K/V tiles, computing partial attention scores in SRAM and using "online softmax" — a mathematical trick that computes the softmax function incrementally without needing all values at once. The NxN attention matrix exists only as 128x128 tiles, computed and consumed entirely within SRAM before being overwritten by the next tile.
            </Jargon>

            <p>The result: <strong>zero bytes of HBM</strong> used for the attention matrix. The only HBM reads are Q, K, V (the inputs) and the only HBM write is the output. Everything in between happens in the 228 KB SRAM at 19.5 TB/s, not in the 80 GB HBM at 3.35 TB/s. This is what makes long-context inference feasible — without FlashAttention, 128K context would require 1 TB of temporary memory that simply does not exist.</p>
          </>
        ),
      },
      {
        title: "From Last Layer to Next Token",
        content: () => (
          <>
            <p>After all 32 layers, we extract the <strong>last position's</strong> hidden state and convert it to a probability distribution over the 32,000-token vocabulary:</p>

            <DiagramBox title="LM Head and Sampling">
{`After 32 layers: hidden_states [1, 5, 4096]
Take last position only: [1, 1, 4096]

1. Final RMSNorm (CUDA cores, ~3 microseconds)

2. LM Head projection (Tensor Cores)
   logits = hidden x lm_head.T  [1,1,4096] x [4096,32000]
   Result: [1, 1, 32000] -- one score per vocabulary token
   Weight read: 256 MB from HBM

3. Temperature scaling
   logits = logits / 0.7  (lower = more deterministic)

4. Top-p filtering (GPU sort + scan)
   Sort 32,000 logits by score
   Keep tokens until cumulative probability >= 0.9
   Mask the rest to negative infinity

5. Softmax -> probability distribution (sums to 1)

6. Sample from distribution
   next_token = weighted_random_choice(vocabulary)
   Example result: token ID 3681 -> "Paris"

This feeds back as input for the next decode step.`}
            </DiagramBox>
          </>
        ),
      },
    ],
  },
  // CHAPTER 4: PREFILL VS DECODE
  {
    id: 4,
    title: "Prefill vs Decode \u2014 Two Completely Different Regimes",
    subtitle: "Why prompt processing is 355x faster per token than generation",
    sections: [
      {
        title: "The Fundamental Asymmetry",
        content: () => (
          <>
            <p>This is the single most important performance insight in LLM inference. Look at the diagram below carefully — it explains why ChatGPT seems to "think" before it starts typing, and why the typing then comes at a steady pace:</p>

            <PrefillDecodeFlowDiagram />

            <p>Let us work through the numbers exactly, using Llama-2-7B on an H100.</p>

            <p><strong>During prefill</strong>, you have a 2048-token prompt. All 2048 tokens enter the network as a matrix [2048, 4096]. When this matrix hits the first weight matrix (say, the QKV projection [4096, 12288]), the GPU performs a <strong>GEMM</strong>: [2048, 4096] x [4096, 12288]. The math: 2048 x 4096 x 12288 x 2 = <strong>206 billion FLOPs</strong>. The weight matrix is 4096 x 12288 x 2 bytes = <strong>96 MB</strong>. So the arithmetic intensity is 206B / 96MB = <strong>~2,150 FLOP/byte</strong>. Since 2,150 is far above the H100's breakeven point of 295, the operation is <strong>compute-bound</strong>. The Tensor Cores are the bottleneck — they are running at near-peak utilization, processing as fast as their circuits allow.</p>

            <p><strong>During decode</strong>, you generate one token at a time. The input is a single vector [1, 4096]. Same weight matrix [4096, 12288], same 96 MB to read from HBM. But the math is only: 1 x 4096 x 12288 x 2 = <strong>100 million FLOPs</strong>. Arithmetic intensity: 100M / 96MB = <strong>~1.05 FLOP/byte</strong>. Since 1.05 is absurdly below 295, the operation is <strong>memory-bandwidth-bound</strong>. The GPU reads the entire 96 MB weight matrix just to compute a single vector of outputs. The Tensor Cores finish their math in microseconds, then sit idle for hundreds of microseconds waiting for the next weight tile to arrive from HBM.</p>

            <ExampleBox title="End-to-end timing for one decode step">
              <p>In one decode step, the GPU must read all model weights through all 32 layers. Total weight reads: ~13.5 GB. HBM bandwidth: 3.35 TB/s. Time = 13.5 GB / 3.35 TB/s = <strong>4.03 milliseconds</strong>. That gives ~248 tokens/sec. The actual compute (matrix multiplications) takes only ~0.1 ms — the other 3.93 ms is pure memory-read time. <strong>The GPU's Tensor Cores are idle 97% of the time during single-batch decode.</strong></p>
            </ExampleBox>
          </>
        ),
      },
      {
        title: "The Roofline Model \u2014 Visualizing the Bottleneck",
        content: () => (
          <>
            <Jargon term="Roofline Model">
              A visual tool that maps any computation onto a 2D chart where the X-axis is arithmetic intensity (FLOP/byte) and the Y-axis is actual throughput (TFLOPS achieved). Two lines form the "roof": a sloped line (memory bandwidth ceiling — performance limited by how fast you can read data) and a flat line (compute ceiling — performance limited by how fast cores can execute). The point where they meet is the <strong>ridge point</strong> — the breakeven arithmetic intensity.
            </Jargon>

            <DiagramBox title="H100 Roofline Model for Inference">
{`Achieved TFLOPS
    ^
989 |                           ________________________ Compute Ceiling (989 TFLOPS FP16)
    |                          /
    |                         /
    |                        /
    |                       /    Memory Bandwidth Ceiling
    |                      /     (slope = 3.35 TB/s)
    |                     /
    |                    /
    |                   /
    |                  /
    |            * Prefill (batch 2048)
    |           /  AI ≈ 2150 → hits compute ceiling
    |          /   Achieved: ~700 TFLOPS (71% utilization)
    |         /
    |        /
    |       /
    |      /
    |     /
    | * Decode (batch 1)
    | AI ≈ 1.05 → on the memory slope
    | Achieved: ~3.5 TFLOPS (0.35% of peak!)
    |
    +--------------------------------------------------------> Arithmetic Intensity (FLOP/byte)
    1        10        100      295      1000      10000
                                 ^
                           Ridge Point
                    (breakeven: 989 / 3.35 = 295)`}
            </DiagramBox>

            <p>During prefill, the operation sits on the flat "roof" — Tensor Cores are the ceiling. During single-batch decode, the operation sits on the sloped "wall" far to the left — HBM bandwidth is the ceiling. The gap between these two positions explains the entire 355x per-token throughput difference.</p>

            <p>This is also why <strong>batching</strong> moves decode from the bad region to a better one. If you batch 32 requests together, decode becomes [32, 4096] x [4096, 12288] instead of [1, 4096] x [4096, 12288]. Same weight read (96 MB), but 32x the compute. Arithmetic intensity jumps from 1.05 to ~33.6. Still memory-bound (below 295), but 32x more efficient — you get 32 tokens from the same data transfer.</p>
          </>
        ),
      },
    ],
  },

  // CHAPTER 5: QUANTIZATION
  {
    id: 5,
    title: "Quantization \u2014 Shrinking Weights to Move Faster",
    subtitle: "The bandwidth argument for INT8, INT4, and FP8",
    sections: [
      {
        title: "Why Quantize? The Bandwidth Argument",
        content: () => (
          <>
            <p>Now that you understand that decode is memory-bandwidth-bound, the motivation for quantization becomes obvious. During decode, the GPU spends 97% of its time reading weights from HBM. <strong>If the weights are smaller, the read finishes faster, and you generate tokens faster.</strong> It really is that direct.</p>

            <ExampleBox title="Decode speed at different precisions (Llama-2-7B, H100)">
              <p><strong>FP16 (2 bytes/weight):</strong> 13.5 GB model. Read time: 13.5 / 3.35 = <strong>4.03 ms/token → 248 tok/s</strong></p>
              <p><strong>INT8 (1 byte/weight):</strong> 6.75 GB. Read time: 6.75 / 3.35 = <strong>2.01 ms/token → 497 tok/s</strong> (2x faster)</p>
              <p><strong>INT4 (0.5 bytes/weight):</strong> 3.37 GB. Read time: 3.37 / 3.35 = <strong>1.01 ms/token → 990 tok/s</strong> (4x faster)</p>
              <p><strong>FP8 (1 byte, native H100):</strong> 6.75 GB. Read time: same as INT8, but Tensor Cores run at 1979 TFLOPS (2x FP16), and dequantization is free in hardware.</p>
            </ExampleBox>

            <p>The speedup is almost exactly proportional to the compression ratio — because we are bandwidth-bound, halving the data size halves the read time, which roughly halves the total time per token. The "almost" is because of small overheads from dequantization arithmetic (converting INT4 back to FP16 for computation).</p>
          </>
        ),
      },
      {
        title: "INT8 Quantization \u2014 Worked Example",
        content: () => (
          <>
            <p>INT8 maps each FP16 weight to the nearest integer in [-128, +127] using a <strong>scale factor</strong>. The scale factor ensures the range of the original values maps to the integer range.</p>

            <CodeBlock label="INT8 quantization for one weight row">
{`# Original weights (FP16): one row of W_q, shape [4096]
row = [-0.023, 0.187, -0.442, 0.003, ..., 0.891]

# Step 1: Find the absolute max value
abs_max = 0.891

# Step 2: Compute scale factor
# Maps the range [-0.891, +0.891] to [-127, +127]
scale = abs_max / 127 = 0.00702

# Step 3: Quantize each weight
int8_row = round(row / scale)
# [-0.023/0.00702, 0.187/0.00702, -0.442/0.00702, ...]
# = round([-3.28, 26.6, -62.96, 0.43, ...])
# = [-3, 27, -63, 0, ...]   <-- stored as INT8 (1 byte each)

# Step 4: Dequantize (at inference time, on GPU)
# Multiply by scale to recover approximate FP16 values
restored = int8_row * scale
# = [-0.021, 0.189, -0.442, 0.0, ...]
# vs original: [-0.023, 0.187, -0.442, 0.003, ...]
# Error per value: ~0.002 (acceptable for most layers)`}
            </CodeBlock>

            <Jargon term="SmoothQuant">
              A technique by Xiao et al. (MIT/NVIDIA) that handles a major problem: some activation channels have huge outlier values (100x larger than average), making their scale factors massive and destroying precision for all other values in that row. SmoothQuant mathematically transfers the "difficulty" from activations to weights by dividing activations by a per-channel smoothing factor and multiplying weights by the same factor. Since weights can be smoothed offline (before deployment), this spreads the outlier problem across both matrices, making both easier to quantize. The result: INT8 with almost zero accuracy loss on most models.
            </Jargon>
          </>
        ),
      },
      {
        title: "INT4 (GPTQ and AWQ) \u2014 Pushing the Limits",
        content: () => (
          <>
            <p>INT4 represents each weight with only 4 bits — just 16 possible values. Naively quantizing to 4 bits would destroy model quality because the resolution is far too coarse. GPTQ and AWQ solve this with different strategies:</p>

            <Jargon term="GPTQ (Generalized Post-Training Quantization)">
              GPTQ quantizes weights one at a time (left to right through each row) and compensates for each weight's quantization error by adjusting the not-yet-quantized weights in the same row. It uses a small calibration dataset (~128 sentences) to measure which outputs matter most. The key insight: if quantizing weight #5 introduces error, you can slightly adjust weights #6 through #4096 to cancel out that error in the output. This is mathematically optimal and takes about 4 GPU-hours for a 7B model.
            </Jargon>

            <Jargon term="AWQ (Activation-Aware Weight Quantization)">
              AWQ observes that a small fraction of weight channels (~1%) are disproportionately important — they activate much more strongly than others. AWQ <strong>scales up these important channels</strong> by 2-4x before quantizing, giving them more of the limited 16-value resolution. Less important channels get less resolution. By concentrating precision where it matters most, AWQ achieves near-FP16 quality at INT4 sizes.
            </Jargon>

            <InfoBox title="Grouping \u2014 the trick that makes INT4 work" color="#f59e0b">
              INT4 quantization uses <strong>group quantization</strong>: instead of one scale factor per entire row (4096 values), there is one scale factor per group of 128 values. This means 32 scale factors per row, each stored in FP16 (2 bytes). Overhead: 32 x 2 bytes = 64 bytes per row vs. 4096 x 0.5 bytes = 2048 bytes of actual INT4 weights. That is only 3% overhead, but it makes each group's 128 values independently ranged, dramatically improving precision. This is why quantized model files are slightly larger than (params x 0.5 bytes) — the group scales add up.
            </InfoBox>

            <ExampleBox title="Quality impact (Llama-2-7B on common benchmarks)">
              <p><strong>FP16 baseline:</strong> MMLU 45.3, HellaSwag 76.0, ARC 53.1</p>
              <p><strong>INT8 (SmoothQuant):</strong> MMLU 45.1, HellaSwag 75.8, ARC 52.9 (~0.2% loss)</p>
              <p><strong>INT4 (GPTQ g128):</strong> MMLU 44.5, HellaSwag 75.1, ARC 52.0 (~1.5% loss)</p>
              <p><strong>INT4 (AWQ g128):</strong> MMLU 44.8, HellaSwag 75.4, ARC 52.3 (~1.0% loss)</p>
              <p>The 4x speed improvement from INT4 costs about 1% accuracy — a favorable tradeoff for most production systems.</p>
            </ExampleBox>
          </>
        ),
      },
    ],
  },

  // CHAPTER 6: KV CACHE
  {
    id: 6,
    title: "The KV Cache \u2014 Trading Memory for Speed",
    subtitle: "How caching past computations makes autoregressive decode feasible",
    sections: [
      {
        title: "Why the KV Cache Exists",
        content: () => (
          <>
            <p>To understand the KV cache, first consider what happens <strong>without</strong> it. To generate token #100, the attention mechanism needs Q, K, V vectors for all 100 positions. Q only needs the current position (#100). But K and V need <strong>all 100 positions</strong>, because the new token must attend to every previous token. Without caching, you would recompute K and V for all 100 positions from scratch — meaning the cost of generating each token grows linearly with sequence length. By token #4000, you are recomputing K and V for positions 1 through 3999 every step — quadratic total cost.</p>

            <p>The KV cache stores every K and V vector as it is computed during each step, so token #100 only computes K/V for position #100 and reads positions 1-99 from the cache. This changes the per-token cost from O(n) to O(1) for K/V computation (plus O(n) for the attention score computation, which is unavoidable).</p>

            <ExampleBox title="KV Cache size for Llama-2-7B">
              <p><strong>Per token, per layer:</strong></p>
              <p>K vector: 32 heads x 128 dimensions x 2 bytes (FP16) = <strong>8 KB</strong></p>
              <p>V vector: same = <strong>8 KB</strong></p>
              <p>Per token across all 32 layers: (8+8) KB x 32 = <strong>512 KB per token</strong></p>
              <br/>
              <p><strong>Scaling up:</strong></p>
              <p>1 user, 2048 tokens: 512 KB x 2048 = <strong>1 GB</strong></p>
              <p>1 user, 4096 tokens: 512 KB x 4096 = <strong>2 GB</strong></p>
              <p>16 concurrent users, 4096 tokens each: 2 GB x 16 = <strong>32 GB</strong></p>
              <p>This 32 GB for KV cache exceeds the 13.5 GB weight footprint by 2.4x.</p>
            </ExampleBox>

            <p>The KV cache grows on every single decode step: generate one token, append one K vector and one V vector per layer. After 4096 tokens, this cache holds 4096 x 32 layers x 2 x 8 KB = 2 GB. But here is the problem: this memory must be contiguous and efficiently accessible. If it becomes fragmented (spread across non-adjacent HBM addresses), the memory reads become slower. This is where PagedAttention comes in.</p>
          </>
        ),
      },
      {
        title: "PagedAttention \u2014 Virtual Memory for KV Cache",
        content: () => (
          <>
            <Jargon term="PagedAttention (from vLLM, UC Berkeley)">
              Before PagedAttention, each request's KV cache had to be <strong>pre-allocated as one contiguous block</strong> in VRAM. If you set max_seq_len=4096, the system allocated 2 GB per request upfront — even if the user only typed "Hi" (1 token = 512 KB needed, 2 GB allocated, 99.97% wasted). Across 16 slots, that wastes 31+ GB.
              <br/><br/>
              PagedAttention borrows the concept of <strong>virtual memory pages</strong> from operating systems. It divides KV cache into fixed-size blocks (typically 16 tokens each = 8 KB per layer). Each request gets a <strong>page table</strong> that maps "logical position in sequence" to "physical block in VRAM." Blocks are allocated on demand — when a request generates its 17th token, a new block is allocated. When a request finishes, its blocks are freed instantly for other requests.
            </Jargon>

            <DiagramBox title="PagedAttention block allocation example">
{`Without PagedAttention (pre-allocated contiguous):
  Request A: [==================== 2 GB reserved =================]
             [## used (200 KB) ## |  ~~~~~~~~ 1.8 GB wasted ~~~~~~]

With PagedAttention (block-allocated on demand):
  Physical VRAM blocks (each = 16 tokens of KV cache):

  Block 0: [Req A, tokens 0-15 ]     Block 8:  [Req C, tokens 0-15 ]
  Block 1: [Req A, tokens 16-31]     Block 9:  [Req C, tokens 16-31]
  Block 2: [Req B, tokens 0-15 ]     Block 10: [FREE]
  Block 3: [Req B, tokens 16-31]     Block 11: [FREE]
  Block 4: [Req B, tokens 32-47]     Block 12: [FREE]
  Block 5: [Req A, tokens 32-47]     ...
  Block 6: [FREE]
  Block 7: [FREE]

  Page Tables:
  Req A: logical [0,1,2] -> physical [Block 0, Block 1, Block 5]
  Req B: logical [0,1,2] -> physical [Block 2, Block 3, Block 4]
  Req C: logical [0,1]   -> physical [Block 8, Block 9]

  Blocks are non-contiguous but page table makes access transparent.
  No memory is wasted — only allocated blocks hold data.`}
            </DiagramBox>

            <p>The result: <strong>~90% memory utilization</strong> vs ~20-30% without PagedAttention. This is not a small improvement — it means serving 3-5x more concurrent users on the same hardware. vLLM's PagedAttention kernel uses custom CUDA code to follow the page table during attention computation, gathering K/V blocks from their scattered physical locations.</p>

            <InfoBox title="Prefix caching \u2014 sharing KV blocks across requests" color="#4ade80">
              If many requests share the same system prompt (common in production), their KV cache for those tokens is identical. PagedAttention enables <strong>prefix caching</strong>: the system prompt's KV blocks are computed once and shared (read-only) across all requests that use them. A 2000-token system prompt's KV cache (1 GB) is stored once, not duplicated 16 times. This saves 15 GB of VRAM and eliminates 15x redundant computation.
            </InfoBox>
          </>
        ),
      },
    ],
  },
  // CHAPTER 7: BATCHING & SCHEDULING
  {
    id: 7,
    title: "Batching and Scheduling \u2014 Keeping the GPU Busy",
    subtitle: "How serving systems turn the single-request bottleneck into high throughput",
    sections: [
      {
        title: "Static vs Continuous Batching",
        content: () => (
          <>
            <p>We established in Chapter 4 that single-batch decode achieves ~1% GPU utilization. The obvious fix: process multiple requests at once. If 32 users send requests, batch their decode steps so the GPU reads weights once and computes 32 outputs.</p>

            <Jargon term="Static Batching">
              The simplest approach: collect a batch of requests, pad all sequences to the same length, process together, return all results. The problem: if request A generates 20 tokens and request B generates 500 tokens, request A sits idle for 480 steps, wasting its slot in the batch. GPU utilization degrades as sequences finish at different times.
            </Jargon>

            <Jargon term="Continuous Batching (a.k.a. iteration-level scheduling)">
              Used by modern serving engines (vLLM, TGI, TensorRT-LLM). Instead of waiting for all requests to finish, the scheduler checks <strong>after every single decode step</strong> whether any request has completed (hit EOS token or max length). Completed requests are immediately evicted and replaced with new requests from the queue. The batch stays full at all times.
            </Jargon>

            <DiagramBox title="Continuous batching — slot recycling">
{`Decode Step:  1   2   3   4   5   6   7   8   9  10  11  12
Slot 0:      [A   A   A   A  done][D   D   D   D   D  done][G
Slot 1:      [B   B   B   B   B   B   B   B  done][F   F   F
Slot 2:      [C   C  done][E   E   E   E   E   E   E  done][H

             ^--- Request A finishes at step 5
                  Slot 0 immediately starts request D at step 6
                  No idle slots ever.

Contrast with static batching:
Slot 0:      [A   A   A   A  idle idle idle idle idle idle idle idle]
Slot 1:      [B   B   B   B   B   B   B   B  idle idle idle idle]
Slot 2:      [C   C  idle idle idle idle idle idle idle idle idle idle]
             All three must finish (step 8) before ANY new batch starts.`}
            </DiagramBox>

            <p>Continuous batching increases throughput by 2-3x over static batching at the same latency targets. The scheduler also handles another critical task: interleaving prefill and decode. A new request needs prefill (compute-bound), while existing requests need decode (memory-bound). Clever schedulers chunk the prefill into smaller pieces and interleave them with decode steps, preventing long prefills from stalling decode for other users.</p>
          </>
        ),
      },
      {
        title: "Speculative Decoding \u2014 Guessing Ahead",
        content: () => (
          <>
            <Jargon term="Speculative Decoding">
              Uses a small "draft" model (e.g., 1B parameters) to quickly guess the next K tokens (typically K=4-8). Then the large "target" model (e.g., 70B) verifies all K tokens <strong>in a single forward pass</strong> (this is a prefill-style GEMM, which is efficient). Tokens that match the draft are accepted for free; the first mismatch is resampled from the target model's distribution, and everything after is discarded.
            </Jargon>

            <p>Why this works: the draft model generates K=5 tokens in ~1 ms total (it is small and fast). The target model verifies all 5 in one forward pass — same cost as generating 1 token normally (~4 ms for 7B, ~20 ms for 70B). If 3 out of 5 match (typical acceptance rate for well-chosen draft models), you got 4 tokens (3 accepted + 1 resampled) for the cost of 1 target forward pass. That is a 3-4x speedup for single-request latency.</p>

            <ExampleBox title="Speculative decoding step-by-step">
              <p><strong>Step 1:</strong> Draft model (Llama-2-1B) generates 5 tokens: ["the", "capital", "city", "of", "France"]</p>
              <p><strong>Step 2:</strong> Target model (Llama-2-70B) processes all 5 as one batch [5, 4096] — a GEMM, not a GEMV. Takes ~20 ms.</p>
              <p><strong>Step 3:</strong> Compare token by token:</p>
              <p>Position 1: draft="the", target="the" → ACCEPT</p>
              <p>Position 2: draft="capital", target="capital" → ACCEPT</p>
              <p>Position 3: draft="city", target="of" → REJECT. Sample from target distribution → "of"</p>
              <p>Positions 4-5: discarded (everything after first mismatch).</p>
              <p><strong>Result:</strong> 3 accepted tokens in 20 ms vs. 60 ms (3 separate decode steps). Net: ~3x faster.</p>
            </ExampleBox>

            <InfoBox title="When speculative decoding helps most" color="#f59e0b">
              The benefit scales with: (1) how predictable the text is (formulaic code, structured data, boilerplate text have less than 80% acceptance rates), and (2) how slow the target model is relative to the draft. For 70B+, speculative decoding is almost always a win. For 7B, the draft model overhead can eat into gains. The approach is <strong>mathematically guaranteed</strong> to produce the same token distribution as the target model — it is not an approximation.
            </InfoBox>
          </>
        ),
      },
    ],
  },

  // CHAPTER 8: MULTI-GPU INFERENCE
  {
    id: 8,
    title: "Multi-GPU Inference \u2014 Scaling Beyond One Card",
    subtitle: "How to fit 70B+ models and serve them fast across multiple GPUs",
    sections: [
      {
        title: "Tensor Parallelism \u2014 Splitting Layers Across GPUs",
        content: () => (
          <>
            <p>Llama-2-70B in FP16 needs 140 GB — it does not fit on a single H100's 80 GB VRAM. Even if it did, reading 140 GB at 3.35 TB/s means each decode token takes 42 ms (24 tok/s) — too slow for interactive use. The solution: split the model across multiple GPUs so each reads less data and they all work in parallel.</p>

            <Jargon term="Tensor Parallelism (TP)">
              Splits each weight matrix <strong>column-wise</strong> across GPUs. With TP=4 (four GPUs), each GPU holds 1/4 of every weight matrix. For a matrix [4096, 12288] split across 4 GPUs, each holds [4096, 3072]. Each GPU multiplies the input by its slice in parallel, producing a partial result. The partials are then combined via an <strong>AllReduce</strong> operation over NVLink.
            </Jargon>

            <DiagramBox title="Tensor Parallelism across 4 GPUs (NVLink connected)">
{`Weight Matrix W_qkv [4096, 12288] — split column-wise:

GPU 0: W_qkv[:, 0:3072]      GPU 1: W_qkv[:, 3072:6144]
GPU 2: W_qkv[:, 6144:9216]   GPU 3: W_qkv[:, 9216:12288]

Input x (broadcast to all 4 GPUs): [batch, seq, 4096]

GPU 0: x @ W0 = partial_0 [batch, seq, 3072]    Time: ~1.0 ms
GPU 1: x @ W1 = partial_1 [batch, seq, 3072]    (each reads 1/4
GPU 2: x @ W2 = partial_2 [batch, seq, 3072]     of 96 MB =
GPU 3: x @ W3 = partial_3 [batch, seq, 3072]     24 MB only)

         ┌──────────────────────────────────┐
         │         AllReduce (NVLink)        │
         │  All 4 GPUs exchange partials     │
         │  and sum them together.           │
         │  Each GPU ends with the full      │
         │  result: [batch, seq, 12288]      │
         │                                   │
         │  Data moved: 3072 x 2B x 3 = 18KB│
         │  per token per GPU (tiny)         │
         │  NVLink 900 GB/s → ~0.02 ms       │
         └──────────────────────────────────┘

Result: Each GPU has the complete output, ready for next operation.
Total time: ~1.0 ms (compute, parallel) + ~0.02 ms (AllReduce)
vs single GPU: ~4.0 ms (read 96 MB) → ~4x speedup`}
            </DiagramBox>

            <p>The key requirement: NVLink. The AllReduce happens <strong>twice per layer</strong> (once after attention, once after MLP). With 80 layers in a 70B model, that is 160 AllReduce operations per token. At ~0.02 ms each: 160 x 0.02 = 3.2 ms of communication overhead. Over NVLink at 900 GB/s, this is acceptable. Over PCIe at 64 GB/s, it would be 14x slower (45 ms) — completely killing any parallelism benefit. This is why multi-GPU inference requires NVLink-connected GPUs (like in DGX systems).</p>
          </>
        ),
      },
      {
        title: "Pipeline Parallelism \u2014 Splitting by Layers",
        content: () => (
          <>
            <Jargon term="Pipeline Parallelism (PP)">
              Instead of splitting each layer across GPUs (TP), pipeline parallelism assigns <strong>entire layers</strong> to different GPUs. With PP=4, GPU 0 runs layers 0-19, GPU 1 runs layers 20-39, GPU 2 runs layers 40-59, GPU 3 runs layers 60-79. Data flows through the GPUs sequentially: GPU 0 produces its output, sends it to GPU 1, which processes and sends to GPU 2, and so on.
            </Jargon>

            <DiagramBox title="Pipeline vs Tensor Parallelism">
{`Tensor Parallelism (TP=4):           Pipeline Parallelism (PP=4):
Every layer split across 4 GPUs      Each GPU owns a group of layers

Layer 0: [G0|G1|G2|G3] → AllReduce   GPU 0: Layers 0-19  (35 GB)
Layer 1: [G0|G1|G2|G3] → AllReduce   GPU 1: Layers 20-39 (35 GB)
Layer 2: [G0|G1|G2|G3] → AllReduce   GPU 2: Layers 40-59 (35 GB)
  ...every layer needs NVLink sync    GPU 3: Layers 60-79 (35 GB)
                                        Data flows: G0 → G1 → G2 → G3

Pros: Low latency (4x less data/GPU)  Pros: Less communication
      Scales decode throughput               Only 1 tensor sent per boundary
Cons: AllReduce after EVERY operation  Cons: GPUs idle in pipeline bubbles
      Requires NVLink                        Higher latency per token

Best for: Latency-sensitive serving    Best for: Offline batch processing
          Real-time interactive use           When NVLink unavailable`}
            </DiagramBox>

            <p>In practice, most production systems use <strong>TP within a node</strong> (the 8 GPUs in one DGX server, connected by NVLink) and <strong>PP across nodes</strong> (multiple DGX servers, connected by InfiniBand). This hybrid approach gives the lowest latency (TP) within the fast-interconnect boundary and minimizes inter-node communication (PP only sends activations, not AllReduce).</p>

            <InfoBox title="Choosing the right parallelism" color="#60a5fa">
              <strong>70B model, 4x H100 80GB, NVLink:</strong> TP=4 — each GPU holds 35 GB of weights, 4x bandwidth for decode. Best single-user latency.<br/>
              <strong>70B model, 8x H100 80GB, NVLink:</strong> TP=8 — each GPU holds 17.5 GB. Fastest possible decode. Remaining ~62 GB per GPU for KV cache → massive batch sizes possible.<br/>
              <strong>405B model, 16x H100 (2 nodes):</strong> TP=8 within each node, PP=2 across nodes.
            </InfoBox>
          </>
        ),
      },
    ],
  },

  // CHAPTER 9: END-TO-END TRACE
  {
    id: 9,
    title: "End-to-End Request Trace",
    subtitle: "A single request, from HTTP to token, with exact timings on H100",
    sections: [
      {
        title: "Full Lifecycle of a Chat Request",
        content: () => (
          <>
            <p>Let us trace exactly what happens when a user sends "Explain quantum entanglement" to a Llama-2-7B running on a single H100 with vLLM. Every timing is realistic for this hardware.</p>

            <DiagramBox title="Complete request lifecycle with per-operation timings">
{`Time     | Operation                          | Hardware    | Detail
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
0.000 ms | HTTP request arrives               | NIC → CPU   | JSON parsed, auth checked
0.050 ms | Tokenization                       | CPU         | "Explain quantum..." → 4 tokens
0.100 ms | Queue + schedule                   | CPU         | vLLM scheduler assigns batch slot
0.120 ms | KV cache blocks allocated           | CPU→GPU     | PagedAttention: 1 initial block (16 tok)
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
         | *** PREFILL PHASE ***              |             |
0.150 ms | Embedding lookup                   | GPU (HBM)   | 4 IDs → [4, 4096], gather from 256MB table
0.160 ms | Layer 0: RMSNorm                   | CUDA cores  | Element-wise, ~3 μs
0.163 ms | Layer 0: QKV projection            | Tensor Cores| [4,4096] x [4096,12288] — GEMM
0.195 ms | Layer 0: FlashAttention            | SRAM tiles  | Q,K,V tiled in 228 KB SRAM
0.210 ms | Layer 0: Output projection         | Tensor Cores| [4,4096] x [4096,4096]
0.225 ms | Layer 0: Residual + RMSNorm        | CUDA cores  | Skip add + normalize
0.228 ms | Layer 0: Gate+Up projection        | Tensor Cores| [4,4096] x [4096,22016]
0.275 ms | Layer 0: SiLU + Down projection    | TC + CUDA   | SiLU on CUDA, down_proj on TC
0.310 ms | Layer 0: Residual add              | CUDA cores  | ~2 μs
  ...    | Layers 1-31 (repeat above)         |             | ~0.16 ms per layer
5.27 ms  | All 32 layers complete             |             |
5.30 ms  | Final RMSNorm                      | CUDA cores  | ~3 μs
5.35 ms  | LM Head projection                | Tensor Cores| [1,4096] x [4096,32000]
5.45 ms  | Top-p sampling                     | GPU         | Sort 32K logits, sample
5.50 ms  | First token: "Quantum"              | GPU→CPU     | Token ID sent back
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
         | TTFT = 5.5 ms                     |             | Time To First Token
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
         | *** DECODE PHASE ***               |             |
         | (repeats for each output token)    |             |
5.50 ms  | Append "Quantum" KV to cache       | GPU (HBM)   | 512 KB written to cache blocks
5.51 ms  | Embedding lookup                   | GPU (HBM)   | 1 ID → [1, 4096]
5.52 ms  | Layer 0: RMSNorm                   | CUDA cores  | ~3 μs
5.52 ms  | Layer 0: QKV projection            | Tensor Cores| [1,4096] x [4096,12288] — GEMV!
5.65 ms  | Layer 0: Attention (cached KV)     | GPU (HBM)   | Read 5-token KV cache
5.68 ms  | Layer 0: Output projection         | Tensor Cores| GEMV
5.70 ms  | Layer 0: MLP (gate, up, down)      | Tensor Cores| 3 GEMVs, 264 MB weight reads
5.83 ms  | Layer 0: Residuals + norms         | CUDA cores  |
  ...    | Layers 1-31                        |             | Each layer reads ~420 MB
9.53 ms  | LM Head + sampling                | TC + GPU    |
9.60 ms  | Second token: "entanglement"       | GPU→CPU     |
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
         | TPOT = 4.1 ms per token           |             | ~244 tokens/sec
─────────┼────────────────────────────────────┼─────────────┼─────────────────────────
         | ... 150 decode steps later ...     |             |
0.62 sec | EOS token generated                |             | ~150 tokens total
0.62 sec | HTTP response complete             | GPU→CPU→NIC | Streaming: user saw tokens live
         | KV cache blocks freed              | GPU         | Available for next request`}
            </DiagramBox>

            <InfoBox title="Where time actually goes during decode (per token)" color="#f59e0b">
              <strong>Weight reads from HBM: ~3.9 ms (95%)</strong> — Reading 13.5 GB at 3.35 TB/s. The dominant cost.<br/>
              <strong>KV cache reads: ~0.1 ms (2.4%)</strong> — Grows linearly with sequence length.<br/>
              <strong>Actual matrix math: ~0.08 ms (1.9%)</strong> — Tensor Cores are nearly idle.<br/>
              <strong>Norms, activations, residuals: ~0.02 ms (0.5%)</strong> — Lightweight CUDA core work.<br/>
              <strong>Kernel launch overhead: ~0.01 ms (0.2%)</strong> — ~200 kernel launches per token.
            </InfoBox>

            <p>This trace makes the optimization landscape clear. The 95% weight-read time is why quantization (INT4 → 4x fewer bytes), tensor parallelism (4 GPUs → 4x bandwidth), and batching (amortize reads across users) are the three most impactful optimizations in production inference. Everything else is optimizing the remaining 5%.</p>
          </>
        ),
      },
    ],
  },
];

// ─── Main App Component ─────────────────────────────────────────────
export default function GPUInferenceDeepDive() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedSections, setCompletedSections] = useState(new Set());

  const chapter = chapters[currentChapter];
  const section = chapter.sections[currentSection];

  const totalSections = chapters.reduce((a, c) => a + c.sections.length, 0);
  const completedCount = completedSections.size;
  const progressPct = Math.round((completedCount / totalSections) * 100);

  const markComplete = useCallback(() => {
    const key = `${currentChapter}-${currentSection}`;
    setCompletedSections(prev => new Set([...prev, key]));
  }, [currentChapter, currentSection]);

  const navigateTo = useCallback((ch, sec) => {
    setCurrentChapter(ch);
    setCurrentSection(sec);
    setSidebarOpen(false);
  }, []);

  const goNext = useCallback(() => {
    markComplete();
    if (currentSection < chapter.sections.length - 1) {
      setCurrentSection(s => s + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(c => c + 1);
      setCurrentSection(0);
    }
  }, [currentChapter, currentSection, chapter, markComplete]);

  const goPrev = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(s => s - 1);
    } else if (currentChapter > 0) {
      const prevCh = currentChapter - 1;
      setCurrentChapter(prevCh);
      setCurrentSection(chapters[prevCh].sections.length - 1);
    }
  }, [currentChapter, currentSection]);

  const isFirst = currentChapter === 0 && currentSection === 0;
  const isLast = currentChapter === chapters.length - 1 && currentSection === chapter.sections.length - 1;

  const font = "'IBM Plex Sans', -apple-system, sans-serif";

  return (
    <div style={{ fontFamily: font, background: "#080c14", color: "#e2e8f0", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>

      {/* Header */}
      <header style={{ background: "#0a0f1a", borderBottom: "1px solid #1e293b", padding: "10px 20px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "1px solid #334155", borderRadius: "6px", color: "#94a3b8", padding: "6px 10px", cursor: "pointer", fontSize: "14px" }}>
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.3px" }}>GPU-Level AI Inference</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>Ch {currentChapter}: {chapter.title}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{progressPct}% complete</div>
          <div style={{ width: "120px", height: "4px", background: "#1e293b", borderRadius: "2px" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "#4ade80", borderRadius: "2px", transition: "width 0.3s" }}/>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <nav style={{ width: "300px", background: "#0a0f1a", borderRight: "1px solid #1e293b", overflowY: "auto", padding: "16px 0", flexShrink: 0 }}>
            {chapters.map((ch, ci) => (
              <div key={ci} style={{ marginBottom: "8px" }}>
                <div style={{ padding: "8px 20px", fontSize: "12px", fontWeight: 700, color: ci === currentChapter ? "#4ade80" : "#64748b", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Ch {ch.id}: {ch.title}
                </div>
                {ch.sections.map((sec, si) => {
                  const key = `${ci}-${si}`;
                  const active = ci === currentChapter && si === currentSection;
                  const done = completedSections.has(key);
                  return (
                    <button key={si} onClick={() => navigateTo(ci, si)} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "6px 20px 6px 32px",
                      background: active ? "#4ade8015" : "transparent", border: "none",
                      borderLeft: active ? "2px solid #4ade80" : "2px solid transparent",
                      color: active ? "#e2e8f0" : done ? "#64748b" : "#94a3b8",
                      fontSize: "12.5px", cursor: "pointer", fontFamily: font, lineHeight: 1.5,
                    }}>
                      {done ? "✓ " : ""}{sec.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 24px", maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              <Badge>Chapter {chapter.id}</Badge>
              <Badge color="#60a5fa">Section {currentSection + 1} of {chapter.sections.length}</Badge>
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px 0", letterSpacing: "-0.5px", lineHeight: 1.3 }}>{section.title}</h1>
            {currentSection === 0 && chapter.subtitle && (
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0, fontStyle: "italic" }}>{chapter.subtitle}</p>
            )}
          </div>

          <div style={{ fontSize: "14.5px", lineHeight: 1.8, color: "#c8d6e5" }}>
            {section.content()}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #1e293b" }}>
            <button onClick={goPrev} disabled={isFirst} style={{
              padding: "10px 24px", borderRadius: "8px", border: "1px solid #334155",
              background: isFirst ? "#0d1117" : "#111827", color: isFirst ? "#334155" : "#e2e8f0",
              cursor: isFirst ? "default" : "pointer", fontSize: "13px", fontWeight: 600, fontFamily: font,
            }}>
              ← Previous
            </button>
            <button onClick={goNext} disabled={isLast} style={{
              padding: "10px 24px", borderRadius: "8px", border: "none",
              background: isLast ? "#1e293b" : "#4ade80", color: isLast ? "#64748b" : "#080c14",
              cursor: isLast ? "default" : "pointer", fontSize: "13px", fontWeight: 700, fontFamily: font,
            }}>
              {isLast ? "Course Complete ✓" : "Next →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
