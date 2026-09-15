"use client";

import { create } from "zustand";

import { ChatMessage } from "@/types/chat";
import api from "@/lib/api";

interface ChatStore {
  messages: ChatMessage[];
  loading: boolean;

  addMessage: (message: ChatMessage) => void;

  sendMessage: (prompt: string) => Promise<void>;

  clearMessages: () => void;
}

interface ChatResponse {
  response: string;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: "1",
      sender: "assistant",
      message:
        "Hello 👋 I'm OmniMind AI. How can I help you today?",
    },
  ],

  loading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  sendMessage: async (prompt: string) => {
    const message = prompt.trim();

    if (!message) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      loading: true,
    }));

    try {
      const response = await api.post<ChatResponse>(
        "/chat/",
        {
          message,
        }
      );

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        message:
          response.data.response ||
          "I didn't receive a response from the AI service.",
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        loading: false,
      }));
    } catch (error) {
      console.error(
        "Chat API error:",
        error
      );

      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        message:
          "Sorry, I couldn't process your request. Please try again.",
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        loading: false,
      }));
    }
  },

  clearMessages: () =>
    set({
      messages: [
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          message:
            "Hello 👋 I'm OmniMind AI. How can I help you today?",
        },
      ],
    }),
}));