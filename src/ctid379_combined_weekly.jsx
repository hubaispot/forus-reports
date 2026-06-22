import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID379 — SNA Level 6 – Live and Online — Combined Weekly Revenue Report
// Forms: HubSpot JSX (enq + app per week)
// Registrations & Revenue: Paythen "Courses Expected Revenue CTID" (Filtered sheet)
//   Status = "Registered" only; deduplicated by email; 9 pre-W1 rows (13–23 Apr) excluded
// Week boundaries: IST (UTC+1), Mon 00:00 → Sun 23:59
// W9 = partial week Mon 22 Jun 2026 (day 1 only)
// Run: 22 Jun 2026
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "27 Apr–3 May",  forms: 6,  regs: 1, revenue: 440.00,   full: true  },
  { week: "4–10 May",      forms: 9,  regs: 1, revenue: 440.00,   full: true  },
  { week: "11–17 May",     forms: 8,  regs: 3, revenue: 1364.00,  full: true  },
  { week: "18–24 May",     forms: 14, regs: 4, revenue: 1804.00,  full: true  },
  { week: "25–31 May",     forms: 9,  regs: 7, revenue: 3146.00,  full: true  },
  { week: "1–7 Jun",       forms: 14, regs: 6, revenue: 2706.00,  full: true  },
  { week: "8–14 Jun",      forms: 15, regs: 4, revenue: 1804.00,  full: true  },
  { week: "15–21 Jun",     forms: 9,  regs: 2, revenue: 923.83,   full: true  },
  { week: "22 Jun ⚡",     forms: 0,  regs: 0, revenue: 0,        full: false },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : 0,
}));

const fullWeeks  = data.filter(d => d.full);
const totalForms = data.reduce((s, d) => s + d.forms, 0);
const totalRegs  = data.reduce((s, d) => s + d.regs,  0);
const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
const avgForms   = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs    = (fullWeeks.reduce((s, d) => s + d.regs,  0) / fullWeeks.length).toFixed(1);
const overallCR  = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const fmt = n => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d     = payload[0]?.payload;
  const forms = d?.forms   ?? 0;
  const regs  = d?.regs    ?? 0;
  const cr    = d?.cr      ?? 0;
  const rev   = d?.revenue ?? 0;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 230 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.forms }}>● Form submissions</span><strong>{forms}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.regs }}>● Registrations</span><strong>{regs}</strong>
        </div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.cr }}>Conv. rate</span>
            <strong style={{ color: COLORS.cr }}>{cr > 0 ? cr + "%" : "—"}{cr > 100 ? " ⚡" : ""}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Expected revenue</span>
            <strong style={{ color: COLORS.rev }}>{rev > 0 ? fmt(rev) : "—"}</strong>
          </div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week (Mon only)</p>}
      {cr > 100 && d?.full && <p style={{ margin: "6px 0 0", color: "#a78bfa", fontSize: 11 }}>CR &gt;100%: some learners registered directly via Paythen</p>}
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
          HubSpot + Paythen · SNA Level 6 – Live and Online (CTID379)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Combined Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          27 Apr – 21 Jun 2026 · W1–W8 full weeks · W9 ⚡ partial (Mon 22 Jun) · run 22 Jun 2026
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid #34d399",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#34d399" }}>📌 Key insight: </strong>
        CTID379 has generated <strong style={{ color: "#f1f5f9" }}>{fmt(totalRev)} in expected revenue</strong> from{" "}
        <strong style={{ color: "#f1f5f9" }}>{totalRegs} registrations</strong> across 8 completed weeks.
        Overall conversion rate is <strong style={{ color: "#f1f5f9" }}>{overallCR}%</strong>. W5 (25–31 May)
        was the standout week with <strong style={{ color: "#f1f5f9" }}>7 registrations</strong> and{" "}
        <strong style={{ color: "#f1f5f9" }}>{fmt(3146)}</strong> revenue — the highest of any week.
        W7 (8–14 Jun) led on form volume with 15 submissions.
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Form Submissions", value: totalForms,      sub: `avg ${avgForms}/wk (W1–W8)`,  color: COLORS.forms },
          { label: "Total Registrations",    value: totalRegs,       sub: `avg ${avgRegs}/wk (W1–W8)`,   color: COLORS.regs  },
          { label: "Overall Conv. Rate",     value: overallCR + "%", sub: "regs ÷ forms (all weeks)",     color: COLORS.cr    },
          { label: "Total Expected Revenue", value: fmt(totalRev),   sub: "W1–W8 completed weeks",        color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 140px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800,
              color: k.color, lineHeight: 1.1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="grouped" active={view === "grouped"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"      active={view === "cr"}      onClick={setView}>Conversion Rate %</Tab>
        <Tab id="rev"     active={view === "rev"}     onClick={setView}>Expected Revenue</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <ReferenceLine y={overallCR} stroke="#a78bfa" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#a78bfa", fontSize: 11, position: "insideBottomRight" }} />
              <Line dataKey="cr" name="Conversion rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={({ cx, cy, index }) => (
                  <circle key={index} cx={cx} cy={cy} r={6}
                    fill={data[index]?.full ? COLORS.cr : "#fbbf24"}
                    stroke="none" />
                )} connectNulls />
            </ComposedChart>
          ) : view === "rev" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(1) + "k"} domain={[0, 4000]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Bar dataKey="revenue" name="revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]} />
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 18]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Form submissions" : "Registrations"} />
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5, 5, 0, 0]} />
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5, 5, 0, 0]} />
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
              {["Wk", "Dates", "Forms", "Registrations", "Conv. Rate", "Expected Revenue"].map((h, i) => (
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
              const crHigh   = row.cr >= 60 && row.forms > 0;
              const crOver   = row.cr > 100;
              const delta = val => {
                if (val === null) return null;
                if (val > 0) return <span style={{ fontSize: 10, marginLeft: 4, color: "#34d399" }}>▲{val}</span>;
                if (val < 0) return <span style={{ fontSize: 10, marginLeft: 4, color: "#f87171" }}>▼{Math.abs(val)}</span>;
                return <span style={{ fontSize: 10, marginLeft: 4, color: "#64748b" }}>=</span>;
              };
              return (
                <tr key={i} style={{ borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032" }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}
                    {!row.full && <span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.forms, fontSize: 15 }}>
                    {row.forms > 0 ? row.forms : "—"}{delta(wowForms)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.regs, fontSize: 15 }}>
                    {row.regs > 0 ? row.regs : "—"}{delta(wowRegs)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12,
                    color: crOver ? "#fbbf24" : crHigh ? "#34d399" : COLORS.cr }}>
                    {row.forms > 0 ? row.cr + "%" : "—"}
                    {crOver ? " ⚡" : crHigh ? " 🔥" : ""}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700,
                    color: COLORS.rev, fontSize: 13 }}>
                    {row.revenue > 0 ? fmt(row.revenue) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8",
                fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>
                Total (W1–W8 + W9 ⚡ partial)
              </td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: COLORS.regs, fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 700, color: COLORS.cr, fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center",
                fontWeight: 800, color: COLORS.rev, fontSize: 14 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p style={{ margin: "16px 0 0", fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
        <strong style={{ color: "#64748b" }}>Notes:</strong> Forms = HubSpot enquiry + application submissions (unique contacts, last form only).
        Registrations = Paythen "Registered" rows (Filtered sheet, deduplicated by email).
        9 pre-window registrations (13–23 Apr) excluded. Revenue tiers: €440.00, €461.83, €462.00, €733.95.
        W9 is a partial week (Mon 22 Jun 2026 — day 1 only).
      </p>

    </div>
  );
}
