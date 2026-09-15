
"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface Insight {
  type: string;
  severity: "high" | "medium" | "info" | "success";
  title: string;
  description: string;
  recommendation?: string;
  column?: string;
  correlation?: number;
}

interface AIInsightsProps {
  insights: Insight[];
  loading?: boolean;
  error?: string | null;
}

function getSeverityConfig(severity: Insight["severity"]) {
  switch (severity) {
    case "high":
      return {
        icon: XCircle,
        label: "High Priority",
        iconClass: "text-red-400",
        badgeClass:
          "border-red-500/20 bg-red-500/10 text-red-400",
        glowClass: "hover:border-red-500/30",
      };

    case "medium":
      return {
        icon: AlertTriangle,
        label: "Needs Attention",
        iconClass: "text-yellow-400",
        badgeClass:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        glowClass: "hover:border-yellow-500/30",
      };

    case "success":
      return {
        icon: CheckCircle2,
        label: "Healthy",
        iconClass: "text-green-400",
        badgeClass:
          "border-green-500/20 bg-green-500/10 text-green-400",
        glowClass: "hover:border-green-500/30",
      };

    default:
      return {
        icon: Info,
        label: "Insight",
        iconClass: "text-blue-400",
        badgeClass:
          "border-blue-500/20 bg-blue-500/10 text-blue-400",
        glowClass: "hover:border-blue-500/30",
      };
  }
}

export default function AIInsights({
  insights,
  loading = false,
  error = null,
}: AIInsightsProps) {
  if (loading) {
    return (
      <section className="mb-10">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                AI-Generated Insights
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                OmniMind is analyzing your dataset...
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10" />

                <div className="flex-1">
                  <div className="h-4 w-1/2 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-white/5" />
                </div>
              </div>

              <div className="h-4 w-full rounded bg-white/10" />
              <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
              <div className="mt-6 h-16 rounded-2xl bg-white/5" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-10">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <h3 className="font-semibold text-red-300">
                AI Insights Unavailable
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <section className="mb-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
          <Sparkles className="mx-auto h-8 w-8 text-purple-400" />

          <h3 className="mt-4 text-lg font-semibold">
            No insights available
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            OmniMind could not identify significant patterns
            in this dataset.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
            <Sparkles className="h-5 w-5 text-purple-400" />

            <span className="absolute inset-0 animate-ping rounded-2xl bg-purple-500/5" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                AI-Generated Insights
              </h2>

              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                OmniMind AI
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-400">
              Automated analysis of patterns, quality issues,
              relationships and potential risks.
            </p>
          </div>
        </div>
      </div>

      {/* Insight summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Total Insights
          </p>

          <p className="mt-2 text-2xl font-bold">
            {insights.length}
          </p>
        </div>

        <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            High Priority
          </p>

          <p className="mt-2 text-2xl font-bold text-red-400">
            {
              insights.filter(
                (item) => item.severity === "high"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Attention
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-400">
            {
              insights.filter(
                (item) => item.severity === "medium"
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-green-500/10 bg-green-500/[0.03] p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Healthy
          </p>

          <p className="mt-2 text-2xl font-bold text-green-400">
            {
              insights.filter(
                (item) => item.severity === "success"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {insights.map((insight, index) => {
          const config = getSeverityConfig(
            insight.severity
          );

          const Icon = config.icon;

          return (
            <div
              key={`${insight.title}-${index}`}
              className={`group rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] ${config.glowClass}`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] ${config.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {insight.title}
                    </h3>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {insight.type === "relationship" && (
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                )}
              </div>

              {/* Description */}
              <p className="mt-5 text-sm leading-6 text-gray-400">
                {insight.description}
              </p>

              {/* Column */}
              {insight.column && (
                <div className="mt-4 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-gray-600">
                    Related column
                  </p>

                  <p className="mt-1 font-mono text-sm text-gray-300">
                    {insight.column}
                  </p>
                </div>
              )}

              {/* Correlation */}
              {typeof insight.correlation === "number" && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-500/10 bg-blue-500/5 px-4 py-3">
                  <span className="text-xs text-gray-500">
                    Correlation strength
                  </span>

                  <span className="font-mono text-sm font-semibold text-blue-400">
                    {insight.correlation.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Recommendation */}
              {insight.recommendation && (
                <div className="mt-5 rounded-2xl border border-purple-500/10 bg-purple-500/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                        Recommendation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center gap-2 text-xs text-gray-600">
        <Info className="h-3.5 w-3.5" />

        <span>
          Insights are generated from the statistical profile
          of your dataset and should be validated before making
          business decisions.
        </span>
      </div>
    </section>
  );
}


