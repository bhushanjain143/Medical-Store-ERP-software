"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Pill, Loader2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
  medicines?: Array<{
    id: string;
    name: string;
    genericName: string | null;
    category: string;
    manufacturer: string | null;
    totalStock: number;
    price: number;
    available: boolean;
  }>;
}

export function MedicineChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Hi! I'm your medicine assistant. Search for medicines by name, composition, or category. I can also suggest substitutes!",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const isSubstitute = query.toLowerCase().includes("substitute") || query.toLowerCase().includes("alternative");

      if (isSubstitute) {
        const medName = query.replace(/substitute|alternative|for|of/gi, "").trim();
        const searchRes = await fetch(`/api/medicines/search?q=${encodeURIComponent(medName)}&inStock=true`);
        const searchData = await searchRes.json();

        if (searchData.results?.length > 0) {
          const medId = searchData.results[0].id;
          const subRes = await fetch(`/api/medicines/substitutes?medicineId=${medId}`);
          const subs = await subRes.json();

          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: Array.isArray(subs) && subs.length > 0
                ? `Found ${subs.length} substitute(s) for ${searchData.results[0].name}:`
                : `No substitutes found for "${medName}". The medicine might be unique or not in our database.`,
              medicines: Array.isArray(subs) ? subs : undefined,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "bot", content: `Could not find "${medName}" in our database. Please check the spelling.` },
          ]);
        }
      } else {
        const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(query)}&inStock=true`);
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: data.message || "Here are the results:",
            medicines: data.results,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:scale-110 transition-all duration-300 no-print"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-22 right-5 z-50 w-[360px] max-w-[calc(100vw-40px)] h-[500px] max-h-[calc(100vh-120px)] rounded-2xl shadow-2xl border flex flex-col animate-fade-in-scale no-print bg-[var(--bg-card)] border-[var(--border-default)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-default)] bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-2xl">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Medicine Assistant</h3>
              <p className="text-[10px] text-white/70">Search medicines, find substitutes</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-indigo-500" />
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-sm"
                        : "bg-[var(--bg-muted)] text-[var(--text-primary)] rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.medicines && msg.medicines.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.medicines.slice(0, 5).map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center gap-2 p-2 rounded-xl border text-xs bg-[var(--bg-card)] border-[var(--border-default)]"
                        >
                          <Pill className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--text-primary)] truncate">{med.name}</p>
                            <p className="text-[var(--text-tertiary)] truncate">{med.genericName || med.category}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-indigo-500">{formatCurrency(med.price)}</p>
                            <p className={`text-[10px] ${med.available ? "text-emerald-500" : "text-red-500"}`}>
                              {med.available ? `${med.totalStock} in stock` : "Out of stock"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-indigo-500" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="bg-[var(--bg-muted)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border-default)]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Search medicine or ask for substitutes..."
                className="flex-1 rounded-xl border px-3.5 py-2.5 text-sm bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-50 hover:shadow-lg transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
