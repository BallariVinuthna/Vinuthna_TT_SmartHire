import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bot,
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { globalAiService } from '../../services/globalAiService';

/* ─────────────────────── helpers ─────────────────────── */
const roleLabel = (role) => {
  if (!role) return 'Guest';
  if (role.includes('RECRUITER')) return 'Recruiter';
  if (role.includes('CANDIDATE')) return 'Candidate';
  if (role.includes('ADMIN')) return 'Admin';
  return 'User';
};

const WELCOME = (role) =>
  `👋 Hi! I'm **SmartHire AI** — your ${roleLabel(role)} assistant. Ask me anything about jobs, applications, recruitment, or tech!`;

const STORAGE_KEY = 'smarthire_global_chat_messages';
const CONV_KEY = 'smarthire_global_chat_conv_id';

/* ─────────────────────── component ─────────────────────── */
const GlobalChatBot = () => {
  const { isAuthenticated, role } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [conversationId, setConversationId] = useState(() => {
    const saved = localStorage.getItem(CONV_KEY);
    return saved ? Number(saved) : null;
  });
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [unread, setUnread] = useState(0);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const micSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  /* persist messages */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  /* scroll to bottom on new messages */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* focus input when opened */
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 80);
      setUnread(0);
    }
  }, [open]);

  /* ── Send message ── */
  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setLoading(true);

    try {
      const res = await globalAiService.chat(text, conversationId);
      if (res.success && res.data) {
        const conv = res.data;
        // Persist conversation id for context continuity
        setConversationId(conv.id);
        localStorage.setItem(CONV_KEY, String(conv.id));

        // Get the last assistant message from returned conversation
        const msgs = conv.messages || [];
        const lastAi = [...msgs].reverse().find((m) => m.role === 'ASSISTANT');
        const aiContent = lastAi?.content || '(No response)';
        const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
        setMessages((prev) => [...prev, aiMsg]);

        if (!open) setUnread((n) => n + 1);
      }
    } catch (err) {
      console.error('GlobalChatBot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Sorry, I encountered an error. Please try again.',
          ts: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [draft, loading, conversationId, open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Mic toggle ── */
  const handleMicClick = useCallback(() => {
    if (!micSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    let final = '';

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setDraft((prev) => {
        const base = prev.replace(/\[🎤.*?\]/g, '').trimEnd();
        if (final) return base ? `${base} ${final}` : final;
        if (interim) return base ? `${base} [🎤 ${interim}]` : `[🎤 ${interim}]`;
        return prev;
      });
    };

    rec.onend = () => {
      setIsListening(false);
      setDraft((prev) => prev.replace(/\[🎤.*?\]/g, '').trim());
    };

    rec.onerror = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  }, [isListening, micSupported]);

  /* ── Clear chat ── */
  const handleClear = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CONV_KEY);
  };

  /* ── Render markdown-lite (bold + line-breaks) ── */
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  /* Only show for authenticated users */
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Floating launcher button ── */}
      <button
        id="global-chatbot-launcher"
        onClick={() => setOpen((v) => !v)}
        className={[
          'fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full',
          'flex items-center justify-center shadow-2xl',
          'transition-all duration-300 focus:outline-none',
          open
            ? 'bg-slate-700 hover:bg-slate-600 rotate-0'
            : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
        ].join(' ')}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
      >
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
        )}

        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white relative z-10" />
        )}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-20">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          id="global-chatbot-panel"
          className={[
            'fixed bottom-24 right-6 z-[9999]',
            'w-[360px] max-w-[calc(100vw-24px)]',
            'bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50',
            'flex flex-col overflow-hidden',
            'animate-[fadeSlideUp_0.2s_ease-out]',
          ].join(' ')}
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-slate-700/60 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">SmartHire AI</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{roleLabel(role)} Assistant</p>
            </div>
            <button
              onClick={handleClear}
              title="Clear chat history"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
            {/* Welcome message */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-indigo-300" />
              </div>
              <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-none px-3 py-2 text-[12px] text-slate-200 leading-relaxed max-w-[85%]">
                {renderContent(WELCOME(role))}
              </div>
            </div>

            {/* Conversation messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3 text-indigo-300" />
                  </div>
                )}
                <div
                  className={[
                    'px-3 py-2 rounded-2xl text-[12px] leading-relaxed max-w-[85%] whitespace-pre-wrap break-words',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.error
                      ? 'bg-red-900/40 border border-red-700/50 text-red-300 rounded-bl-none'
                      : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-bl-none',
                  ].join(' ')}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-indigo-300" />
                </div>
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-none px-3 py-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  <span className="text-[11px] text-slate-400">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-700/60 shrink-0">
            {isListening && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-400 mb-1 px-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Listening...
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask anything…"
                disabled={loading}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed disabled:opacity-50"
              />

              {/* Mic button */}
              {micSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  title={isListening ? 'Stop recording' : 'Voice input'}
                  disabled={loading}
                  className={[
                    'relative p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40',
                    isListening
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700',
                  ].join(' ')}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-xl animate-ping bg-red-500 opacity-30" />
                  )}
                  {isListening ? (
                    <MicOff className="w-4 h-4 relative z-10" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Send button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !draft.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 px-1">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>
      )}

      {/* Inline keyframe */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default GlobalChatBot;
