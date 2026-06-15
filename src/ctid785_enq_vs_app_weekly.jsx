import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

export const data = [
  { week: "14–20 Apr",    enq: 5, app: 0, full: true  },
  { week: "21–27 Apr",    enq: 3, app: 0, full: true  },
  { week: "28 Apr–4 May", enq: 5, app: 0, full: true  },
  { week: "5–11 May",     enq: 2, app: 0, full: true  },
  { week: "12–18 May",    enq: 5, app: 0, full: true  },
  { week: "19–25 May",    enq: 7, app: 0, full: true  },
  { week: "26 May–1 Jun", enq: 4, app: 0, full: true  },
  { week: "2–7 Jun ⚡",   enq: 6, app: 0, full: false },
].map(d => ({ ...d, total: d.enq + d.app, appRate: (d.enq + d.app) > 0 ? +(d.app / (d.enq + d.app) * 100).toFixed(0) : 0 }));

const fullWeeks  = data.filter(d => d.full);
const totalEnq   = data.reduce((s,d) => s + d.enq, 0);
const totalApp   = data.reduce((s,d) => s + d.app, 0);
const total      = totalEnq + totalApp;
const avgEnq     = (fullWeeks.reduce((s,d) => s + d.enq, 0) / fullWeeks.length).toFixed(1);
const avgApp     = (fullWeeks.reduce((s,d) => s + d.app, 0) / fullWeeks.length).toFixed(1);
const overallApp = total > 0 ? Math.round(totalApp / total * 100) : 0;

const COLORS = { enq:"#fb923c", app:"#38bdf8", rate:"#a78bfa" };

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
      {!d?.full && <p style={{ margin:"6px 0 0", color:"#fbbf24", fontSize:11 }}>⚡ Partial week</p>}
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
  const [view, setView] = useState("grouped");

  return (
    <div style={{ background:"#0f172a", minHeight:"100vh", padding:"32px 24px",
      fontFamily:"'Inter','Segoe UI',sans-serif", color:"#f1f5f9" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <p style={{ color:"#64748b", fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 6px" }}>
          HubSpot · ELC Level 5 – Live and Online (CTID785)
        </p>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:700, color:"#f8fafc" }}>
          Weekly Form Submissions — Enquiry vs Application
        </h1>
        <p style={{ margin:0, color:"#94a3b8", fontSize:13 }}>
          14 Apr – 7 Jun 2026 · Unique contacts · last form only per contact
        </p>
      </div>

      {/* Notable insight banner */}
      <div style={{ background:"rgba(251,191,36,0.08)", border:"1px solid #fbbf24", borderRadius:8,
        padding:"10px 14px", marginBottom:20, fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>
        <strong style={{ color:"#fbbf24" }}>⚠️ Key finding: </strong>
        CTID785 shows <strong style={{ color:"#f1f5f9" }}>0 application form submissions</strong> across all 8 weeks — all {total} contacts are enquiry-only.
        This may indicate the application form is not yet live, not linked in communications, or that the course cohort date has not been announced.
        <strong style={{ color:"#fbbf24" }}> Action recommended: verify application form is published and linked for this course.</strong>
      </div>

      {/* KPIs */}
      <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { label:"Total Enquiries",    value:totalEnq,        sub:`avg ${avgEnq}/wk`,  color:COLORS.enq  },
          { label:"Total Applications", value:totalApp,        sub:"none received",      color:"#64748b"   },
          { label:"Total Submissions",  value:total,           sub:"8 weeks",            color:"#f1f5f9"   },
          { label:"Overall App Rate",   value:overallApp+"%",  sub:"apps ÷ total",       color:"#fbbf24"   },
          { label:"This week (Sat)",    value:`${data[7].enq}e / ${data[7].app}a`, sub:"⚡ partial", color:"#fbbf24" },
        ].map(k => (
          <div key={k.label} style={{ background:"#1e293b", borderRadius:10, padding:"12px 18px",
            flex:"1 1 110px", border:"1px solid #334155" }}>
            <p style={{ margin:"0 0 3px", fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>{k.label}</p>
            <p style={{ margin:"0 0 2px", fontSize:22, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</p>
            <p style={{ margin:0, fontSize:10, color:"#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Comparison strip */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { label:"CTID742 (SNA L5&6)",   total:138, rate:38 },
          { label:"CTID786 (Care Skills)", total:81,  rate:47 },
          { label:"CTID379 (SNA L6)",      total:39,  rate:67 },
          { label:"CTID785 (ELC L5)",      total,     rate:overallApp, highlight:true },
        ].map(c => (
          <div key={c.label} style={{ background: c.highlight ? "rgba(251,191,36,0.08)" : "#1e293b",
            border:`1px solid ${c.highlight ? "#fbbf24" : "#334155"}`,
            borderRadius:8, padding:"8px 14px", fontSize:12, flex:"1 1 150px" }}>
            <span style={{ color:"#64748b" }}>{c.label}: </span>
            <strong style={{ color:"#f1f5f9" }}>{c.total} submissions</strong>
            <span style={{ color:"#64748b" }}> · </span>
            <strong style={{ color: c.highlight ? "#fbbf24" : COLORS.rate }}>{c.rate}% app rate</strong>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <Tab id="grouped" active={view==="grouped"} onClick={setView}>Side by side</Tab>
        <Tab id="stacked" active={view==="stacked"} onClick={setView}>Stacked</Tab>
        <Tab id="rate"    active={view==="rate"}    onClick={setView}>Application rate %</Tab>
      </div>

      {/* Chart */}
      <div style={{ background:"#1e293b", borderRadius:12, padding:"24px 16px 16px",
        border:"1px solid #334155", marginBottom:20 }}>
        <ResponsiveContainer width="100%" height={300}>
          {view === "rate" ? (
            <ComposedChart data={data} margin={{ top:8, right:20, left:-8, bottom:8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={{ stroke:"#334155" }} tickLine={false}/>
              <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v+"%"} domain={[0,110]}/>
              <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={0} stroke="#fbbf24" strokeDasharray="4 3"
                label={{ value:"App rate: 0%", fill:"#fbbf24", fontSize:11, position:"insideTopRight" }}/>
              <Line dataKey="appRate" name="Application rate" type="monotone"
                stroke="#a78bfa" strokeWidth={2.5}
                dot={{ r:5, fill:"#a78bfa", strokeWidth:0 }} connectNulls/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top:8, right:20, left:-8, bottom:8 }}
              barCategoryGap={view==="stacked"?"30%":"22%"} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={{ stroke:"#334155" }} tickLine={false}/>
              <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} axisLine={false} tickLine={false} domain={[0,10]}/>
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
                    color: rateHigh ? "#34d399" : "#64748b" }}>
                    {row.total>0 ? row.appRate+"%" : "—"}{rateHigh?" 🔥":""}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background:"#0f172a", borderTop:"2px solid #334155" }}>
              <td colSpan={2} style={{ padding:"11px 14px", color:"#94a3b8", fontWeight:700, fontSize:10, textTransform:"uppercase" }}>Total</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:COLORS.enq, fontSize:15 }}>{totalEnq}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:"#64748b", fontSize:15 }}>{totalApp}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:800, color:"#f1f5f9", fontSize:15 }}>{total}</td>
              <td style={{ padding:"11px 14px", textAlign:"center", fontWeight:700, color:"#fbbf24", fontSize:13 }}>{overallApp}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
