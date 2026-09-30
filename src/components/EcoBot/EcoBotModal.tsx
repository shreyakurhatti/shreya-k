import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useEco } from '../../context/EcoContext';
import { askEcoBot } from '../../services/geminiService';

export const EcoBotModal: React.FC = () => {
  const { ecoBotOpen, setEcoBotOpen, activeScan, locationRegion } = useEco();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: activeScan
        ? `Hello! I'm EcoBot. I see you just scanned **${activeScan.itemName}** (${activeScan.plasticType}, Resin Code #${activeScan.resinCode}). How can I help you safely segregate, upcycle, or understand its health risks?`
        : `Hello! I'm EcoBot, your environmental science and polymer expert. Ask me anything about plastic recycling, toxic additives (BPA/phthalates), biodegradation enzymes, or zero-waste habits!`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!ecoBotOpen) return null;

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const reply = await askEcoBot(
        textToSend,
        activeScan
          ? {
              itemName: activeScan.itemName,
              plasticType: activeScan.plasticType,
              resinCode: activeScan.resinCode,
              severityLevel: activeScan.severityLevel,
              healthRisk: activeScan.healthRisk,
              biodegradation: activeScan.biodegradation,
              recommendedAction: activeScan.recommendedAction,
            }
          : null,
        newMessages
      );

      setMessages([...newMessages, { role: 'model' as const, content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'model' as const,
          content: 'EcoBot encountered a connection issue. Please check your network and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Can I recycle the cap with the bottle?',
    'What happens if I burn this plastic?',
    'Is this container microwave-safe?',
    'Does this plastic shed microplastics?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-emerald-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[620px] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">Ask EcoBot AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in scan context & {locationRegion} municipal sorting
              </p>
            </div>
          </div>

          <button
            onClick={() => setEcoBotOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Scan Context Pill (if any) */}
        {activeScan && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/20 text-xs flex items-center justify-between text-emerald-300">
            <span className="truncate">
              Active Context: <strong>{activeScan.itemName}</strong> (Resin #{activeScan.resinCode} {activeScan.polymerShort})
            </span>
            <span className="font-mono text-[10px] text-emerald-400 shrink-0">
              {activeScan.severityLevel} Severity
            </span>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>EcoBot is formulating chemical & recycling guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about segregation, health risks, recycling rules..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-400 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold disabled:opacity-40 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
