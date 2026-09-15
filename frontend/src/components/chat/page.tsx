import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {
  return (
    <ChatLayout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-black">
            🤖 OmniMind Assistant
          </h1>

          <p className="mt-5 text-gray-400">
            Start a conversation with AI.
          </p>
        </div>
      </div>
    </ChatLayout>
  );
}
