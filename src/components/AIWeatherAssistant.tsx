import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Bot, ArrowUpRight, RefreshCw, CheckCircle } from 'lucide-react';
import { ChatMessage, PersonaId, WeatherData } from '../types';
import { PERSONA_PROFILES } from '../data/weatherData';
import { getPersonalizedAIQuestions } from '../utils/weatherEngine';

interface AIWeatherAssistantProps {
  weatherData: WeatherData;
  activePersona: PersonaId;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AIWeatherAssistant: React.FC<AIWeatherAssistantProps> = ({
  weatherData,
  activePersona,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persona = PERSONA_PROFILES.find((p) => p.id === activePersona) || PERSONA_PROFILES[0];
  const dynamicQuestions = getPersonalizedAIQuestions(activePersona, weatherData.locationName);

  const quickPrompts = dynamicQuestions.map((item) => ({
    label: item.label,
    prompt: item.q,
  }));

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          text: `Hello! I'm your ClimaIQ Environmental Assistant. I analyze live conditions in **${weatherData.locationName}** (${weatherData.currentTemp}°C, ${weatherData.conditionText}) and tailor actionable recommendations for your **${persona.name}** profile. Ask me anything!`,
          timestamp: 'Just now',
          suggestedFollowUps: dynamicQuestions.slice(0, 3).map((item) => item.q),
        },
      ]);
    }
  }, [weatherData.locationName, activePersona]);

  // Handle incoming initial prompt from cards
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          persona: persona.name,
          weatherContext: weatherData,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "Based on the current weather data, please follow the outdoor advisories.",
        actionablePoints: data.actionablePoints,
        suggestedFollowUps: data.suggestedFollowUps || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error calling AI assistant endpoint:', err);
      // Fallback
      const aiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `In ${weatherData.locationName}, temperature is ${weatherData.currentTemp}°C with ${weatherData.hourly[2]?.rainProb || 15}% rain chance. Conditions are suitable for standard outdoor routines.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-150px)] max-h-[820px] min-h-[480px] rounded-[28px] bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* AI Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.08] bg-[#05070A]/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative p-2 rounded-2xl bg-[rgba(96,165,250,0.15)] border border-[rgba(96,165,250,0.3)] text-[#60A5FA] shrink-0">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#05070A]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">Ask Weather AI</h2>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-[rgba(96,165,250,0.15)] text-[#60A5FA] border border-[rgba(96,165,250,0.3)]">
                Gemini AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate">
              {weatherData.locationName} · {persona.name}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-reset',
                sender: 'assistant',
                text: `Chat reset. Ask any question about ${weatherData.locationName}'s weather, outdoor activity safety, commute advice, or travel planning!`,
                timestamp: 'Now',
              },
            ])
          }
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation cursor-pointer shrink-0"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 overscroll-contain scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-white/[0.08] text-white rounded-br-none border border-white/[0.12]'
                  : 'bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.18)] text-slate-100 rounded-bl-none backdrop-blur-md'
              }`}
            >
              {/* Formatted Text */}
              <div className="whitespace-pre-wrap font-normal">{msg.text}</div>

              {/* Actionable points */}
              {msg.actionablePoints && msg.actionablePoints.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-white/[0.08] space-y-1">
                  {msg.actionablePoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#60A5FA]">
                      <CheckCircle className="w-3 h-3 text-[#60A5FA] shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>

            {/* Follow-up suggestions */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.suggestedFollowUps.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(suggestion)}
                    className="flex items-center gap-1 text-[11px] font-medium px-3 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] text-[#60A5FA] transition-all min-h-[40px] touch-manipulation cursor-pointer select-none"
                  >
                    <span className="text-left">{suggestion}</span>
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] w-36 text-xs text-[#60A5FA]">
            <Sparkles className="w-4 h-4 animate-spin text-[#60A5FA]" />
            <span>Analyzing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Horizontal Scroll */}
      <div className="px-3.5 py-2 bg-[#05070A]/50 border-t border-white/[0.04] overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 overscroll-x-contain">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qp.prompt)}
            className="text-xs whitespace-nowrap px-3.5 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] text-slate-200 hover:text-white transition-all shrink-0 font-medium min-h-[44px] flex items-center justify-center touch-manipulation cursor-pointer select-none"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#05070A]/90 border-t border-white/[0.08] flex items-center gap-2 shrink-0"
      >
        <input
          id="ai-weather-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${weatherData.locationName} weather...`}
          className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#60A5FA]/50 transition-all font-normal min-h-[46px]"
        />
        <button
          id="send-ai-query-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 rounded-2xl bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-40 disabled:hover:bg-[#60A5FA] text-slate-950 font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
          title="Send query"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </form>
    </div>
  );
};

