import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

export const data = [
  { week: "15–21 Jun",    forms: 2,  regs: 1, revenue: 324.80,  full: true  },
  { week: "22–28 Jun",    forms: 2,  regs: 1, revenue: 440.00,  full: true  },
  { week: "29 Jun–5 Jul", forms: 5,  regs: 1, revenue: 295.00,  full: true  },
  { week: "6–12 Jul",     forms: 4,  regs: 1, revenue: 440.00,  full: true  },
  { week: "13–19 Jul",    forms: 2,  regs: 0, revenue: 0,        full: true  },
  { week: "20–26 Jul",    forms: 1,  regs: 2, revenue: 604.75,  full: true  },
  { week: "27 Jul–2 Aug", forms: 3,  regs: 1, revenue: 462.00,  full: true  },
  { week: "3–9 Aug",      forms: 1,  regs: 1, revenue: 295.00,  full: true  },
  { week: "10–16 Aug ⚡", forms: 7,  regs: 9, revenue: 3188.50, full: false },
].map(d => ({
  ...d,
  cr: d.forms > 0 ? +((d.regs / d.forms) * 100).toFixed(1) : null,
}));

const fullWeeks   = data.filter(d => d.full);
const totalForms  = data.reduce((s, d) => s + d.forms, 0);
const totalRegs   = data.reduce((s, d) => s + d.regs, 0);
const totalRev    = data.reduce((s, d) => s + d.revenue, 0);
const avgForms    = (fullWeeks.reduce((s, d) => s + d.forms, 0) / fullWeeks.length).toFixed(1);
const avgRegs     = (fullWeeks.reduce((s, d) => s + d.regs, 0) / fullWeeks.length).toFixed(1);
const overallCR   = totalForms > 0 ? +((totalRegs / totalForms) * 100).toFixed(1) : 0;

const C = {
  forms:   "#fb923c",
  regs:    "#38bdf8",
  cr:      "#a78bfa",
  rev:     "#34d399",
  bg:      "#0f172a",
  card:    "#1e293b",
  border:  "#334155",
  text:    "#f1f5f9",
  muted:   "#94a3b8",
  dim:     "#64748b",
};

const fmt = v => "€" + v.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: C.text, minWidth: 220 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: C.forms }}>● Forms</span><strong>{d.forms}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: C.regs }}>● Registrations</span><strong>{d.regs}</strong>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.cr }}>Conv. Rate</span>
            <strong style={{ color: C.cr }}>{d.cr !== null ? d.cr + "%" : "—"}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.rev }}>Expected Revenue</span>
            <strong style={{ color: C.rev }}>{fmt(d.revenue)}</strong>
          </div>
        </div>
      </div>
      {!d.full && (
        <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>
          ⚡ Partial week — counts may grow
        </p>
      )}
      {d.cr !== null && d.cr > 100 && (
        <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 10, lineHeight: 1.4 }}>
          CR% &gt;100% — payment date falls in a later week than the originating form submission.
        </p>
      )}
    </div>
  );
};

const Tab = ({ id, active, onClick, children }) => (
  <button onClick={() => onClick(id)} style={{
    padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "1px solid",
    borderColor: active ? C.regs : C.border,
    background:  active ? "rgba(56,189,248,0.15)" : "transparent",
    color:       active ? C.regs : C.dim,
  }}>{children}</button>
);

export default function App() {
  const [view, setView] = useState("bars");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: C.dim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
          HubSpot + Paythen · SNA Online Anytime — CTID490 + CTID423 combined
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: C.text }}>
          Combined Weekly Revenue Report
        </h1>
        <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
          15 Jun – 16 Aug 2026 · W1–W8 full weeks + W9 ⚡ partial · CTID490 + CTID423
        </p>
      </div>

      {/* Insight banner */}
      <div style={{ background: "rgba(52,211,153,0.08)", border: `1px solid ${C.rev}`, borderRadius: 8,
        padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
        <strong style={{ color: C.rev }}>📌 Key characteristic: </strong>
        Registrations were low and steady through W1–W8 (1–2/week), with a{" "}
        <strong style={{ color: C.text }}>significant W9 surge of 9 registrations (€3,188.50)</strong> — more than half of all
        in-window revenue landed in the final week. CR% &gt;100% in W6, W8, and W9 reflects Paythen
        payment dates falling in a later week than the originating enquiry or application — this is expected
        and not a data error. 15 pre-window registrations (€6,189.60) were excluded per standing instruction.
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",         value: totalForms,        sub: `avg ${avgForms}/wk (W1–W8)`,  color: C.forms },
          { label: "Total Registrations", value: totalRegs,         sub: `avg ${avgRegs}/wk (W1–W8)`,  color: C.regs  },
          { label: "Overall Conv. Rate",  value: overallCR + "%",   sub: "regs ÷ forms",               color: C.cr    },
          { label: "Total Expected Rev.", value: fmt(totalRev),     sub: "W1–W9 combined",             color: C.rev   },
        ].map(k => (
          <div key={k.label} style={{ background: C.card, borderRadius: 10, padding: "12px 18px",
            flex: "1 1 130px", border: `1px solid ${C.border}` }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: C.dim }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="bars" active={view === "bars"} onClick={setView}>Forms vs Registrations</Tab>
        <Tab id="cr"   active={view === "cr"}   onClick={setView}>Conversion Rate %</Tab>
        <Tab id="rev"  active={view === "rev"}  onClick={setView}>Expected Revenue</Tab>
      </div>

      {/* Chart */}
      <div style={{ background: C.card, borderRadius: 12, padding: "24px 16px 16px",
        border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 220]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <ReferenceLine y={100} stroke="#f87171" strokeDasharray="4 3"
                label={{ value: "100%", fill: "#f87171", fontSize: 10, position: "insideTopRight" }} />
              <ReferenceLine y={overallCR} stroke={C.dim} strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: C.dim, fontSize: 11, position: "insideTopLeft" }} />
              <Line dataKey="cr" name="Conv. Rate" type="monotone"
                stroke={C.cr} strokeWidth={2.5}
                dot={{ r: 6, fill: C.cr, strokeWidth: 0 }} connectNulls />
            </ComposedChart>
          ) : view === "rev" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => "€" + v.toLocaleString()} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Bar dataKey="revenue" name="Expected Revenue" fill={C.rev} radius={[5, 5, 0, 0]} />
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 12]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,.06)" }} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "forms" ? "Forms (ENQ + APP)" : "Registrations (Paythen)"} />
              <Bar dataKey="forms" name="forms" fill={C.forms} radius={[5, 5, 0, 0]} />
              <Bar dataKey="regs"  name="regs"  fill={C.regs}  radius={[5, 5, 0, 0]} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {["Wk", "Dates", "Forms", "Registrations", "CR%", "Expected Revenue"].map((h, i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i <= 1 ? "left" : "center",
                  color: C.dim, fontWeight: 600, fontSize: 11, textTransform: "uppercase",
                  letterSpacing: "0.06em", borderBottom: `1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowForms = i > 0 ? row.forms - data[i - 1].forms : null;
              const wowRegs  = i > 0 ? row.regs  - data[i - 1].regs  : null;
              const crHigh   = row.cr !== null && row.cr >= 100;
              return (
                <tr key={i} style={{ borderBottom: i < data.length - 1 ? `1px solid #1e2d3d` : "none",
                  background: i % 2 === 0 ? C.card : "#162032" }}>
                  <td style={{ padding: "11px 14px", color: C.dim, fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}{!row.full && <span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: C.forms, fontSize: 15 }}>
                    {row.forms}
                    {wowForms !== null && <span style={{ fontSize: 10, marginLeft: 4, color: wowForms > 0 ? C.rev : wowForms < 0 ? "#f87171" : C.dim }}>
                      {wowForms > 0 ? `▲${wowForms}` : wowForms < 0 ? `▼${Math.abs(wowForms)}` : "="}
                    </span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: C.regs, fontSize: 15 }}>
                    {row.regs}
                    {wowRegs !== null && <span style={{ fontSize: 10, marginLeft: 4, color: wowRegs > 0 ? C.rev : wowRegs < 0 ? "#f87171" : C.dim }}>
                      {wowRegs > 0 ? `▲${wowRegs}` : wowRegs < 0 ? `▼${Math.abs(wowRegs)}` : "="}
                    </span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12,
                    color: crHigh ? "#fbbf24" : C.cr }}>
                    {row.cr !== null ? row.cr + "%" : "—"}
                    {crHigh && <span style={{ fontSize: 9, marginLeft: 3, color: C.muted }}>†</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: C.rev, fontSize: 13 }}>
                    {row.revenue > 0 ? fmt(row.revenue) : "—"}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: C.bg, borderTop: `2px solid ${C.border}` }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: C.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: C.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: C.regs,  fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: C.cr,    fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: C.rev,   fontSize: 13 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 14, fontSize: 11, color: "#475569", lineHeight: 1.7 }}>
        <p style={{ margin: 0 }}>
          † CR% &gt;100% — Paythen payment date falls in a later week than the originating HubSpot form submission. Not a data error.
        </p>
        <p style={{ margin: "4px 0 0" }}>
          Run: 17 Aug 2026 · Window: W1 15 Jun – W9 16 Aug 2026 · CTID490 + CTID423 combined ·
          Pre-window excluded: 5 CTID490 (€1,726.60) + 10 CTID423 (€4,463.00) = 15 rows (€6,189.60) ·
          No email duplicates · No cross-CTID overlaps
        </p>
      </div>
    </div>
  );
}
