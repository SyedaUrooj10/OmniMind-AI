"use client";

import { Plus, MessageSquare } from "lucide-react";

const chats = [
  "AI Project Planning",
  "Resume Review",
  "Document Analysis",
];

export default function ChatSidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-[#0B1120] p-5">
      <button className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-semibold hover:bg-cyan-500 transition">
        <Plus size={18} />
        New Chat
      </button>

      <div className="space-y-3">
        {chats.map((chat) => (
          <button
            key={chat}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10 transition"
          >
            <MessageSquare size={18} />
            <span>{chat}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}