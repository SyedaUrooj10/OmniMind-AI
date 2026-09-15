"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Database,
  FileText,
  Gauge,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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
  };
  data_quality?: {
    quality_score?: number;
  };
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

export default function IntelligencePage() {
  const [datasets, setDatasets] = useState<
    Dataset[]
  >([]);

  const [profiles, setProfiles] = useState<
    Record<number, Profile>
  >({});

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

        const profileEntries =
          await Promise.all(
            response.data.datasets
              .slice(0, 6)
              .map(async (dataset) => {
                try {
                  const result =
                    await api.get<unknown>(
                      `/profiling/datasets/${dataset.id}`,
                    );

                  if (
                    typeof result.data ===
                      "object" &&
                    result.data !== null
                  ) {
                    return [
                      dataset.id,
                      result.data as Profile,
                    ] as const;
                  }
                } catch {
                  return null;
                }

                return null;
              }),
          );

        const nextProfiles: Record<
          number,
          Profile
        > = {};

        profileEntries.forEach((entry) => {
          if (entry) {
            nextProfiles[entry[0]] =
              entry[1];
          }
        });

        setProfiles(nextProfiles);
      } catch (requestError: unknown) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load intelligence dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const totalRows = datasets.reduce(
    (sum, dataset) =>
      sum + dataset.row_count,
    0,
  );

  const averageQuality =
    Object.values(profiles).length > 0
      ? Object.values(profiles).reduce(
          (sum, profile) =>
            sum +
            (profile.data_quality
              ?.quality_score ?? 0),
          0,
        ) /
        Object.values(profiles).length
      : 0;

  return (
    <main className="min-h-full bg-[#050816] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-1.5 text-xs text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Decision Intelligence
          </div>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Intelligence Center
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            A centralized view of your datasets,
            analytical health, predictive capabilities,
            and AI-powered decisions.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <Database className="h-5 w-5 text-cyan-300" />

            <p className="mt-5 text-xs text-gray-500">
              Datasets
            </p>

            <p className="mt-1 text-3xl font-black">
              {datasets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <BarChart3 className="h-5 w-5 text-violet-300" />

            <p className="mt-5 text-xs text-gray-500">
              Total rows
            </p>

            <p className="mt-1 text-3xl font-black">
              {totalRows.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <Gauge className="h-5 w-5 text-emerald-300" />

            <p className="mt-5 text-xs text-gray-500">
              Avg. quality
            </p>

            <p className="mt-1 text-3xl font-black text-emerald-300">
              {averageQuality.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />

            <p className="mt-5 text-xs text-gray-500">
              AI capabilities
            </p>

            <p className="mt-1 text-3xl font-black">
              15+
            </p>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/dashboard/agent"
            className="group rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 transition hover:border-cyan-400/40"
          >
            <BrainCircuit className="h-6 w-6 text-cyan-300" />

            <h2 className="mt-5 font-bold">
              Run AI Agent
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Run autonomous multi-step intelligence.
            </p>

            <ArrowRight className="mt-5 h-4 w-4 text-gray-600 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
          </Link>

          <Link
            href="/dashboard/reports"
            className="group rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5 transition hover:border-violet-400/40"
          >
            <FileText className="h-6 w-6 text-violet-300" />

            <h2 className="mt-5 font-bold">
              Executive Reports
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Generate management-ready intelligence reports.
            </p>

            <ArrowRight className="mt-5 h-4 w-4 text-gray-600 transition group-hover:translate-x-1 group-hover:text-violet-300" />
          </Link>

          <Link
            href="/dashboard/chat"
            className="group rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 transition hover:border-emerald-400/40"
          >
            <Sparkles className="h-6 w-6 text-emerald-300" />

            <h2 className="mt-5 font-bold">
              Ask OmniMind
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Explore your data using natural language.
            </p>

            <ArrowRight className="mt-5 h-4 w-4 text-gray-600 transition group-hover:translate-x-1 group-hover:text-emerald-300" />
          </Link>
        </section>

        {/* Dataset intelligence */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Dataset Intelligence
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Analytical status across your datasets.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-8 text-center text-sm text-gray-500">
              Loading intelligence...
            </div>
          ) : datasets.length === 0 ? (
            <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-8 text-center">
              <Database className="mx-auto h-8 w-8 text-gray-600" />

              <p className="mt-4 font-semibold text-white">
                No datasets yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Upload a dataset to begin.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {datasets.map((dataset) => {
                const quality =
                  profiles[dataset.id]
                    ?.data_quality
                    ?.quality_score ?? 0;

                return (
                  <div
                    key={dataset.id}
                    className="rounded-2xl border border-white/10 lg-white/[0.03] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">
                          {dataset.filename}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {dataset.row_count.toLocaleString()} rows
                          {" • "}
                          {dataset.column_count} columns
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                        {dataset.status}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">
                          Data quality
                        </span>

                        <span className="text-gray-300">
                          {quality.toFixed(1)}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                quality,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/datasets/${dataset.id}`}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
                      >
                        Dataset
                      </Link>

                      <Link
                        href={`/dashboard/reports?datasetId=${dataset.id}`}
                        className="rounded-lg border border-violet-400/20 bg-violet-400/5 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-400/10"
                      >
                        Report
                      </Link>

                      <Link
                        href="/dashboard/agent"
                        className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-400/10"
                      >
                        Analyze
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Capability strip */}
        <section className="mt-8 rounded-3xl border border-white/10 lg-gradient-to-r from-cyan-400/5 via-violet-400/5 to-emerald-400/5 p-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />

            <div>
              <h2 className="font-bold">
                From data to decisions
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                OmniMind combines statistical analysis,
                diagnostic intelligence, predictive
                analytics, anomaly detection, and
                evidence-grounded language reasoning to
                turn raw datasets into actionable business
                intelligence.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          Predictions are analytical estimates and should
          be validated against business context.
        </div>
      </div>
    </main>
  );
}



