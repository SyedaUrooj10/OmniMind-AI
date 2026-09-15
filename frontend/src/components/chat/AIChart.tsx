"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AIChartData {
  label: string;
  value: number;
}

export interface AIChartConfig {
  type: "bar" | "line";
  title: string;
  x_label?: string;
  y_label?: string;
  data: AIChartData[];
}

interface AIChartProps {
  chart: AIChartConfig;
}

export default function AIChart({
  chart,
}: AIChartProps) {
  if (
    !chart ||
    !chart.data ||
    chart.data.length === 0
  ) {
    return null;
  }

  const isLineChart = chart.type === "line";

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {chart.title}
          </h3>

          {chart.y_label && (
            <p className="mt-1 text-xs text-gray-500">
              Metric: {chart.y_label}
            </p>
          )}
        </div>

        <div className="w-fit rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
          {isLineChart
            ? "Trend Analysis"
            : "Segment Comparison"}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          {isLineChart ? (
            <LineChart
              data={chart.data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#0b1020",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="value"
                name={chart.y_label ?? "Value"}
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{
                  r: 3,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={chart.data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                dataKey="label"
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#0b1020",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend />

              <Bar
                dataKey="value"
                name={chart.y_label ?? "Value"}
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}




