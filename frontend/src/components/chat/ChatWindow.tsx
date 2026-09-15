"use client";

import MessageBubble from "./MessageBubble";
import { useChatStore } from "@/store/chatStore";

export default function ChatWindow() {
  const { messages } = useChatStore();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          sender={message.sender}
          message={message.message}
        />
      ))}
    </div>
  );
}