"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am your visual financial assistant. Ask me about your transactions or upload a statement!" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.text();
            setMessages((prev) => [...prev, { role: "assistant", content: data }]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto mb-4 w-[350px] md:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-5 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-xl"></div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-sm">
                                <Sparkles className="w-5 h-5 text-emerald-50" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight text-white">Financial Assistant</h3>
                                <p className="text-emerald-100/90 text-xs font-medium flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="relative z-10 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                        <div className="flex justify-center my-2">
                            <div className="bg-slate-200/50 px-3 py-1 rounded-full text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                                Today
                            </div>
                        </div>

                        {messages.map((m, i) => (
                            <ChatMessage key={i} role={m.role} content={m.content} />
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-white text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                    <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all duration-200 shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message your assistant..."
                                className="w-full pl-3 py-2.5 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 text-slate-800"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="p-2.5 mb-0.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <Send size={18} className={isLoading ? "opacity-0" : ""} />
                                {isLoading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                            </button>
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-slate-400 font-medium">AI can make mistakes. Verify important info.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto relative group w-14 h-14 rounded-full shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 z-50 overflow-hidden ${isOpen ? "bg-slate-900 rotate-90" : "bg-emerald-600 hover:bg-emerald-500"
                    } text-white ring-4 ring-white`}
            >
                <div className={`absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
                {isOpen ? <X size={24} /> : <MessageCircle size={24} fill="currentColor" />}
            </button>
        </div>
    );
}
