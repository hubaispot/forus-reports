import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID786 — CS & COOP LO Level 5 – Live and Online
// W1–W8 all full weeks (Mon–Sun IST), no partial week
// Window: 18 May – 12 Jul 2026
// Forms = enq + app from HubSpot JSX (unique contacts, last form only per contact)
//         Two application forms combined (APP_1 + APP_2); phone dupe merged
// Registrations + Revenue from Paythen "Filtered" sheet
//   CTID label: "CSCOOP LO - CTID786" · Status = Registered · deduped by email
//   24 pre-W1 registrations (Apr, €11,859.75) excluded per standing instruction
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "18–24 May",     label: "W1", forms: 17, regs: 5,  revenue: 2493.75, full: true },
  { week: "25–31 May",     label: "W2", forms: 13, regs: 3,  revenue: 1155.00, full: true },
  { week: "1–7 Jun",       label: "W3", forms: 10, regs: 6,  revenue: 2968.75, full: true },
  { week: "8–14 Jun",      label: "W4", forms:  6, regs: 3,  revenue: 1472.50, full: true },
  { week: "15–21 Jun",     label: "W5", forms: 10, regs: 4,  revenue: 1971.25, full: true },
  { week: "22–28 Jun",     label: "W6", forms: 17, regs: 9,  revenue: 4465.00, full: true },
  { week: "29 Jun–5 Jul",  label: "W7", forms: 10, regs: 4,  revenue: 1947.50, full: true },
  { week: "6–12 Jul",      label: "W8", forms: 14, regs: 1,  revenue:  498.75, full: true },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : 0,
}));

const fullWeeks  = data.filter(d => d.full);
const totalForms = data.reduce((s, d) => s + d.forms,   0);
const totalRegs  = data.reduce((s, d) => s + d.regs,    0);
const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
const avgForms   = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs    = (fullWeeks.reduce((s, d) => s + d.regs,  0) / fullWeeks.length).toFixed(1);
const overallCR  = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;

const COLORS = { forms: "#fb923c", regs: "#38bdf8", cr: "#a78bfa", rev: "#34d399" };

const fmt = n => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d     = payload[0]?.payload;
  const forms = d?.forms   ?? 0;
  const regs  = d?.regs    ?? 0;
  const rev   = d?.revenue ?? 0;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 230 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>
        {d?.label} · {d?.week}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.forms }}>● Forms</span><strong>{forms}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.regs }}>● Registrations</span><strong>{regs}</strong>
        </div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.cr }}>Conv. rate</span>
            <strong style={{ color: COLORS.cr }}>{d?.forms > 0 ? d.cr + "%" : "—"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rev }}>Exp. revenue</span>
            <strong style={{ color: COLORS.rev }}>{fmt(rev)}</strong>
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
    <div style={{ textAlign: "left", background: "#0f172a", minHeight: "100vh",
      padding: "32px 24px", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px" }}>
          Paythen + HubSpot · CS &amp; COOP LO Level 5 – Live and Online (CTID786)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Revenue Report — Forms vs Registrations
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          18 May – 12 Jul 2026 · IST boundaries · 8 full weeks
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid #fb923c",
        borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12,
        color: "#94a3b8", lineHeight: 1.7 }}>
        <strong style={{ color: "#fb923c" }}>📌 Key insight: </strong>
        W6 (22–28 Jun) is the standout week with{" "}
        <strong style={{ color: "#f1f5f9" }}>9 registrations</strong> and{" "}
        <strong style={{ color: "#34d399" }}>€4,465.00</strong> revenue — the busiest week on both
        measures. W3 (1–7 Jun) delivers the highest conversion rate at{" "}
        <strong style={{ color: "#f1f5f9" }}>60%</strong> (6 regs from 10 forms 🔥).
        W8 (6–12 Jul) shows a sharp drop to 1 registration despite 14 forms — the largest gap
        between form volume and registrations in the window, suggesting a lag in conversions
        that may still come through. Overall conversion rate is{" "}
        <strong style={{ color: "#f1f5f9" }}>{overallCR}%</strong> across{" "}
        <strong style={{ color: "#f1f5f9" }}>{totalRegs} registrations</strong> and{" "}
        <strong style={{ color: "#34d399" }}>{fmt(totalRev)}</strong> expected revenue.
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",         value: totalForms,      sub: `avg ${avgForms}/wk`,  color: COLORS.forms },
          { label: "Total Registrations", value: totalRegs,       sub: `avg ${avgRegs}/wk`,   color: COLORS.regs  },
          { label: "Overall Conv. Rate",  value: overallCR + "%", sub: "regs ÷ forms",         color: COLORS.cr    },
          { label: "Total Exp. Revenue",  value: fmt(totalRev),   sub: "W1–W8 full weeks",     color: COLORS.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10,
            padding: "12px 18px", flex: "1 1 130px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px",
              fontSize: k.label === "Total Exp. Revenue" ? 18 : 22,
              fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="grouped" active={view === "grouped"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"      active={view === "cr"}      onClick={setView}>Conversion Rate %</Tab>
        <Tab id="revenue" active={view === "revenue"} onClick={setView}>Expected Revenue</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 80]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallCR} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11,
                  position: "insideTopRight" }}/>
              <Line dataKey="cr" name="Conv. rate" type="monotone"
                stroke={COLORS.cr} strokeWidth={2.5}
                dot={{ r: 6, fill: COLORS.cr, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : view === "revenue" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + (v / 1000).toFixed(1) + "k"} domain={[0, 5000]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Bar dataKey="revenue" name="revenue" fill={COLORS.rev} radius={[5, 5, 0, 0]}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                domain={[0, 20]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms (enq + app)" : "Registrations"}/>
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
              {["Wk", "Dates", "Forms", "Registrations", "Conv. Rate", "Exp. Revenue"].map((h, i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i <= 1 ? "left" : "center",
                  color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const crHigh = row.cr >= 50 && row.forms > 0;
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
                  background: i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>{row.label}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}</td>
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
                    color: crHigh ? "#34d399" : COLORS.cr }}>
                    {row.forms > 0 ? row.cr + "%" : "—"}
                    {crHigh ? " 🔥" : ""}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center",
                    fontWeight: 700, color: COLORS.rev, fontSize: 13 }}>
                    {fmt(row.revenue)}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8",
                fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>
                Total (W1–W8, all full weeks)
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
      <p style={{ marginTop: 12, fontSize: 11, color: "#475569", textAlign: "center" }}>
        All 8 weeks are complete (Mon–Sun IST). Two application forms combined (APP_1 + APP_2).
        24 pre-W1 Paythen registrations (Apr 2026) excluded per standing instruction.
        Test submissions (jean@forustraining.ie) excluded from all counts.
      </p>
    </div>
  );
}
