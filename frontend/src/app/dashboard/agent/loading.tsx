"use client";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#050816] p-6">
      <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10">
          <AlertTriangle className="h-6 w-6 text-red-300" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          OmniMind could not load this dashboard
          section. Try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}


