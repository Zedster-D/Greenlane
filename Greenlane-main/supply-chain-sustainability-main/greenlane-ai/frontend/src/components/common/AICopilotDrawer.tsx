import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, ChatResponse } from '../../api/client';
import { X, Send, Bot, User, Sparkles, Cpu, ChevronRight } from 'lucide-react';

export const AICopilotDrawer: React.FC = () => {
  const { isCopilotOpen, setIsCopilotOpen, dataset } = useApp();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; toolCalls?: any[] }>>([
    {
      role: 'assistant',
      content: "Hello! I'm your **GreenLane AI Sustainability Copilot**. I can calculate footprint drivers, run mode-shift simulations, solve Pareto multi-objective plans, and simulate disruptions. How can I help?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isCopilotOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user' as const, content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: ChatResponse = await api.sendChatMessage(query, dataset);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.reply,
        toolCalls: res.tool_calls
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Failed to reach the calculation engine. Please ensure the backend is running."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Why are emissions so high?",
    "Simulate shifting air shipments to sea freight",
    "How can we reduce emissions by 25%?",
    "Simulate a port disruption at Rotterdam",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-dark-900 h-full border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-850">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-dark-950 font-bold">
              <Bot className="w-5 h-5 text-dark-950" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center">
                AI Sustainability Copilot
                <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TOOL CALLING ACTIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Context: {dataset === 'demo' ? 'VastraGlobal Demo' : 'Original CSV'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-brand-500 text-white shadow-glow-emerald rounded-tr-none'
                    : 'bg-dark-850 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-sans prose prose-invert prose-xs">
                  {m.content}
                </div>

                {/* Tool Executions Badge */}
                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
                      <Cpu className="w-3 h-3" />
                      <span>Executed {m.toolCalls.length} calculation tools</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.toolCalls.map((tc, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 border border-slate-700 text-slate-300">
                          {tc.tool}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-dark-850 p-3 rounded-xl border border-slate-800 w-max">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></div>
              <span>Querying optimization and carbon engines...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-dark-950/80 border-t border-slate-800/80 overflow-x-auto flex space-x-2 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-dark-800 border border-slate-700 text-slate-300 hover:border-brand-500/50 hover:text-brand-400 transition-colors flex items-center space-x-1"
            >
              <span>{q}</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-dark-850">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'simulate shifting air to sea')..."
              className="flex-1 bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-brand-500 text-white disabled:opacity-40 hover:bg-brand-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
