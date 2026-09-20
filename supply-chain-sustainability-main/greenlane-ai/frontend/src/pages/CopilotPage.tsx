import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api, ChatResponse } from '../api/client';
import { Bot, Send, User, Sparkles, Cpu, ChevronRight, MessageSquare, Terminal } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const { dataset } = useApp();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; toolCalls?: any[] }>>([
    {
      role: 'assistant',
      content: `### 👋 Welcome to GreenLane AI Sustainability Copilot!

I am connected directly to your logistics database, canonical ADEME carbon calculation engine, Pareto multi-objective optimizer, and supply disruption models.

**Try asking:**
- *"Why are our emissions so high?"*
- *"Simulate shifting air freight to ocean shipping"*
- *"How can we reduce our carbon footprint by 25%?"*
- *"What is the impact of a port disruption at Rotterdam?"*`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        content: "⚠️ Calculation engine communication error. Please check if the FastAPI backend is running."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Why are emissions so high?",
    "Simulate shifting air shipments to sea freight",
    "How can we reduce emissions by 20%?",
    "Simulate a port disruption in Rotterdam",
    "Show supplier ESG ratings",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-dark-950 font-bold shadow-glow-emerald">
            <Bot className="w-5 h-5 text-dark-950" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Sustainability & Decarbonization Copilot</h2>
            <p className="text-xs text-slate-400">Deterministic tool execution &bull; Zero Hallucination Carbon Math</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300">{dataset === 'demo' ? 'VastraGlobal Dataset' : 'Original CSV Dataset'}</span>
        </div>
      </div>

      {/* Chat History Box */}
      <div className="flex-1 glass-panel rounded-xl p-5 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-500 text-white shadow-glow-emerald'
                  : 'bg-dark-850 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert prose-xs">
                {m.content}
              </div>

              {/* Tool Execution Transparency Pills */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono font-medium">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Engine Tool Calls Executed:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.toolCalls.map((tc, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 border border-slate-700 text-cyan-300">
                        {tc.tool}({JSON.stringify(tc.parameters)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-dark-850 p-3 rounded-xl border border-slate-800 w-max">
            <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></div>
            <span>Evaluating carbon ledger & executing simulation tools...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-mono text-slate-500 shrink-0">Quick prompts:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-dark-850 border border-slate-800 text-slate-300 hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-panel p-2 rounded-xl flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot to analyze emissions, simulate mode shifts, or solve Pareto plans..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-glow-emerald transition-all disabled:opacity-40 flex items-center space-x-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
