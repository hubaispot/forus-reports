import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  PieChart, Pie, Cell
} from "recharts";

// ── CTID379 — SNA Level 6 – Live and Online ───────────────────────────────
// Generated: 7 Oct 2026 | W1 10 Aug → W9 5–7 Oct 2026 (W9 partial ⚡)
// ENQ: 81 raw → 81 unique | APP: 7 raw → 7 unique (0 dups)
// 0 rows outside window | CSV exports (local Irish time) | latest ENQ 1 Oct, latest APP 30 Sep
// Traffic source tab added 7 Oct 2026 — UTM categories below
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "10 Aug–16 Aug",    enq: 6,  app: 2, full: true  },
  { week: "17 Aug–23 Aug",    enq: 3,  app: 0, full: true  },
  { week: "24 Aug–30 Aug",    enq: 4,  app: 0, full: true  },
  { week: "31 Aug–6 Sep",     enq: 14, app: 1, full: true  },
  { week: "7 Sep–13 Sep",     enq: 18, app: 3, full: true  },
  { week: "14 Sep–20 Sep",    enq: 9,  app: 0, full: true  },
  { week: "21 Sep–27 Sep",    enq: 21, app: 0, full: true  },
  { week: "28 Sep–4 Oct",     enq: 6,  app: 1, full: true  },
  { week: "5 Oct–7 Oct ⚡",   enq: 0,  app: 0, full: false },
].map(d => ({ ...d, total: d.enq + d.app, appRate: (d.enq + d.app) > 0 ? +(d.app / (d.enq + d.app) * 100).toFixed(0) : 0 }));

const fullWeeks  = data.filter(d => d.full);
const totalEnq   = data.reduce((s,d) => s + d.enq, 0);
const totalApp   = data.reduce((s,d) => s + d.app, 0);
const total      = totalEnq + totalApp;
const avgEnq     = (fullWeeks.reduce((s,d) => s + d.enq, 0) / fullWeeks.length).toFixed(1);
const avgApp     = (fullWeeks.reduce((s,d) => s + d.app, 0) / fullWeeks.length).toFixed(1);
const overallApp = Math.round(totalApp / total * 100);

const COLORS = { enq:"#fb923c", app:"#38bdf8", rate:"#a78bfa" };

// ── UTM TRAFFIC SOURCE (W1–W9, deduped contacts) ─────────────────────────────
// Mapping (UTM Source / Medium): adwords/ppc → Google Ads
// fb or ig / placement (e.g. Facebook_Mobile_Reels) → Meta Ads
// {{utm_source}} / Facebook_Mobile_Reels → Meta Ads · {{utm_source}} / blank → Unknown
// {{site_source_name}} / {{placement}} (unfilled Meta placeholders) → Unknown
// hs_automation → Workflow Email · hs_email/email → Marketing Email
// website → Website · chatgpt.com → AI / ChatGPT · blank/blank → Unknown
export const utmData = [
  { name: "Google Ads",       enq:   0, app:   0, color: "#4f8ef7" },
  { name: "Meta Ads",         enq:  42, app:   1, color: "#818cf8" },
  { name: "Workflow Email",   enq:   0, app:   0, color: "#f472b6" },
  { name: "Marketing Email",  enq:   1, app:   0, color: "#fbbf24" },
  { name: "Website",          enq:  16, app:   0, color: "#34d399" },
  { name: "AI / ChatGPT",     enq:   1, app:   0, color: "#2dd4bf" },
  { name: "Unknown",          enq:  21, app:   6, color: "#475569" },
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

const UtmPanel = ({ form, setForm }) => {
  const totalForm = utmData.reduce((s, d) => s + d[form], 0);
  // Categories with no submissions across both forms are hidden entirely
  const rows = utmData.filter(d => d.combined > 0).map(d => ({
    name: d.name, color: d.color, value: d[form],
    pct: totalForm > 0 ? Math.round(d[form] / totalForm * 100) : 0
  }));
  const pieRows = rows.filter(r => r.value > 0);
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "center" }}>
        {UTM_FORMS.map(f => (
          <Tab key={f.id} id={f.id} active={form === f.id} onClick={setForm}>{f.label}</Tab>
        ))}
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
          <p style={{ margin: "6px 4px 0", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            UTM source/medium captured on the form submission · W1–W9 · deduped contacts. Unknown = no UTMs recorded or unfilled ad placeholders.
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
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:8,
      padding:"10px 14px", fontSize:13, color:"#f1f5f9", minWidth:210 }}>
      <p style={{ fontWeight:700, marginBottom:8, color:"#cbd5e1" }}>{label}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:COLORS.enq }}>● Enquiry form</span><strong>{enq}</strong>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:COLORS.app }}>● Application form</span><strong>{app}</strong>
        </div>
        <div style={{ borderTop:"1px solid #334155", marginTop:4, paddingTop:4,
          display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#94a3b8" }}>Total</span><strong>{enq+app}</strong>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:COLORS.rate }}>App rate</span>
            <strong style={{ color:COLORS.rate }}>{d?.appRate}%</strong>
          </div>
        </div>
      </div>
      {!d?.full && <p style={{ margin:"6px 0 0", color:"#fbbf24", fontSize:11 }}>⚡ Partial week (Mon–Wed)</p>}
    </div>
  );
};

const Tab = ({id, active, onClick, children}) => (
  <button onClick={() => onClick(id)} style={{
    padding:"6px 16px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
    border:"1px solid",
    borderColor: active ? "#38bdf8" : "#334155",
    background:  active ? "rgba(56,189,248,0.15)" : "transparent",
    color:       active ? "#38bdf8" : "#64748b"
  }}>{children}</button>
);

export default function App() {
  const [view, setView] = useState("stacked");
  const [utmForm, setUtmForm] = useState("combined");

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", padding:"32px 24px",
      fontFamily:"'Inter','Segoe UI',sans-serif", color:"#f1f5f9" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <p style={{ color:"#64748b", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px" }}>
          HubSpot · SNA Level 6 – Live and Online (CTID379)
        </p>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"#f8fafc" }}>
          Weekly Form Submissions — Enquiry vs Application
        </h1>
        <p style={{ margin:0, color:"#94a3b8", fontSize:13 }}>
          10 Aug – 7 Oct 2026 · Unique contacts · last form only per contact · W9 partial ⚡
        </p>
      </div>

      {/* Notable insight banner */}
      <div style={{ background:"rgba(251,146,60,0.08)", border:"1px solid #fb923c", borderRadius:8,
        padding:"10px 14px", marginBottom:20, fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>
        <strong style={{ color:"#fb923c" }}>📌 Note: </strong>
        CTID379 application counts are likely <strong style={{ color:"#f1f5f9" }}>understated</strong> —
        applications may be routing to the B2C Single Modules pipeline rather than the CTID379 application form.
        Cross-reference the B2C Single Modules report for a fuller picture of CTID379 applications.
        Overall app rate from this form: <strong style={{ color:"#f1f5f9" }}>{overallApp}%</strong>.
      </div>

      {/* KPIs */}
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { label:"Total Enquiries",    value:totalEnq,        sub:`avg ${avgEnq}/wk (W1–W8)`,  color:COLORS.enq  },
          { label:"Total Applications", value:totalApp,        sub:`avg ${avgApp}/wk (W1–W8)`,  color:COLORS.app  },
          { label:"Total Submissions",  value:total,           sub:"W1–W9",                      color:"#f1f5f9"   },
          { label:"Overall App Rate",   value:overallApp+"%",  sub:"apps ÷ total",               color:"#34d399"   },
          { label:"This week (Mon–Wed)", value:`${data[data.length-1].enq}e / ${data[data.length-1].app}a`, sub:"⚡ W9 partial", color:"#fbbf24" },
        ].map(k => (
          <div key={k.label} style={{ background:"#1e293b", borderRadius:10, padding:"12px 18px",
            flex:"1 1 110px", border:"1px solid #334155" }}>
            <p style={{ margin:"0 0 3px", fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>{k.label}</p>
            <p style={{ margin:"0 0 2px", fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</p>
            <p style={{ margin:0, fontSize:10, color:"#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <Tab id="stacked" active={view==="stacked"} onClick={setView}>Stacked</Tab>
        <Tab id="grouped" active={view==="grouped"} onClick={setView}>Side by side</Tab>
        <Tab id="rate"    active={view==="rate"}    onClick={setView}>Application rate %</Tab>
        <Tab id="utm"     active={view==="utm"}     onClick={setView}>Traffic source</Tab>
      </div>

      {/* Chart */}
      <div style={{ background:"#1e293b", borderRadius:12, padding:"24px 16px 16px",
        border:"1px solid #334155", marginBottom:20 }}>
        {view === "utm" ? <UtmPanel form={utmForm} setForm={setUtmForm}/> : (
        <ResponsiveContainer width="100%" height={300}>
          {view === "rate" ? (
            <ComposedChart data={data} margin={{ top:8, right:20, left:-8, bottom:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={{ stroke:"#334155" }} tickLine={false}/>
              <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v+"%"} domain={[0,110]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallApp} stroke="#64748b" strokeDasharray="4 3"
                label={{ value:`Avg ${overallApp}%`, fill:"#64748b", fontSize:11, position:"insideTopRight" }}/>
              <Line dataKey="appRate" name="Application rate" type="monotone"
                stroke="#34d399" strokeWidth={2.5}
                dot={{ r:6, fill:"#34d399", strokeWidth:0 }} connectNulls/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top:8, right:20, left:-8, bottom:8 }}
              barCategoryGap={view==="stacked"?"30%":"22%"} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={{ stroke:"#334155" }} tickLine={false}/>
              <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} domain={[0,22]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop:16, fontSize:12 }}
                formatter={v => v==="enq" ? "Enquiry form" : "Application form"}/>
              <Bar dataKey="enq" name="enq" fill={COLORS.enq}
                radius={view==="stacked"?[0,0,0,0]:[5,5,0,0]}
                stackId={view==="stacked"?"a":undefined}/>
              <Bar dataKey="app" name="app" fill={COLORS.app}
                radius={[5,5,0,0]}
                stackId={view==="stacked"?"a":undefined}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      <div style={{ background:"#1e293b", borderRadius:12, border:"1px solid #334155", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"#0f172a" }}>
              {["Wk","Dates","Enquiry","Application","Total","App Rate"].map((h,i) => (
                <th key={h} style={{ padding:"11px 14px", textAlign:i<=1?"left":"center",
                  color:"#64748b", fontWeight:600, fontSize:11, textTransform:"uppercase",
                  letterSpacing:"0.06em", borderBottom:"1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowEnq = i>0 ? row.enq - data[i-1].enq : null;
              const wowApp = i>0 ? row.app - data[i-1].app : null;
              const rateHigh = row.appRate >= 60 && row.total > 0;
              return (
                <tr key={i} style={{ borderBottom:i<data.length-1?"1px solid #1e2d3d":"none",
                  background:i%2===0?"#1e293b":"#162032" }}>
                  <td style={{ padding:"11px 14px", color:"#64748b", fontWeight:700 }}>W{i+1}</td>
                  <td style={{ padding:"11px 14px", color:"#cbd5e1" }}>
                    {row.week}{!row.full&&<span style={{ marginLeft:5, color:"#fbbf24", fontSize:10 }}>⚡</span>}
                  </td>
                  <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, color:COLORS.enq, fontSize:15 }}>
                    {row.enq}
                    {wowEnq!==null&&<span style={{ fontSize:10, marginLeft:4, color:wowEnq>0?"#34d399":wowEnq<0?"#f87171":"#64748b" }}>
                      {wowEnq>0?`▲${wowEnq}`:wowEnq<0?`▼${Math.abs(wowEnq)}`:"="}
                    </span>}
                  </td>
                  <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, color:COLORS.app, fontSize:15 }}>
                    {row.app}
                    {wowApp!==null&&<span style={{ fontSize:10, marginLeft:4, color:wowApp>0?"#34d399":wowApp<0?"#f87171":"#64748b" }}>
                      {wowApp>0?`▲${wowApp}`:wowApp<0?`▼${Math.abs(wowApp)}`:"="}
                    </span>}
                  </td>
                  <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, color:"#f1f5f9", fontSize:15 }}>{row.total}</td>
                  <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, fontSize:12,
                    color: rateHigh ? "#34d399" : COLORS.rate }}>
                    {row.total>0 ? row.appRate+"%" : "—"}{rateHigh?" 🔥":""}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background:"#0f172a", borderTop:"2px solid #334155" }}>
              <td colSpan={2} style={{ padding:"11px 14px", color:"#94a3b8", fontWeight:700, fontSize:10, textTransform:"uppercase" }}>Total</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:COLORS.enq, fontSize:15 }}>{totalEnq}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:COLORS.app, fontSize:15 }}>{totalApp}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:"#f1f5f9", fontSize:15 }}>{total}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, color:"#34d399", fontSize:13 }}>{overallApp}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop:12, fontSize:11, color:"#475569", textAlign:"center" }}>
        CTID379 · SNA L6 LO · Generated 7 Oct 2026 · ENQ 81 raw → 81 unique · APP 7 raw → 7 unique (0 dups) · Latest ENQ 1 Oct, latest APP 30 Sep · W9 partial ⚡ Mon–Wed
      </p>
    </div>
  );
}
