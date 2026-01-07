import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex gap-3 mb-4 animate-in slide-in-from-bottom-2 fade-in duration-300 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ${isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-600 border border-emerald-100'
                }`}>
                {isUser ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${isUser
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                    }`}
            >
                <p className="whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
}
