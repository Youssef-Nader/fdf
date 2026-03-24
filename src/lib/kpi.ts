// src/lib/kpi.ts


export const DEPARTMENTS = [
  "IT", 
  "Sales",
  "Operations",
  "Finance",
  "CustomerSuccess",
  "HR",
  "Engineering",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export type KPIInputs = {
  department: Department;

  revenue: number;
  cogs: number;
  operatingCosts: number;

  dso: number;
  dio: number;
  dpo: number;

  nps: number; // 0..100
  targetProfitMargin: number; // 0..1 (ex: 0.20)
  incentiveMaxAmount: number;
};

export type KPIResults = {
  cccDays: number;

  operatingCostRatio: number; // 0..1
  profitabilityMargin: number; // 0..1

  nps: number;

  cccDeltaDays: number;
  operatingCostDelta: number;
  profitabilityDelta: number;
  npsDelta: number;

  quarterlyIncentive: number;
  incentiveProgress: number; // 0..1

  trend: { month: string; value: number }[];
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const safeDiv = (a: number, b: number) => (b === 0 ? 0 : a / b);

/** 2) Multipliers — لو نسيت تحط Department هنا، هياخد 1 تلقائيًا */
const DEPT_MULTIPLIER: Partial<Record<Department, number>> = {
  Sales: 1.15,
  CustomerSuccess: 1.05,
  Operations: 1.0,
  Finance: 0.95,
  Engineering: 0.9,
  HR: 0.85,
  IT: 1.0, // ✅ IT (عدلها لو عندك وزن مختلف)
};

function deptMultiplier(dept: Department) {
  return DEPT_MULTIPLIER[dept] ?? 1;
}

/** 3) (اختياري) Labels للعرض في الـ UI لو محتاج أسماء جميلة */
export const DEPARTMENT_LABEL: Record<Department, string> = {
  Sales: "Sales",
  Operations: "Operations",
  Finance: "Finance",
  CustomerSuccess: "Customer Success",
  HR: "HR",
  Engineering: "Engineering",
  IT: "IT",
};

/** 4) (اختياري) Defaults لكل قسم (لو عايز تغير inputs تلقائيًا حسب القسم) */
export const DEPT_DEFAULTS: Partial<Record<Department, Partial<KPIInputs>>> = {
  IT: {
    // مثال: خلي IT operating costs أعلى شوية افتراضيًا (لو تحب)
    operatingCosts: 120000,
    nps: 75,
  },
};

export function computeKpis(input: KPIInputs): KPIResults {
  const grossProfit = input.revenue - input.cogs;
  const operatingProfit = grossProfit - input.operatingCosts;

  const profitabilityMargin = clamp(safeDiv(operatingProfit, input.revenue), -1, 1);
  const operatingCostRatio = clamp(safeDiv(input.operatingCosts, input.revenue), 0, 1);

  const cccDays = Math.round(input.dso + input.dio - input.dpo);

  const target = clamp(input.targetProfitMargin, 0, 1);
  const achievement = target <= 0 ? 0 : clamp(profitabilityMargin / target, 0, 1.25);

  const rawIncentive = input.incentiveMaxAmount * clamp(achievement, 0, 1);
  const quarterlyIncentive = Math.round(rawIncentive * deptMultiplier(input.department));

  const incentiveProgress = clamp(
    quarterlyIncentive / Math.max(1, input.incentiveMaxAmount),
    0,
    1
  );

  // Deltas (demo)
  const cccDeltaDays = Math.round(-12 + (50 - cccDays) * 0.2);
  const operatingCostDelta = clamp(0.08 - operatingCostRatio, -0.25, 0.25);
  const profitabilityDelta = clamp(profitabilityMargin - 0.15, -0.25, 0.25);
  const npsDelta = clamp((input.nps - 60) / 100, -0.5, 0.5);

  // Trend (demo)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const base = clamp(profitabilityMargin, 0, 0.5) * 100;
  const bump = incentiveProgress * 20;

  const trend = months.map((m, i) => {
    const t = i / 11;
    const curve = base * (0.6 + 0.7 * t * t) + bump * t;
    return { month: m, value: Math.round(curve * 10) / 10 };
  });

  return {
    cccDays,
    operatingCostRatio,
    profitabilityMargin,
    nps: clamp(input.nps, 0, 100),

    cccDeltaDays,
    operatingCostDelta,
    profitabilityDelta,
    npsDelta,

    quarterlyIncentive,
    incentiveProgress,

    trend,
  };
}
