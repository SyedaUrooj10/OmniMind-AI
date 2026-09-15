"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Download,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";
import api from "@/lib/api";

interface Dataset {
  id: number;
  filename: string;
  row_count: number;
  column_count: number;
  file_size: number;
  status: string;
}

interface DatasetResponse {
  datasets: Dataset[];
  total: number;
}

interface Profile {
  overview?: {
    row_count?: number;
    column_count?: number;
    duplicate_rows?: number;
    memory_usage_bytes?: number;
  };
  data_quality?: {
    completeness?: number;
    uniqueness?: number;
    quality_score?: number;
  };
}

interface AgentResponse {
  success: boolean;
  answer?: string;
  recommendations?: unknown[];
  predictive?: Record<string, unknown> | null;
  decision?: Record<string, unknown> | null;
  what_if?: Record<string, unknown> | null;
}

function isDatasetResponse(
  value: unknown,
): value is DatasetResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Record<string, unknown>;

  return (
    Array.isArray(item.datasets) &&
    typeof item.total === "number"
  );
}

function isAgentResponse(
  value: unknown,
): value is AgentResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item =
    value as Record<string, unknown>;

  return typeof item.success === "boolean";
}

function getNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number"
    ? value
    : fallback;
}

function getString(
  value: unknown,
  fallback = "",
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

export default function ReportsPage() {
  const searchParams = useSearchParams();

  const requestedId = Number(
    searchParams.get("datasetId") ?? "",
  );

  const [datasets, setDatasets] = useState<
    Dataset[]
  >([]);

  const [selectedId, setSelectedId] =
    useState<number | null>(
      Number.isFinite(requestedId) &&
        requestedId > 0
        ? requestedId
        : null,
    );

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [agent, setAgent] =
    useState<AgentResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const response =
          await api.get<unknown>("/datasets");

        if (!isDatasetResponse(response.data)) {
          throw new Error(
            "Invalid dataset response.",
          );
        }

        setDatasets(response.data.datasets);

        const firstId =
          response.data.datasets[0]?.id ??
          null;

        setSelectedId(
          (current) =>
            current ??
            firstId,
        );
      } catch (requestError: unknown) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load datasets.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    async function generateReport() {
      try {
        setLoading(true);
        setError(null);

        const [profileResponse, agentResponse] =
          await Promise.all([
            api.get<unknown>(
              `/profiling/datasets/${selectedId}`,
            ),
            api.post<unknown>("/ai/agent", {
              dataset_id: selectedId,
              question:
                "Create an executive intelligence analysis of this dataset. Identify the most important business insights, risks, trends, anomalies, forecasts, and recommended actions.",
            }),
          ]);

        if (
          typeof profileResponse.data !==
          "object" ||
          profileResponse.data === null
        ) {
          throw new Error(
            "Invalid profile response.",
          );
        }

        setProfile(
          profileResponse.data as Profile,
        );

        if (!isAgentResponse(agentResponse.data)) {
          throw new Error(
            "Invalid agent response.",
          );
        }

        setAgent(agentResponse.data);
      } catch (requestError: unknown) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to generate report.",
        );
      } finally {
        setLoading(false);
      }
    }

    void generateReport();
  }, [selectedId]);

  const dataset =
    datasets.find(
      (item) => item.id === selectedId,
    ) ?? null;

  const qualityScore = getNumber(
    profile?.data_quality?.quality_score,
  );

  const forecast =
    agent?.predictive &&
    typeof agent.predictive.forecast ===
      "object" &&
    agent.predictive.forecast !== null
      ? (agent.predictive.forecast as Record<
          string,
          unknown
        >)
      : null;

  const anomalyResult =
    agent?.predictive &&
    typeof agent.predictive.anomalies ===
      "object" &&
    agent.predictive.anomalies !== null
      ? (agent.predictive.anomalies as Record<
          string,
          unknown
        >)
      : null;

  const forecastTrend = getString(
    forecast?.trend,
    "stable",
  );

  const forecastConfidence =
    getNumber(
      forecast?.confidence,
    );

  const anomalyCount = getNumber(
    anomalyResult?.anomaly_count,
  );

  function printReport() {
    window.print();
  }

  return (
    <main className="min-h-full bg-[#050816] text-white">
      <div className="mx-auto max-w-6xl p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-gray-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Intelligence Center
              </p>

              <h1 className="text-2xl font-black">
                Executive Reports
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={printReport}
            disabled={!agent || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Save as PDF
          </button>
        </div>

        {datasets.length > 0 && (
          <div className="mb-6 print:hidden">
            <select
              value={selectedId ?? ""}
              onChange={(event) =>
                setSelectedId(
                  Number(event.target.value),
                )
              }
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {datasets.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.filename}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-3xl border border-white/10 lg-white/[0.03] p-10 text-center">
            <BrainCircuit className="mx-auto h-8 w-8 animate-pulse text-cyan-300" />

            <p className="mt-4 font-semibold text-white">
              Generating intelligence report...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              OmniMind is analyzing the selected dataset.
            </p>
          </div>
        )}

        {!loading && dataset && agent && (
          <article className="rounded-3xl border border-white/10 bg-[#080d1c] shadow-2xl shadow-black/30">
            {/* Report header */}
            <header className="border-b border-white/10 p-6 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-cyan-300">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      OmniMind AI
                    </span>
                  </div>

                  <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                    Executive Intelligence Report
                  </h2>

                  <p className="mt-3 text-sm text-gray-400">
                    {dataset.filename}
                  </p>
                </div>

                <FileText className="hidden h-10 w-10 text-gray-700 sm:block" />
              </div>
            </header>

            {/* KPI section */}
            <section className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
              <div className="border-r border-white/10 p-5">
                <p className="text-xs text-gray-500">
                  Rows
                </p>

                <p className="mt-2 text-2xl font-black">
                  {getNumber(
                    profile?.overview?.row_count,
                    dataset.row_count,
                  ).toLocaleString()}
                </p>
              </div>

              <div className="border-r border-white/10 p-5">
                <p className="text-xs text-gray-500">
                  Columns
                </p>

                <p className="mt-2 text-2xl font-black">
                  {getNumber(
                    profile?.overview?.column_count,
                    dataset.column_count,
                  )}
                </p>
              </div>

              <div className="border-r border-white/10 p-5">
                <p className="text-xs text-gray-500">
                  Quality
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-300">
                  {qualityScore.toFixed(1)}%
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs text-gray-500">
                  Anomalies
                </p>

                <p className="mt-2 text-2xl font-black text-amber-300">
                  {anomalyCount}
                </p>
              </div>
            </section>

            {/* Executive summary */}
            <section className="border-b border-white/10 p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />

                <h3 className="text-lg font-bold">
                  Executive Summary
                </h3>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-gray-300">
                {agent.answer ||
                  "OmniMind completed the requested intelligence analysis."}
              </p>
            </section>

            {/* Predictive section */}
            <section className="border-b border-white/10 p-6 sm:p-10">
              <div className="flex items-center gap-3">
                {forecastTrend ===
                "decreasing" ? (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                )}

                <h3 className="text-lg font-bold">
                  Predictive Outlook
                </h3>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 lg-white/[0.025] p-5">
                  <p className="text-xs text-gray-500">
                    Forecast trend
                  </p>

                  <p className="mt-2 text-xl font-bold capitalize">
                    {forecastTrend}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 lg-white/[0.025] p-5">
                  <p className="text-xs text-gray-500">
                    Confidence
                  </p>

                  <p className="mt-2 text-xl font-bold text-cyan-300">
                    {forecastConfidence.toFixed(
                      1,
                    )}
                    %
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 lg-white/[0.025] p-5">
                  <p className="text-xs text-gray-500">
                    Detected anomalies
                  </p>

                  <p className="mt-2 text-xl font-bold text-amber-300">
                    {anomalyCount}
                  </p>
                </div>
              </div>
            </section>

            {/* Recommendations */}
            <section className="p-6 sm:p-10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-violet-300" />

                <h3 className="text-lg font-bold">
                  Recommended Actions
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                {(agent.recommendations ?? [])
                  .slice(0, 10)
                  .map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 lg-white/[0.025] p-5"
                      >
                        <p className="text-sm leading-6 text-gray-300">
                          {typeof item ===
                          "object" &&
                          item !== null &&
                          "action" in item
                            ? getString(
                                (
                                  item as Record<
                                    string,
                                    unknown
                                  >
                                ).action,
                                "Review the identified business driver.",
                              )
                            : String(item)}
                        </p>
                      </div>
                    ),
                  )}
              </div>
            </section>

            <footer className="border-t border-white/10 p-6 text-center text-xs text-gray-600">
              Generated by OmniMind AI Decision Intelligence Platform
            </footer>
          </article>
        )}
      </div>
    </main>
  );
}






