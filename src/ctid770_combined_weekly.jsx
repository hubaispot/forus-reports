import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID770 — Healthcare Support MA Level 5 – Online Anytime 1:1
// Window: W1 27 Apr 2026 → W8 21 Jun 2026 (8 completed weeks) + W9⚡ partial (22–23 Jun)
// Forms = app only (0 enquiry forms recorded) from HubSpot JSX exported 23 Jun 2026
// Registrations + Revenue from Paythen (Status = Registered, IST week boundaries)
// 5 pre-W1 rows (before 27 Apr) excluded — standing instruction
// 4 null-status rows excluded (not Registered)
// No duplicate emails detected
// W3 (11–17 May): 5 form submissions, 0 registrations — applications converted in adjacent weeks
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "27 Apr–3 May",   forms:  8, regs: 6, revenue:  6237.00, full: true  },
  { week: "4–10 May",       forms:  3, regs: 3, revenue:  2730.00, full: true  },
  { week: "11–17 May",      forms:  5, regs: 0, revenue:     0.00, full: true  },
  { week: "18–24 May",      forms:  3, regs: 2, revenue:  1905.00, full: true  },
  { week: "25–31 May",      forms:  5, regs: 4, revenue:  4095.25, full: true  },
  { week: "1–7 Jun",        forms: 11, regs: 4, revenue:  2735.00, full: true  },
  { week: "8–14 Jun",       forms:  9, regs: 5, revenue:  3226.00, full: true  },
  { week: "15–21 Jun",      forms: 10, regs: 4, revenue:  3228.75, full: true  },
  { week: "22–23 Jun ⚡",   forms:  2, regs: 0, revenue:     0.00, full: false },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : null,
}));

const fullWeeks  = data.filter(d => d.full);
const totalForms = data.reduce((s, d) => s + d.forms, 0);
const totalRegs  = data.reduce((s, d) => s + d.regs,  0);
const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
const avgForms   = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs    = (fullWeeks.reduce((s, d) => s + d.regs,  0) / fullWeeks.length).toFixed(1);
const overallCR  = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const fmt = n =>
  "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d     = payload[0]?.payload;
  const forms = d?.forms   ?? 0;
  const regs  = d?.regs    ?? 0;
  const cr    = d?.cr;
  const rev   = d?.revenue ?? 0;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 230
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
            <span style={{ color: COLORS.cr }}>Conv. Rate</span>
            <strong style={{ color: COLORS.cr }}>
              {cr !== null ? cr + "%" : "—"}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Expected Revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmt(rev)}</strong>
          </div>
        </div>
      </div>
      {!d?.full && (
        <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week (Mon–Tue — updated throughout the week)</p>
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
  const [view, setView] = useState("formsRegs");

  return (
    <div style={{
      textAlign: "left",
      background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px"
        }}>
          Forus Training · Healthcare Support MA Level 5 OA (CTID770)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Revenue Report — Forms, Registrations &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          27 Apr – 21 Jun 2026 · 8 completed weeks + W9⚡ partial · HubSpot forms + Paythen registrations
        </p>
      </div>

      {/* Insight banner */}
      <div style={{
        background: "rgba(52,211,153,0.08)", border: "1px solid #34d399", borderRadius: 8,
        padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.7
      }}>
        <strong style={{ color: "#34d399" }}>📌 Key finding: </strong>
        CTID770 generated <strong style={{ color: "#f1f5f9" }}>{fmt(totalRev)} in expected revenue</strong> across{" "}
        {totalRegs} registrations. W1 (27 Apr–3 May) was the standout week with{" "}
        <strong style={{ color: COLORS.regs }}>6 registrations</strong> and{" "}
        <strong style={{ color: COLORS.rev }}>€6,237.00 revenue</strong>. W3 (11–17 May) had 5 form
        submissions but <strong style={{ color: "#f1f5f9" }}>zero registrations</strong> — applicants from that
        week converted in surrounding weeks instead. All contacts submitted the application form directly
        (no enquiry form submissions detected for CTID770).
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",         value: totalForms,      sub: `avg ${avgForms}/wk (full weeks)`, color: COLORS.forms },
          { label: "Total Registrations", value: totalRegs,       sub: `avg ${avgRegs}/wk (full weeks)`,  color: COLORS.regs  },
          { label: "Overall Conv. Rate",  value: overallCR + "%", sub: "total regs ÷ total forms",        color: COLORS.cr    },
          { label: "Total Expected Rev.", value: fmt(totalRev),   sub: `${totalRegs} registrations`,      color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{
            background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 140px", border: "1px solid #334155"
          }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab toggle */}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 120]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <ReferenceLine y={overallCR} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }} />
              <Line dataKey="cr" name="Conversion Rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={({ cx, cy, payload }) => (
                  payload.cr !== null
                    ? <circle key={cx} cx={cx} cy={cy} r={6} fill={COLORS.cr} strokeWidth={0} />
                    : <circle key={cx} cx={cx} cy={cy} r={6} fill="#334155" strokeWidth={0} />
                )}
                connectNulls={false} />
            </ComposedChart>
          ) : view === "revenue" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Bar dataKey="revenue" name="Expected Revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]} />
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 14]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms (HubSpot)" : "Registrations (Paythen)"} />
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5, 5, 0, 0]} />
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5, 5, 0, 0]} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
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
              const crDisplay = row.cr !== null ? row.cr + "%" : "—";
              const crHigh = row.cr !== null && row.cr >= 80;
              return (
                <tr key={i} style={{
                  borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}
                    {!row.full && <span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}
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
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 13,
                    color: row.cr === null ? "#475569" : row.cr > 100 ? "#fbbf24" : crHigh ? "#34d399" : COLORS.cr }}>
                    {crDisplay}{row.cr !== null && row.cr > 100 ? " ⚡" : crHigh ? " 🔥" : ""}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.rev, fontSize: 13 }}>
                    {row.revenue > 0 ? fmt(row.revenue) : <span style={{ color: "#475569" }}>—</span>}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.regs,  fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.cr,   fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.rev,  fontSize: 13 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center" }}>
        ⚠️ No enquiry form submissions detected for CTID770 — all contacts applied directly via application form.
      </p>

    </div>
  );
}
