"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ColumnProfile {
  name: string;
  data_type: string;
}

interface ColumnTypesChartProps {
  columns: ColumnProfile[];
}

export default function ColumnTypesChart({
  columns,
}: ColumnTypesChartProps) {
  const typeCounts = columns.reduce(
    (acc: Record<string, number>, column) => {
      const type = column.data_type || "unknown";

      acc[type] = (acc[type] || 0) + 1;

      return acc;
    },
    {}
  );

  const data = Object.entries(typeCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const chartCells = [
    "#a855f7",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-400">
          Detected column types
        </p>

        <p className="mt-1 text-2xl font-bold">
          {columns.length}
        </p>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={75}
              outerRadius={120}
              paddingAngle={3}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    chartCells[
                      index % chartCells.length
                    ]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1020",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Columns",
              ]}
            />

            <Legend
              wrapperStyle={{
                color: "#9ca3af",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



