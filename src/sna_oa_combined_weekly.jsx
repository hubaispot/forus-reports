import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID490 + CTID423 — SNA Online Anytime (merged) — Combined Weekly Revenue Report
// Forms: from HubSpot JSX (enq + app per week), W1–W8 full, W9 partial (Mon–Sat)
// Registrations & Revenue: from Paythen "Courses Expected Revenue CTID" (deduplicated)
// Week boundaries: IST (UTC+1), Mon 00:00 → Sun 23:59. W9 = Mon 8 Jun – Sat 13 Jun.
// Trudy Walsh (CTID490, 2026-05-28) appeared twice — counted as 1 registration.
// W2 CR >100%: 2 regs from 1 form (1 direct Paythen registration, no HubSpot record).
// W4 CR —: 1 reg from 0 forms (direct Paythen registration, no HubSpot record).
// ─────────────────────────────────────────────────────────────────────────────
const data = [
  { week: "13–19 Apr",    forms: 4,  regs: 3,  revenue: 1204.80, full: true  },
  { week: "20–26 Apr",    forms: 1,  regs: 2,  revenue:  880.00, full: true  },
  { week: "27 Apr–3 May", forms: 1,  regs: 1,  revenue:  462.00, full: true  },
  { week: "4–10 May",     forms: 0,  regs: 1,  revenue:  462.00, full: true  },
  { week: "11–17 May",    forms: 3,  regs: 3,  revenue: 1248.80, full: true  },
  { week: "18–24 May",    forms: 2,  regs: 0,  revenue:    0.00, full: true  },
  { week: "25–31 May",    forms: 2,  regs: 1,  revenue:  320.00, full: true  },
  { week: "1–7 Jun",      forms: 5,  regs: 0,  revenue:    0.00, full: true  },
  { week: "8–13 Jun ⚡",  forms: 1,  regs: 0,  revenue:    0.00, full: false },
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
const overallCR   = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const fmt = (n) => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d     = payload[0]?.payload;
  const forms = d?.forms ?? 0;
  const regs  = d?.regs  ?? 0;
  const rev   = d?.revenue ?? 0;
  const cr    = d?.cr;
  const crOver = cr !== null && cr > 100;
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
            <strong style={{ color: COLORS.cr }}>
              {cr !== null ? cr + "%" + (crOver ? " ⚡" : "") : "—"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Expected revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmt(rev)}</strong>
          </div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week (Mon–Sat)</p>}
      {crOver && <p style={{ margin: "6px 0 0", color: "#a78bfa", fontSize: 11 }}>CR &gt;100%: registrations exceed HubSpot forms — learner registered directly via Paythen</p>}
      {cr === null && regs > 0 && <p style={{ margin: "6px 0 0", color: "#a78bfa", fontSize: 11 }}>No HubSpot forms this week — learner registered directly via Paythen</p>}
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
          Paythen + HubSpot · SNA Online Anytime (CTID490 + CTID423)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Combined Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          13 Apr – 13 Jun 2026 · W1–W8 full weeks · W9 partial (Mon–Sat) ⚡ · CTID490 &amp; CTID423 merged
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid #a78bfa",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#a78bfa" }}>📌 Key insight: </strong>
        SNA Online Anytime has generated <strong style={{ color: "#f1f5f9" }}>{fmt(totalRev)} in expected revenue</strong> from{" "}
        <strong style={{ color: "#f1f5f9" }}>{totalRegs} registrations</strong> across 9 weeks.
        Overall conversion rate is <strong style={{ color: "#f1f5f9" }}>{overallCR}%</strong>.
        W2 and W4 show direct Paythen registrations with no prior HubSpot form — indicating some learners
        find the course and register without enquiring first. W6 and W8 had forms but no registrations,
        suggesting a lag between interest and sign-up for this course type.
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Form Submissions", value: totalForms,      sub: `avg ${avgForms}/wk (full weeks)`,  color: COLORS.forms },
          { label: "Total Registrations",    value: totalRegs,       sub: `avg ${avgRegs}/wk (full weeks)`,   color: COLORS.regs  },
          { label: "Overall Conv. Rate",     value: overallCR + "%", sub: "regs ÷ forms (all weeks)",         color: COLORS.cr    },
          { label: "Total Expected Revenue", value: fmt(totalRev),   sub: "W1–W9 incl. partial",              color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 140px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: k.label === "Total Expected Revenue" ? 18 : 22,
              fontWeight: 800, color: k.color, lineHeight: 1.1 }}>{k.value}</p>
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
                tickFormatter={v => v + "%"} domain={[0, 220]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <ReferenceLine y={100} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: "100%", fill: "#64748b", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={overallCR} stroke="#a78bfa" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#a78bfa", fontSize: 11, position: "insideBottomRight" }} />
              <Line dataKey="cr" name="Conv. rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={({ cx, cy, index }) => {
                  if (data[index]?.cr === null) return null;
                  return (
                    <circle key={index} cx={cx} cy={cy} r={6}
                      fill={data[index]?.full ? COLORS.cr : "#fbbf24"}
                      stroke="none" />
                  );
                }} connectNulls={false} />
            </ComposedChart>
          ) : view === "rev" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(1) + "k"} domain={[0, 1600]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Bar dataKey="revenue" name="revenue" fill={COLORS.rev}
                radius={[5, 5, 0, 0]} />
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 8]} />
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
              const crOver   = row.cr !== null && row.cr > 100;
              const crHigh   = row.cr !== null && row.cr >= 80 && row.cr <= 100 && row.forms > 0;
              const delta = (val, prev) => {
                if (prev === null) return null;
                const diff = val - prev;
                if (diff > 0) return <span style={{ fontSize: 10, marginLeft: 4, color: "#34d399" }}>▲{diff}</span>;
                if (diff < 0) return <span style={{ fontSize: 10, marginLeft: 4, color: "#f87171" }}>▼{Math.abs(diff)}</span>;
                return <span style={{ fontSize: 10, marginLeft: 4, color: "#64748b" }}>=</span>;
              };
              return (
                <tr key={i} style={{
                  borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: !row.full ? "rgba(251,191,36,0.04)" : i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}
                    {!row.full && (
                      <span style={{ marginLeft: 6, fontSize: 10, color: "#fbbf24",
                        background: "rgba(251,191,36,0.12)", borderRadius: 4,
                        padding: "1px 5px" }}>partial</span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: COLORS.forms, fontSize: 15 }}>
                    {row.forms}{delta(row.forms, i > 0 ? data[i - 1].forms : null)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: COLORS.regs, fontSize: 15 }}>
                    {row.regs}{delta(row.regs, i > 0 ? data[i - 1].regs : null)}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, fontSize: 12,
                    color: crOver ? "#fbbf24" : crHigh ? "#34d399" : !row.full ? "#fbbf24" : COLORS.cr }}>
                    {row.cr !== null ? row.cr + "%" : (row.regs > 0 ? "—⚡" : "—")}
                    {crOver ? " ⚡" : crHigh ? " 🔥" : ""}
                    {!row.full && row.forms > 0 && <span style={{ fontSize: 10, marginLeft: 3 }}>⚡</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: row.revenue > 0 ? COLORS.rev : "#475569", fontSize: 13 }}>
                    {row.revenue > 0 ? fmt(row.revenue) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8",
                fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>
                Total (W1–W9 incl. partial)
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
        <strong style={{ color: "#64748b" }}>Notes:</strong> Forms = HubSpot enquiry + application submissions (CTID490 + CTID423 combined, unique contacts, last form only).
        Registrations = Paythen "Registered" status rows (deduplicated — Trudy Walsh counted once).
        W2 CR &gt;100% and W4 CR — indicate learners who registered via Paythen without a prior HubSpot form submission.
        Revenue tiers: CTID490 €320.00–€324.80 · CTID423 €440.00–€462.00.
      </p>
    </div>
  );
}
