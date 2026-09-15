import api from "./api";

export async function getDashboardAnalytics() {
  return api.get("/analytics/dashboard");
}