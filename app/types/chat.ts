export type ChatRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatMessage = ChatRequestMessage & {
  id: number;
};
