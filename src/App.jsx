import { useState } from "react";
import CTID742 from "./ctid742_enq_vs_app_weekly";
import CTID786 from "./ctid786_enq_vs_app_weekly";
import CTID379 from "./ctid379_enq_vs_app_weekly";

const tabs = [
  { id: "742", label: "CTID742 · SNA L5&6",      Component: CTID742 },
  { id: "786", label: "CTID786 · Care Skills",    Component: CTID786 },
  { id: "379", label: "CTID379 · SNA L6 Online",  Component: CTID379 },
];

export default function App() {
  const [active, setActive] = useState("742");
  const current = tabs.find(t => t.id === active);

  return (
    <div>
      <div style={{
        display: "flex", gap: 8, padding: "12px 24px",
        background: "#0f172a", borderBottom: "1px solid #1e293b",
        position: "sticky", top: 0, zIndex: 100
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            padding: "7px 16px", borderRadius: 6, fontSize: 12,
            fontWeight: 600, cursor: "pointer", border: "1px solid",
            borderColor: active === t.id ? "#38bdf8" : "#334155",
            background:  active === t.id ? "rgba(56,189,248,0.15)" : "transparent",
            color:       active === t.id ? "#38bdf8" : "#64748b"
          }}>{t.label}</button>
        ))}
      </div>
      <current.Component />
    </div>
  );
}