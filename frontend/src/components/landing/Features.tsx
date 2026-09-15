"use client";

import {
  BrainCircuit,
  FileText,
  Eye,
  BarChart3,
} from "lucide-react";

import FeatureCard from "../features/FeatureCard";

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-8 py-40"
    >
      <h2 className="text-center text-5xl font-black">
        AI Modules
      </h2>

      <p className="mx-auto mt-5 max-w-3xl text-center text-gray-400">
        Everything you need to build enterprise AI
        applications in one unified platform.
      </p>

      <div className="mt-20 grid gap-8 md:grid-cols-2">

        <FeatureCard
          icon={<BrainCircuit size={30} />}
          title="Chat AI"
          description="Enterprise conversational AI with memory, tools and RAG."
          color="linear-gradient(135deg,#2563EB,#7C3AED)"
        />

        <FeatureCard
          icon={<FileText size={30} />}
          title="Document AI"
          description="Summarize, classify and search PDFs using LLMs."
          color="linear-gradient(135deg,#0EA5E9,#06B6D4)"
        />

        <FeatureCard
          icon={<Eye size={30} />}
          title="Vision AI"
          description="Image understanding, OCR and object detection."
          color="linear-gradient(135deg,#9333EA,#6366F1)"
        />

        <FeatureCard
          icon={<BarChart3 size={30} />}
          title="Predictive Analytics"
          description="Machine learning dashboards and forecasting."
          color="linear-gradient(135deg,#10B981,#22C55E)"
        />

      </div>
    </section>
  );
}