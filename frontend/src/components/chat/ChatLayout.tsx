"use client";

import { ReactNode } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";

interface Props {
  children: ReactNode;
}

export default function ChatLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-[#050816] text-white">
      <ChatSidebar />

      <div className="flex flex-1 flex-col">
        <ChatHeader />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}