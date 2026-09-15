"use client";

interface DatasetPreviewProps {
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function DatasetPreview({
  columns,
  rows,
  page,
  totalPages,
  totalRows,
  onPageChange,
  loading = false,
}: DatasetPreviewProps) {
  const pageSize = 25;

  const startRow =
    totalRows === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const endRow = Math.min(
    page * pageSize,
    totalRows
  );

  const formatValue = (
    value: unknown
  ): string => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    if (
      typeof value === "object"
    ) {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-semibold">
            Dataset Preview
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Showing rows{" "}
            {startRow.toLocaleString()}–
            {endRow.toLocaleString()} of{" "}
            {totalRows.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Table */}

      <div className="relative overflow-x-auto">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#050816]/70 backdrop-blur-sm">
            <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-sm text-gray-200">
              Loading preview...
            </div>
          </div>
        )}

        {columns.length === 0 ||
        rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mb-3 text-4xl">
              📊
            </div>

            <h4 className="text-lg font-semibold">
              No rows available
            </h4>

            <p className="mt-2 text-sm text-gray-400">
              This dataset does not contain
              previewable rows.
            </p>
          </div>
        ) : (
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="sticky left-0 z-[1] whitespace-nowrap border-r border-white/10 bg-[#101326] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  #
                </th>

                {columns.map(
                  (column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-r border-white/5 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 last:border-r-0"
                    >
                      {column}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, rowIndex) => (
                  <tr
                    key={`${page}-${rowIndex}`}
                    className="border-b border-white/5 transition hover:bg-white/[0.04]"
                  >
                    <td className="sticky left-0 z-[1] whitespace-nowrap border-r border-white/10 bg-[#080b1c] px-4 py-4 font-mono text-xs text-gray-500">
                      {(
                        (page - 1) *
                          pageSize +
                        rowIndex +
                        1
                      ).toLocaleString()}
                    </td>

                    {columns.map(
                      (column) => (
                        <td
                          key={`${rowIndex}-${column}`}
                          className="max-w-[280px] whitespace-nowrap border-r border-white/5 px-5 py-4 text-gray-300 last:border-r-0"
                          title={formatValue(
                            row[column]
                          )}
                        >
                          <span className="block max-w-[280px] overflow-hidden text-ellipsis">
                            {formatValue(
                              row[column]
                            )}
                          </span>
                        </td>
                      )
                    )}
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}

      <div className="flex flex-col justify-between gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          {totalRows.toLocaleString()} total
          rows
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={
              page <= 1 || loading
            }
            onClick={() =>
              onPageChange(page - 1)
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          <div className="min-w-[90px] text-center text-sm text-gray-400">
            {page} / {totalPages}
          </div>

          <button
            type="button"
            disabled={
              page >= totalPages ||
              loading
            }
            onClick={() =>
              onPageChange(page + 1)
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
