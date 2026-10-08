import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  PieChart, Pie, Cell
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// CTID742 — SNA Level 5 & 6 (Live and Online)
// Rolling window: last 8 completed Mon–Sun weeks · W9 partial if included
// W1 = Mon 10 Aug 2026 · W8 = Sun 4 Oct 2026 · W9 = 5–7 Oct 2026 ⚡ partial
// Methodology: global dedup per form · email primary · phone fallback · most recent kept
// Freshly processed 7 Oct 2026 (CSV, local Irish time) · 123 unique enquiries · 131 unique apps · no dupes detected
// Traffic source tab added 7 Oct 2026, aligned to CTID786 / CTID770+771 template 8 Oct 2026
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "10–16 Aug",     enq: 13, app: 9,  full: true  },
  { week: "17–23 Aug",     enq: 13, app: 8,  full: true  },
  { week: "24–30 Aug",     enq: 16, app: 17, full: true  },
  { week: "31 Aug–6 Sep",  enq: 17, app: 27, full: true  },
  { week: "7–13 Sep",      enq: 12, app: 11, full: true  },
  { week: "14–20 Sep",     enq: 19, app: 19, full: true  },
  { week: "21–27 Sep",     enq: 8,  app: 18, full: true  },
  { week: "28 Sep–4 Oct",  enq: 16, app: 14, full: true  },
  { week: "5–7 Oct ⚡",    enq: 9,  app: 8,  full: false },
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

// ── UTM TRAFFIC SOURCE (W1–W9, 254 forms · 226 contacts) — CTID786 / CTID770+771 template, 8 Oct 2026 ─
// Source: HubSpot contact utm_source / utm_medium (pulled 8 Oct 2026), not the form-submission UTMs
// Counted per form: the 28 contacts who submitted both ENQ and APP appear in both
// Mapping: adwords or medium ppc → Google Ads · fb / facebook, or medium paid-social → Facebook · ig → Instagram
// hs_automation / hs_email / any email medium → HubSpot email · website (no medium clue) → Website
// chatgpt.com / copilot.com → AI search · blank → Unknown · order: largest first, Unknown last
export const utmData = [
  { name: "Google Ads",       enq:  40, app:  42, color: "#facc15" },
  { name: "Website",          enq:  22, app:  24, color: "#34d399" },
  { name: "Facebook",         enq:  21, app:  11, color: "#60a5fa" },
  { name: "HubSpot email",    enq:   9, app:  10, color: "#fb923c" },
  { name: "Instagram",        enq:   2, app:   1, color: "#f472b6" },
  { name: "AI search",        enq:   1, app:   0, color: "#a78bfa" },
  { name: "Unknown",          enq:  28, app:  43, color: "#475569" },
].map(d => ({ ...d, combined: d.enq + d.app }));

const UTM_FORMS = [
  { id: "combined", label: "Combined" },
  { id: "enq",      label: "Enquiry" },
  { id: "app",      label: "Application" },
];

const UtmTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "8px 12px", fontSize: 13, color: "#f1f5f9"
    }}>
      <span style={{ color: p.payload.color }}>● </span>{p.name}: <strong>{p.value}</strong>
      <span style={{ color: "#94a3b8" }}> ({p.payload.pct}%)</span>
    </div>
  );
};

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.04) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#0f172a" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>{Math.round(percent * 100)}%</text>
  );
};

const UtmPanel = ({ form, setForm, showUnknown, setShowUnknown }) => {
  const unknownCount = utmData.find(d => d.name === "Unknown")?.[form] ?? 0;
  // Categories with no submissions across both forms are hidden entirely
  const base = utmData.filter(d => d.combined > 0 && (showUnknown || d.name !== "Unknown"));
  const totalForm = base.reduce((s, d) => s + d[form], 0);
  const rows = base.map(d => ({
    name: d.name, color: d.color, value: d[form],
    pct: totalForm > 0 ? Math.round(d[form] / totalForm * 100) : 0
  }));
  const pieRows = rows.filter(r => r.value > 0);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {UTM_FORMS.map(f => (
          <Tab key={f.id} id={f.id} active={form === f.id} onClick={setForm}>{f.label}</Tab>
        ))}
        <span style={{ width: 1, background: "#334155", margin: "0 6px" }}/>
        <Tab id="incl" active={showUnknown}  onClick={() => setShowUnknown(true)}>Include Unknown</Tab>
        <Tab id="excl" active={!showUnknown} onClick={() => setShowUnknown(false)}>Exclude Unknown</Tab>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <div style={{ flex: "1 1 260px", minWidth: 240, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieRows} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={55} outerRadius={120} paddingAngle={1}
                labelLine={false} label={renderPieLabel} stroke="#1e293b" isAnimationActive={false}>
                {pieRows.map(r => <Cell key={r.name} fill={r.color}/>)}
              </Pie>
              <Tooltip content={<UtmTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          {rows.map(r => (
            <div key={r.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 4px", borderBottom: "1px solid #334155", fontSize: 13,
              opacity: r.value > 0 ? 1 : 0.4
            }}>
              <span style={{ color: "#cbd5e1" }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: r.color, marginRight: 8 }}/>
                {r.name}
              </span>
              <span>
                <strong style={{ color: "#f1f5f9" }}>{r.value}</strong>
                <span style={{ color: "#64748b", marginLeft: 8, display: "inline-block", minWidth: 34, textAlign: "right" }}>{r.pct}%</span>
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 4px", fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "#94a3b8" }}>Total</span>
            <span style={{ color: "#f1f5f9" }}>{totalForm}</span>
          </div>
          {!showUnknown && (
            <p style={{ margin: "2px 4px 0", fontSize: 11, color: "#94a3b8" }}>
              Excluded: {unknownCount} Unknown forms (no UTM source recorded).
            </p>
          )}
          <p style={{ margin: "6px 4px 0", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            HubSpot contact UTM source/medium · W1–W9 · counted per form (contacts who submitted both ENQ and APP count in each).
            Unknown = no UTMs recorded on the contact.
          </p>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d   = payload[0]?.payload;
  const enq = payload.find(p => p.dataKey === "enq")?.value ?? 0;
  const app = payload.find(p => p.dataKey === "app")?.value ?? 0;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 210
    }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.enq }}>● Enquiry form</span><strong>{enq}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: COLORS.app }}>● Application form</span><strong>{app}</strong>
        </div>
        <div style={{
          borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4,
          display: "flex", flexDirection: "column", gap: 3
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8" }}>Total</span><strong>{enq + app}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: COLORS.rate }}>App rate</span>
            <strong style={{ color: COLORS.rate }}>{d?.appRate > 0 ? d.appRate + "%" : "—"}</strong>
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
  const [view, setView] = useState("stacked");
  const [utmForm, setUtmForm] = useState("combined");
  const [showUnknown, setShowUnknown] = useState(true);

  return (
    <div style={{
      background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          color: "#64748b", fontSize: 12, textTransform: "uppercase",
          letterSpacing: "0.08em", margin: "0 0 6px"
        }}>
          HubSpot · SNA Level 5 &amp; 6 – Live and Online (CTID742)
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Form Submissions — Enquiry vs Application
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          10 Aug – 7 Oct 2026 · 8 full weeks + W9 partial ⚡ · Unique contacts · global dedup per form
        </p>
      </div>

      {/* Insight banner */}
      <div style={{
        background: "rgba(52,211,153,0.08)", border: "1px solid #34d399", borderRadius: 8,
        padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.7
      }}>
        <strong style={{ color: "#34d399" }}>📌 Key characteristic: </strong>
        CTID742 shows a <strong style={{ color: "#f1f5f9" }}>{overallApp}% overall application rate</strong> across
        8 full weeks plus a partial W9, with applications overtaking enquiries from late August.
        Peak volume was W4 (31 Aug–6 Sep) at 44 submissions with a 61% app rate; W7 (21–27 Sep)
        hit the highest app rate at 69% despite the lowest enquiry week (8). W9 (5–7 Oct ⚡) already has
        17 submissions after under 3 days — well ahead of the 29.6/wk average.
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Enquiries",    value: totalEnq,       sub: `avg ${avgEnq}/wk`,   color: COLORS.enq },
          { label: "Total Applications", value: totalApp,       sub: `avg ${avgApp}/wk`,   color: COLORS.app },
          { label: "Total Submissions",  value: total,          sub: "8 wks + W9 ⚡",       color: "#f1f5f9"  },
          { label: "Overall App Rate",   value: overallApp+"%", sub: "apps ÷ total",        color: "#34d399"  },
        ].map(k => (
          <div key={k.label} style={{
            background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 110px", border: "1px solid #334155"
          }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab id="stacked" active={view === "stacked"} onClick={setView}>Stacked</Tab>
        <Tab id="grouped" active={view === "grouped"} onClick={setView}>Side by side</Tab>
        <Tab id="rate"    active={view === "rate"}    onClick={setView}>Application rate %</Tab>
        <Tab id="utm"     active={view === "utm"}     onClick={setView}>Traffic source</Tab>
      </div>

      {/* Chart */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20
      }}>
        {view === "utm" ? <UtmPanel form={utmForm} setForm={setUtmForm}
          showUnknown={showUnknown} setShowUnknown={setShowUnknown}/> : (
        <ResponsiveContainer width="100%" height={300}>
          {view !== "rate" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}
              barCategoryGap={view === "stacked" ? "30%" : "22%"} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 50]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                formatter={v => v === "enq" ? "Enquiry form" : "Application form"}/>
              <Bar dataKey="enq" name="enq" fill={COLORS.enq}
                radius={view === "stacked" ? [0, 0, 0, 0] : [5, 5, 0, 0]}
                stackId={view === "stacked" ? "a" : undefined}/>
              <Bar dataKey="app" name="app" fill={COLORS.app}
                radius={[5, 5, 0, 0]}
                stackId={view === "stacked" ? "a" : undefined}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v + "%"} domain={[0, 110]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallApp} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallApp}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="appRate" name="Application rate" type="monotone"
                stroke="#34d399" strokeWidth={2.5}
                dot={{ r: 6, fill: "#34d399", strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk", "Dates", "Enquiry", "Application", "Total", "App Rate"].map((h, i) => (
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
              const wowEnq = i > 0 ? row.enq - data[i - 1].enq : null;
              const wowApp = i > 0 ? row.app - data[i - 1].app : null;
              const rateHigh = row.appRate >= 60 && row.total > 0;
              return (
                <tr key={i} style={{
                  borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                  background: i % 2 === 0 ? "#1e293b" : "#162032"
                }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>
                    {row.week}{!row.full && <span style={{ marginLeft: 4, color: "#fbbf24", fontSize: 10 }}>⚡ partial</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.enq, fontSize: 15 }}>
                    {row.enq}
                    {wowEnq !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4, color: wowEnq > 0 ? "#34d399" : wowEnq < 0 ? "#f87171" : "#64748b" }}>
                        {wowEnq > 0 ? `▲${wowEnq}` : wowEnq < 0 ? `▼${Math.abs(wowEnq)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.app, fontSize: 15 }}>
                    {row.app}
                    {wowApp !== null && (
                      <span style={{ fontSize: 10, marginLeft: 4, color: wowApp > 0 ? "#34d399" : wowApp < 0 ? "#f87171" : "#64748b" }}>
                        {wowApp > 0 ? `▲${wowApp}` : wowApp < 0 ? `▼${Math.abs(wowApp)}` : "="}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{row.total}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12, color: rateHigh ? "#34d399" : COLORS.rate }}>
                    {row.total > 0 ? row.appRate + "%" : "—"}{rateHigh ? " 🔥" : ""}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.enq, fontSize: 15 }}>{totalEnq}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.app, fontSize: 15 }}>{totalApp}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: "#f1f5f9", fontSize: 15 }}>{total}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: "#34d399", fontSize: 13 }}>{overallApp}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center" }}>
        Updated 7 Oct 2026 · W1–W9 processed from fresh CSV exports (Irish local time) · W9 partial (Mon 5 – Wed 7 Oct, to 10:00) · no duplicates detected · traffic source from HubSpot contact UTMs, 8 Oct 2026
      </p>

    </div>
  );
}
