"use client";

import ActivityCard from "./ActivityCard";

export default function RecentActivity() {
  return (
    <div className="glass mt-10 rounded-3xl p-8">

      <h2 className="text-2xl font-bold">
        Recent Activity
      </h2>

      <div className="mt-8 space-y-5">

        <ActivityCard
          title="Document Processed"
          description="Annual_Report_2025.pdf analyzed successfully."
          time="2 minutes ago"
        />

        <ActivityCard
          title="Vision AI Completed"
          description="Image recognition finished with 98.2% confidence."
          time="18 minutes ago"
        />

        <ActivityCard
          title="Prediction Generated"
          description="Customer churn prediction completed."
          time="42 minutes ago"
        />

      </div>

    </div>
  );
}