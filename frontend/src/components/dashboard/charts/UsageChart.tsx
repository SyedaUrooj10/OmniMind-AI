"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Mon", chats: 25 },
  { day: "Tue", chats: 42 },
  { day: "Wed", chats: 38 },
  { day: "Thu", chats: 61 },
  { day: "Fri", chats: 58 },
  { day: "Sat", chats: 80 },
  { day: "Sun", chats: 74 },
];

export default function UsageChart() {
  return (
    <div className="glass mt-10 rounded-3xl p-6">
      <h2 className="mb-6 text-2xl font-bold">
        Weekly AI Usage
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="chats"
              stroke="#06B6D4"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}