import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import UsageChart from "@/components/dashboard/charts/UsageChart";
import RecentActivity from "@/components/dashboard/activity/RecentActivity";
import QuickActions from "@/components/dashboard/quick-actions/QuickActions";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>

        <h1 className="text-5xl font-black">
          👋 Welcome Back
        </h1>

        <p className="mt-3 text-gray-400">
          Here is everything happening across your AI workspace.
        </p>

        <div className="mt-10">
          <DashboardStats />
        </div>

        <UsageChart />

        <RecentActivity />

        <QuickActions />

      </DashboardLayout>
    </ProtectedRoute>
  );
}