import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID786 — Care Skills & Care of the Older Person L5 – Live and Online
// Forms: HubSpot JSX (enq + app per week, unique contacts)
// Registrations & Revenue: Paythen "Courses Expected Revenue CTID" (Filtered sheet)
//   Status = "Registered" only; deduplicated by email; 11 pre-W1 rows (13–26 Apr) excluded
// Week boundaries: IST (UTC+1), Mon 00:00 → Sun 23:59
// W1 = 11 May 2026, W8 = 29 Jun–5 Jul 2026 (8 full completed weeks) + W9 partial (6–7 Jul)
// Run: 7 Jul 2026
// Revenue tiers: €498.75 (main), €475.00, €157.50 (1 reg — Samuel Ogun, instalment)
// 22 pre-W1 registrations (before 11 May) excluded
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "11–17 May",      forms: 10, regs: 2, revenue:  973.75, full: true  },
  { week: "18–24 May",      forms: 17, regs: 5, revenue: 2493.75, full: true  },
  { week: "25–31 May",      forms: 10, regs: 3, revenue: 1155.00, full: true  },
  { week: "1–7 Jun",        forms: 10, regs: 6, revenue: 2968.75, full: true  },
  { week: "8–14 Jun",       forms:  6, regs: 3, revenue: 1472.50, full: true  },
  { week: "15–21 Jun",      forms: 10, regs: 3, revenue: 1496.25, full: true  },
  { week: "22–28 Jun",      forms: 17, regs: 9, revenue: 4465.00, full: true  },
  { week: "29 Jun–5 Jul",   forms: 11, regs: 4, revenue: 1947.50, full: true  },
  { week: "6–7 Jul ⚡",      forms:  3, regs: 0, revenue:    0.00, full: false },
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
      {cr > 100 && d?.full && (
        <p style={{ margin: "6px 0 0", color: "#a78bfa", fontSize: 11 }}>
          CR &gt;100%: some learners registered directly via Paythen
        </p>
      )}
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
          HubSpot + Paythen · Care Skills &amp; Care of the Older Person L5 – Live and Online (CTID786)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Combined Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          11 May – 7 Jul 2026 · W1–W8 full weeks · W9 ⚡ partial (6–7 Jul) · run 7 Jul 2026
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid #34d399",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#34d399" }}>📌 Key insight: </strong>
        CTID786 has generated{" "}
        <strong style={{ color: "#f1f5f9" }}>{fmt(totalRev)} in expected revenue</strong> from{" "}
        <strong style={{ color: "#f1f5f9" }}>{totalRegs} registrations</strong> across 8 completed weeks plus a partial W9.
        Overall conversion rate is <strong style={{ color: "#f1f5f9" }}>{overallCR}%</strong>. W7 (22–28 Jun)
        is the standout week — 9 registrations and{" "}
        <strong style={{ color: "#f1f5f9" }}>{fmt(4465)}</strong> — the highest revenue of any week.
        W4 (1–7 Jun) hit the highest conversion at 60.0%. W1 (11–17 May) had the lowest conversion
        at 20.0% despite 10 form submissions.
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Form Submissions", value: totalForms,      sub: `avg ${avgForms}/wk (W1–W8)`,       color: COLORS.forms },
          { label: "Total Registrations",    value: totalRegs,       sub: `avg ${avgRegs}/wk (W1–W8)`,        color: COLORS.regs  },
          { label: "Overall Conv. Rate",     value: overallCR + "%", sub: "regs ÷ forms (all weeks)",          color: COLORS.cr    },
          { label: "Total Expected Revenue", value: fmt(totalRev),   sub: "W1–W8 full + W9 partial",          color: COLORS.rev   },
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

      {/* Tabs */}
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
                tickFormatter={v => v + "%"} domain={[0, 80]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <ReferenceLine y={overallCR} stroke="#a78bfa" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#a78bfa", fontSize: 11, position: "insideBottomRight" }} />
              <Line dataKey="cr" name="Conversion rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={({ cx, cy, index }) => (
                  <circle key={index} cx={cx} cy={cy} r={6}
                    fill={COLORS.cr} stroke="none" />
                )} connectNulls />
            </ComposedChart>
          ) : view === "rev" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(1) + "k"} domain={[0, 5000]} />
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
                domain={[0, 22]} />
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
              const crHigh   = row.cr >= 50 && row.forms > 0;
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
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}</td>
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
                Total (W1–W8 full + W9 ⚡ partial)
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

      {/* Footer */}
      <p style={{ margin: "16px 0 0", fontSize: 11, color: "#475569", lineHeight: 1.6 }}>
        <strong style={{ color: "#64748b" }}>Notes:</strong> Forms = HubSpot enquiry + application submissions (unique contacts, last form only, cols A–D dedup).
        Registrations = Paythen "Registered" rows (Filtered sheet, deduplicated by email).
        22 pre-window registrations (before 11 May) excluded. Revenue tiers: €498.75 (main), €475.00, €157.50 (instalment — 1 reg).
        W9 is a partial week (6–7 Jul 2026) — excluded from weekly averages.
      </p>

    </div>
  );
}
