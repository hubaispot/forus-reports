import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ── IMPORTS — course components + exported data arrays ────────────────────────
// SNA — Enquiry & Application
import CTID742enq,  { data as sna742Raw   } from "./ctid742_enq_vs_app_weekly";
import CTID379enq,  { data as sna379Raw   } from "./ctid379_enq_vs_app_weekly";
import SNAOAenq,    { data as snaOARaw    } from "./sna_online_anytime_enq_vs_app_weekly";
// SNA — Revenue
import CTID742rev,  { data as sna742RevRaw  } from "./ctid742_combined_weekly";
import CTID379rev,  { data as sna379RevRaw  } from "./ctid379_combined_weekly";
import SNAOArev,    { data as snaOARevRaw   } from "./sna_oa_combined_weekly";
// Healthcare — Enquiry & Application
import CTID771enq,  { data as hc771Raw    } from "./ctid771_enq_vs_app_weekly";
import CTID786enq,  { data as hc786Raw    } from "./ctid786_enq_vs_app_weekly";
// ELC — Enquiry & Application
import CTID785enq,  { data as elc785Raw   } from "./ctid785_enq_vs_app_weekly";
import M5M22413enq, { data as elc5mRaw    } from "./5m22413_enq_vs_app_weekly";

// ── NORMALISE — ensure every row has the fields the combined merge needs ───────
// enq/app files: add total + appRate if not already present
const normaliseEnq = rows => rows.map(d => ({
  ...d,
  total:   d.total   ?? (d.enq + d.app),
  appRate: d.appRate ?? ((d.enq + d.app) > 0 ? +(d.app / (d.enq + d.app) * 100).toFixed(0) : 0),
}));

// revenue files: add cr if not already present
const normaliseRev = rows => rows.map(d => ({
  ...d,
  cr: d.cr ?? (d.forms > 0 ? +(d.regs / d.forms * 100).toFixed(1) : 0),
}));

const sna742Data    = normaliseEnq(sna742Raw);
const sna379Data    = normaliseEnq(sna379Raw);
const snaOAData     = normaliseEnq(snaOARaw);
const hc771Data     = normaliseEnq(hc771Raw);
const hc786Data     = normaliseEnq(hc786Raw);
const elc785Data    = normaliseEnq(elc785Raw);
const elc5mData     = normaliseEnq(elc5mRaw);
const sna742RevData = normaliseRev(sna742RevRaw);
const sna379RevData = normaliseRev(sna379RevRaw);
const snaOARevData  = normaliseRev(snaOARevRaw);

// ── MERGE HELPERS ─────────────────────────────────────────────────────────────
function mergeEnqApp(datasets) {
  const len = Math.max(...datasets.map(d => d.length));
  return Array.from({ length: len }, (_, i) => {
    const week = datasets.find(ds => ds[i]?.week)?.[i].week ?? `W${i + 1}`;
    const enq  = datasets.reduce((s, ds) => s + (ds[i]?.enq ?? 0), 0);
    const app  = datasets.reduce((s, ds) => s + (ds[i]?.app ?? 0), 0);
    const full = datasets.every(ds => ds[i]?.full !== false);
    return { week, enq, app, full, total: enq + app, appRate: (enq + app) > 0 ? +(app / (enq + app) * 100).toFixed(0) : 0 };
  });
}

function mergeRevenue(datasets) {
  const len = Math.max(...datasets.map(d => d.length));
  return Array.from({ length: len }, (_, i) => {
    const week    = datasets.find(ds => ds[i]?.week)?.[i].week ?? `W${i + 1}`;
    const forms   = datasets.reduce((s, ds) => s + (ds[i]?.forms   ?? 0), 0);
    const regs    = datasets.reduce((s, ds) => s + (ds[i]?.regs    ?? 0), 0);
    const revenue = datasets.reduce((s, ds) => s + (ds[i]?.revenue ?? 0), 0);
    const full    = datasets.every(ds => ds[i]?.full !== false);
    return { week, forms, regs, revenue, full, cr: forms > 0 ? +(regs / forms * 100).toFixed(1) : 0 };
  });
}

const fmt = n => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const COLORS = { enq: "#fb923c", app: "#38bdf8", rate: "#a78bfa", forms: "#fb923c", regs: "#38bdf8", rev: "#34d399", cr: "#a78bfa" };

// ── INSIGHTS ──────────────────────────────────────────────────────────────────
const INSIGHTS = {
  "742-enqApp":    { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  text: "CTID742 is accelerating strongly — W8 (1–7 Jun) is the peak week at 35 total submissions (20 enquiries + 15 applications). Overall app rate is 38% across 9 weeks." },
  "379-enqApp":    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  text: "CTID379 has a consistently high application rate (67%) — applications outnumber or match enquiries in 7 of 9 weeks. Strong direct-intent audience." },
  "snaOA-enqApp":  { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  text: "SNA Online Anytime (CTID490 + CTID423) shows strong direct-application intent — 59% overall app rate across 9 weeks, with W2, W3 and W7 seeing applications only and zero enquiries. Low but steady volume averaging 1.1 applications per completed week." },
  "742-revenue":   { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  text: "CTID742 generated €27,296.81 in expected revenue from 38 registrations across 9 weeks. W8 was the peak revenue week at €7,983.55 in a single week." },
  "379-revenue":   { color: "#34d399", bg: "rgba(52,211,153,0.08)",  text: "CTID379 generated €14,850.00 in expected revenue from 33 registrations. W7 (25–31 May) was the standout week with 7 registrations from only 3 forms." },
  "snaOA-revenue": { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  text: "SNA Online Anytime generated €4,577.60 in expected revenue from 11 registrations across 9 weeks. Overall conversion rate is 61%. W2 and W4 show direct Paythen registrations with no prior HubSpot form — some learners find and register without enquiring first." },
  "771-enqApp":    { color: "#fb923c", bg: "rgba(251,146,60,0.08)",  text: "CTID771 is heavily enquiry-led — only 2 of 16 submissions over 8 weeks were applications (13% app rate). Applications are isolated to W2 and W4." },
  "786-enqApp":    { color: "#34d399", bg: "rgba(52,211,153,0.08)",  text: "CTID786 shows strong application intent — W4–W8 all delivered 57%+ app rates with 3 of those 5 weeks hitting 60%+. Overall app rate is 47%." },
  "785-enqApp":    { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  text: "CTID785 shows 0 application form submissions across all 8 weeks — all contacts are enquiry-only. Action recommended: verify application form is published and linked." },
  "5m22413-enqApp":{ color: "#34d399", bg: "rgba(52,211,153,0.08)",  text: "5M22413 has an exceptionally high application rate (67%) — applications dominate enquiries in 5 of 7 completed weeks. Many contacts go directly to the application form." },
};

// ── NAV STRUCTURE ─────────────────────────────────────────────────────────────
const NAV = {
  SNA: {
    label: "SNA", color: "#38bdf8",
    enqApp: {
      courses: [
        { id: "742",      label: "CTID742 · SNA L5&6",      Component: CTID742enq, data: sna742Data,  insightKey: "742-enqApp"     },
        { id: "379",      label: "CTID379 · SNA L6 Online",  Component: CTID379enq, data: sna379Data,  insightKey: "379-enqApp"     },
        { id: "snaOA",    label: "SNA Online Anytime",        Component: SNAOAenq,   data: snaOAData,  insightKey: "snaOA-enqApp"   },
      ],
      get combined() { return mergeEnqApp([sna742Data, sna379Data, snaOAData]); },
    },
    revenue: {
      courses: [
        { id: "742rev",   label: "CTID742 · SNA L5&6",      Component: CTID742rev, data: sna742RevData, insightKey: "742-revenue"   },
        { id: "379rev",   label: "CTID379 · SNA L6 Online",  Component: CTID379rev, data: sna379RevData, insightKey: "379-revenue"   },
        { id: "snaOArev", label: "SNA Online Anytime",        Component: SNAOArev,   data: snaOARevData,  insightKey: "snaOA-revenue" },
      ],
      get combined() { return mergeRevenue([sna742RevData, sna379RevData, snaOARevData]); },
    },
  },
  Healthcare: {
    label: "Healthcare", color: "#f87171",
    enqApp: {
      courses: [
        { id: "771", label: "CTID771 · Healthcare MA L5", Component: CTID771enq, data: hc771Data, insightKey: "771-enqApp" },
        { id: "786", label: "CTID786 · Care Skills",      Component: CTID786enq, data: hc786Data, insightKey: "786-enqApp" },
      ],
      get combined() { return mergeEnqApp([hc771Data, hc786Data]); },
    },
    revenue: { placeholder: true },
  },
  ELC: {
    label: "ELC", color: "#34d399",
    enqApp: {
      courses: [
        { id: "785",     label: "CTID785 · ELC L5 LO", Component: CTID785enq,  data: elc785Data, insightKey: "785-enqApp"      },
        { id: "5m22413", label: "5M22413 · ELC L5&6",  Component: M5M22413enq, data: elc5mData,  insightKey: "5m22413-enqApp"  },
      ],
      get combined() { return mergeEnqApp([elc785Data, elc5mData]); },
    },
    revenue: { placeholder: true },
  },
  Business: {
    label: "Business", color: "#a78bfa",
    placeholder: true,
  },
};

// ── SHARED UI COMPONENTS ──────────────────────────────────────────────────────
const NavBtn = ({ active, color = "#38bdf8", onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "13px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "none", background: "transparent",
    color: active ? color : "#475569",
    borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
    transition: "all 0.15s", whiteSpace: "nowrap"
  }}>{children}</button>
);

const ToggleBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
    borderColor: active ? "#38bdf8" : "#334155",
    background:  active ? "rgba(56,189,248,0.15)" : "transparent",
    color:       active ? "#38bdf8" : "#64748b"
  }}>{children}</button>
);

const EnqTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const enq = payload.find(p => p.dataKey === "enq")?.value ?? 0;
  const app = payload.find(p => p.dataKey === "app")?.value ?? 0;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 200 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>{d?.week}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: COLORS.enq }}>● Enquiry</span><strong>{enq}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: COLORS.app }}>● Application</span><strong>{app}</strong></div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#94a3b8" }}>Total</span><strong>{enq + app}</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: COLORS.rate }}>App rate</span><strong style={{ color: COLORS.rate }}>{d?.appRate}%</strong></div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week</p>}
    </div>
  );
};

const RevTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 210 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>{d?.week}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: COLORS.forms }}>● Forms</span><strong>{d?.forms}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span style={{ color: COLORS.regs }}>● Registrations</span><strong>{d?.regs}</strong></div>
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: COLORS.cr }}>Conv. rate</span><strong style={{ color: COLORS.cr }}>{d?.cr}%</strong></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: COLORS.rev }}>Revenue</span><strong style={{ color: COLORS.rev }}>{fmt(d?.revenue ?? 0)}</strong></div>
        </div>
      </div>
      {!d?.full && <p style={{ margin: "6px 0 0", color: "#fbbf24", fontSize: 11 }}>⚡ Partial week</p>}
    </div>
  );
};

// ── ENQ VS APP COMBINED VIEW ──────────────────────────────────────────────────
function EnqAppCombined({ data, title, subtitle }) {
  const [view, setView] = useState("grouped");
  const fullWeeks  = data.filter(d => d.full);
  const totalEnq   = data.reduce((s, d) => s + d.enq, 0);
  const totalApp   = data.reduce((s, d) => s + d.app, 0);
  const total      = totalEnq + totalApp;
  const avgEnq     = fullWeeks.length ? (fullWeeks.reduce((s,d) => s+d.enq,0)/fullWeeks.length).toFixed(1) : "—";
  const avgApp     = fullWeeks.length ? (fullWeeks.reduce((s,d) => s+d.app,0)/fullWeeks.length).toFixed(1) : "—";
  const overallApp = total > 0 ? Math.round(totalApp / total * 100) : 0;
  const maxY       = Math.ceil(Math.max(...data.map(d => view==="stacked" ? d.total : Math.max(d.enq, d.app))) * 1.2);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{subtitle}</p>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>{title}</h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Weekly Form Submissions — Enquiry vs Application · Week-aligned totals</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Enquiries",    value: totalEnq,       sub: `avg ${avgEnq}/wk`, color: COLORS.enq },
          { label: "Total Applications", value: totalApp,       sub: `avg ${avgApp}/wk`, color: COLORS.app },
          { label: "Total Submissions",  value: total,          sub: `${data.length} weeks`, color: "#f1f5f9" },
          { label: "Overall App Rate",   value: overallApp+"%", sub: "apps ÷ total",     color: "#34d399"  },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 18px", flex: "1 1 100px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <ToggleBtn active={view==="grouped"} onClick={() => setView("grouped")}>Side by side</ToggleBtn>
        <ToggleBtn active={view==="stacked"} onClick={() => setView("stacked")}>Stacked</ToggleBtn>
        <ToggleBtn active={view==="rate"}    onClick={() => setView("rate")}>App Rate %</ToggleBtn>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px", border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          {view === "rate" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v+"%"} domain={[0,110]}/>
              <Tooltip content={<EnqTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallApp} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallApp}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="appRate" type="monotone" stroke={COLORS.rate} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.rate, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap={view==="stacked"?"30%":"22%"} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, maxY]}/>
              <Tooltip content={<EnqTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} formatter={v => v==="enq"?"Enquiry form":"Application form"}/>
              <Bar dataKey="enq" name="enq" fill={COLORS.enq} radius={view==="stacked"?[0,0,0,0]:[5,5,0,0]} stackId={view==="stacked"?"a":undefined}/>
              <Bar dataKey="app" name="app" fill={COLORS.app} radius={[5,5,0,0]} stackId={view==="stacked"?"a":undefined}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk","Week","Enquiry","Application","Total","App Rate"].map((h,i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i<=1?"left":"center", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowEnq   = i > 0 ? row.enq - data[i-1].enq : null;
              const wowApp   = i > 0 ? row.app - data[i-1].app : null;
              const rateHigh = row.appRate >= 60 && row.total > 0;
              return (
                <tr key={i} style={{ borderBottom: i<data.length-1?"1px solid #1e2d3d":"none", background: i%2===0?"#1e293b":"#162032" }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i+1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}{!row.full&&<span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.enq, fontSize: 15 }}>
                    {row.enq}{wowEnq!==null&&<span style={{ fontSize: 10, marginLeft: 4, color: wowEnq>0?"#34d399":wowEnq<0?"#f87171":"#64748b" }}>{wowEnq>0?`▲${wowEnq}`:wowEnq<0?`▼${Math.abs(wowEnq)}`:"="}</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.app, fontSize: 15 }}>
                    {row.app}{wowApp!==null&&<span style={{ fontSize: 10, marginLeft: 4, color: wowApp>0?"#34d399":wowApp<0?"#f87171":"#64748b" }}>{wowApp>0?`▲${wowApp}`:wowApp<0?`▼${Math.abs(wowApp)}`:"="}</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>{row.total}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12, color: rateHigh?"#34d399":COLORS.rate }}>{row.total>0?row.appRate+"%":"—"}{rateHigh?" 🔥":""}</td>
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
    </div>
  );
}

// ── REVENUE COMBINED VIEW ─────────────────────────────────────────────────────
function RevenueCombined({ data, title, subtitle }) {
  const [view, setView] = useState("grouped");
  const fullWeeks  = data.filter(d => d.full);
  const totalForms = data.reduce((s, d) => s + d.forms, 0);
  const totalRegs  = data.reduce((s, d) => s + d.regs, 0);
  const totalRev   = data.reduce((s, d) => s + d.revenue, 0);
  const avgForms   = fullWeeks.length ? (fullWeeks.reduce((s,d)=>s+d.forms,0)/fullWeeks.length).toFixed(1) : "—";
  const avgRegs    = fullWeeks.length ? (fullWeeks.reduce((s,d)=>s+d.regs,0)/fullWeeks.length).toFixed(1) : "—";
  const overallCR  = totalForms > 0 ? +(totalRegs / totalForms * 100).toFixed(1) : 0;
  const maxRev     = Math.ceil(Math.max(...data.map(d => d.revenue)) * 1.2);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>{subtitle}</p>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>{title}</h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>Weekly Revenue — Forms vs Registrations · Week-aligned totals</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Forms",   value: totalForms,    sub: `avg ${avgForms}/wk`, color: COLORS.forms },
          { label: "Total Regs",    value: totalRegs,     sub: `avg ${avgRegs}/wk`,  color: COLORS.regs  },
          { label: "Conv. Rate",    value: overallCR+"%", sub: "regs ÷ forms",       color: COLORS.cr    },
          { label: "Total Revenue", value: fmt(totalRev), sub: `${data.length} weeks`, color: COLORS.rev },
        ].map(k => (
          <div key={k.label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 18px", flex: "1 1 100px", border: "1px solid #334155" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: k.label==="Total Revenue"?16:22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <ToggleBtn active={view==="grouped"} onClick={() => setView("grouped")}>Forms vs Registrations</ToggleBtn>
        <ToggleBtn active={view==="cr"}      onClick={() => setView("cr")}>Conv Rate %</ToggleBtn>
        <ToggleBtn active={view==="revenue"} onClick={() => setView("revenue")}>Expected Revenue</ToggleBtn>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px", border: "1px solid #334155", marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          {view === "cr" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v+"%"} domain={[0,100]}/>
              <Tooltip content={<RevTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <ReferenceLine y={overallCR} stroke="#64748b" strokeDasharray="4 3"
                label={{ value: `Avg ${overallCR}%`, fill: "#64748b", fontSize: 11, position: "insideTopRight" }}/>
              <Line dataKey="cr" type="monotone" stroke={COLORS.cr} strokeWidth={2.5} dot={{ r: 5, fill: COLORS.cr, strokeWidth: 0 }} connectNulls/>
            </ComposedChart>
          ) : view === "revenue" ? (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "€"+(v/1000).toFixed(0)+"k"} domain={[0, maxRev]}/>
              <Tooltip content={<RevTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Bar dataKey="revenue" fill={COLORS.rev} radius={[5,5,0,0]}/>
            </ComposedChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<RevTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} formatter={v => v==="forms"?"Form submissions":"Registrations"}/>
              <Bar dataKey="forms" name="forms" fill={COLORS.forms} radius={[5,5,0,0]}/>
              <Bar dataKey="regs"  name="regs"  fill={COLORS.regs}  radius={[5,5,0,0]}/>
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk","Week","Forms","Registrations","Conv. Rate","Revenue"].map((h,i) => (
                <th key={h} style={{ padding: "11px 14px", textAlign: i<=1?"left":"center", color: "#64748b", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #334155" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const wowForms = i > 0 ? row.forms - data[i-1].forms : null;
              const wowRegs  = i > 0 ? row.regs  - data[i-1].regs  : null;
              const crHigh   = row.cr >= 60 && row.forms > 0;
              return (
                <tr key={i} style={{ borderBottom: i<data.length-1?"1px solid #1e2d3d":"none", background: i%2===0?"#1e293b":"#162032" }}>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontWeight: 700 }}>W{i+1}</td>
                  <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{row.week}{!row.full&&<span style={{ marginLeft: 5, color: "#fbbf24", fontSize: 10 }}>⚡</span>}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.forms, fontSize: 15 }}>
                    {row.forms}{wowForms!==null&&<span style={{ fontSize: 10, marginLeft: 4, color: wowForms>0?"#34d399":wowForms<0?"#f87171":"#64748b" }}>{wowForms>0?`▲${wowForms}`:wowForms<0?`▼${Math.abs(wowForms)}`:"="}</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.regs, fontSize: 15 }}>
                    {row.regs}{wowRegs!==null&&<span style={{ fontSize: 10, marginLeft: 4, color: wowRegs>0?"#34d399":wowRegs<0?"#f87171":"#64748b" }}>{wowRegs>0?`▲${wowRegs}`:wowRegs<0?`▼${Math.abs(wowRegs)}`:"="}</span>}
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, fontSize: 12, color: crHigh?"#34d399":COLORS.cr }}>{row.forms>0?row.cr+"%":"—"}{crHigh?" 🔥":""}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.rev, fontSize: 13 }}>{row.revenue>0?fmt(row.revenue):"—"}</td>
                </tr>
              );
            })}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ padding: "11px 14px", color: "#94a3b8", fontWeight: 700, fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.forms, fontSize: 15 }}>{totalForms}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.regs, fontSize: 15 }}>{totalRegs}</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 700, color: COLORS.cr, fontSize: 13 }}>{overallCR}%</td>
              <td style={{ padding: "11px 14px", textAlign: "center", fontWeight: 800, color: COLORS.rev, fontSize: 14 }}>{fmt(totalRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PLACEHOLDER ───────────────────────────────────────────────────────────────
const Placeholder = ({ message }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column", gap: 12 }}>
    <p style={{ fontSize: 40, margin: 0 }}>🚧</p>
    <p style={{ color: "#475569", fontSize: 15, margin: 0 }}>{message}</p>
  </div>
);

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [dept,       setDept]       = useState("SNA");
  const [reportType, setReportType] = useState("enqApp");
  const [courseId,   setCourseId]   = useState("combined");

  const deptData = NAV[dept];
  const handleDept = d => { setDept(d); setReportType("enqApp"); setCourseId("combined"); };
  const handleType = t => { setReportType(t); setCourseId("combined"); };

  const isRevPlaceholder = !deptData.placeholder && deptData.revenue?.placeholder;
  const currentCourses   = !deptData.placeholder ? (deptData[reportType]?.courses ?? []) : [];
  const currentCourse    = currentCourses.find(c => c.id === courseId);
  const CourseComponent  = currentCourse?.Component;

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9" }}>

      {/* Row 1 — Department */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <span style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 8 }}>Dept</span>
        {Object.entries(NAV).map(([key, val]) => (
          <NavBtn key={key} active={dept===key} color={val.color} onClick={() => handleDept(key)}>{val.label}</NavBtn>
        ))}
      </div>

      {deptData.placeholder ? (
        <Placeholder message={`${deptData.label} department — reports coming soon`} />
      ) : (
        <>
          {/* Row 2 — Report Type */}
          <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 8 }}>Type</span>
            <NavBtn active={reportType==="enqApp"}  color="#f1f5f9" onClick={() => handleType("enqApp")}>Enquiry &amp; Applications</NavBtn>
            <NavBtn active={reportType==="revenue"} color="#f1f5f9" onClick={() => handleType("revenue")}>Revenue</NavBtn>
          </div>

          {reportType === "revenue" && isRevPlaceholder ? (
            <Placeholder message={`Revenue reports for ${deptData.label} coming soon`} />
          ) : (
            <>
              {/* Row 3 — Courses + Combined */}
              <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 8 }}>Course</span>
                {currentCourses.map(c => (
                  <NavBtn key={c.id} active={courseId===c.id} color={deptData.color} onClick={() => setCourseId(c.id)}>{c.label}</NavBtn>
                ))}
                <div style={{ width: 1, height: 20, background: "#334155", margin: "0 6px" }}/>
                <NavBtn active={courseId==="combined"} color="#fbbf24" onClick={() => setCourseId("combined")}>⊕ All {dept} Combined</NavBtn>
              </div>

              {/* Content */}
              <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
                {courseId === "combined" ? (
                  reportType === "enqApp" ? (
                    <EnqAppCombined
                      data={deptData.enqApp.combined}
                      title={`All ${dept} Courses Combined`}
                      subtitle={`${dept} · Enquiry & Applications · Week-aligned totals`}
                    />
                  ) : (
                    <RevenueCombined
                      data={deptData.revenue.combined}
                      title={`All ${dept} Courses Combined`}
                      subtitle={`${dept} · Revenue · Week-aligned totals`}
                    />
                  )
                ) : CourseComponent ? (
                  <CourseComponent />
                ) : null}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
