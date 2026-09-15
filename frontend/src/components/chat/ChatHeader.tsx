"use client";

import { Bot } from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-cyan-500 p-2">
          <Bot />
        </div>

        <div>
          <h2 className="font-bold">OmniMind Assistant</h2>
          <p className="text-sm text-green-400">Online</p>
        </div>
      </div>
    </header>
  );
}