"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  executed?: { action: string; result: unknown }[];
}

const SUGGESTIONS = [
  "Add John Smith, #75, Center, 6-3, 290 lbs, Junior",
  "Show me all my players",
  "Add a game vs Oregon on September 6th, week 1",
  "Delete the game against [opponent name]",
  "Update player #52's weight to 275",
];

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    CREATE_PLAYER: "bg-green-500/20 text-green-400 border-green-500/30",
    UPDATE_PLAYER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DELETE_PLAYER: "bg-red-500/20 text-red-400 border-red-500/30",
    CREATE_GAME:   "bg-green-500/20 text-green-400 border-green-500/30",
    UPDATE_GAME:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
    DELETE_GAME:   "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const label = action.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${colors[action] ?? "bg-white/10 text-white/50 border-white/20"}`}>
      ✓ {label}
    </span>
  );
}

export default function AiPage() {
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? new Date().getFullYear().toString();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          year,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content, executed: data.executed },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — check your connection");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="flex flex-col rounded-xl border border-white/[0.08] overflow-hidden"
      style={{ height: "calc(100vh - var(--topnav-h) - 6rem)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] flex-shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgb(var(--cp-500) / 0.18)", border: "1px solid rgb(var(--cp-500) / 0.30)" }}>
            <Sparkles size={15} style={{ color: "rgb(var(--cp-300))" }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white font-inter">AI Assistant</h1>
            <p className="text-[11px] text-white/30 font-inter">{year} season · Nvidia Nemotron 120B</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/55 transition-colors font-inter"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgb(var(--cp-500) / 0.12)", border: "1px solid rgb(var(--cp-500) / 0.22)" }}
            >
              <Sparkles size={26} style={{ color: "rgb(var(--cp-400))" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1 font-inter">Ask the AI anything</h2>
              <p className="text-white/35 text-sm max-w-xs font-inter">
                Add players, schedule games, or ask questions about your roster.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.14] rounded-lg px-4 py-2.5 transition-all duration-150 font-inter"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${
              msg.role === "user"
                ? "border"
                : "bg-white/[0.06] border border-white/[0.10]"
            }`}
              style={msg.role === "user" ? { background: "rgb(var(--cp-500) / 0.20)", borderColor: "rgb(var(--cp-500) / 0.35)" } : {}}
            >
              {msg.role === "user"
                ? <User size={13} style={{ color: "rgb(var(--cp-300))" }} />
                : <Bot size={13} className="text-white/60" />
              }
            </div>

            <div className={`max-w-[78%] space-y-2 ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-inter ${
                msg.role === "user"
                  ? "text-white border"
                  : "bg-white/[0.05] border border-white/[0.08] text-white/85"
              }`}
                style={msg.role === "user" ? { background: "rgb(var(--cp-500) / 0.18)", borderColor: "rgb(var(--cp-500) / 0.30)" } : {}}
              >
                {msg.content}
              </div>

              {msg.executed && msg.executed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                  {msg.executed.map((e, j) => (
                    <ActionBadge key={j} action={e.action} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.10] flex items-center justify-center mt-0.5">
              <Bot size={13} className="text-white/60" />
            </div>
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3">
              <Loader2 size={15} className="animate-spin text-white/30" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 font-inter">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.08] bg-white/[0.01]">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask the AI to add players, schedule games, edit data…"
            rows={1}
            className="flex-1 bg-white/[0.05] border border-white/[0.10] focus:border-white/25 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none transition-colors font-inter"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 hover:opacity-85"
            style={{ background: "rgb(var(--cp-500))" }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-white/15 mt-2 text-center font-inter">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
