import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// Forms data from ctid770_771_enq_vs_app_weekly.jsx (enq = CTID771 LO only, app = OA+LO combined)
const formsData = [
  { week: "4 May–10 May",   enq: 4, app: 4,  full: true  },
  { week: "11 May–17 May",  enq: 1, app: 5,  full: true  },
  { week: "18 May–24 May",  enq: 0, app: 3,  full: true  },
  { week: "25 May–31 May",  enq: 1, app: 6,  full: true  },
  { week: "1 Jun–7 Jun",    enq: 3, app: 13, full: true  },
  { week: "8 Jun–14 Jun",   enq: 4, app: 9,  full: true  },
  { week: "15 Jun–21 Jun",  enq: 2, app: 10, full: true  },
  { week: "22 Jun–28 Jun",  enq: 2, app: 7,  full: true  },
  { week: "29 Jun–5 Jul",   enq: 3, app: 5,  full: false },
];

// Paythen registrations + revenue (CTID770 + CTID771, Status=Registered, from 4 May)
const paythenData = [
  { week: "4 May–10 May",   regs: 3, revenue: 2730.00   },
  { week: "11 May–17 May",  regs: 0, revenue: 0.00      },
  { week: "18 May–24 May",  regs: 2, revenue: 1905.00   },
  { week: "25 May–31 May",  regs: 4, revenue: 4095.25   },
  { week: "1 Jun–7 Jun",    regs: 4, revenue: 2735.00   },
  { week: "8 Jun–14 Jun",   regs: 6, revenue: 4541.13   },
  { week: "15 Jun–21 Jun",  regs: 4, revenue: 3228.75   },
  { week: "22 Jun–28 Jun",  regs: 3, revenue: 2654.00   },
  { week: "29 Jun–5 Jul",   regs: 3, revenue: 3097.50   },
];

export const data = formsData.map((f, i) => {
  const p = paythenData[i];
  const forms = f.enq + f.app;
  const cr = forms > 0 ? +(p.regs / forms * 100).toFixed(1) : null;
  return {
    week:    f.week,
    full:    f.full,
    forms,
    regs:    p.regs,
    revenue: p.revenue,
    cr,
  };
});

const fullWeeks  = data.filter(d => d.full);
const totalForms = data.reduce((s, d) => s + d.forms, 0);
const totalRegs  = data.reduce((s, d) => s + d.regs, 0);
const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
const avgForms   = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs    = (fullWeeks.reduce((s, d) => s + d.regs, 0)  / fullWeeks.length).toFixed(1);
const overallCR  = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const fmtEur = v => v === 0 ? "€0" : "€" + v.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 220 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.forms }}>● Forms (enq+app)</span><strong>{d?.forms}</strong>
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
            <span style={{ color: COLORS.rev }}>Revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmtEur(d?.revenue ?? 0)}</strong>
          </div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week</p>}
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
  const [view, setView] = useState("formsRegs");

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9", textAlign: "left" }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
          Paythen + HubSpot · Healthcare Support MA L5 — LO (CTID771) + OA (CTID770)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Combined Revenue Report
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          4 May – 2 Jul 2026 · W1–W8 complete · W9 partial ⚡ · CTID770 (OA) + CTID771 (LO)
        </p>
      </div>

      {/* Asymmetry notice banner */}
      <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid #fbbf24", borderRadius: 8,
        padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#fbbf24" }}>⚠️ Merged report — asymmetric forms: </strong>
        Enquiry figures are <strong style={{ color: "#f1f5f9" }}>CTID771 (LO) only</strong> — CTID770 (OA) has no enquiry form.
        Application figures include <strong style={{ color: "#f1f5f9" }}>both CTID770 (OA) and CTID771 (LO)</strong>.
        Forms total = LO enquiries + (OA + LO) applications. Conv. Rate = Registrations ÷ Forms.
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",         value: totalForms,       sub: `avg ${avgForms}/wk (W1–W8)`, color: COLORS.forms },
          { label: "Total Registrations", value: totalRegs,        sub: `avg ${avgRegs}/wk (W1–W8)`,  color: COLORS.regs  },
          { label: "Overall Conv. Rate",  value: overallCR + "%",  sub: "regs ÷ forms (all weeks)",   color: COLORS.cr    },
          { label: "Total Revenue",       value: fmtEur(totalRev), sub: "Registered · in-window",     color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 130px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="formsRegs" active={view === "formsRegs"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"        active={view === "cr"}        onClick={setView}>Conversion Rate %</Tab>
        <Tab id="revenue"   active={view === "revenue"}   onClick={setView}>Revenue €</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 100]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallCR} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="cr" name="Conv. Rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={{ r: 6, fill: COLORS.cr, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : view === "revenue" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Bar dataKey="revenue" name="Revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 20]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms (enq+app)" : "Registrations"}/>
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5, 5, 0, 0]}/>
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
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
              const crHigh   = row.cr !== null && row.cr >= 50;
              return (
                <tr key={i} style={{ borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032" }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}{!row.full && <span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.forms, fontSize: 15 }}>
                    {row.forms}
                    {wowForms !== null && <span style={{ fontSize: 10, marginLeft: 4, color: wowForms > 0 ? "#34d399" : wowForms < 0 ? "#f87171" : "#64748b" }}>
                      {wowForms > 0 ? `▲${wowForms}` : wowForms < 0 ? `▼${Math.abs(wowForms)}` : "="}
                    </span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.regs, fontSize: 15 }}>
                    {row.regs}
                    {wowRegs !== null && <span style={{ fontSize: 10, marginLeft: 4, color: wowRegs > 0 ? "#34d399" : wowRegs < 0 ? "#f87171" : "#64748b" }}>
                      {wowRegs > 0 ? `▲${wowRegs}` : wowRegs < 0 ? `▼${Math.abs(wowRegs)}` : "="}
                    </span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12,
                    color: crHigh ? "#34d399" : COLORS.cr }}>
                    {row.cr !== null ? row.cr + "%" : "—"}{crHigh ? " 🔥" : ""}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.rev, fontSize: 13 }}>
                    {row.revenue > 0 ? fmtEur(row.revenue) : <span style={{ color: "#475569" }}>—</span>}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.regs,  fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: "#34d399",    fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.rev,   fontSize: 14 }}>{fmtEur(totalRev)}</td>
            </tr>
            <tr style={{ background: "#0f172a" }}>
              <td colSpan={2} style={{ padding: "8px 14px", color: "#64748b", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Avg/wk (W1–W8)</td>
              <td style={{ padding: "8px 14px", textAlign: "center", color: COLORS.forms, fontSize: 13 }}>{avgForms}</td>
              <td style={{ padding: "8px 14px", textAlign: "center", color: COLORS.regs,  fontSize: 13 }}>{avgRegs}</td>
              <td></td>
              <td style={{ padding: "8px 14px", textAlign: "center", color: "#64748b", fontSize: 12 }}>
                {fmtEur(fullWeeks.reduce((s, d) => s + d.revenue, 0) / fullWeeks.length)} avg/wk
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 16, fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
        ⚠️ Forms = CTID771 (LO) enquiries + CTID770 (OA) &amp; CTID771 (LO) applications combined. Registrations = Paythen Status=Registered rows for CTID770 + CTID771, from 4 May 2026. Pre-window CTID770 rows (before 4 May, 11 registrations) excluded. CTID771 has 0 Paythen registrations in this period. W9 (29 Jun–5 Jul) is a partial week — 3 days recorded as of 2 Jul 2026. Source: HubSpot XLSX exports + Paythen XLSX, 2 Jul 2026.
      </p>
    </div>
  );
}
