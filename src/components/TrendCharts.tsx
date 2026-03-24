"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TrendChart({
  data,
}: { data: { month: string; value: number }[] }) {
  return (
    <div className="chartBox">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeOpacity={0.15} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#071b2f",
              border: "1px solid rgba(34,211,238,0.25)",
              borderRadius: 12,
              color: "#e6edf6",
            }}
          />
          <Line type="monotone" dataKey="value" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
