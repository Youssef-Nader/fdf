// src/app/fdf/results/page.tsx

"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import TrendChart from "@/components/TrendCharts";
import { computeKpis, type KPIInputs, type Department } from "@/lib/kpi";

function num(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function str(v: string | null, fallback: string) {
  return v ?? fallback;
}
function pct(x: number) {
  return `${Math.round(x * 1000) / 10}%`;
}
function money(n: number) {
  return n.toLocaleString("en-US");
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="fdf-page">
          <div className="fdf-container">
            <div className="fdf-panel">
              <h1 className="fdf-title">Financial Dashboard Results</h1>
              <p className="fdf-subtitle">Loading results…</p>
            </div>
          </div>
        </main>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}

function ResultsInner() {
  const sp = useSearchParams();

  const input: KPIInputs = useMemo(() => {
    const department = str(sp.get("department"), "Sales") as Department;

    return {
      department,
      revenue: num(sp.get("revenue"), 500000),
      cogs: num(sp.get("cogs"), 300000),
      operatingCosts: num(sp.get("operatingCosts"), 100000),
      dso: num(sp.get("dso"), 45),
      dio: num(sp.get("dio"), 35),
      dpo: num(sp.get("dpo"), 32),
      nps: num(sp.get("nps"), 70),
      targetProfitMargin: num(sp.get("targetProfitMargin"), 0.2),
      incentiveMaxAmount: num(sp.get("incentiveMaxAmount"), 50000),
    };
  }, [sp]);

  const r = useMemo(() => computeKpis(input), [input]);

  return (
    <main className="fdf-page">
      <div className="fdf-container">
        <div className="fdf-panel">
          <div className="fdf-header">
            <div>
              <h1 className="fdf-title">Financial Dashboard Results</h1>
              <p className="fdf-subtitle">
                Department: <b style={{ color: "#e6edf6" }}>{input.department}</b>
              </p>
            </div>

            <Link href="/fdf" className="fdf-back">
              ← Back to Inputs
            </Link>
          </div>

          <div className="kpi-grid">
            <KpiCard
              title="CCC"
              value={`${r.cccDays} days`}
              delta={`${r.cccDeltaDays >= 0 ? "+" : ""}${r.cccDeltaDays}`}
              positive={r.cccDeltaDays < 0}
            />
            <KpiCard
              title="Operation Costs"
              value={pct(r.operatingCostRatio)}
              delta={pct(r.operatingCostDelta)}
              positive={r.operatingCostDelta < 0}
            />
            <KpiCard
              title="Company Profitability"
              value={pct(r.profitabilityMargin)}
              delta={pct(r.profitabilityDelta)}
              positive={r.profitabilityDelta >= 0}
            />
            <KpiCard
              title="NPS"
              value={`${Math.round(r.nps)}%`}
              delta={pct(r.npsDelta)}
              positive={r.npsDelta >= 0}
            />
          </div>

          <div className="block">
            <div className="blockTop">
              <div className="incentiveTitle">
                Quarterly Incentive <span>${money(r.quarterlyIncentive)}</span>
              </div>
              <div style={{ color: "#a9b6c6", fontSize: 13 }}>
                Target margin: <b style={{ color: "#e6edf6" }}>{pct(input.targetProfitMargin)}</b> • Max:{" "}
                <b style={{ color: "#e6edf6" }}>${money(input.incentiveMaxAmount)}</b>
              </div>
            </div>

            <div className="progressTrack">
              <div
                className="progressFill"
                style={{ width: `${Math.round(r.incentiveProgress * 100)}%` }}
              />
            </div>

            <div className="progressMeta">+{Math.round(r.incentiveProgress * 100)}%</div>
          </div>

          <div className="block">
            <div className="blockTop">
              <div style={{ fontSize: 18, fontWeight: 700 }}>Trend</div>
              <div style={{ fontSize: 13, color: "#a9b6c6" }}>(Derived from inputs)</div>
            </div>

            <TrendChart data={r.trend} />
          </div>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  delta,
  positive,
}: {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
}) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${positive ? "positive" : "negative"}`}>
        {positive ? "↑ " : "↓ "}
        {delta}
      </div>
    </div>
  );
}
