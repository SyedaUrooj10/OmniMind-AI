
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ColumnProfile {
  name: string;
  missing_count: number;
  missing_percentage: number;
}

interface MissingValuesChartProps {
  columns: ColumnProfile[];
}

export default function MissingValuesChart({
  columns,
}: MissingValuesChartProps) {
  const data = columns
    .filter((column) => column.missing_count > 0)
    .sort((a, b) => b.missing_count - a.missing_count)
    .slice(0, 15)
    .map((column) => ({
      name:
        column.name.length > 18
          ? `${column.name.slice(0, 18)}...`
          : column.name,
      missing: column.missing_count,
      percentage: Number(column.missing_percentage.toFixed(1)),
    }));

  const totalMissing = columns.reduce(
    (total, column) => total + column.missing_count,
    0
  );

  if (data.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-green-500/10 bg-green-500/5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-2xl">
            ✓
          </div>

          <h3 className="font-semibold text-green-400">
            No Missing Values
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            All columns are completely populated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Columns with missing data
          </p>

          <p className="mt-1 text-2xl font-bold">
            {data.length}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">
            Total missing values
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-400">
            {totalMissing.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.08)"
            />

            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{
                fill: "#9ca3af",
                fontSize: 11,
              }}
            />

            <YAxis
              allowDecimals={false}
              tick={{
                fill: "#9ca3af",
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1020",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value, name) => {
                if (name === "missing") {
                  return [
                    Number(value).toLocaleString(),
                    "Missing values",
                  ];
                }

                return [value, String(name)];
              }}
            />

            <Bar
              dataKey="missing"
              name="Missing values"
              fill="#a855f7"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
        <p className="text-xs text-gray-500">
          Showing the {data.length} columns with the highest
          number of missing values.
        </p>
      </div>
    </div>
  );
}
