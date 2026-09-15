"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Upload,
  FileSpreadsheet,
  Eye,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { uploadDataset } from "@/services/upload";
import api from "@/lib/api";

interface Dataset {
  id: number;
  filename: string;
  file_size: number;
  row_count: number;
  column_count: number;
  status: string;
  created_at: string;
}

interface DatasetListResponse {
  datasets: Dataset[];
  total: number;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDatasets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<DatasetListResponse>("/datasets");

      setDatasets(response.data.datasets);
    } catch (err: unknown) {
      console.error("Failed to load datasets:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to load your datasets."
        );
      } else {
        setError("Unable to load your datasets.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      await uploadDataset(file);

      setSuccess("Dataset uploaded successfully!");

      await loadDatasets();
    } catch (err: unknown) {
      console.error("Upload error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to upload dataset."
        );
      } else {
        setError("Unable to upload dataset.");
      }
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  const handleDelete = async (dataset: Dataset) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${dataset.filename}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/datasets/${dataset.id}`);

      setSuccess("Dataset deleted successfully.");

      await loadDatasets();
    } catch (err: unknown) {
      console.error("Delete error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail ||
            "Unable to delete dataset."
        );
      } else {
        setError("Unable to delete dataset.");
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${
      units[index]
    }`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/20 p-3">
                  <Database
                    size={24}
                    className="text-purple-400"
                  />
                </div>

                <span className="text-sm text-gray-500">
                  DATA WORKSPACE
                </span>
              </div>

              <h1 className="text-4xl font-black">
                Dataset Library
              </h1>

              <p className="mt-3 text-gray-400">
                Upload, manage and analyze your datasets.
              </p>
            </div>

            {/* Upload */}
            <label
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
                uploading
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "bg-purple-600 text-white hover:bg-purple-500"
              }`}
            >
              <Upload size={18} />

              {uploading
                ? "Uploading..."
                : "Upload Dataset"}

              <input
                type="file"
                accept=".csv"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid gap-5 md:grid-cols-3">

            <div className="glass rounded-3xl p-6">
              <p className="text-sm text-gray-500">
                TOTAL DATASETS
              </p>

              <p className="mt-2 text-3xl font-black">
                {datasets.length}
              </p>
            </div>

            <div className="glass rounded-3xl p-6">
              <p className="text-sm text-gray-500">
                TOTAL ROWS
              </p>

              <p className="mt-2 text-3xl font-black">
                {datasets
                  .reduce(
                    (total, dataset) =>
                      total + dataset.row_count,
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>

            <div className="glass rounded-3xl p-6">
              <p className="text-sm text-gray-500">
                TOTAL COLUMNS
              </p>

              <p className="mt-2 text-3xl font-black">
                {datasets
                  .reduce(
                    (total, dataset) =>
                      total + dataset.column_count,
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>

          </div>

          {/* Refresh */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={loadDatasets}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-75 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />

                <p className="text-gray-400">
                  Loading datasets...
                </p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && datasets.length === 0 && (
            <div className="glass rounded-3xl p-12 text-center">
              <FileSpreadsheet
                size={50}
                className="mx-auto text-gray-600"
              />

              <h2 className="mt-6 text-2xl font-bold">
                No datasets yet
              </h2>

              <p className="mt-3 text-gray-500">
                Upload your first CSV dataset to start
                analyzing your data.
              </p>
            </div>
          )}

          {/* Dataset Cards */}
          {!loading && datasets.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="glass group rounded-3xl p-6 transition hover:-translate-y-1 hover:bg-white/10"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-purple-500/20 p-3">
                        <FileSpreadsheet
                          size={24}
                          className="text-purple-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold">
                          {dataset.filename}
                        </h3>

                        <p className="text-xs text-gray-500">
                          Dataset #{dataset.id}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      {dataset.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-4">

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-gray-500">
                        ROWS
                      </p>

                      <p className="mt-1 font-bold">
                        {dataset.row_count.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-gray-500">
                        COLUMNS
                      </p>

                      <p className="mt-1 font-bold">
                        {dataset.column_count}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-gray-500">
                        FILE SIZE
                      </p>

                      <p className="mt-1 font-bold">
                        {formatBytes(dataset.file_size)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-gray-500">
                        UPLOADED
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold">
                        {formatDate(dataset.created_at)}
                      </p>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">

                    <Link
                      href={`/dashboard/datasets/${dataset.id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold transition hover:bg-purple-500"
                    >
                      <Eye size={17} />
                      View Analysis
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(dataset)
                      }
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20"
                      title="Delete dataset"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}








