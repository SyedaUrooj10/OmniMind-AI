"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";

import api from "@/lib/api";
import DatasetPreview from "@/components/analytics/DatasetPreview";
import CorrelationHeatmap from "@/components/analytics/CorrelationHeatmap";
import AIInsights from "@/components/analytics/AIInsights";
import MissingValuesChart from "@/components/analytics/MissingValuesChart";
import ColumnTypesChart from "@/components/analytics/ColumnTypesChart";


interface Dataset {
  id: number;
  filename: string;
  file_size: number;
  row_count: number;
  column_count: number;
  status: string;
  created_at: string;
}

interface ColumnStatistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  q1: number;
  q3: number;
}

interface TopValue {
  value: string;
  count: number;
}

interface ColumnProfile {
  name: string;
  data_type: string;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  unique_percentage: number;
  statistics?: ColumnStatistics | null;
  outlier_count?: number;
  top_values?: TopValue[] | null;
}

interface DataQuality {
  completeness: number;
  uniqueness: number;
  quality_score: number;
}

interface DatasetProfile {
  overview: {
    row_count: number;
    column_count: number;
    duplicate_rows: number;
    memory_usage_bytes: number;
  };
  columns: ColumnProfile[];
  correlations: Record<
    string,
    Record<string, number | null>
  >;
  data_quality: DataQuality;
}

interface DatasetPreview {
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
}

export default function DatasetAnalysisPage() {
  const params = useParams();

  const datasetId = params.id as string;

  const [dataset, setDataset] =
    useState<Dataset | null>(null);

  const [profile, setProfile] =
    useState<DatasetProfile | null>(null);

  const [preview, setPreview] =
    useState<DatasetPreview | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // LOAD DATASET PREVIEW
  // ============================================================

  const loadPreview = async (
    page: number
  ) => {
    try {
      setPreviewLoading(true);

      const response = await api.get(
        `/datasets/${datasetId}/preview`,
        {
          params: {
            page,
            page_size: 25,
          },
        }
      );

      setPreview(response.data);
    } catch (err) {
      console.error(
        "Preview loading error:",
        err
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // ============================================================
  // LOAD DATASET + PROFILE + PREVIEW
  // ============================================================

  useEffect(() => {
    if (!datasetId) {
      return;
    }

    const loadDataset = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          datasetResponse,
          profileResponse,
        ] = await Promise.all([
          api.get(
            `/datasets/${datasetId}`
          ),
          api.get(
            `/profiling/datasets/${datasetId}`
          ),
        ]);

        setDataset(
          datasetResponse.data
        );

        setProfile(
          profileResponse.data
        );

        await loadPreview(1);
      } catch (err: unknown) {
        console.error(
          "Dataset loading error:",
          err
        );

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError(
              "Dataset not found."
            );
          } else if (
            err.response?.status === 401
          ) {
            setError(
              "Authentication failed. Please log in again."
            );
          } else {
            setError(
              err.response?.data?.detail ||
                "Unable to load dataset."
            );
          }
        } else {
          setError(
            "Unable to load dataset."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, [datasetId]);

  // ============================================================
  // HELPERS
  // ============================================================

  const formatFileSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(2)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(2)} MB`;
    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(2)} GB`;
  };

  const formatDate = (
    date: string
  ) => {
    try {
      return new Date(
        date
      ).toLocaleString();
    } catch {
      return date;
    }
  };

  const formatCorrelation = (
    value: number | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    ) {
      return "—";
    }

    return value.toFixed(2);
  };

  const getQualityClass = (
    score: number
  ) => {
    if (score >= 90) {
      return "text-green-400";
    }

    if (score >= 70) {
      return "text-yellow-400";
    }

    return "text-red-400";
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-64 rounded-lg bg-white/10" />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-white/5"
                />
              ))}
            </div>

            <div className="h-96 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error || !dataset || !profile) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-red-500/20 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
            <div className="mb-4 text-5xl">
              ⚠️
            </div>

            <h1 className="mb-3 text-2xl font-bold">
              Unable to Load Dataset
            </h1>

            <p className="mb-8 text-gray-400">
              {error ||
                "Something went wrong while loading the dataset."}
            </p>

            <Link
              href="/dashboard/datasets"
              className="inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              Back to Datasets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const qualityScore =
    profile.data_quality
      .quality_score;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <div className="mb-10">
          <Link
            href="/dashboard/datasets"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Datasets
          </Link>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                Dataset Intelligence
              </div>

              <h1 className="break-all text-3xl font-bold tracking-tight md:text-4xl">
                {dataset.filename}
              </h1>

              <p className="mt-3 text-gray-400">
                Automated dataset profiling,
                quality analysis and visual
                analytics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
                {dataset.status}
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* OVERVIEW CARDS */}
        {/* ====================================================== */}

        <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              Rows
            </p>

            <p className="mt-2 text-3xl font-bold">
              {profile.overview.row_count.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Records analyzed
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              Columns
            </p>

            <p className="mt-2 text-3xl font-bold">
              {profile.overview.column_count.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Features detected
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              Quality Score
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${getQualityClass(
                qualityScore
              )}`}
            >
              {qualityScore.toFixed(1)}%
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Overall data quality
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <p className="text-sm text-gray-400">
              File Size
            </p>

            <p className="mt-2 text-3xl font-bold">
              {formatFileSize(
                dataset.file_size
              )}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Uploaded dataset
            </p>
          </div>
        </section>

        {/* ====================================================== */}
        {/* DATA QUALITY */}
        {/* ====================================================== */}

        <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              Data Quality
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Understand the completeness and
              uniqueness of your dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Completeness */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Completeness
                </span>

                <span className="font-semibold">
                  {profile.data_quality.completeness.toFixed(
                    1
                  )}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        profile.data_quality
                          .completeness
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Uniqueness */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Uniqueness
                </span>

                <span className="font-semibold">
                  {profile.data_quality.uniqueness.toFixed(
                    1
                  )}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        profile.data_quality
                          .uniqueness
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Quality Score */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Overall Quality
                </span>

                <span
                  className={`font-semibold ${getQualityClass(
                    qualityScore
                  )}`}
                >
                  {qualityScore.toFixed(
                    1
                  )}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        qualityScore
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-sm text-gray-400">
                Duplicate Rows
              </p>

              <p className="mt-2 text-2xl font-bold">
                {profile.overview.duplicate_rows.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-sm text-gray-400">
                Memory Usage
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatFileSize(
                  profile.overview
                    .memory_usage_bytes
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* DATASET INFORMATION */}
        {/* ====================================================== */}

        <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Dataset Information
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Basic metadata for this dataset.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Filename
              </p>

              <p className="mt-2 break-all font-medium">
                {dataset.filename}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Uploaded
              </p>

              <p className="mt-2 font-medium">
                {formatDate(
                  dataset.created_at
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Rows
              </p>

              <p className="mt-2 font-medium">
                {dataset.row_count.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Columns
              </p>

              <p className="mt-2 font-medium">
                {dataset.column_count.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        
{/* ====================================================== */}
{/* VISUAL ANALYTICS */}
{/* ====================================================== */}

<section className="mb-10">
  <div className="mb-6">
    <h2 className="text-2xl font-bold">
      Visual Analytics
    </h2>

    <p className="mt-2 text-sm text-gray-400">
      Explore data quality, column composition and
      relationships between numeric features.
    </p>
  </div>

  {/* Analytics Grid */}

  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

    {/* Column Types */}

    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">
          Column Types
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Distribution of detected data types.
        </p>
      </div>

      <ColumnTypesChart
        columns={profile.columns}
      />
    </div>

    {/* Missing Values */}

    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">
          Missing Values
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Identify columns requiring data cleaning.
        </p>
      </div>

      <MissingValuesChart
        columns={profile.columns}
      />
    </div>

  </div>

  {/* Correlation Heatmap */}

  <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
    <div className="mb-6">
      <h3 className="text-lg font-semibold">
        Correlation Analysis
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Explore relationships between numeric
        features.
      </p>
    </div>

    <CorrelationHeatmap
      correlations={profile.correlations}
    />
  </div>
</section>


        {/* ====================================================== */}
        {/* COLUMN ANALYSIS */}
        {/* ====================================================== */}

        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Column Analysis
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Detailed statistics for every
              column in your dataset.
            </p>
          </div>

          <div className="space-y-5">
            {profile.columns.map(
              (column) => (
                <div
                  key={column.name}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8"
                >
                  {/* Column Header */}

                  <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="break-all text-xl font-semibold">
                        {column.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                          {column.data_type}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                          {column.unique_count.toLocaleString()}{" "}
                          unique
                        </span>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Missing
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {column.missing_percentage.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Missing / Unique */}

                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                      <p className="text-sm text-gray-400">
                        Missing Values
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {column.missing_count.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/20 p-5">
                      <p className="text-sm text-gray-400">
                        Unique Percentage
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        {column.unique_percentage.toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Numeric Statistics */}

                  {column.statistics && (
                    <div>
                      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                        Numeric Statistics
                      </h4>

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Mean
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.mean.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Median
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.median.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Minimum
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.min.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Maximum
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.max.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Std Dev
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.std.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Q1
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.q1.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Q3
                          </p>

                          <p className="mt-1 font-semibold">
                            {column.statistics.q3.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                          <p className="text-xs text-gray-500">
                            Outliers
                          </p>

                          <p className="mt-1 font-semibold">
                            {(
                              column.outlier_count ||
                              0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Categorical Values */}

                  {column.top_values &&
                    column.top_values.length >
                      0 && (
                      <div className="mt-6">
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                          Top Values
                        </h4>

                        <div className="space-y-3">
                          {column.top_values.map(
                            (item) => (
                              <div
                                key={`${column.name}-${item.value}`}
                                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-4 py-3"
                              >
                                <span className="max-w-[70%] truncate text-sm text-gray-300">
                                  {item.value}
                                </span>

                                <span className="text-sm font-semibold">
                                  {item.count.toLocaleString()}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )
            )}
          </div>
        </section>

        {/* ====================================================== */}
        {/* CORRELATION DETAILS */}
        {/* ====================================================== */}

        {Object.keys(
          profile.correlations
        ).length > 0 && (
          <section className="mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                Correlation Details
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Numeric relationships detected
                in the dataset.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Feature
                    </th>

                    {Object.keys(
                      profile.correlations
                    ).map(
                      (column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap px-5 py-4 font-semibold"
                        >
                          {column}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(
                    profile.correlations
                  ).map(
                    ([column, values]) => (
                      <tr
                        key={column}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {column}
                        </td>

                        {Object.keys(
                          profile.correlations
                        ).map(
                          (otherColumn) => (
                            <td
                              key={`${column}-${otherColumn}`}
                              className="px-5 py-4 text-gray-300"
                            >
                              {formatCorrelation(
                                values[
                                  otherColumn
                                ]
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ====================================================== */}
        {/* FOOTER */}
        {/* ====================================================== */}

        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          OmniMind AI • Dataset Intelligence
        </div>
      </div>
    </div>
  );
}


