import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 22 Jun 2026) ─────────────────────────────────────
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
// Deduplication applied (keep most recent per person/course):
//   App excluded: 506376313071 (Jean Baeyens — test deal)
//   App dropped:  506633816254 (Paul Garry  — earlier of 2; kept 506625732814)
//   App dropped:  506889283801 (Oran Molloy — earlier of 2; kept 506956136670)
//   Won dropped:  505699441903 (Kinga Kania — same person as Kania Kania x2; kept latest 505719685355)
//   Won dropped:  505708538048 (Kania Kania — earlier of 2; kept 505719685355)
const EXCLUDED_IDS = new Set([
  "506376313071", // test deal
  "506633816254", // Paul Garry dup (older)
  "506889283801", // Oran Molloy dup (older)
  "505699441903", // Kinga/Kania Kania dup (oldest)
  "505708538048", // Kania Kania dup (middle)
]);

const RAW_DEALS = [
  { id:"505205340373", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) for Yvonne Nixon",                                         createdate:"2026-06-02T22:05:18Z", stage:"app" },
  { id:"505699441903", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) for Kinga Kania",                                  createdate:"2026-06-09T09:14:49Z", stage:"won" },
  { id:"505708538048", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) for Kania Kania",                                  createdate:"2026-06-09T09:17:24Z", stage:"won" },
  { id:"505719685355", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) for Kania Kania",                                  createdate:"2026-06-09T09:43:02Z", stage:"won" },
  { id:"505755864306", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) for Shannon Campbell",                                     createdate:"2026-06-09T16:09:14Z", stage:"app" },
  { id:"505797144800", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (Existing Learners) (5N1356 OA EX DHC) -  for Noel Byrne",           createdate:"2026-06-10T10:33:18Z", stage:"app" },
  { id:"505898201284", dealname:"Care Support - Online Anytime 1:1 (Existing Learners) (5N0758 OA EX DHC) -  for Kitumetsi",                            createdate:"2026-06-12T05:38:15Z", stage:"app" },
  { id:"505929233655", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Amy Broderick",                                  createdate:"2026-06-12T15:47:01Z", stage:"app" },
  { id:"505981272309", dealname:"Community Inclusion - Online Anytime 1:1 (5N1740 OA DSC) -  for Richard Walsh",                                        createdate:"2026-06-13T16:12:03Z", stage:"app" },
  { id:"505989396699", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Janine Doherty",                                   createdate:"2026-06-14T07:28:13Z", stage:"won" },
  { id:"506186736882", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Nurul Islam",                                                      createdate:"2026-06-16T11:34:11Z", stage:"won" },
  { id:"506199597246", dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Samantha Adamson",                            createdate:"2026-06-16T17:17:27Z", stage:"app" },
  { id:"506203345126", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Leanne Noonan",                                    createdate:"2026-06-16T18:57:10Z", stage:"app" },
  { id:"506231288040", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Mc loughlin Mc loughlin",                           createdate:"2026-06-16T20:36:09Z", stage:"app" },
  { id:"506253296845", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Kate Galvin",                             createdate:"2026-06-17T10:27:20Z", stage:"app" },
  { id:"506268626117", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Edel Ryan",                                        createdate:"2026-06-17T06:44:06Z", stage:"app" },
  { id:"506298626274", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Janice Uí Thuama",                                 createdate:"2026-06-17T13:03:27Z", stage:"won" },
  { id:"506376313071", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jean Baeyens test",                                createdate:"2026-06-17T12:30:10Z", stage:"app" },
  { id:"506517127362", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Laurem Hickey",                                    createdate:"2026-06-17T17:05:16Z", stage:"app" },
  { id:"506565664988", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Rathbone Rathbone",                    createdate:"2026-06-17T19:06:56Z", stage:"app" },
  { id:"506587284673", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Vilija Dockute",                                                createdate:"2026-06-17T15:37:17Z", stage:"won" },
  { id:"506625732814", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",                                       createdate:"2026-06-18T10:41:16Z", stage:"app" },
  { id:"506633816254", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",                                       createdate:"2026-06-18T09:21:35Z", stage:"app" },
  { id:"506690291950", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",                                       createdate:"2026-06-18T10:44:57Z", stage:"won" },
  { id:"506889283801", dealname:"Accounting Manual and Computerised - Online Anytime 1:1 (5N1348 OA DBU) -  for Oran Molloy",                           createdate:"2026-06-18T15:36:03Z", stage:"app" },
  { id:"506956136670", dealname:"Accounting Manual and Computerised - Online Anytime 1:1 (5N1348 OA DBU) -  for Oran Molloy",                           createdate:"2026-06-18T15:39:40Z", stage:"app" },
  { id:"507064310994", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for lorraine mcdermott",                                           createdate:"2026-06-19T10:09:13Z", stage:"app" },
  { id:"507146335419", dealname:"Work Experience (Business Studies) - Online Anytime 1:1 (5N1356 OA DBU) -  for Irene Geoghegan",                       createdate:"2026-06-19T13:38:43Z", stage:"won" },
  { id:"507419788478", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Ethna Killern",                                    createdate:"2026-06-19T14:53:08Z", stage:"won" },
  { id:"507502432457", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Jimin George",                                                 createdate:"2026-06-20T21:26:15Z", stage:"app" },
  { id:"507511290071", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Irene Geoghegan",                             createdate:"2026-06-20T11:59:29Z", stage:"app" },
];

// ─── PARSING ─────────────────────────────────────────────────────────────────
const DEPT_MAP   = { DSN:"SNA", DHC:"Healthcare", DSC:"Social Care", DBU:"Business", ELC:"ELC" };
const DELIV_MAP  = { OA:"Online Anytime", LO:"Live and Online", CNY:"Classroom Near You" };
const DEPT_ORDER = ["SNA","Healthcare","Social Care","Business","ELC","Other"];
const DEPT_COLOR = {
  SNA:          "#38bdf8",
  Healthcare:   "#34d399",
  "Social Care":"#a78bfa",
  Business:     "#fb923c",
  ELC:          "#f472b6",
  Other:        "#64748b",
};

function parseDeal(d) {
  // Use LAST parenthetical as the code block — handles "(Existing Learners) (5N... OA DHC)" patterns
  const allParens = [...d.dealname.matchAll(/\(([^)]+)\)/g)];
  const m = allParens.length > 0 ? allParens[allParens.length - 1] : null;
  const codeBlock = m ? m[1] : "";
  const tokens = codeBlock.split(/\s+/);
  const courseCode = tokens[0] || "";

  // Level: first digit of course code (e.g. "6N1957" → 6, "5N1786" → 5)
  const levelDigit = courseCode.match(/^(\d)/)?.[1] || "";
  const level = levelDigit ? `L${levelDigit}` : "";

  let delivCode = "", deptCode = "";
  for (const t of tokens.slice(1)) {
    if (DELIV_MAP[t]) delivCode = t;
    if (DEPT_MAP[t])  deptCode  = t;
  }

  const dept     = DEPT_MAP[deptCode]  || "Other";
  const delivery = DELIV_MAP[delivCode] || "Online Anytime";

  // Base course name = everything before the opening bracket, stripped of delivery type suffix
  // e.g. "Special Needs Assisting - Online Anytime 1:1" → "Special Needs Assisting"
  // e.g. "Special Needs Assisting - Live and Online"     → "Special Needs Assisting"
  // e.g. "Special Needs Assisting - Classroom Near You"  → "Special Needs Assisting"
  const DELIV_SUFFIXES = [
    " - Online Anytime 1:1", " - Online Anytime",
    " - Live and Online", " - Classroom Near You",
  ];
  let rawName = m
    ? d.dealname.slice(0, m.index).replace(/\s*[-–]\s*$/, "").trim()
    : d.dealname;
  // Strip "(Existing Learners)" parenthetical if present before code block
  rawName = rawName.replace(/\s*\([^)]*\)\s*$/, "").trim();
  for (const suffix of DELIV_SUFFIXES) {
    if (rawName.endsWith(suffix)) { rawName = rawName.slice(0, -suffix.length).trim(); break; }
  }
  const courseName = rawName; // clean base name, e.g. "Special Needs Assisting"

  // courseLabel shown in pills: "{baseName} {Level}", e.g. "Special Needs Assisting L6"
  const courseLabel = level ? `${courseName} ${level}` : courseName;

  // Location for CNY
  let location = "";
  if (delivCode === "CNY" && m) {
    const after = d.dealname.slice(m.index + m[0].length);
    const lm = after.match(/^\s*[-–]\s*(.+?)\s+for\s+/i);
    if (lm) location = lm[1].trim();
  }

  const dt = new Date(d.createdate);

  return { ...d, courseName, courseLabel, courseCode, level, delivCode, delivery, dept, deptCode, location, dt };
}

const DEALS = RAW_DEALS.filter(d => !EXCLUDED_IDS.has(d.id)).map(parseDeal);

// ─── WEEK BUCKETS (Mon 1 Jun = W1, Europe/Dublin / IST UTC+1) ────────────────
// W1: 1–7 Jun | W2: 8–14 Jun | W3: 15–21 Jun (closed) | W4: 22–28 Jun ⚡ (partial)
// UTC offsets: IST = UTC+1 → Mon 00:00 IST = Sun 23:00 UTC prior day
const WEEKS = [
  { wk:"W1", label:"1–7 Jun",       start:new Date("2026-05-31T23:00:00Z"), end:new Date("2026-06-07T22:59:59Z"), full:true  },
  { wk:"W2", label:"8–14 Jun",      start:new Date("2026-06-07T23:00:00Z"), end:new Date("2026-06-14T22:59:59Z"), full:true  },
  { wk:"W3", label:"15–21 Jun",     start:new Date("2026-06-14T23:00:00Z"), end:new Date("2026-06-21T22:59:59Z"), full:true  },
  { wk:"W4", label:"22–28 Jun ⚡",  start:new Date("2026-06-21T23:00:00Z"), end:new Date("2026-06-22T22:59:59Z"), full:false },
];

function countWeek(deals, wk) {
  return deals.filter(d => d.dt >= wk.start && d.dt <= wk.end);
}

function buildWeeklyData(deals) {
  return WEEKS.map(wk => {
    const inWk  = countWeek(deals, wk);
    const apps  = inWk.filter(d => d.stage === "app").length;
    const won   = inWk.filter(d => d.stage === "won").length;
    const total = apps + won;
    const convRate = total > 0 ? Math.round(won / total * 100) : 0;
    return { week: wk.label, wk: wk.wk, apps, won, total, convRate, full: wk.full };
  });
}

// ─── FILTER HELPERS ──────────────────────────────────────────────────────────
function getDeliveryTypes(deals) {
  const s = new Set(deals.map(d => d.delivery).filter(Boolean));
  return [...s].sort();
}

function getCourses(deals) {
  const map = {};
  for (const d of deals) {
    const key = d.courseLabel; // e.g. "Special Needs Assisting L6"
    if (!map[key]) map[key] = { courseLabel: d.courseLabel, courseName: d.courseName, courseCode: d.courseCode, dept: d.dept };
  }
  return Object.values(map).sort((a,b) => a.courseLabel.localeCompare(b.courseLabel));
}

function getLocations(deals) {
  const s = new Set(deals.map(d => d.location).filter(Boolean));
  return [...s].sort();
}

// ─── COLORS & STYLES ─────────────────────────────────────────────────────────
const C = { app:"#38bdf8", won:"#34d399", rate:"#a78bfa", bg:"#0f172a", card:"#1e293b", border:"#334155", muted:"#64748b", text:"#f1f5f9", sub:"#94a3b8" };

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d   = payload[0]?.payload;
  const apps = payload.find(p => p.dataKey === "apps")?.value ?? 0;
  const won  = payload.find(p => p.dataKey === "won")?.value ?? 0;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.text, minWidth:200 }}>
      <p style={{ fontWeight:700, marginBottom:8, color:C.sub }}>{label}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:C.app }}>● Applications received</span><strong>{apps}</strong>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:C.won }}>● Invoiced Won</span><strong>{won}</strong>
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, marginTop:4, paddingTop:4, display:"flex", justifyContent:"space-between" }}>
          <span style={{ color:C.rate }}>Conv. rate</span>
          <strong style={{ color:C.rate }}>{d?.convRate ?? 0}%</strong>
        </div>
      </div>
      {!d?.full && <p style={{ margin:"6px 0 0", color:"#fbbf24", fontSize:11 }}>⚡ Partial week</p>}
    </div>
  );
};

// ─── TAB BUTTON ──────────────────────────────────────────────────────────────
const Tab = ({ id, active, onClick, children }) => (
  <button onClick={() => onClick(id)} style={{
    padding:"5px 14px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
    border:`1px solid ${active ? C.app : C.border}`,
    background: active ? "rgba(56,189,248,0.15)" : "transparent",
    color: active ? C.app : C.muted,
  }}>{children}</button>
);

// ─── PILL ─────────────────────────────────────────────────────────────────────
const Pill = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{
    padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer",
    border:`1px solid ${active ? color : C.border}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : C.muted,
    transition:"all .15s",
  }}>{label}</button>
);

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const Stat = ({ label, value, sub, color }) => (
  <div style={{ background:C.card, borderRadius:10, padding:"12px 16px", flex:"1 1 100px", border:`1px solid ${C.border}` }}>
    <p style={{ margin:"0 0 3px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
    <p style={{ margin:"0 0 2px", fontSize:22, fontWeight:800, color: color||C.text, lineHeight:1 }}>{value}</p>
    <p style={{ margin:0, fontSize:10, color:C.muted }}>{sub}</p>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [chartView,    setChartView]    = useState("grouped");
  const [tableSort,    setTableSort]    = useState({ col: null, dir: "desc" });

  function handleTableSort(col) {
    setTableSort(prev =>
      prev.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: "desc" }
    );
  }

  // Navigation state: dept → deliveryType → courseLabel (base name + level) → location
  const [selDept,      setSelDept]      = useState("All");
  const [selDelivery,  setSelDelivery]  = useState("All");
  const [selCourse,    setSelCourse]    = useState("All");
  const [selLocation,  setSelLocation]  = useState("All");

  // Reset child selections when parent changes
  function chooseDept(d) {
    setSelDept(d); setSelDelivery("All"); setSelCourse("All"); setSelLocation("All");
  }
  function chooseDelivery(d) {
    setSelDelivery(d); setSelCourse("All"); setSelLocation("All");
  }
  function chooseCourse(c) {
    setSelCourse(c); setSelLocation("All");
  }

  // Filtered deals
  const filtered = useMemo(() => {
    let deals = DEALS;
    if (selDept     !== "All") deals = deals.filter(d => d.dept       === selDept);
    if (selDelivery !== "All") deals = deals.filter(d => d.delivery   === selDelivery);
    if (selCourse   !== "All") deals = deals.filter(d => d.courseLabel === selCourse);
    if (selLocation !== "All") deals = deals.filter(d => d.location   === selLocation);
    return deals;
  }, [selDept, selDelivery, selCourse, selLocation]);

  const weeklyData    = useMemo(() => buildWeeklyData(filtered), [filtered]);
  const totalApps     = filtered.filter(d => d.stage === "app").length;
  const totalWon      = filtered.filter(d => d.stage === "won").length;
  const totalDeals    = totalApps + totalWon;
  const convRate      = totalDeals > 0 ? Math.round(totalWon / totalDeals * 100) : 0;
  const avgConv       = (() => {
    const full = weeklyData.filter(w => w.full);
    if (!full.length) return 0;
    return Math.round(full.reduce((s,w) => s + w.convRate, 0) / full.length);
  })();

  // Available filter options
  const availDepts     = ["All", ...DEPT_ORDER.filter(dep => DEALS.some(d => d.dept === dep))];
  const availDelivs    = useMemo(() => {
    const base = selDept === "All" ? DEALS : DEALS.filter(d => d.dept === selDept);
    return ["All", ...getDeliveryTypes(base)];
  }, [selDept]);
  const availCourses   = useMemo(() => {
    let base = DEALS;
    if (selDept     !== "All") base = base.filter(d => d.dept     === selDept);
    if (selDelivery !== "All") base = base.filter(d => d.delivery === selDelivery);
    return ["All", ...getCourses(base).map(c => c.courseLabel)];
  }, [selDept, selDelivery]);
  const availLocations = useMemo(() => {
    let base = DEALS;
    if (selDept     !== "All") base = base.filter(d => d.dept       === selDept);
    if (selDelivery !== "All") base = base.filter(d => d.delivery   === selDelivery);
    if (selCourse   !== "All") base = base.filter(d => d.courseLabel === selCourse);
    return getLocations(base);
  }, [selDept, selDelivery, selCourse]);

  const showLocationRow = selDelivery === "Classroom Near You" || availLocations.length > 0;

  // Scope label for header
  const scopeLabel = [
    selDept     !== "All" ? selDept     : "All Departments",
    selDelivery !== "All" ? selDelivery : null,
    selCourse   !== "All" ? selCourse   : null,
    selLocation !== "All" ? `(${selLocation})` : null,
  ].filter(Boolean).join(" · ");

  const accentColor = selDept !== "All" ? DEPT_COLOR[selDept] : C.app;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"28px 24px", fontFamily:"'Inter','Segoe UI',sans-serif", color:C.text, textAlign:"left" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:20 }}>
        <p style={{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px" }}>
          HubSpot · B2C (Single Modules) Pipeline
        </p>
        <h1 style={{ margin:"0 0 4px", fontSize:21, fontWeight:700, color:C.text }}>
          Single Module Applications &amp; Conversions
        </h1>
        <p style={{ margin:0, color:C.sub, fontSize:13 }}>
          1 Jun – 22 Jun 2026 · deal create date · W4 opens today
        </p>
      </div>

      {/* ── Filter Layer 1: Department ── */}
      <div style={{ marginBottom:12 }}>
        <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Department</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {availDepts.map(dep => (
            <Pill key={dep} label={dep} active={selDept === dep}
              color={dep === "All" ? C.app : DEPT_COLOR[dep] || C.muted}
              onClick={() => chooseDept(dep)} />
          ))}
        </div>
      </div>

      {/* ── Filter Layer 2: Delivery Type ── */}
      <div style={{ marginBottom:12 }}>
        <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Delivery Type</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {availDelivs.map(del => (
            <Pill key={del} label={del} active={selDelivery === del}
              color={accentColor} onClick={() => chooseDelivery(del)} />
          ))}
        </div>
      </div>

      {/* ── Filter Layer 3: Course (only when dept or delivery is narrowed) ── */}
      {(selDept !== "All" || selDelivery !== "All") ? (
        <div style={{ marginBottom: showLocationRow ? 12 : 20 }}>
          <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Course</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {availCourses.map(c => (
              <Pill key={c} label={c} active={selCourse === c}
                color={accentColor} onClick={() => chooseCourse(c)} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom:20, padding:"8px 12px", borderRadius:8,
          border:`1px dashed ${C.border}`, fontSize:11, color:C.muted, fontStyle:"italic" }}>
          Select a department or delivery type above to filter by course
        </div>
      )}

      {/* ── Filter Layer 4: Location (CNY only) ── */}
      {showLocationRow && (
        <div style={{ marginBottom:20 }}>
          <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Location (Classroom Near You)</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Pill label="All" active={selLocation === "All"} color={accentColor} onClick={() => setSelLocation("All")} />
            {availLocations.map(loc => (
              <Pill key={loc} label={loc} active={selLocation === loc} color={accentColor} onClick={() => setSelLocation(loc)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Scope breadcrumb ── */}
      <div style={{ background:"rgba(56,189,248,0.06)", border:`1px solid ${C.border}`, borderRadius:8,
        padding:"8px 14px", marginBottom:20, fontSize:12, color:C.sub }}>
        <span style={{ color:accentColor, fontWeight:700 }}>📊 Viewing: </span>{scopeLabel}
        {" · "}<strong style={{ color:C.text }}>{totalDeals} deals total</strong>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        <Stat label="Applications Received" value={totalApps} sub="stages: self + 3rd party" color={C.app} />
        <Stat label="Invoiced Won" value={totalWon} sub="successful payment" color={C.won} />
        <Stat label="Total Deals" value={totalDeals} sub="all pipeline stages" color={C.text} />
        <Stat label="Conversion Rate" value={convRate+"%"} sub="won ÷ total" color="#f472b6" />
        <Stat label="This Week (W3 ⚡)" value={`${weeklyData[2]?.apps||0}a / ${weeklyData[2]?.won||0}w`} sub="partial week" color="#fbbf24" />
      </div>

      {/* ── Chart toggle ── */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <Tab id="grouped" active={chartView==="grouped"} onClick={setChartView}>Side by side</Tab>
        <Tab id="stacked" active={chartView==="stacked"} onClick={setChartView}>Stacked</Tab>
        <Tab id="rate"    active={chartView==="rate"}    onClick={setChartView}>Conv. rate %</Tab>
      </div>

      {/* ── Chart ── */}
      <div style={{ background:C.card, borderRadius:12, padding:"22px 16px 14px", border:`1px solid ${C.border}`, marginBottom:20 }}>
        {totalDeals === 0 ? (
          <div style={{ height:260, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:13 }}>
            No deals match the current filter selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {chartView === "rate" ? (
              <ComposedChart data={weeklyData} margin={{ top:8, right:20, left:-8, bottom:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="week" tick={{ fill:C.sub, fontSize:11 }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v+"%"} domain={[0,110]}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
                <ReferenceLine y={avgConv} stroke={C.muted} strokeDasharray="4 3"
                  label={{ value:`Avg ${avgConv}%`, fill:C.muted, fontSize:11, position:"insideTopRight" }}/>
                <Line dataKey="convRate" name="Conv. rate" type="monotone"
                  stroke={C.rate} strokeWidth={2.5}
                  dot={{ r:6, fill:C.rate, strokeWidth:0 }} connectNulls/>
              </ComposedChart>
            ) : (
              <ComposedChart data={weeklyData} margin={{ top:8, right:20, left:-8, bottom:8 }}
                barCategoryGap={chartView==="stacked"?"34%":"24%"} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="week" tick={{ fill:C.sub, fontSize:11 }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false} domain={[0,'auto']}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
                <Legend wrapperStyle={{ paddingTop:14, fontSize:12 }}
                  formatter={v => v === "apps" ? "Applications received" : "Invoiced Won"}/>
                <Bar dataKey="apps" name="apps" fill={C.app}
                  radius={chartView==="stacked"?[0,0,0,0]:[5,5,0,0]}
                  stackId={chartView==="stacked"?"a":undefined}/>
                <Bar dataKey="won" name="won" fill={C.won}
                  radius={[5,5,0,0]}
                  stackId={chartView==="stacked"?"a":undefined}/>
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Weekly table ── */}
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Wk","Dates","Apps Received","Won","Total","Conv. Rate"].map((h,i) => (
                <th key={h} style={{ padding:"10px 14px", textAlign:i<=1?"left":"center",
                  color:C.muted, fontWeight:600, fontSize:11, textTransform:"uppercase",
                  letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((row, i) => (
              <tr key={i} style={{ borderBottom:i<weeklyData.length-1?`1px solid #1e2d3d`:"none",
                background:i%2===0?C.card:"#162032" }}>
                <td style={{ padding:"10px 14px", color:C.muted, fontWeight:700 }}>{row.wk}</td>
                <td style={{ padding:"10px 14px", color:"#cbd5e1" }}>
                  {row.week.replace(" ⚡","")}{!row.full&&<span style={{ marginLeft:5, color:"#fbbf24", fontSize:10 }}>⚡</span>}
                </td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.app, fontSize:15 }}>{row.apps}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.won, fontSize:15 }}>{row.won}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.text, fontSize:15 }}>{row.total}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, fontSize:12,
                  color: row.convRate >= 50 ? "#34d399" : C.rate }}>
                  {row.total > 0 ? row.convRate+"%" : "—"}{row.convRate >= 50 && row.total > 0 ? " 🔥" : ""}
                </td>
              </tr>
            ))}
            <tr style={{ background:C.bg, borderTop:`2px solid ${C.border}` }}>
              <td colSpan={2} style={{ padding:"10px 14px", color:C.sub, fontWeight:700, fontSize:10, textTransform:"uppercase" }}>Total</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.app, fontSize:15 }}>{totalApps}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.won, fontSize:15 }}>{totalWon}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.text, fontSize:15 }}>{totalDeals}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:"#34d399", fontSize:13 }}>{convRate}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Course breakdown table ── */}
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <p style={{ margin:0, fontWeight:700, fontSize:13, color:C.text }}>Course Breakdown</p>
            <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>
              {tableSort.col ? `Sorted by ${tableSort.col} (${tableSort.dir === "desc" ? "high → low" : "low → high"})` : "Click a column header to sort"}
            </p>
          </div>
          {tableSort.col && (
            <button onClick={() => setTableSort({ col: null, dir: "desc" })} style={{
              fontSize:11, color:C.muted, background:"transparent", border:`1px solid ${C.border}`,
              borderRadius:6, padding:"3px 10px", cursor:"pointer"
            }}>✕ Reset sort</button>
          )}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {[
                { label:"Department", col:null,    align:"left"   },
                { label:"Course",     col:null,    align:"left"   },
                { label:"Delivery",   col:null,    align:"left"   },
                { label:"Location",   col:null,    align:"left"   },
                { label:"Apps",       col:"apps",  align:"center" },
                { label:"Won",        col:"won",   align:"center" },
                { label:"Conv %",     col:"rate",  align:"center" },
              ].map(({ label, col, align }) => (
                <th key={label}
                  onClick={() => col && handleTableSort(col)}
                  style={{
                    padding:"9px 12px", textAlign:align,
                    color: col && tableSort.col === col ? C.text : C.muted,
                    fontWeight:600, fontSize:10, textTransform:"uppercase",
                    letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`,
                    cursor: col ? "pointer" : "default",
                    userSelect:"none",
                    background: col && tableSort.col === col ? "rgba(255,255,255,0.04)" : "transparent",
                    whiteSpace:"nowrap",
                  }}>
                  {label}
                  {col && (
                    <span style={{ marginLeft:4, opacity: tableSort.col === col ? 1 : 0.3 }}>
                      {tableSort.col === col ? (tableSort.dir === "desc" ? " ▼" : " ▲") : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Group by dept + courseLabel + delivery + location
              const groups = {};
              for (const d of filtered) {
                const key = `${d.dept}||${d.courseLabel}||${d.delivery}||${d.location}`;
                if (!groups[key]) groups[key] = { dept:d.dept, courseLabel:d.courseLabel, delivery:d.delivery, location:d.location, apps:0, won:0 };
                if (d.stage === "app") groups[key].apps++;
                if (d.stage === "won") groups[key].won++;
              }
              const rows = Object.values(groups).map(g => ({
                ...g,
                total: g.apps + g.won,
                rate: (g.apps + g.won) > 0 ? Math.round(g.won / (g.apps + g.won) * 100) : 0,
              }));

              if (tableSort.col) {
                const dir = tableSort.dir === "desc" ? -1 : 1;
                rows.sort((a, b) => (b[tableSort.col] - a[tableSort.col]) * dir);
              } else {
                rows.sort((a,b) => DEPT_ORDER.indexOf(a.dept) - DEPT_ORDER.indexOf(b.dept) || a.courseLabel.localeCompare(b.courseLabel));
              }

              return rows.map((g, i) => {
                const dc = DEPT_COLOR[g.dept] || C.muted;
                return (
                  <tr key={i} style={{ borderBottom:`1px solid #1e2d3d`, background:i%2===0?C.card:"#162032" }}>
                    <td style={{ padding:"9px 12px" }}>
                      <span style={{ background:`${dc}22`, color:dc, padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700 }}>{g.dept}</span>
                    </td>
                    <td style={{ padding:"9px 12px", color:"#cbd5e1", maxWidth:260 }}>{g.courseLabel}</td>
                    <td style={{ padding:"9px 12px", color:C.sub }}>{g.delivery}</td>
                    <td style={{ padding:"9px 12px", color:C.sub }}>{g.location || "—"}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: tableSort.col === "apps" ? C.text : C.app }}>{g.apps}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: tableSort.col === "won" ? C.text : C.won }}>{g.won}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: g.rate >= 50 ? "#34d399" : C.rate }}>
                      {g.total > 0 ? g.rate+"%" : "—"}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop:16, fontSize:10, color:C.muted, textAlign:"right" }}>
        Data: HubSpot B2C (Single Modules) pipeline · fetched 22 Jun 2026 · deal create date as week anchor
      </p>
    </div>
  );
}
