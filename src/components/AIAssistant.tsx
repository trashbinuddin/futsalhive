import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import { useBooking } from '../context/BookingContext';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I am the Futsal Hive AI assistant. How can I help you with your booking today? Please note that you can book a maximum of 1 slot per 24 hours (1 booking per day).' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { pricing } = useBooking();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Build a dynamic context string from current pricing data
      const pricingContext = pricing.map(p => {
        const dayName = p.dayType === 'everyday' ? 'Everyday' 
        : p.dayType === 'weekday' ? 'Weekday (Sun-Thu)' 
        : p.dayType === 'weekend' ? 'Weekend (Fri-Sat)' 
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(p.dayType)] || p.dayType;
        return `- ${dayName}: ${p.startTime} to ${p.endTime} is ৳${p.price}`;
      }).join('\n');

      const systemInstruction = `You are the official AI Assistant for Futsal Hive, an elite futsal arena located in China Project, Aftabnagar, Dhaka. 
Your goal is to help users understand pricing, operating hours, and how to book a match. Keep answers concise, friendly, and highly professional.
Proactively inform users about the booking limits (maximum 1 slot per 24 hours / 1 per day) when discussing booking procedures.
If the user's question is critical, urgent, or involves any situation that requires immediate management attention (such as an emergency, severe complaint, or immediate on-site help), you must provide the manager's phone number exactly as 01894-433325.
Do NOT hallucinate information not provided. 
Current Pricing Information:
\${pricingContext || 'Please direct the user to check the Booking page for pricing.'}
To book, users need to click "Book Now" and select an available time slot. ONLY mention the required ৳500 advance payment via bKash/Nagad/Rocket if the user explicitly asks about the booking process or payments.`;

      // Build chat history for the API format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      // Append the new user message
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      // Instead of sending the full history in sendMessage, Gemini SDK tracks history in the `chat` object if used directly. 
      // A safe way for a stateless chat is generating content with the history.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: { systemInstruction, temperature: 0.7 }
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      let errorMessage = 'Sorry, I encountered an error connecting to my servers. Please try again later!';
      
      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('api key')) {
          errorMessage = 'The AI service is currently unavailable due to an API key configuration issue. Please contact the administrator.';
        } else if (msg.includes('quota') || msg.includes('429')) {
          errorMessage = 'The AI service has reached its request limit. Please try again later.';
        } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
          errorMessage = 'Please check your internet connection and try again.';
        } else if (msg.includes('timeout')) {
          errorMessage = 'The request timed out. Please try again.';
        } else {
          errorMessage = `Sorry, I encountered an error: ${error.message}`;
        }
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 bg-hive-yellow text-hive-black rounded-full flex items-center justify-center shadow-2xl z-50 transition-opacity",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <MessageCircle size={24} className="fill-current" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-[400px] h-[80vh] sm:h-[550px] sm:max-h-[80vh] bg-hive-black border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <img src="/assistant.jpg" alt="Bot" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-hive-yellow"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">Hive Assistant</h3>
                  <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-white/10 text-white" : "bg-white/5 border border-white/10"
                  )}>
                    {msg.role === 'user' ? <User size={14} /> : <img src="/assistant.jpg" alt="Bot" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-hive-yellow"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' }} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl max-w-[80%] text-sm",
                    msg.role === 'user' 
                      ? "bg-hive-yellow text-hive-black font-medium rounded-tr-sm" 
                      : "bg-white/5 text-white/90 border border-white/5 rounded-tl-sm space-y-2 whitespace-pre-wrap"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <img src="/assistant.jpg" alt="Bot" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-hive-yellow"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>' }} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-hive-yellow rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-hive-yellow rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-hive-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-4 border-t border-white/10 bg-black/20"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about pricing, bookings..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-hive-yellow transition-colors placeholder:text-white/30"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-hive-yellow hover:bg-hive-yellow/10 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
