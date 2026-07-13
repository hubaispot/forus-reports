import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID742 — SNA Level 5 & 6 (Live and Online)
// Combined HubSpot + Paythen report
// W1 anchor: 18 May 2026 · W1–W8 full weeks only (no partial)
// Forms: HubSpot enq+app, global dedup per form (run 13 Jul 2026)
// Registrations: Paythen Filtered sheet, Status=Registered, deduped by email
// 16 pre-W1 registrations excluded (13 Apr–17 May 2026) · 0 after W8
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "18–24 May",     forms: 26, regs: 2,  revenue: 1443.44,  full: true  },
  { week: "25–31 May",     forms: 36, regs: 6,  revenue: 4313.80,  full: true  },
  { week: "1–7 Jun",       forms: 47, regs: 11, revenue: 7983.55,  full: true  },
  { week: "8–14 Jun",      forms: 24, regs: 4,  revenue: 2756.00,  full: true  },
  { week: "15–21 Jun",     forms: 18, regs: 7,  revenue: 5092.70,  full: true  },
  { week: "22–28 Jun",     forms: 30, regs: 6,  revenue: 4313.80,  full: true  },
  { week: "29 Jun–5 Jul",  forms: 46, regs: 13, revenue: 9361.55,  full: true  },
  { week: "6–12 Jul",      forms: 33, regs: 3,  revenue: 2156.90,  full: true  },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : 0,
}));

const fullWeeks   = data.filter(d => d.full);
const totalForms  = data.reduce((s, d) => s + d.forms, 0);
const totalRegs   = data.reduce((s, d) => s + d.regs, 0);
const totalRev    = data.reduce((s, d) => s + d.revenue, 0);
const avgForms    = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs     = (fullWeeks.reduce((s, d) => s + d.regs, 0) / fullWeeks.length).toFixed(1);
const overallCR   = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const fmt = v => "€" + v.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d     = payload[0]?.payload;
  const forms = d?.forms ?? 0;
  const regs  = d?.regs  ?? 0;
  const cr    = d?.cr    ?? 0;
  const rev   = d?.revenue ?? 0;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 220
    }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.forms }}>● Forms</span><strong>{forms}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.regs }}>● Registrations</span><strong>{regs}</strong>
        </div>
        <div style={{
          borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.cr }}>Conv. rate</span>
            <strong style={{ color: COLORS.cr }}>{forms > 0 ? cr + "%" : "—"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Expected revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmt(rev)}</strong>
          </div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week (Mon–Wed)</p>}
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
  const [view, setView] = useState("formsRegs");

  return (
    <div style={{
      background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9",
      textAlign: "left"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px"
        }}>
          HubSpot + Paythen · SNA Level 5 &amp; 6 – Live and Online (CTID742)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Combined Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          18 May – 12 Jul 2026 · 8 full weeks · W1 anchor: 18 May 2026
        </p>
      </div>

      {/* Insight banner */}
      <div style={{
        background: "rgba(52,211,153,0.08)", border: "1px solid #34d399", borderRadius: 8,
        padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.7
      }}>
        <strong style={{ color: "#34d399" }}>📌 Key insight: </strong>
        W7 (29 Jun–5 Jul) is the standout week with <strong style={{ color: "#f1f5f9" }}>13 registrations and €9,361.55 revenue at 28.3% CR</strong>.
        W3 (1–7 Jun) peaks on forms with 47 submissions and delivers the second-highest registration week (11 regs, €7,983.55).
        W5 (15–21 Jun) shows strong late conversion — only 18 forms but <strong style={{ color: "#f1f5f9" }}>7 registrations at 38.9% CR</strong>.
        Total pipeline: <strong style={{ color: "#f1f5f9" }}>52 registrations · €37,421.74</strong> expected revenue across 8 weeks.
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",           value: totalForms,       sub: `avg ${avgForms}/wk (W1–W8)`,  color: COLORS.forms },
          { label: "Total Registrations",   value: totalRegs,        sub: `avg ${avgRegs}/wk (W1–W8)`,   color: COLORS.regs  },
          { label: "Overall Conv. Rate",    value: overallCR + "%",  sub: "regs ÷ forms",                color: COLORS.cr    },
          { label: "Expected Revenue",      value: fmt(totalRev),    sub: "W1–W8 total",                 color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{
            background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 130px", border: "1px solid #334155"
          }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="formsRegs" active={view === "formsRegs"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"        active={view === "cr"}        onClick={setView}>Conversion Rate %</Tab>
        <Tab id="revenue"   active={view === "revenue"}   onClick={setView}>Expected Revenue</Tab>
      </div>

      {/* Chart */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20
      }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 60]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallCR} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="cr" name="Conversion rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={{ r: 6, fill: COLORS.cr, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : view === "revenue" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Bar dataKey="revenue" name="revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms (enq + app)" : "Registrations (Paythen)"}/>
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5, 5, 0, 0]}/>
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk", "Dates", "Forms", "Registrations", "Conv. Rate", "Expected Revenue"].map((h, i) => (
                <th key={h} style={{
                  padding: "11px 14px", textAlign: i <= 1 ? "left" : "center",
                  color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: "1px solid #334155"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowForms = i > 0 ? row.forms - data[i - 1].forms : null;
              const wowRegs  = i > 0 ? row.regs  - data[i - 1].regs  : null;
              const crHigh   = row.cr >= 30 && row.forms > 0;
              return (
                <tr key={i} style={{
                  borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}{!row.full && <span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.forms, fontSize: 15 }}>
                    {row.forms}
                    {wowForms !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4, color: wowForms > 0 ? "#34d399" : wowForms < 0 ? "#f87171" : "#64748b" }}>
                        {wowForms > 0 ? `▲${wowForms}` : wowForms < 0 ? `▼${Math.abs(wowForms)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.regs, fontSize: 15 }}>
                    {row.regs}
                    {wowRegs !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4, color: wowRegs > 0 ? "#34d399" : wowRegs < 0 ? "#f87171" : "#64748b" }}>
                        {wowRegs > 0 ? `▲${wowRegs}` : wowRegs < 0 ? `▼${Math.abs(wowRegs)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12, color: crHigh ? "#34d399" : COLORS.cr }}>
                    {row.forms > 0 ? row.cr + "%" : "—"}{crHigh ? " 🔥" : ""}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.rev, fontSize: 13 }}>
                    {fmt(row.revenue)}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.regs,  fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: "#34d399", fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.rev,   fontSize: 13 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center" }}>
        Paythen: Status = Registered only · 16 pre-W1 registrations excluded (13 Apr–17 May 2026) · 0 after W8
      </p>

    </div>
  );
}
