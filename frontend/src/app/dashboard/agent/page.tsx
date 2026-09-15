"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  Loader2,
  Play,
  ShieldCheck,
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

interface ExecutionStep {
  step: number;
  name: string;
  status: "running" | "completed" | "failed";
}

interface Recommendation {
  action: string;
  impact: string;
  priority_score: number;
  reason: string;
}

interface AgentResponse {
  success: boolean;
  dataset_id: number;
  question: string;
  completed_steps: number;
  failed_steps: number;
  execution: ExecutionStep[];
  recommendations: unknown[];
  chart?: Record<string, unknown> | null;
  predictive?: Record<string, unknown> | null;
  decision?: Record<string, unknown> | null;
  what_if?: Record<string, unknown> | null;
  evidence?: Record<string, unknown>;
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

  const candidate =
    value as Record<string, unknown>;

  return (
    Array.isArray(candidate.datasets) &&
    typeof candidate.total === "number"
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

  const candidate =
    value as Record<string, unknown>;

  return (
    typeof candidate.success === "boolean" &&
    typeof candidate.dataset_id === "number" &&
    Array.isArray(candidate.execution)
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 * 1024 * 1024)
  ).toFixed(1)} GB`;
}

function AgentStep({
  step,
}: {
  step: ExecutionStep;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 lg-white/[0.025] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5">
        {step.status === "completed" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : step.status === "running" ? (
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          {step.name}
        </p>

        <p className="mt-1 text-xs capitalize text-gray-500">
          {step.status}
        </p>
      </div>

      <span className="text-xs text-gray-600">
        {String(step.step).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function AgentPage() {
  const [datasets, setDatasets] = useState<
    Dataset[]
  >([]);

  const [selectedDatasetId, setSelectedDatasetId] =
    useState<number | null>(null);

  const [question, setQuestion] = useState(
    "Analyze this dataset and tell me what I should know",
  );

  const [agentResult, setAgentResult] =
    useState<AgentResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoading(true);

        const response =
          await api.get<unknown>("/datasets");

        if (!isDatasetResponse(response.data)) {
          throw new Error(
            "Invalid dataset response received.",
          );
        }

        setDatasets(response.data.datasets);

        if (response.data.datasets.length > 0) {
          setSelectedDatasetId(
            response.data.datasets[0].id,
          );
        }
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load datasets.";

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadDatasets();
  }, []);

  async function runAgent() {
    if (selectedDatasetId === null) {
      setError("Please select a dataset.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter an analysis request.");
      return;
    }

    try {
      setRunning(true);
      setError(null);
      setAgentResult(null);

      const response =
        await api.post<unknown>("/ai/agent", {
          dataset_id: selectedDatasetId,
          question: question.trim(),
        });

      if (!isAgentResponse(response.data)) {
        throw new Error(
          "Invalid agent response received.",
        );
      }

      setAgentResult(response.data);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "The AI Agent could not complete the analysis.";

      setError(message);
    } finally {
      setRunning(false);
    }
  }

  const selectedDataset =
    datasets.find(
      (dataset) =>
        dataset.id === selectedDatasetId,
    ) ?? null;

  return (
    <main className="min-h-full bg-[#050816] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-xs font-medium text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Autonomous Intelligence
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            OmniMind AI Agent
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Let OmniMind autonomously profile, analyze,
            diagnose, predict, detect anomalies, and
            recommend actions from your dataset.
          </p>
        </div>

        {/* Agent configuration */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dataset
              </label>

              <select
                value={
                  selectedDatasetId ?? ""
                }
                onChange={(event) =>
                  setSelectedDatasetId(
                    Number(event.target.value),
                  )
                }
                disabled={loading || running}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
              >
                {datasets.length === 0 && (
                  <option value="">
                    No datasets available
                  </option>
                )}

                {datasets.map((dataset) => (
                  <option
                    key={dataset.id}
                    value={dataset.id}
                  >
                    {dataset.filename}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Agent objective
              </label>

              <input
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                disabled={running}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/40"
                placeholder="What should OmniMind analyze?"
              />
            </div>

            <button
              type="button"
              onClick={() => void runAgent()}
              disabled={
                running ||
                loading ||
                selectedDatasetId === null
              }
              className="inline-flex min-l-[48px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Agent
                </>
              )}
            </button>
          </div>

          {selectedDataset && (
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">
                  Rows
                </p>
                <p className="mt-1 font-semibold text-white">
                  {selectedDataset.row_count.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Columns
                </p>
                <p className="mt-1 font-semibold text-white">
                  {selectedDataset.column_count}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  File
                </p>
                <p className="mt-1 font-semibold text-white">
                  {formatFileSize(
                    selectedDataset.file_size,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Status
                </p>
                <p className="mt-1 font-semibold capitalize text-emerald-300">
                  {selectedDataset.status}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!agentResult && !running && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileSearch,
                title: "Profile",
                text: "Understand dataset structure and quality.",
              },
              {
                icon: BarChart3,
                title: "Analyze",
                text: "Discover metrics, segments and relationships.",
              },
              {
                icon: TrendingUp,
                title: "Predict",
                text: "Forecast trends and identify anomalies.",
              },
              {
                icon: ShieldCheck,
                title: "Decide",
                text: "Turn evidence into prioritized actions.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 lg-white/[0.025] p-5"
                >
                  <Icon className="h-5 w-5 text-cyan-300" />

                  <h3 className="mt-4 font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Running */}
        {running && (
          <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />

              <div>
                <h2 className="font-semibold text-white">
                  OmniMind is thinking...
                </h2>

                <p className="text-sm text-gray-500">
                  Running autonomous intelligence workflow
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {agentResult && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-cyan-400/10 p-2.5">
                  <BrainCircuit className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Agent Execution
                  </h2>

                  <p className="text-xs text-gray-500">
                    Autonomous analysis pipeline
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {agentResult.execution.map(
                  (step) => (
                    <AgentStep
                      key={step.step}
                      step={step}
                    />
                  ),
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5 sm:p-6">
              <Activity className="h-6 w-6 text-emerald-300" />

              <p className="mt-5 text-xs uppercase tracking-wider text-gray-500">
                Workflow completion
              </p>

              <p className="mt-2 text-5xl font-black text-white">
                {agentResult.completed_steps}
                <span className="text-xl text-gray-600">
                  /{agentResult.execution.length}
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-400">
                intelligence steps completed
              </p>

              {agentResult.failed_steps > 0 && (
                <p className="mt-4 text-sm text-red-300">
                  {agentResult.failed_steps} step(s)
                  failed.
                </p>
              )}
            </section>

            {agentResult.recommendations.length > 0 && (
              <section className="lg:col-span-2 rounded-3xl border border-violet-400/20 bg-violet-400/5 p-5 sm:p-6">
                <h2 className="font-semibold text-white">
                  Agent Recommendations
                </h2>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {agentResult.recommendations
                    .slice(0, 8)
                    .map(
                      (
                        recommendation,
                        index,
                      ) => {
                        if (
                          typeof recommendation ===
                          "object" &&
                          recommendation !== null
                        ) {
                          const item =
                            recommendation as Recommendation;

                          return (
                            <div
                              key={`${item.action}-${index}`}
                              className="rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm font-semibold text-white">
                                  {item.action}
                                </p>

                                <span className="shrink-0 rounded-lg bg-violet-400/10 px-2 py-1 text-xs text-violet-300">
                                  {item.priority_score}
                                </span>
                              </div>

                              <p className="mt-2 text-xs leading-5 text-gray-500">
                                {item.reason}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`recommendation-${index}`}
                            className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"
                          >
                            {String(
                              recommendation,
                            )}
                          </div>
                        );
                      },
                    )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}









