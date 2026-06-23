'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, CheckCheck, Clock } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    time: string;
    isAction?: boolean;
}

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '👋 Hi there! Welcome to ShoeStyle Premium. How can we help you today?',
            isBot: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    // 🔥 Isse hum website ke kisi bhi button (jaise FAQ page) se chat open kar payenge
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-live-chat', handleOpenChat);
        return () => window.removeEventListener('open-live-chat', handleOpenChat);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isBot: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // 🤖 Bot Reply & WhatsApp Redirect Logic
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: 'Thanks for reaching out! To give you the fastest resolution, our human agents are available on WhatsApp. Click below to connect instantly! 🚀',
                isBot: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, {
                id: (Date.now() + 2).toString(),
                text: inputValue, // Save user message to pass to whatsapp
                isBot: true,
                isAction: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    const handleWhatsAppRedirect = (userText: string) => {
        const phone = "918726540277";
        const encodedText = encodeURIComponent(`Hi ShoeStyle Support! 👋\n\nMy Query: ${userText}`);
        window.open(`https://wa.me/${phone}?text=${encodedText}`, '_blank');
    };

    return (
        <>
            {/* 🔥 Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-1 group relative"
                        >
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-gray-900"></span>
                            </span>
                            <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[380px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[550px] max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-black p-5 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-gray-800 shadow-sm">
                                        <Sparkles size={18} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-tight">ShoeStyle Support</h3>
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        <Clock size={10} /> Typically replies instantly
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 bg-[#F4F7FB] space-y-4">
                            <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Today</div>

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                    {msg.isAction ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-2">
                                            <button
                                                onClick={() => handleWhatsAppRedirect(msg.text)}
                                                className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1"
                                            >
                                                <MessageCircle size={18} /> Connect with Human Agent
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm ${msg.isBot
                                                    ? 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                                    : 'bg-gray-900 text-white rounded-tr-sm'
                                                }`}
                                        >
                                            <p className="leading-relaxed">{msg.text}</p>
                                            <p className={`text-[10px] mt-2 text-right flex items-center justify-end gap-1 ${msg.isBot ? 'text-gray-400' : 'text-gray-300'}`}>
                                                {msg.time} {!msg.isBot && <CheckCheck size={12} className="text-blue-400" />}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            ))}

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-gray-100 flex gap-1.5 items-center">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSend} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:bg-white transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="bg-gray-900 disabled:bg-gray-300 text-white p-3 rounded-full transition-colors flex-shrink-0"
                                >
                                    <Send size={18} className="ml-0.5" />
                                </button>
                            </form>
                            <div className="text-center mt-3">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">⚡ Powered by ShoeStyle AI</p>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}