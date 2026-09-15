"use client";

import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Bot,
  Database,
} from "lucide-react";

import { useRouter } from "next/navigation";
import ActionButton from "./ActionButton";

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="glass mt-10 rounded-3xl p-8">

      {/* Header */}
      <h2 className="text-2xl font-bold">
        ⚡ Quick Actions
      </h2>

      {/* Actions */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <ActionButton
          icon={<MessageSquare size={22} />}
          title="New AI Chat"
          subtitle="Start a conversation with OmniMind"
        />

        <ActionButton
          icon={<Database size={22} />}
          title="Upload Dataset"
          subtitle="Upload CSV for AI data profiling"
          onClick={() => router.push("/dashboard/datasets")}
        />

        <ActionButton
          icon={<FileText size={22} />}
          title="Upload Document"
          subtitle="Analyze PDFs with AI"
        />

        <ActionButton
          icon={<ImageIcon size={22} />}
          title="Vision AI"
          subtitle="Analyze images"
        />

        <ActionButton
          icon={<BarChart3 size={22} />}
          title="Predictive Analytics"
          subtitle="Run ML predictions"
        />

        <ActionButton
          icon={<Bot size={22} />}
          title="Create AI Agent"
          subtitle="Build an automated workflow"
        />

      </div>
    </div>
  );
}




