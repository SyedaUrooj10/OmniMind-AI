"use client";

import StatsCard from "./widgets/StatsCard";

export default function DashboardStats() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatsCard
        title="AI Chats"
        value="124"
        color="#06B6D4"
      />

      <StatsCard
        title="Documents"
        value="38"
        color="#10B981"
      />

      <StatsCard
        title="Vision Jobs"
        value="87"
        color="#8B5CF6"
      />

      <StatsCard
        title="Predictions"
        value="56"
        color="#F59E0B"
      />

    </section>
  );
}