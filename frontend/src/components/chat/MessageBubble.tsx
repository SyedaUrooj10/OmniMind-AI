"use client";

import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  sender: "user" | "assistant";
  message: string;
}

export default function MessageBubble({
  sender,
  message,
}: MessageBubbleProps) {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-3xl items-start gap-3 ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div className="rounded-full bg-cyan-500 p-2">
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        <div
          className={`rounded-2xl px-5 py-4 ${
            isUser
              ? "bg-cyan-600"
              : "bg-white/10"
          }`}
        >
          <p className="leading-7 whitespace-pre-wrap">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}