import ChatLayout from "@/components/chat/ChatLayout";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  return (
    <ChatLayout>
      <div className="flex h-full flex-col">
        <ChatWindow />
        <ChatInput />
      </div>
    </ChatLayout>
  );
}
