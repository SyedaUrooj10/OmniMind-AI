"use client";

import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  Eye,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      whileHover={{
        scale: 1.03,
      }}
      className="glass absolute bottom-10 right-0 w-80 rounded-3xl p-6 shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="text-cyan-400" />

        <div>
          <h2 className="font-bold">
            OmniMind Assistant
          </h2>

          <p className="text-xs text-gray-400">
            AI Workspace
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">

        <Feature icon={<Bot size={18} />} text="Chat AI" />

        <Feature icon={<FileText size={18} />} text="Document AI" />

        <Feature icon={<Eye size={18} />} text="Vision AI" />

        <Feature icon={<BrainCircuit size={18} />} text="Predictive Analytics" />

      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">

        <MiniCard
          title="Accuracy"
          value="98.6%"
        />

        <MiniCard
          title="Models"
          value="30+"
        />

        <MiniCard
          title="Latency"
          value="0.3s"
        />

      </div>
    </motion.div>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function MiniCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 text-center">
      <p className="text-xs text-gray-400">
        {title}
      </p>

      <h3 className="mt-1 font-bold text-cyan-400">
        {value}
      </h3>
    </div>
  );
}