import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

export const data = [
  { week: "15–21 Jun",    forms: 10, regs: 4,  revenue: 1971.25, full: true },
  { week: "22–28 Jun",    forms: 16, regs: 10, revenue: 4963.75, full: true },
  { week: "29 Jun–5 Jul", forms: 10, regs: 4,  revenue: 1947.50, full: true },
  { week: "6–12 Jul",     forms: 13, regs: 1,  revenue:  498.75, full: true },
  { week: "13–19 Jul",    forms: 11, regs: 4,  revenue: 1971.25, full: true },
  { week: "20–26 Jul",    forms:  6, regs: 0,  revenue:    0.00, full: true },
  { week: "27 Jul–2 Aug", forms:  7, regs: 3,  revenue: 1472.50, full: true },
  { week: "3–9 Aug",      forms: 10, regs: 5,  revenue: 2446.25, full: true },
  { week: "10–16 Aug",    forms: 17, regs: 6,  revenue: 2992.50, full: true },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : null,
}));

const fullWeeks   = data.filter(d => d.full);
const totalForms  = data.reduce((s, d) => s + d.forms, 0);
const totalRegs   = data.reduce((s, d) => s + d.regs, 0);
const totalRev    = data.reduce((s, d) => s + d.revenue, 0);
const avgForms    = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs     = (fullWeeks.reduce((s, d) => s + d.regs, 0) / fullWeeks.length).toFixed(1);
const overallCR   = totalForms > 0 ? (totalRegs / totalForms * 100).toFixed(1) : "0.0";

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const fmt = (n) => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 220 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.forms }}>● Forms</span><strong>{d?.forms}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.regs }}>● Registrations</span><strong>{d?.regs}</strong>
        </div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.cr }}>Conv. Rate</span>
            <strong style={{ color: COLORS.cr }}>{d?.cr != null ? d.cr + "%" : "—"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Expected Revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmt(d?.revenue ?? 0)}</strong>
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
    color:       active ? "#38bdf8" : "#64748b",
  }}>{children}</button>
);

export default function App() {
  const [view, setView] = useState("bars");

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px" }}>
          HubSpot + Paythen · CS &amp; COOP LO Level 5 – Live and Online (CTID786)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Combined Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          15 Jun – 16 Aug 2026 · 9 full weeks · IST boundaries · Unique contacts
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid #34d399",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#34d399" }}>📌 Key characteristic: </strong>
        W2 (22–28 Jun) was the standout week — <strong style={{ color: "#f1f5f9" }}>10 registrations and €4,964</strong>,
        accounting for 27% of all registrations across 9 weeks. W6 (20–26 Jul) recorded zero registrations despite 6 forms,
        suggesting a lag in conversion. W9 (10–16 Aug) closed strongly with the highest form volume (17) and 6 registrations
        (€2,993) — late-summer demand is growing. Overall CR of 37% reflects a healthy pipeline with room to convert the
        remaining 63 forms that haven't yet registered.
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",         value: totalForms,        sub: `avg ${avgForms}/wk`,  color: COLORS.forms },
          { label: "Total Registrations", value: totalRegs,         sub: `avg ${avgRegs}/wk`,   color: COLORS.regs  },
          { label: "Overall Conv. Rate",  value: overallCR + "%",   sub: "regs ÷ forms",        color: COLORS.cr    },
          { label: "Expected Revenue",    value: fmt(totalRev),     sub: "9 full weeks",        color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10,
            padding: "12px 18px", flex: "1 1 130px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800,
              color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="bars" active={view === "bars"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"   active={view === "cr"}   onClick={setView}>Conversion Rate %</Tab>
        <Tab id="rev"  active={view === "rev"}  onClick={setView}>Expected Revenue</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 90]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={parseFloat(overallCR)} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="cr" name="Conv. Rate %" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={{ r: 6, fill: COLORS.cr, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : view === "rev" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"} domain={[0, 6000]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Bar dataKey="revenue" name="Expected Revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 20]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms" : "Registrations"}/>
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5, 5, 0, 0]}/>
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5, 5, 0, 0]}/>
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
              {["Wk", "Dates", "Forms", "Registrations", "CR%", "Expected Revenue"].map((h, i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i <= 1 ? "left" : "center",
                  color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowForms = i > 0 ? row.forms - data[i - 1].forms : null;
              const wowRegs  = i > 0 ? row.regs  - data[i - 1].regs  : null;
              return (
                <tr key={i} style={{ borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032" }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.forms, fontSize: 15 }}>
                    {row.forms}
                    {wowForms !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4,
                        color: wowForms > 0 ? "#34d399" : wowForms < 0 ? "#f87171" : "#64748b" }}>
                        {wowForms > 0 ? `▲${wowForms}` : wowForms < 0 ? `▼${Math.abs(wowForms)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.regs, fontSize: 15 }}>
                    {row.regs}
                    {wowRegs !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4,
                        color: wowRegs > 0 ? "#34d399" : wowRegs < 0 ? "#f87171" : "#64748b" }}>
                        {wowRegs > 0 ? `▲${wowRegs}` : wowRegs < 0 ? `▼${Math.abs(wowRegs)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    fontSize: 12, color: COLORS.cr }}>
                    {row.cr != null ? row.cr + "%" : "—"}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.rev, fontSize: 13 }}>
                    {row.revenue > 0 ? fmt(row.revenue) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700,
                fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800,
                color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800,
                color: COLORS.regs, fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                color: COLORS.cr, fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800,
                color: COLORS.rev, fontSize: 13 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 16, fontSize: 11, color: "#475569", textAlign: "center" }}>
        CTID786 · CS &amp; COOP LO L5 · 15 Jun – 16 Aug 2026 · IST boundaries ·
        HubSpot: 100 unique form contacts · Paythen: 37 registered (52 pre-window excluded) · Revenue tiers: €475.00 / €498.75
      </p>
    </div>
  );
}
