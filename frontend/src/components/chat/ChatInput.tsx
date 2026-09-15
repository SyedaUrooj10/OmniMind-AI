"use client";

import { useState } from "react";

import {
  Paperclip,
  Smile,
  SendHorizontal,
} from "lucide-react";

import { useChatStore } from "@/store/chatStore";

export default function ChatInput() {
  const [text, setText] = useState("");

  const {
    sendMessage,
    loading,
  } = useChatStore();

  const handleSend = async () => {
    const message = text.trim();

    if (!message || loading) {
      return;
    }

    setText("");

    await sendMessage(message);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      void handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 bg-black/20 p-4">
      <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">

        {/* Attachment */}

        <button
          type="button"
          className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Message Input */}

        <input
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-500 disabled:cursor-not-allowed"
          placeholder={
            loading
              ? "OmniMind is thinking..."
              : "Ask OmniMind AI anything..."
          }
        />

        {/* Emoji */}

        <button
          type="button"
          className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          title="Add emoji"
        >
          <Smile size={20} />
        </button>

        {/* Send */}

        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={
            loading || !text.trim()
          }
          className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 p-3 text-white transition hover:scale-105 hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          title="Send message"
        >
          <SendHorizontal size={18} />
        </button>

      </div>
    </div>
  );
}