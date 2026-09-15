import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl text-center">

        <h1 className="text-5xl font-black">
          OmniMind AI
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          Your intelligent AI workspace for data analysis,
          documents, vision, predictive analytics, and AI agents.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500"
          >
            Get Started
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
          >
            Open Dashboard
          </Link>
        </div>

      </div>
    </main>
  );
}