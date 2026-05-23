"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { requestChatResponse } from "@/app/services/chatApi";
import type { ChatMessage } from "@/app/types/chat";

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi, I'm Pearl Dental Clinic's assistant. Ask about services, appointments, hours, contact details, or treatments.",
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
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section className="flex h-[34rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-2xl shadow-blue-950/20">
          <header className="flex items-center justify-between bg-blue-950 px-5 py-4 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                Pearl Dental
              </p>
              <h2 className="text-lg font-bold">Clinic Assistant</h2>
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

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5">
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
                      ? "rounded-br-md bg-blue-700 text-white"
                      : "rounded-bl-md border border-blue-100 bg-white text-slate-700"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-blue-100 bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700 [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-blue-100 bg-white p-4"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-blue-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Ask about services or appointments"
                type="text"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-full bg-blue-700 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-2xl"
          aria-label="Open clinic assistant chat"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-blue-800 transition group-hover:bg-sky-100">
            AI
          </span>
          Chat
        </button>
      )}
    </div>
  );
}
