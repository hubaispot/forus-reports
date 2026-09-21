import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── DATA ─────────────────────────────────────────────────────────────────────
const CNY_BASE = [
  { n: 1,  rev: 440,   base: 936.48  },
  { n: 2,  rev: 880,   base: 985.96  },
  { n: 3,  rev: 1320,  base: 1035.44 },
  { n: 4,  rev: 1760,  base: 1084.92 },
  { n: 5,  rev: 2200,  base: 1134.40 },
  { n: 6,  rev: 2640,  base: 1183.88 },
  { n: 7,  rev: 3080,  base: 1233.36 },
  { n: 8,  rev: 3520,  base: 1282.84 },
  { n: 9,  rev: 3960,  base: 1332.32 },
  { n: 10, rev: 4400,  base: 1388.80 },
  { n: 11, rev: 4840,  base: 1438.28 },
  { n: 12, rev: 5280,  base: 1487.76 },
  { n: 13, rev: 5720,  base: 1537.24 },
  { n: 14, rev: 6160,  base: 1586.72 },
  { n: 15, rev: 6600,  base: 1636.20 },
  { n: 16, rev: 7040,  base: 1685.68 },
  { n: 17, rev: 7480,  base: 1735.16 },
  { n: 18, rev: 7920,  base: 1784.64 },
  { n: 19, rev: 8360,  base: 1834.12 },
  { n: 20, rev: 8800,  base: 1883.60 },
];

const LO_BASE = [
  { n: 1,  rev: 689,   base: 544.17  },
  { n: 2,  rev: 1378,  base: 608.34  },
  { n: 3,  rev: 2067,  base: 672.51  },
  { n: 4,  rev: 2756,  base: 736.68  },
  { n: 5,  rev: 3445,  base: 800.85  },
  { n: 6,  rev: 4134,  base: 865.02  },
  { n: 7,  rev: 4823,  base: 929.19  },
  { n: 8,  rev: 5512,  base: 993.36  },
  { n: 9,  rev: 6201,  base: 1057.53 },
  { n: 10, rev: 6890,  base: 1121.70 },
  { n: 11, rev: 7579,  base: 1185.87 },
  { n: 12, rev: 8268,  base: 1250.04 },
  { n: 13, rev: 8957,  base: 1314.21 },
  { n: 14, rev: 9646,  base: 1378.38 },
  { n: 15, rev: 10335, base: 1442.55 },
  { n: 16, rev: 11024, base: 1506.72 },
  { n: 17, rev: 11713, base: 1570.89 },
  { n: 18, rev: 12402, base: 1635.06 },
  { n: 19, rev: 13091, base: 1699.23 },
  { n: 20, rev: 13780, base: 1763.40 },
];

// SNA Live & Online Level 6 only (CTID379) — advertising €0
const L6_BASE = [
  { n: 1,  rev: 440,  base: 359.19  },
  { n: 2,  rev: 880,  base: 395.49  },
  { n: 3,  rev: 1320, base: 431.79  },
  { n: 4,  rev: 1760, base: 468.09  },
  { n: 5,  rev: 2200, base: 504.39  },
  { n: 6,  rev: 2640, base: 540.69  },
  { n: 7,  rev: 3080, base: 576.99  },
  { n: 8,  rev: 3520, base: 613.29  },
  { n: 9,  rev: 3960, base: 649.59  },
  { n: 10, rev: 4400, base: 685.89  },
  { n: 11, rev: 4840, base: 722.19  },
  { n: 12, rev: 5280, base: 758.49  },
  { n: 13, rev: 5720, base: 794.79  },
  { n: 14, rev: 6160, base: 831.09  },
  { n: 15, rev: 6600, base: 867.39  },
  { n: 16, rev: 7040, base: 903.69  },
  { n: 17, rev: 7480, base: 939.99  },
  { n: 18, rev: 7920, base: 976.29  },
  { n: 19, rev: 8360, base: 1012.59 },
  { n: 20, rev: 8800, base: 1048.89 },
];

// CS COOP Live & Online Level 5 — advertising €0, flat €475/learner
const CSCOOP_BASE = [
  { n: 1,  rev: 475,  base: 162.89  },
  { n: 2,  rev: 950,  base: 325.78  },
  { n: 3,  rev: 1425, base: 488.67  },
  { n: 4,  rev: 1900, base: 651.56  },
  { n: 5,  rev: 2375, base: 814.45  },
  { n: 6,  rev: 2850, base: 977.34  },
  { n: 7,  rev: 3325, base: 1140.23 },
  { n: 8,  rev: 3800, base: 1303.12 },
  { n: 9,  rev: 4275, base: 1466.01 },
  { n: 10, rev: 4750, base: 1628.90 },
  { n: 11, rev: 5225, base: 1791.79 },
  { n: 12, rev: 5700, base: 1954.68 },
  { n: 13, rev: 6175, base: 2117.57 },
  { n: 14, rev: 6650, base: 2280.46 },
  { n: 15, rev: 7125, base: 2443.35 },
  { n: 16, rev: 7600, base: 2606.24 },
  { n: 17, rev: 8075, base: 2769.13 },
  { n: 18, rev: 8550, base: 2932.02 },
  { n: 19, rev: 9025, base: 3094.91 },
  { n: 20, rev: 9500, base: 3257.80 },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmt  = n => "€" + Math.abs(n).toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtI = n => "€" + Math.round(Math.abs(n)).toLocaleString("en-IE");

function calcRow(tableData, n, budget) {
  const { rev, base } = tableData[n - 1];
  const cost     = +(base + budget).toFixed(2);
  const profit   = +(rev - cost).toFixed(2);
  const margin   = (profit / rev) * 100;
  const cpa      = budget > 0 ? budget / n : 0;
  const be_cpa   = profit > 0 ? profit / n : 0;
  const headroom = be_cpa - cpa;
  const roas     = budget > 0 ? rev / budget : null;
  return { rev, cost, profit, margin, cpa, be_cpa, headroom, roas };
}

function statusInfo(profit, cpa, be_cpa, headroom, budget) {
  if (profit < 0)   return { type: "danger",  msg: "Below break-even — running at a loss at this enrolment." };
  if (budget === 0) return { type: "success", msg: "No ad spend — full profit retained." };
  if (be_cpa > 0 && cpa < be_cpa * 0.5) return { type: "success", msg: `Healthy — CPA is ${((cpa / be_cpa) * 100).toFixed(0)}% of break-even. Good headroom.` };
  if (headroom > 0) return { type: "warning", msg: `Caution — CPA is ${((cpa / be_cpa) * 100).toFixed(0)}% of break-even. Monitor spend closely.` };
  return { type: "danger", msg: "Ad spend exceeds profit at this enrolment — reduce budget or grow cohort." };
}

const STATUS_COLORS = {
  success: { bg: "rgba(52,211,153,0.08)",  border: "#34d399", text: "#34d399" },
  warning: { bg: "rgba(251,191,36,0.08)",  border: "#fbbf24", text: "#fbbf24" },
  danger:  { bg: "rgba(248,113,113,0.08)", border: "#f87171", text: "#f87171" },
};

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const ProfitTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { n, profit } = payload[0].payload;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f1f5f9" }}>
      <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>{n} learner{n === 1 ? "" : "s"}</p>
      <p style={{ margin: 0, color: profit >= 0 ? "#34d399" : "#f87171", fontWeight: 700 }}>
        {profit >= 0 ? "" : "-"}{fmt(profit)}
      </p>
    </div>
  );
};

// ── TAB PANEL ─────────────────────────────────────────────────────────────────
function TabPanel({ tableData, defaultBudget, footerNote }) {
  const [learners, setLearners] = useState(8);
  const [budget,   setBudget]   = useState(defaultBudget);

  const { rev, cost, profit, margin, cpa, be_cpa, headroom, roas } = calcRow(tableData, learners, budget);
  const { type, msg } = statusInfo(profit, cpa, be_cpa, headroom, budget);
  const sc = STATUS_COLORS[type];

  const chartData = tableData.map(r => ({
    n:      r.n,
    profit: +(r.rev - (r.base + budget)).toFixed(2),
  }));

  const kpis = [
    { label: "Revenue",        val: fmt(rev),                                              color: "#f1f5f9" },
    { label: "Cost",           val: fmt(cost),                                             color: "#f1f5f9" },
    { label: "Profit",         val: (profit >= 0 ? "" : "-") + fmt(profit),               color: profit >= 0 ? "#34d399" : "#f87171" },
    { label: "Margin",         val: margin.toFixed(2) + "%",                              color: profit >= 0 ? "#34d399" : "#f87171" },
    ...(budget > 0 ? [
      { label: "CPA",            val: fmt(cpa),                                              color: "#f1f5f9" },
      { label: "Break-even CPA", val: be_cpa > 0 ? fmt(be_cpa) : "N/A",                    color: be_cpa > 0 ? "#34d399" : "#f87171" },
      { label: "Headroom",       val: be_cpa > 0 ? (headroom >= 0 ? "+" : "") + fmt(headroom) : "—", color: headroom > 0 ? "#34d399" : "#f87171" },
      ...(roas !== null ? [{ label: "ROAS", val: roas.toFixed(1) + "×", color: "#fbbf24" }] : []),
    ] : []),
  ];

  return (
    <div>
      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 14px" }}>
          <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>Learners enrolled</label>
          <input
            type="range" min={1} max={tableData.length} value={learners} step={1}
            onChange={e => setLearners(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#38bdf8" }}
          />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginTop: 4 }}>
            {learners} learner{learners === 1 ? "" : "s"}
          </div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 14px" }}>
          <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>Ad spend</label>
          <input
            type="range" min={0} max={800} value={budget} step={1}
            onChange={e => setBudget(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#38bdf8" }}
          />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginTop: 4 }}>
            {"€" + budget.toLocaleString("en-IE")}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: sc.text, marginBottom: 16 }}>
        {msg}
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="n" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#334155" }} tickLine={false} label={{ value: "Learners", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtI} width={72} />
          <Tooltip content={<ProfitTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={i === learners - 1 ? "#2a78d6" : entry.profit >= 0 ? "#1baf7a" : "#f87171"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Footer */}
      <p style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>{footerNote}</p>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SNAProfitabilityCalculator() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label:         "SNA Classroom Level 6",
      tableData:     CNY_BASE,
      defaultBudget: 400,
      footerNote:    "€440/learner · Venue €400 · Min 6 learners · Ad spend replaces the advertising cost line",
    },
    {
      label:         "SNA Live & Online Level 5 & 6",
      tableData:     LO_BASE,
      defaultBudget: 0,
      footerNote:    "€689/learner · Min 4 learners · Ad spend added to base cost",
    },
    {
      label:         "SNA Live & Online Level 6",
      tableData:     L6_BASE,
      defaultBudget: 0,
      footerNote:    "€440/learner · Min 4 learners · Ad spend added to base cost",
    },
    {
      label:         "CS-COOP Live & Online Level 5",
      tableData:     CSCOOP_BASE,
      defaultBudget: 0,
      footerNote:    "€475/learner · Ad spend added to base cost",
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>
          Profitability &amp; CPA Calculator
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          SNA · Adjust learner count and ad spend to model profitability in real time
        </p>
      </div>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #1e293b" }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "none", background: "transparent",
              color: activeTab === i ? "#38bdf8" : "#475569",
              borderBottom: activeTab === i ? "2px solid #38bdf8" : "2px solid transparent",
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — keep both mounted to preserve slider state */}
      {tabs.map((tab, i) => (
        <div key={i} style={{ display: activeTab === i ? "block" : "none" }}>
          <TabPanel
            tableData={tab.tableData}
            defaultBudget={tab.defaultBudget}
            footerNote={tab.footerNote}
          />
        </div>
      ))}
    </div>
  );
}
