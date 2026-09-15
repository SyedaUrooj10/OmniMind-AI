import api from "./api";

export async function sendChatMessage(message: string) {
  return api.post("/chat", {
    message,
  });
}