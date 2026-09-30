import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
// Green Cert — Green Cert Programme Application + Paythen (CTID = "Green Cert")
// Rolling window: last 8 completed Mon–Sun weeks + W9 partial
// W1 = Mon 3 Aug 2026 · W8 = Sun 27 Sep 2026 · W9 = 28–30 Sep 2026 ⚡ partial
// HubSpot: hubspot-form-submissions-green-cert-programme-applicatio-2026-09-30.csv
//   412 raw → 355 after email dedup (keep last) → 354 after phone fallback · 0 jean rows
//   Form live from 19 Aug 2026 (W3); early W3 submitters resubmitted later → W3 = 0 after dedup
// Paythen: Courses_Expected_Revenue_CTID_-_Filtered__7_.csv · CTID == "Green Cert" (92 rows)
//   46 Registered (€218,425) · 42 blank status → Pipeline (€202,821) · 4 Refunded Not Registered excluded (€18,898)
//   0 email dupes · 0 pre-window rows · price tiers €4,450 / €4,999
// ─────────────────────────────────────────────────────────────────────────────
export const data = [
  { week: "3–9 Aug",       sep: 0,   jan: 0,  regs: 0,  regRev: 0,      pipe: 0,  pipeRev: 0,     full: true,  live: false },
  { week: "10–16 Aug",     sep: 0,   jan: 0,  regs: 0,  regRev: 0,      pipe: 0,  pipeRev: 0,     full: true,  live: false },
  { week: "17–23 Aug",     sep: 0,   jan: 0,  regs: 0,  regRev: 0,      pipe: 0,  pipeRev: 0,     full: true,  live: true  },
  { week: "24–30 Aug",     sep: 1,   jan: 0,  regs: 1,  regRev: 4450,   pipe: 0,  pipeRev: 0,     full: true,  live: true  },
  { week: "31 Aug–6 Sep",  sep: 3,   jan: 0,  regs: 0,  regRev: 0,      pipe: 1,  pipeRev: 4999,  full: true,  live: true  },
  { week: "7–13 Sep",      sep: 116, jan: 38, regs: 25, regRev: 119485, pipe: 3,  pipeRev: 14997, full: true,  live: true  },
  { week: "14–20 Sep",     sep: 85,  jan: 27, regs: 10, regRev: 48892,  pipe: 12, pipeRev: 58890, full: true,  live: true  },
  { week: "21–27 Sep",     sep: 62,  jan: 10, regs: 10, regRev: 45598,  pipe: 18, pipeRev: 84492, full: true,  live: true  },
  { week: "28–30 Sep ⚡",  sep: 12,  jan: 0,  regs: 0,  regRev: 0,      pipe: 8,  pipeRev: 39443, full: false, live: true  },
].map(d => {
  const apps = d.sep + d.jan;
  return {
    ...d,
    apps,
    totalRev: d.regRev + d.pipeRev,
    cr:     apps > 0 ? +(d.regs / apps * 100).toFixed(1) : 0,
    crPipe: apps > 0 ? +((d.regs + d.pipe) / apps * 100).toFixed(1) : 0,
  };
});

// Agriculture Level 5 Paths — counted per selection (39 applicants ticked 2+ paths)
const PATHS = [
  { name: "Beef/Sheep (Dry Stock)", sep: 182, jan: 52, color: "#a3e635" },
  { name: "Dairy/Beef (Dairy)",     sep: 107, jan: 29, color: "#38bdf8" },
  { name: "Tillage Crops",          sep: 34,  jan: 8,  color: "#fbbf24" },
  { name: "Not stated",             sep: 1,   jan: 0,  color: "#475569" },
];
const MULTI_PATH = { all: 39, sep: 29, jan: 10 };

// Where did you hear about us? — one answer per applicant
const SOURCES = [
  { name: "Facebook",               sep: 140, jan: 40, color: "#3b82f6" },
  { name: "Friends and Family",     sep: 45,  jan: 12, color: "#a3e635" },
  { name: "Instagram",              sep: 38,  jan: 12, color: "#f472b6" },
  { name: "Google",                 sep: 22,  jan: 3,  color: "#fbbf24" },
  { name: "Forus Training Website", sep: 12,  jan: 0,  color: "#34d399" },
  { name: "Other",                  sep: 8,   jan: 2,  color: "#a78bfa" },
  { name: "Email",                  sep: 3,   jan: 3,  color: "#fb923c" },
  { name: "LinkedIn",               sep: 2,   jan: 0,  color: "#0ea5e9" },
  { name: "findacourse.ie",         sep: 1,   jan: 1,  color: "#f87171" },
  { name: "Leaflet",                sep: 1,   jan: 0,  color: "#e2e8f0" },
  { name: "Twitter",                sep: 1,   jan: 0,  color: "#94a3b8" },
  { name: "Not stated",             sep: 6,   jan: 2,  color: "#475569" },
];

const sum = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
const liveFull   = data.filter(d => d.full && d.live);
const totalSep   = sum(data, "sep");
const totalJan   = sum(data, "jan");
const totalApps  = totalSep + totalJan;
const totalRegs  = sum(data, "regs");
const totalPipe  = sum(data, "pipe");
const totalRegRev  = sum(data, "regRev");
const totalPipeRev = sum(data, "pipeRev");
const avgApps    = (sum(liveFull, "apps") / liveFull.length).toFixed(1);
const overallCR  = totalApps > 0 ? (totalRegs / totalApps * 100).toFixed(1) : "0.0";
const overallCRp = totalApps > 0 ? ((totalRegs + totalPipe) / totalApps * 100).toFixed(1) : "0.0";

const COLORS = {
  sep: "#a3e635", jan: "#38bdf8", apps: "#f1f5f9",
  regs: "#34d399", pipe: "#fbbf24", cr: "#a78bfa",
};

const fmt  = n => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct  = (n, d) => d > 0 ? (n / d * 100).toFixed(1) + "%" : "—";

const Row = ({ color, label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
    <span style={{ color }}>● {label}</span><strong>{value}</strong>
  </div>
);

const WeekTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 13, color: "#f1f5f9", minWidth: 230
    }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#cbd5e1" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Row color={COLORS.sep} label="September 2026" value={d?.sep} />
        <Row color={COLORS.jan} label="January 2027"   value={d?.jan} />
        <Row color={COLORS.apps} label="Applications"  value={d?.apps} />
        <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <Row color={COLORS.regs} label={`Registered (${d?.regs})`} value={fmt(d?.regRev ?? 0)} />
          <Row color={COLORS.pipe} label={`Pipeline (${d?.pipe})`}   value={fmt(d?.pipeRev ?? 0)} />
          <Row color={COLORS.cr}   label="Conv. rate"                 value={d?.apps > 0 ? d.cr + "%" : "—"} />
        </div>
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f1f5f9" }}>
      <span style={{ color: p.payload.color }}>● </span>{p.name}: <strong>{p.value}</strong>
      <span style={{ color: "#94a3b8" }}> ({pct(p.value, total)})</span>
    </div>
  );
};

const Tab = ({ id, active, onClick, children, color = "#a3e635" }) => (
  <button onClick={() => onClick(id)} style={{
    padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "1px solid",
    borderColor: active ? color : "#334155",
    background:  active ? "rgba(163,230,53,0.12)" : "transparent",
    color:       active ? color : "#64748b"
  }}>{children}</button>
);

const PieBlock = ({ rows, intake, note }) => {
  const slices = rows
    .map(r => ({ name: r.name, color: r.color, value: intake === "all" ? r.sep + r.jan : r[intake] }))
    .filter(r => r.value > 0);
  const total = slices.reduce((s, r) => s + r.value, 0);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
      <div style={{ flex: "1 1 280px", minWidth: 260, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius="48%" outerRadius="85%"
              paddingAngle={1} stroke="#1e293b" strokeWidth={2}>
              {slices.map(s => <Cell key={s.name} fill={s.color} />)}
            </Pie>
            <Tooltip content={<PieTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: "1 1 260px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            {slices.map(s => (
              <tr key={s.name} style={{ borderBottom: "1px solid #273449" }}>
                <td style={{ padding: "7px 4px", color: "#cbd5e1" }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: s.color, marginRight: 8 }} />
                  {s.name}
                </td>
                <td style={{ padding: "7px 4px", textAlign: "right", fontWeight: 700, color: "#f1f5f9" }}>{s.value}</td>
                <td style={{ padding: "7px 4px", textAlign: "right", color: "#94a3b8", width: 60 }}>{pct(s.value, total)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: "8px 4px", color: "#94a3b8", fontWeight: 700, fontSize: 11 }}>Total</td>
              <td style={{ padding: "8px 4px", textAlign: "right", fontWeight: 800, color: "#f1f5f9" }}>{total}</td>
              <td />
            </tr>
          </tbody>
        </table>
        {note && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{note}</p>}
      </div>
    </div>
  );
};

const INTAKE_LABEL = { all: "All intakes", sep: "September 2026", jan: "January 2027" };
const INTAKE_N     = { all: totalApps, sep: totalSep, jan: totalJan };

export default function GreenCertReport() {
  const [view, setView]     = useState("apps");
  const [intake, setIntake] = useState("all");

  const th = {
    padding: "11px 12px", color: "#64748b", fontWeight: 600, fontSize: 11,
    textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #334155",
    whiteSpace: "nowrap"
  };
  const td = { padding: "11px 12px", textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" };

  return (
    <div style={{
      background: "#0f172a", minHeight: "100vh", padding: "32px 24px",
      fontFamily: "'Inter','Segoe UI',sans-serif", color: "#f1f5f9", textAlign: "left"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
          HubSpot + Paythen · Green Cert Programme
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>
          Weekly Green Cert Report — Applications, Paths, Sources &amp; Revenue
        </h1>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
          3 Aug – 30 Sep 2026 · 8 full weeks + W9 partial ⚡ · application form live from 19 Aug
        </p>
      </div>

      {/* Insight banner */}
      <div style={{
        background: "rgba(163,230,53,0.07)", border: "1px solid #a3e635", borderRadius: 8,
        padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.7
      }}>
        <strong style={{ color: "#a3e635" }}>📌 Key characteristic: </strong>
        W6 (7–13 Sep) is the peak — <strong style={{ color: "#f1f5f9" }}>154 applications and 25 registrations</strong> worth
        €119,485 (55% of registered revenue). From W7 onward, Pipeline rows outnumber completed registrations
        (38 of the 42 Pipeline rows sit in W7–W9), so a large share of recent revenue is still awaiting
        registration completion. January 2027 accounts for {pct(totalJan, totalApps)} of applications but has no completed
        registrations yet. Facebook is the source for just over half of all applicants.
      </div>

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Applications",       value: totalApps,          sub: `${totalSep} Sep · ${totalJan} Jan · avg ${avgApps}/wk live`, color: COLORS.apps },
          { label: "Registered Revenue", value: fmt(totalRegRev),   sub: `${totalRegs} registrations`,                                color: COLORS.regs },
          { label: "Pipeline Revenue",   value: fmt(totalPipeRev),  sub: `${totalPipe} not yet registered`,                           color: COLORS.pipe },
          { label: "Total Potential",    value: fmt(totalRegRev + totalPipeRev), sub: "registered + pipeline",                        color: "#f1f5f9"   },
          { label: "Conv. Rate",         value: overallCR + "%",    sub: `regs ÷ apps · ${overallCRp}% incl. pipeline`,               color: COLORS.cr   },
        ].map(k => (
          <div key={k.label} style={{
            background: "#1e293b", borderRadius: 10, padding: "12px 18px",
            flex: "1 1 150px", border: "1px solid #334155"
          }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</p>
            <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#64748b" }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Main toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Tab id="apps"    active={view === "apps"}    onClick={setView}>Applications by Intake</Tab>
        <Tab id="paths"   active={view === "paths"}   onClick={setView}>L5 Paths</Tab>
        <Tab id="sources" active={view === "sources"} onClick={setView}>Where Did You Hear About Us?</Tab>
        <Tab id="revenue" active={view === "revenue"} onClick={setView}>Revenue Converted</Tab>
      </div>

      {/* Intake filter for pies */}
      {(view === "paths" || view === "sources") && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "sep", "jan"].map(k => (
            <Tab key={k} id={k} active={intake === k} onClick={setIntake} color="#cbd5e1">
              {INTAKE_LABEL[k]} ({INTAKE_N[k]})
            </Tab>
          ))}
        </div>
      )}

      {/* Chart panel */}
      <div style={{
        background: "#1e293b", borderRadius: 12, padding: "24px 16px 16px",
        border: "1px solid #334155", marginBottom: 20
      }}>
        {view === "paths" ? (
          <PieBlock rows={PATHS} intake={intake}
            note={`Counted per path selected — ${MULTI_PATH[intake]} of ${INTAKE_N[intake]} applicants ticked more than one path, so the total exceeds applicants.`} />
        ) : view === "sources" ? (
          <PieBlock rows={SOURCES} intake={intake} note="One answer per applicant (deduped, most recent submission)." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {view === "revenue" ? (
              <ComposedChart data={data} margin={{ top: 8, right: 20, left: 10, bottom: 8 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => "€" + (v / 1000).toFixed(0) + "k"}/>
                <Tooltip content={<WeekTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                  formatter={v => v === "regRev" ? "Registered revenue" : "Pipeline (not yet registered)"}/>
                <Bar dataKey="regRev"  name="regRev"  stackId="rev" fill={COLORS.regs}/>
                <Bar dataKey="pipeRev" name="pipeRev" stackId="rev" fill={COLORS.pipe} radius={[5, 5, 0, 0]}/>
              </ComposedChart>
            ) : (
              <ComposedChart data={data} margin={{ top: 8, right: 20, left: -8, bottom: 8 }} barCategoryGap="22%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false}/>
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<WeekTooltip/>} cursor={{ fill: "rgba(148,163,184,.06)" }}/>
                <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                  formatter={v => v === "sep" ? "September 2026 intake" : v === "jan" ? "January 2027 intake" : "Registrations"}/>
                <Bar dataKey="sep" name="sep" stackId="apps" fill={COLORS.sep}/>
                <Bar dataKey="jan" name="jan" stackId="apps" fill={COLORS.jan} radius={[5, 5, 0, 0]}/>
                <Line dataKey="regs" name="regs" type="monotone" stroke={COLORS.regs} strokeWidth={2.5}
                  dot={{ r: 5, fill: COLORS.regs, strokeWidth: 0 }}/>
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly table */}
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#0f172a" }}>
              {["Wk", "Dates", "Sep 26", "Jan 27", "Apps", "Regs", "CR%", "Registered €", "Pipeline", "Pipeline €"].map((h, i) => (
                <th key={h} style={{ ...th, textAlign: i <= 1 ? "left" : "center" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{
                borderBottom: i < data.length - 1 ? "1px solid #1e2d3d" : "none",
                background: i % 2 === 0 ? "#1e293b" : "#162032",
                opacity: row.live ? 1 : 0.55
              }}>
                <td style={{ ...td, textAlign: "left", color: "#64748b" }}>W{i + 1}</td>
                <td style={{ ...td, textAlign: "left", color: "#cbd5e1", fontWeight: 400 }}>
                  {row.week}
                  {!row.full && <span style={{ marginLeft: 4, color: "#fbbf24", fontSize: 10 }}>⚡ partial</span>}
                  {!row.live && <span style={{ marginLeft: 4, color: "#64748b", fontSize: 10 }}>pre-launch</span>}
                </td>
                <td style={{ ...td, color: COLORS.sep }}>{row.sep}</td>
                <td style={{ ...td, color: COLORS.jan }}>{row.jan}</td>
                <td style={{ ...td, color: COLORS.apps, fontSize: 15 }}>{row.apps}</td>
                <td style={{ ...td, color: COLORS.regs, fontSize: 15 }}>{row.regs}</td>
                <td style={{ ...td, color: COLORS.cr, fontSize: 12 }}>{row.apps > 0 ? row.cr + "%" : "—"}</td>
                <td style={{ ...td, color: COLORS.regs }}>{row.regRev > 0 ? fmt(row.regRev) : "—"}</td>
                <td style={{ ...td, color: COLORS.pipe }}>{row.pipe}</td>
                <td style={{ ...td, color: COLORS.pipe }}>{row.pipeRev > 0 ? fmt(row.pipeRev) : "—"}</td>
              </tr>
            ))}
            <tr style={{ background: "#0f172a", borderTop: "2px solid #334155" }}>
              <td colSpan={2} style={{ ...td, textAlign: "left", color: "#94a3b8", fontSize: 10, textTransform: "uppercase" }}>Total</td>
              <td style={{ ...td, color: COLORS.sep }}>{totalSep}</td>
              <td style={{ ...td, color: COLORS.jan }}>{totalJan}</td>
              <td style={{ ...td, color: COLORS.apps, fontSize: 15, fontWeight: 800 }}>{totalApps}</td>
              <td style={{ ...td, color: COLORS.regs, fontSize: 15, fontWeight: 800 }}>{totalRegs}</td>
              <td style={{ ...td, color: COLORS.cr, fontSize: 12 }}>{overallCR}%</td>
              <td style={{ ...td, color: COLORS.regs, fontWeight: 800 }}>{fmt(totalRegRev)}</td>
              <td style={{ ...td, color: COLORS.pipe }}>{totalPipe}</td>
              <td style={{ ...td, color: COLORS.pipe, fontWeight: 800 }}>{fmt(totalPipeRev)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 14, fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.6 }}>
        Updated 30 Sep 2026 · 354 deduped applications (412 raw) · Pipeline = Paythen rows with blank status ·
        4 Refunded Not Registered (€18,898) excluded · no duplicate emails in Paythen
      </p>

    </div>
  );
}
