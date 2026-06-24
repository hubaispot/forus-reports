import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

export const data = [
  { week: "27 Apr–3 May",  label: "W1", enq: 13, app: 4,  full: true  },
  { week: "4–10 May",      label: "W2", enq: 5,  app: 11, full: true  },
  { week: "11–17 May",     label: "W3", enq: 3,  app: 7,  full: true  },
  { week: "18–24 May",     label: "W4", enq: 12, app: 8,  full: true  },
  { week: "25–31 May",     label: "W5", enq: 5,  app: 8,  full: true  },
  { week: "1–7 Jun",       label: "W6", enq: 4,  app: 6,  full: true  },
  { week: "8–14 Jun",      label: "W7", enq: 1,  app: 5,  full: true  },
  { week: "15–21 Jun",     label: "W8", enq: 3,  app: 8,  full: true  },
  { week: "22–24 Jun ⚡",   label: "W9", enq: 1,  app: 8,  full: false },
].map(d => ({
  ...d,
  total: d.enq + d.app,
  appRate: (d.enq + d.app) > 0 ? +(d.app / (d.enq + d.app) * 100).toFixed(0) : 0
}));

const fullWeeks  = data.filter(d => d.full);
const totalEnq   = data.reduce((s, d) => s + d.enq, 0);
const totalApp   = data.reduce((s, d) => s + d.app, 0);
const total      = totalEnq + totalApp;
const avgEnq     = (fullWeeks.reduce((s, d) => s + d.enq, 0) / fullWeeks.length).toFixed(1);
const avgApp     = (fullWeeks.reduce((s, d) => s + d.app, 0) / fullWeeks.length).toFixed(1);
const overallApp = Math.round(totalApp / total * 100);

const COLORS = { enq: "#fb923c", app: "#38bdf8", rate: "#a78bfa" };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d   = payload[0]?.payload;
  const enq = payload.find(p => p.dataKey === "enq")?.value ?? 0;
  const app = payload.find(p => p.dataKey === "app")?.value ?? 0;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 215 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
        {d?.label} · {d?.week}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.enq }}>● Enquiry form</span><strong>{enq}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.app }}>● Application form</span><strong>{app}</strong>
        </div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8" }}>Total</span><strong>{enq + app}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rate }}>App rate</span>
            <strong style={{ color: COLORS.rate }}>{d?.appRate}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

const Tab = ({ id, active, onClick, children }) => (
  <button onClick={() => onClick(id)} style={{
    padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "1px solid",
    borderColor: active ? "#38bdf8" : "#334155",
    background:  active ? "rgba(56,189,248,0.15)" : "transparent",
    color:       active ? "#38bdf8" : "#64748b"
  }}>{children}</button>
);

export default function App() {
  const [view, setView] = useState("grouped");

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px" }}>
          HubSpot · Care Skills & Care of the Older Person L5 – Live and Online (CTID786)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Form Submissions — Enquiry vs Application
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          27 Apr – 24 Jun 2026 · IST boundaries · Unique contacts · last form only per contact
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid #34d399",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#34d399" }}>📌 Key characteristic: </strong>
        Applications dominate throughout — 6 of 8 completed weeks hit 60%+ conversion 🔥.
        W2 and W3 kicked off strongly (69–70%) before a W4 dip to 40% on a surge of enquiries.
        W7 and W8 both exceed 70%, with W8 (15–21 Jun) recording 11 total submissions.
        W9 is showing a strong partial-week surge: 8 applications in just 3 days (22–24 Jun).
        W1 is the only full week where enquiries led (13 vs 4), suggesting early-cycle interest
        that converts consistently in later weeks.
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Enquiries",    value: totalEnq,         sub: `avg ${avgEnq}/wk`,        color: COLORS.enq },
          { label: "Total Applications", value: totalApp,         sub: `avg ${avgApp}/wk`,        color: COLORS.app },
          { label: "Total Submissions",  value: total,            sub: "8 full + 1 partial wk",   color: "#f1f5f9"  },
          { label: "Overall App Rate",   value: overallApp + "%", sub: "apps ÷ total",             color: "#34d399"  },
          { label: "Best Week",          value: "W7",             sub: "83% · 8–14 Jun",           color: "#fbbf24"  },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10,
            padding: "12px 18px", flex: "1 1 110px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800,
              color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="grouped" active={view === "grouped"} onClick={setView}>Side by side</Tab>
        <Tab id="stacked" active={view === "stacked"} onClick={setView}>Stacked</Tab>
        <Tab id="rate"    active={view === "rate"}    onClick={setView}>Application rate %</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "rate" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false}
                tickLine={false} tickFormatter={v => v + "%"} domain={[0, 110]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallApp} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallApp}%`, fill: "#64748b", fontSize: 11,
                  position: "insideTopRight" }}/>
              <Line dataKey="appRate" name="Application rate" type="monotone"
                stroke="#34d399" strokeWidth={2.5}
                dot={{ r: 6, fill: "#34d399", strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap={view === "stacked" ? "30%" : "22%"} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false}
                tickLine={false} domain={[0, 16]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "enq" ? "Enquiry form" : "Application form"}/>
              <Bar dataKey="enq" name="enq" fill={COLORS.enq}
                radius={view === "stacked" ? [0,0,0,0] : [5,5,0,0]}
                stackId={view === "stacked" ? "a" : undefined}/>
              <Bar dataKey="app" name="app" fill={COLORS.app}
                radius={[5,5,0,0]}
                stackId={view === "stacked" ? "a" : undefined}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: 12,
        border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk", "Dates", "Enquiry", "Application", "Total", "App Rate"].map((h, i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i <= 1 ? "left" : "center",
                  color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const rateHigh = row.appRate >= 60 && row.total > 0;
              const delta = (val, prev) => {
                if (prev === null) return null;
                if (val > prev) return <span style={{ fontSize: 10, marginLeft: 4, color: "#34d399" }}>▲{val - prev}</span>;
                if (val < prev) return <span style={{ fontSize: 10, marginLeft: 4, color: "#f87171" }}>▼{prev - val}</span>;
                return <span style={{ fontSize: 10, marginLeft: 4, color: "#64748b" }}>=</span>;
              };
              return (
                <tr key={i} style={{
                  borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>{row.label}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: COLORS.enq, fontSize: 15 }}>
                    {row.enq}{delta(row.enq, i > 0 ? data[i-1].enq : null)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: COLORS.app, fontSize: 15 }}>
                    {row.app}{delta(row.app, i > 0 ? data[i-1].app : null)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{row.total}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, fontSize: 12,
                    color: rateHigh ? "#34d399" : COLORS.rate }}>
                    {row.total > 0 ? row.appRate + "%" : "—"}{rateHigh ? " 🔥" : ""}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8",
                fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>
                Total (W1–W8 full + W9 partial)
              </td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: COLORS.enq, fontSize: 15 }}>{totalEnq}</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: COLORS.app, fontSize: 15 }}>{totalApp}</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: "#f1f5f9", fontSize: 15 }}>{total}</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 700, color: "#34d399", fontSize: 13 }}>{overallApp}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 12, fontSize: 11, color: "#475569", textAlign: "center" }}>
        ⚡ W9 is a partial week (22–24 Jun) — excluded from weekly averages.
        Test submissions (jean@forustraining.ie) excluded from all counts.
      </p>
    </div>
  );
}
