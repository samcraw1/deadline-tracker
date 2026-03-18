"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your DOL compliance assistant. Ask me about notice requirements, deadlines, or ERISA regulations.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const current = assistantContent;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: current,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all"
        style={{
          backgroundColor: "#003366",
          color: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#002244")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#003366")}
      >
        <MessageCircle style={{ width: 20, height: 20 }} />
        DOL Assistant
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-xl"
      style={{
        width: 400,
        height: 520,
        backgroundColor: "#ffffff",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#003366", color: "#ffffff" }}
      >
        <div className="flex items-center gap-2">
          <Bot style={{ width: 20, height: 20 }} />
          <span className="text-sm font-medium">DOL Compliance Assistant</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-1 transition-colors"
          style={{ color: "#ffffff" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#002244")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#EEF2FF" }}
              >
                <Bot style={{ width: 16, height: 16, color: "#0066CC" }} />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { backgroundColor: "#0066CC", color: "#ffffff" }
                  : { backgroundColor: "#f1f5f9", color: "#111827" }
              }
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === "user" && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#0066CC" }}
              >
                <User style={{ width: 16, height: 16, color: "#ffffff" }} />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#EEF2FF" }}
            >
              <Bot style={{ width: 16, height: 16, color: "#0066CC" }} />
            </div>
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "#f1f5f9" }}>
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: "#94a3b8", animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: "#94a3b8", animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: "#94a3b8", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3" style={{ borderTop: "1px solid #e2e8f0" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DOL compliance..."
            className="flex-1 rounded-md px-3 py-2 text-sm outline-none"
            style={{
              border: "1px solid #e2e8f0",
              fontSize: 14,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#0066CC";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.boxShadow = "none";
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-md px-3 py-2 transition-colors"
            style={{
              backgroundColor: isLoading || !input.trim() ? "#93c5fd" : "#0066CC",
              color: "#ffffff",
              border: "none",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
