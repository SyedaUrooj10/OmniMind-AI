export default function DashboardLoading() {
  return (
    <div className="min-h-full bg-[#050816] p-6">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-white/10" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/5" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl border border-white/10 lg-white/[0.03]"
              />
            ),
          )}
        </div>

        <div className="mt-6 h-96 rounded-3xl border border-white/10 lg-white/[0.03]" />
      </div>
    </div>
  );
}




