"use client";

interface CorrelationHeatmapProps {
  correlations: Record<
    string,
    Record<string, number | null>
  >;
}

function getCorrelationBackground(
  value: number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "rgba(255,255,255,0.03)";
  }

  const intensity = Math.min(
    Math.abs(value),
    1
  );

  if (value > 0) {
    return `rgba(139, 92, 246, ${
      0.12 + intensity * 0.7
    })`;
  }

  if (value < 0) {
    return `rgba(59, 130, 246, ${
      0.12 + intensity * 0.7
    })`;
  }

  return "rgba(255,255,255,0.08)";
}

function getCorrelationText(
  value: number | null | undefined
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return value.toFixed(2);
}

export default function CorrelationHeatmap({
  correlations,
}: CorrelationHeatmapProps) {
  const columns = Object.keys(
    correlations
  );

  if (columns.length === 0) {
    return (
      <div className="glass rounded-3xl p-7">
        <h2 className="text-2xl font-bold">
          Correlation Heatmap
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Not enough numerical data to calculate correlations.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-7">
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Correlation Heatmap
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Strength and direction of relationships between numerical variables
        </p>
      </div>

      {/* Heatmap */}

      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `180px repeat(${columns.length}, minmax(75px, 1fr))`,
            minWidth: `${180 + columns.length * 75}px`,
          }}
        >
          {/* Empty corner */}

          <div className="flex items-end p-2">
            <span className="text-xs text-gray-600">
              Variable
            </span>
          </div>

          {/* Column labels */}

          {columns.map((column) => (
            <div
              key={`header-${column}`}
              className="flex h-24 items-end justify-center p-2"
            >
              <span
                className="max-w-[100px] truncate text-center text-xs font-semibold text-gray-400"
                title={column}
              >
                {column}
              </span>
            </div>
          ))}

          {/* Rows */}

          {columns.map((column) => (
            <div
              key={column}
              className="contents"
            >
              {/* Row label */}

              <div
                className="flex items-center truncate rounded-lg px-3 py-4 text-xs font-semibold text-gray-400"
                title={column}
              >
                {column}
              </div>

              {/* Cells */}

              {columns.map(
                (otherColumn) => {
                  const value =
                    correlations[
                      column
                    ]?.[otherColumn];

                  const valid =
                    typeof value ===
                      "number" &&
                    Number.isFinite(
                      value
                    );

                  return (
                    <div
                      key={`${column}-${otherColumn}`}
                      className="group relative flex h-[75px] items-center justify-center rounded-lg border border-white/5 transition hover:scale-105 hover:border-white/20"
                      style={{
                        backgroundColor:
                          getCorrelationBackground(
                            value
                          ),
                      }}
                    >
                      <span
                        className={`text-xs font-bold ${
                          valid
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {getCorrelationText(
                          value
                        )}
                      </span>

                      {/* Tooltip */}

                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-gray-950 p-3 text-xs shadow-xl group-hover:block">
                        <p className="font-semibold text-white">
                          {column}
                        </p>

                        <p className="my-1 text-gray-600">
                          ↕
                        </p>

                        <p className="font-semibold text-white">
                          {otherColumn}
                        </p>

                        <div className="mt-2 border-t border-white/10 pt-2">
                          <span className="text-gray-500">
                            Correlation:
                          </span>

                          <span className="ml-2 font-bold text-purple-300">
                            {getCorrelationText(
                              value
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}

      <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-white/10 pt-5">

        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{
              backgroundColor:
                "rgba(59, 130, 246, 0.75)",
            }}
          />

          <span className="text-xs text-gray-500">
            Negative
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{
              backgroundColor:
                "rgba(255,255,255,0.08)",
            }}
          />

          <span className="text-xs text-gray-500">
            Weak / None
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded"
            style={{
              backgroundColor:
                "rgba(139, 92, 246, 0.75)",
            }}
          />

          <span className="text-xs text-gray-500">
            Positive
          </span>
        </div>

        <span className="text-xs text-gray-600">
          Range: -1.00 to +1.00
        </span>

      </div>
    </div>
  );
}


