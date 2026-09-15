export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  message: string;
}