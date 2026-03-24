// src/app/fdf/page.tsx

"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DEPARTMENTS,
  DEPARTMENT_LABEL,
  DEPT_DEFAULTS,
  type Department,
  type KPIInputs,
} from "@/lib/kpi";

function money(n: number) {
  return n.toLocaleString("en-US");
}

type FormState = Omit<KPIInputs, "department"> & { department: Department };

const BASE: FormState = {
  department: "Sales",
  revenue: 500000,
  cogs: 300000,
  operatingCosts: 100000,
  dso: 45,
  dio: 35,
  dpo: 32,
  nps: 70,
  targetProfitMargin: 0.2,
  incentiveMaxAmount: 50000,
};

export default function FdfInputsPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(BASE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const preset = DEPT_DEFAULTS?.[form.department];
    if (!preset) return;

    setForm((prev) => ({
      ...prev,
      ...preset,
      department: prev.department,
    }));
  }, [form.department]);

  const preview = useMemo(() => {
    const gp = form.revenue - form.cogs;
    const op = gp - form.operatingCosts;
    const margin = form.revenue === 0 ? 0 : op / form.revenue;
    return { gp, op, margin };
  }, [form.revenue, form.cogs, form.operatingCosts]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      department: form.department,
      quarter_revenue: form.revenue,
      quarter_cogs: form.cogs,
      operating_costs: form.operatingCosts,
      gross_profit: preview.gp,
      operating_profit: preview.op,
      margin: preview.margin,
      dso: form.dso,
      dio: form.dio,
      dpo: form.dpo,
      nps: form.nps,
      target_margin: form.targetProfitMargin,
      incentive_max: form.incentiveMaxAmount,
    };

    try {
      const response = await fetch(
        "https://applied-salmonlike-stephen.ngrok-free.dev",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const params = new URLSearchParams({
        department: form.department,
        revenue: String(form.revenue),
        cogs: String(form.cogs),
        operatingCosts: String(form.operatingCosts),
        dso: String(form.dso),
        dio: String(form.dio),
        dpo: String(form.dpo),
        nps: String(form.nps),
        targetProfitMargin: String(form.targetProfitMargin),
        incentiveMaxAmount: String(form.incentiveMaxAmount),
      });

      router.push(`/fdf/results?${params.toString()}`);
      router.refresh();
    } catch (error) {
      console.error("Submit failed:", error);
      setSubmitError("Failed to submit data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function setNumber<K extends keyof FormState>(key: K, value: number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="fdf-page">
      <div className="fdf-container" style={{ maxWidth: 900 }}>
        <div className="fdf-panel">
          <div style={{ padding: "6px 6px 10px 6px" }}>
            <h1 className="fdf-title">Financial Dashboard Demo</h1>
            <p className="fdf-subtitle">
              Enter data below to calculate key performance indicators (KPIs).
            </p>
          </div>

          <form className="fdf-form" onSubmit={onSubmit}>
            <section>
              <h2 className="fdf-sectionTitle">Department</h2>
              <div
                className="fdf-noteBox"
                style={{ background: "transparent", border: "none", padding: 0 }}
              >
                <div className="fdf-label" style={{ marginBottom: 8 }}>
                  Choose department
                </div>

                <select
                  className="fdf-select"
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      department: e.target.value as Department,
                    }))
                  }
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {DEPARTMENT_LABEL?.[d] ?? d}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <h2 className="fdf-sectionTitle">Financial Inputs</h2>
              <MoneyRow
                label="Quarter Revenue"
                value={form.revenue}
                onChange={(v) => setNumber("revenue", v)}
              />
              <MoneyRow
                label="Quarter COGS"
                value={form.cogs}
                onChange={(v) => setNumber("cogs", v)}
              />
              <MoneyRow
                label="Quarter Operating Costs"
                value={form.operatingCosts}
                onChange={(v) => setNumber("operatingCosts", v)}
              />

              <div className="fdf-noteBox" style={{ marginTop: 10 }}>
                <div className="fdf-inlineStats">
                  <span>
                    Gross Profit: <b>${money(preview.gp)}</b>
                  </span>
                  <span>
                    Operating Profit: <b>${money(preview.op)}</b>
                  </span>
                  <span>
                    Margin: <b>{Math.round(preview.margin * 1000) / 10}%</b>
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="fdf-sectionTitle">Working Capital Inputs</h2>
              <NumberRow
                label="DSO (Days Sales Outstanding)"
                value={form.dso}
                onChange={(v) => setNumber("dso", v)}
                suffix="days"
              />
              <NumberRow
                label="DIO (Days Inventory Outstanding)"
                value={form.dio}
                onChange={(v) => setNumber("dio", v)}
                suffix="days"
              />
              <NumberRow
                label="DPO (Days Payables Outstanding)"
                value={form.dpo}
                onChange={(v) => setNumber("dpo", v)}
                suffix="days"
              />
            </section>

            <section>
              <h2 className="fdf-sectionTitle">Additional Inputs</h2>
              <NumberRow
                label="Net Promoter Score (NPS)"
                value={form.nps}
                onChange={(v) => setNumber("nps", v)}
              />
              <PercentRow
                label="Target Profit Margin %"
                value={form.targetProfitMargin}
                onChange={(v) => setNumber("targetProfitMargin", v)}
              />
              <MoneyRow
                label="Incentive Max Amount"
                value={form.incentiveMaxAmount}
                onChange={(v) => setNumber("incentiveMaxAmount", v)}
              />
            </section>

            <div style={{ marginTop: 6 }}>
              <button
                type="submit"
                className="fdf-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              <div className="fdf-footerHint">
                Department presets apply automatically (single state update).
              </div>

              {submitError ? (
                <div
                  style={{
                    marginTop: 10,
                    color: "#ff6b6b",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {submitError}
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function MoneyRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="fdf-row" style={{ marginTop: 10 }}>
      <div className="fdf-label">{label}</div>
      <div className="fdf-control">
        <span className="fdf-prefix">$</span>
        <input
          className="fdf-input"
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="fdf-row" style={{ marginTop: 10 }}>
      <div className="fdf-label">{label}</div>
      <div className="fdf-control">
        <input
          className="fdf-input"
          style={{ width: 140 }}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="fdf-suffix">{suffix}</span> : null}
      </div>
    </div>
  );
}

function PercentRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const percent = Math.round(value * 1000) / 10;

  return (
    <div className="fdf-row" style={{ marginTop: 10 }}>
      <div className="fdf-label">{label}</div>
      <div className="fdf-control">
        <input
          className="fdf-input"
          style={{ width: 120 }}
          type="number"
          step="0.1"
          value={percent}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
        />
        <span className="fdf-suffix">%</span>
      </div>
    </div>
  );
}