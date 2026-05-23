import type { ChatMessage } from "@/app/types/chat";

export async function requestChatResponse(
  message: string,
  messages: ChatMessage[],
) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      messages: messages.map(({ role, content }) => ({
        role,
        content,
      })),
    }),
  });
  const data = (await response.json()) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "The AI assistant request failed.");
  }

  return (
    data.message ||
    "I could not answer that right now. Please contact the clinic directly."
  );
}
