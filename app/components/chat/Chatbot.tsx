"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { requestChatResponse } from "@/app/services/chatApi";
import type { ChatMessage } from "@/app/types/chat";

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello. I can help with clinic timings, treatments, or booking a visit with Dr. Virdy.",
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();

    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedInput,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const responseMessage = await requestChatResponse(
        trimmedInput,
        nextMessages,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: responseMessage,
        },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Error: I could not reach the assistant right now. Please contact the clinic directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pearl-chatbot fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section className="flex h-[34rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.5rem] border border-[#eadfcf] bg-[#fffdf9] shadow-2xl shadow-[#183f41]/20">
          <header className="flex items-center justify-between bg-[#183f41] px-5 py-4 text-white">
            <div>
              <p className="text-xs font-semibold text-[#dfc58c]">
                Pearl Dental
              </p>
              <h2 className="pearl-serif text-2xl">Clinic Assistant</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg font-semibold transition hover:bg-white/10"
              aria-label="Close chat"
            >
              x
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8f3ea] px-4 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-[#205356] text-white"
                      : "rounded-bl-md border border-[#eadfcf] bg-[#fffdf9] text-[#46524f]"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#eadfcf] bg-[#fffdf9] px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#205356]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#205356] [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#205356] [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[#eadfcf] bg-[#fffdf9] p-4"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm text-[#303937] outline-none transition focus:border-[#418083] focus:bg-[#fffdf9] focus:ring-4 focus:ring-[#dfd6c5]"
                placeholder="Ask about services or appointments"
                type="text"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-[#205356] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183f41] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-full bg-[#205356] px-5 py-4 text-sm font-bold text-white shadow-xl shadow-[#183f41]/20 transition hover:-translate-y-0.5 hover:bg-[#183f41] hover:shadow-2xl"
          aria-label="Open clinic assistant chat"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fffdf9] text-xs font-black text-[#23575a] transition group-hover:bg-[#f5efe4]">
            AI
          </span>
          Chat
        </button>
      )}
    </div>
  );
}
