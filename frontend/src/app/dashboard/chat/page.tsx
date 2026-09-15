"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  FileBarChart2,
  Loader2,
  Send,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Upload,
} from "lucide-react";

import api from "@/lib/api";
import AIChart, {
  AIChartConfig,
} from "@/components/chat/AIChart";

interface Dataset {
  id: number;
  filename: string;
  row_count: number;
  column_count: number;
  file_size?: number;
  status?: string;
}

interface DatasetResponse {
  datasets: Dataset[];
  total: number;
}

interface AgentExecutionStep {
  step: number;
  name: string;
  status: "running" | "completed" | "failed";
}

interface PredictiveData {
  forecast?: Array<{
    period: number;
    predicted_value: number;
  }>;
  confidence?: number;
  anomalies?: Array<{
    index: number;
    value: number;
    z_score: number;
  }>;
}

interface DecisionData {
  recommendations?: Array<{
    action?: string;
    impact?: string;
    priority_score?: number;
  }>;
}

interface WhatIfData {
  scenario?: string;
  baseline?: number;
  projected?: number;
  change?: number;
}

interface AIQueryResponse {
  success: boolean;
  dataset_id: number;
  question: string;
  answer: string;
  insights: string[];
  recommendations: string[];
  metadata: Record<string, unknown>;
  chart?: AIChartConfig | null;
  predictive?: PredictiveData | null;
  decision?: DecisionData | null;
  what_if?: WhatIfData | null;
}

interface AgentResponse {
  success: boolean;
  dataset_id: number;
  question: string;
  execution: AgentExecutionStep[];
  completed_steps: number;
  failed_steps: number;
  evidence: Record<string, unknown>;
  recommendations: unknown[];
  chart?: AIChartConfig | null;
  predictive?: PredictiveData | null;
  decision?: DecisionData | null;
  what_if?: WhatIfData | null;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  aiResponse?: AIQueryResponse;
  agentResponse?: AgentResponse;
}

function isAIQueryResponse(
  value: unknown,
): value is AIQueryResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.success === "boolean" &&
    typeof data.answer === "string" &&
    Array.isArray(data.insights) &&
    Array.isArray(data.recommendations)
  );
}

function isAgentResponse(
  value: unknown,
): value is AgentResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.success === "boolean" &&
    Array.isArray(data.execution) &&
    typeof data.completed_steps === "number" &&
    typeof data.failed_steps === "number"
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AgentExecutionCard({
  execution,
  completedSteps,
  failedSteps,
}: {
  execution: AgentExecutionStep[];
  completedSteps: number;
  failedSteps: number;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-400/10 p-2">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              OmniMind Agent
            </h3>

            <p className="text-xs text-gray-500">
              Autonomous analysis workflow
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-5">
        {execution.map((step) => (
          <div
            key={step.step}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
          >
            {step.status === "completed" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : step.status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-red-400/20" />
            )}

            <div className="flex-1">
              <p className="text-sm text-white">
                {step.name}
              </p>

              <p className="text-xs capitalize text-gray-500">
                {step.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-white/10 p-5">
        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs text-gray-500">
            Completed
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-300">
            {completedSteps}
          </p>
        </div>

        <div className="rounded-xl bg-black/20 p-3">
          <p className="text-xs text-gray-500">
            Failed
          </p>

          <p className="mt-1 text-xl font-bold text-red-300">
            {failedSteps}
          </p>
        </div>
      </div>
    </div>
  );
}

function RichAIResponse({
  response,
}: {
  response: AIQueryResponse;
}) {
  const hasInsights = response.insights.length > 0;
  const hasRecommendations =
    response.recommendations.length > 0;

  const predictive = response.predictive;
  const decision = response.decision;
  const whatIf = response.what_if;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" />

          <h3 className="text-sm font-semibold text-white">
            Executive Summary
          </h3>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
          {response.answer}
        </p>
      </div>

      {hasInsights && (
        <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4 text-violet-300" />

            <h3 className="text-sm font-semibold text-white">
              Key Evidence
            </h3>
          </div>

          <div className="space-y-2">
            {response.insights.map((insight, index) => (
              <div
                key={`${insight}-${index}`}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasRecommendations && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />

            <h3 className="text-sm font-semibold text-white">
              Recommendations
            </h3>
          </div>

          <div className="space-y-2">
            {response.recommendations.map(
              (recommendation, index) => (
                <div
                  key={`${recommendation}-${index}`}
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300"
                >
                  {recommendation}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {response.chart && (
        <AIChart chart={response.chart} />
      )}

      {predictive && (
        <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-300" />

            <h3 className="text-sm font-semibold text-white">
              Predictive Analytics
            </h3>
          </div>

          {typeof predictive.confidence === "number" && (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-gray-500">
                Forecast Confidence
              </p>

              <p className="mt-1 text-2xl font-bold text-violet-300">
                {predictive.confidence.toFixed(1)}%
              </p>
            </div>
          )}

          {predictive.forecast &&
            predictive.forecast.length > 0 && (
              <div className="space-y-2">
                {predictive.forecast.map((item) => (
                  <div
                    key={item.period}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm text-gray-400">
                      Period {item.period}
                    </span>

                    <span className="font-semibold text-white">
                      {item.predicted_value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

          {predictive.anomalies &&
            predictive.anomalies.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-amber-300" />

                  <p className="text-sm font-medium text-amber-200">
                    {predictive.anomalies.length} anomalies detected
                  </p>
                </div>
              </div>
            )}
        </div>
      )}

      {decision && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-cyan-300" />

            <h3 className="text-sm font-semibold text-white">
              Decision Intelligence
            </h3>
          </div>

          {decision.recommendations &&
            decision.recommendations.length > 0 && (
              <div className="space-y-3">
                {decision.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      {recommendation.action && (
                        <p className="text-sm font-medium text-white">
                          {recommendation.action}
                        </p>
                      )}

                      {recommendation.impact && (
                        <p className="mt-2 text-xs text-gray-400">
                          Impact: {recommendation.impact}
                        </p>
                      )}

                      {typeof recommendation.priority_score ===
                        "number" && (
                        <p className="mt-2 text-xs text-cyan-300">
                          Priority score:{" "}
                          {recommendation.priority_score.toFixed(1)}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
        </div>
      )}

      {whatIf && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5">
          <h3 className="text-sm font-semibold text-white">
            What-If Analysis
          </h3>

          {whatIf.scenario && (
            <p className="mt-2 text-sm text-gray-400">
              {whatIf.scenario}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-3">
            {typeof whatIf.baseline === "number" && (
              <div className="rounded-xl bg-black/20 p-3">
                <p className="text-xs text-gray-500">
                  Baseline
                </p>

                <p className="mt-1 font-semibold text-white">
                  {whatIf.baseline.toFixed(2)}
                </p>
              </div>
            )}

            {typeof whatIf.projected === "number" && (
              <div className="rounded-xl bg-black/20 p-3">
                <p className="text-xs text-gray-500">
                  Projected
                </p>

                <p className="mt-1 font-semibold text-cyan-300">
                  {whatIf.projected.toFixed(2)}
                </p>
              </div>
            )}

            {typeof whatIf.change === "number" && (
              <div className="rounded-xl bg-black/20 p-3">
                <p className="text-xs text-gray-500">
                  Change
                </p>

                <p className="mt-1 font-semibold text-emerald-300">
                  {whatIf.change.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] =
    useState<number | null>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingDatasets, setLoadingDatasets] =
    useState(true);
  const [error, setError] = useState("");

  const selectedDataset = useMemo(
    () =>
      datasets.find(
        (dataset) => dataset.id === selectedDatasetId,
      ) ?? null,
    [datasets, selectedDatasetId],
  );

  useEffect(() => {
    async function loadDatasets() {
      try {
        setLoadingDatasets(true);

        const response =
          await api.get<DatasetResponse>("/datasets");

        const loadedDatasets = response.data.datasets ?? [];

        setDatasets(loadedDatasets);

        if (
          loadedDatasets.length > 0 &&
          selectedDatasetId === null
        ) {
          setSelectedDatasetId(loadedDatasets[0].id);
        }
      } catch (requestError: unknown) {
        console.error(
          "Failed to load datasets:",
          requestError,
        );

        setError(
          "Unable to load datasets. Please make sure you are logged in.",
        );
      } finally {
        setLoadingDatasets(false);
      }
    }

    void loadDatasets();
  }, [selectedDatasetId]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const question = input.trim();

    if (!question) {
      return;
    }

    if (selectedDatasetId === null) {
      setError("Please select a dataset first.");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post<unknown>(
        "/ai/query",
        {
          dataset_id: selectedDatasetId,
          question,
        },
      );

      if (!isAIQueryResponse(response.data)) {
        throw new Error(
          "The AI returned an unexpected response.",
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.answer,
        aiResponse: response.data,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (requestError: unknown) {
      console.error("AI query failed:", requestError);

      setError(
        "AI analysis failed. Please check that the backend and Ollama are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function runAgent() {
    const question =
      "Analyze this dataset and tell me what I should know";

    if (selectedDatasetId === null) {
      setError("Please select a dataset first.");
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post<unknown>(
        "/ai/agent",
        {
          dataset_id: selectedDatasetId,
          question,
        },
      );

      if (!isAgentResponse(response.data)) {
        throw new Error(
          "The agent returned an unexpected response.",
        );
      }

      const agentMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "OmniMind Agent completed an autonomous analysis of your dataset.",
        agentResponse: response.data,
      };

      setMessages((current) => [
        ...current,
        agentMessage,
      ]);
    } catch (requestError: unknown) {
      console.error(
        "Agent analysis failed:",
        requestError,
      );

      setError(
        "Agent analysis failed. Please check that the backend is running and the /ai/agent endpoint is available.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2">
                  <BrainCircuit className="h-5 w-5 text-cyan-300" />
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  OmniMind Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                AI Data Analyst
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Ask questions about your datasets and let
                OmniMind turn raw data into evidence,
                predictions, and decisions.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-4">
              <p className="text-xs text-gray-500">
                Selected Dataset
              </p>

              <p className="mt-1 max-w-xs truncate text-sm font-semibold text-white">
                {selectedDataset?.filename ??
                  "No dataset selected"}
              </p>
            </div>
          </div>
        </div>

        {/* Dataset selector */}
        <div className="mb-6 rounded-2xl border border-white/10 lg-white/[0.03] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label
                htmlFor="dataset"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Dataset
              </label>

              <div className="relative">
                <select
                  id="dataset"
                  value={selectedDatasetId ?? ""}
                  onChange={(event) =>
                    setSelectedDatasetId(
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    )
                  }
                  disabled={loadingDatasets}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  {datasets.length === 0 ? (
                    <option value="">
                      {loadingDatasets
                        ? "Loading datasets..."
                        : "No datasets available"}
                    </option>
                  ) : (
                    datasets.map((dataset) => (
                      <option
                        key={dataset.id}
                        value={dataset.id}
                        className="bg-[#0b1020]"
                      >
                        {dataset.filename}
                      </option>
                    ))
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {selectedDataset && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-gray-500">
                    Rows
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {selectedDataset.row_count.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-gray-500">
                    Columns
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {selectedDataset.column_count}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs text-gray-500">
                    Size
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatFileSize(
                      selectedDataset.file_size,
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              "What are the most important insights?",
              "Why did revenue decrease?",
              "Show me the top performing categories",
              "What trends should I be concerned about?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="rounded-2xl border border-white/10 lg-white/[0.03] p-4 text-left text-sm text-gray-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/5 hover:text-white"
              >
                <Sparkles className="mb-3 h-4 w-4 text-cyan-300" />

                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 pb-32">
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              {message.role === "user" ? (
                <div className="max-w-3xl rounded-2xl rounded-br-md border border-cyan-400/20 bg-cyan-400/10 px-5 py-4">
                  <p className="text-sm leading-6 text-cyan-50">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-4xl">
                  {message.agentResponse ? (
                    <div>
                      <AgentExecutionCard
                        execution={
                          message.agentResponse.execution
                        }
                        completedSteps={
                          message.agentResponse
                            .completed_steps
                        }
                        failedSteps={
                          message.agentResponse.failed_steps
                        }
                      />

                      <div className="mt-5 rounded-2xl border border-white/10 lg-white/[0.03] p-5">
                        <div className="mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-cyan-300" />

                          <h3 className="text-sm font-semibold text-white">
                            Agent Summary
                          </h3>
                        </div>

                        <p className="text-sm leading-7 text-gray-300">
                          {message.content}
                        </p>
                      </div>

                      {message.agentResponse.chart && (
                        <AIChart
                          chart={
                            message.agentResponse.chart
                          }
                        />
                      )}

                      {message.agentResponse
                        .predictive && (
                        <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-5">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-violet-300" />

                            <h3 className="text-sm font-semibold text-white">
                              Predictive Analytics
                            </h3>
                          </div>

                          {typeof message.agentResponse
                            .predictive.confidence ===
                            "number" && (
                            <p className="mt-3 text-2xl font-bold text-violet-300">
                              {message.agentResponse.predictive.confidence.toFixed(
                                1,
                              )}
                              %
                              <span className="ml-2 text-xs font-normal text-gray-500">
                                confidence
                              </span>
                            </p>
                          )}

                          {message.agentResponse
                            .predictive.anomalies &&
                            message.agentResponse
                              .predictive.anomalies
                              .length > 0 && (
                              <div className="mt-4 flex items-center gap-2 text-sm text-amber-200">
                                <TriangleAlert className="h-4 w-4" />

                                {
                                  message.agentResponse
                                    .predictive
                                    .anomalies.length
                                }{" "}
                                anomalies detected
                              </div>
                            )}
                        </div>
                      )}

                      {message.agentResponse.decision
                        ?.recommendations &&
                        message.agentResponse.decision
                          .recommendations.length > 0 && (
                          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-300" />

                              <h3 className="text-sm font-semibold text-white">
                                Agent Recommendations
                              </h3>
                            </div>

                            <div className="space-y-3">
                              {message.agentResponse.decision.recommendations.map(
                                (
                                  recommendation,
                                  index,
                                ) => (
                                  <div
                                    key={index}
                                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                                  >
                                    {recommendation.action && (
                                      <p className="text-sm text-white">
                                        {
                                          recommendation.action
                                        }
                                      </p>
                                    )}

                                    {recommendation.impact && (
                                      <p className="mt-2 text-xs text-gray-400">
                                        Impact:{" "}
                                        {
                                          recommendation.impact
                                        }
                                      </p>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : message.aiResponse ? (
                    <RichAIResponse
                      response={message.aiResponse}
                    />
                  ) : (
                    <div className="rounded-2xl border border-white/10 lg-white/[0.03] p-5">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-5 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />

                <div>
                  <p className="text-sm text-white">
                    OmniMind is analyzing...
                  </p>

                  <p className="text-xs text-gray-500">
                    Profiling data, finding patterns, and
                    generating intelligence
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="fixed bottom-28 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 shadow-2xl">
            {error}
          </div>
        )}

        {/* Chat input */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 lg-white/[0.04] p-3 shadow-2xl"
            >
              <div className="flex flex-col gap-3">
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (!loading) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }
                  }}
                  placeholder="Ask OmniMind about your dataset..."
                  rows={2}
                  disabled={loading}
                  className="w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInput(
                          "Analyze this dataset and tell me what I should know",
                        );
                      }}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Bot className="h-4 w-4" />
                      AI Agent
                    </button>

                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 lg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-500"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !input.trim() ||
                      selectedDatasetId === null
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Thinking
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Ask OmniMind
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

