import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  Loader2,
  MessageSquareText,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Zap,
} from 'lucide-react';
import { recruiterService } from '../../services/recruiterService';

const emptyConversation = {
  id: null,
  title: 'Recruiter AI Session',
  messages: [],
};

const SUGGESTED_PROMPTS = [
  { label: 'Summarize Candidate', text: "Summarize this candidate's resume, key strengths, and overall background." },
  { label: 'Extract Technical Skills', text: "What are the candidate's core technical skills, frameworks, and tools mentioned?" },
  { label: 'Years of Experience', text: "How many years of professional experience are explicitly evidenced in this resume?" },
  { label: 'Compare with Job Posting', text: "Compare this resume against the uploaded job description. What matches and what is missing?" },
  { label: 'Missing Qualifications', text: "Which qualifications mentioned in the job description are not evidenced in the resume?" },
  { label: 'Explain Spring Boot (Subject QA)', text: "What is Spring Boot and how does its Auto-Configuration work?" },
  { label: 'Java 21 Features (Subject QA)', text: "Explain Virtual Threads and key new features in Java 21." },
];

const RecruiterAssistantPage = () => {
  const [conversations, setConversations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(() => {
    const saved = localStorage.getItem('smarthire_active_ai_conversation');
    return saved ? Number(saved) : null;
  });
  const [selectedDocFilter, setSelectedDocFilter] = useState('');
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [documentType, setDocumentType] = useState('RESUME');
  const [selectedFile, setSelectedFile] = useState(null);

  // Analysis & Matching Modals State
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'analyzer' | 'matcher'
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedAnalysisDocId, setSelectedAnalysisDocId] = useState('');

  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchResumeId, setMatchResumeId] = useState('');
  const [matchJdId, setMatchJdId] = useState('');

  // Mic / Speech-to-Text
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const micSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || emptyConversation,
    [activeConversationId, conversations]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation.messages, chatLoading]);

  const fetchConversations = async () => {
    try {
      const res = await recruiterService.getAIConversations();
      if (res.success) {
        const nextConversations = res.data || [];
        setConversations(nextConversations);
        if (nextConversations.length > 0) {
          if (!activeConversationId || !nextConversations.some((c) => c.id === activeConversationId)) {
            setActiveConversationId(nextConversations[0].id);
            localStorage.setItem('smarthire_active_ai_conversation', String(nextConversations[0].id));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load AI conversations:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await recruiterService.getAIDocuments();
      if (res.success) {
        const docs = res.data || [];
        setDocuments(docs);
        if (docs.length > 0 && !selectedAnalysisDocId) {
          setSelectedAnalysisDocId(String(docs[0].id));
        }
        if (docs.length > 0 && !matchResumeId) {
          const firstResume = docs.find((d) => d.documentType === 'RESUME') || docs[0];
          setMatchResumeId(String(firstResume.id));
        }
        if (docs.length > 0 && !matchJdId) {
          const firstJd = docs.find((d) => d.documentType === 'JOB_DESCRIPTION') || docs[0];
          setMatchJdId(String(firstJd.id));
        }
      }
    } catch (error) {
      console.error('Failed to load AI documents:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchConversations(), fetchDocuments()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    localStorage.setItem('smarthire_active_ai_conversation', String(id));
  };

  const createConversation = async (customTitle) => {
    try {
      const titleToUse = (typeof customTitle === 'string' && customTitle.trim()) ? customTitle.trim() : (title.trim() || 'Recruiter AI Session');
      const res = await recruiterService.createAIConversation(titleToUse);
      if (res.success) {
        setTitle('');
        await fetchConversations();
        handleSelectConversation(res.data.id);
      }
    } catch (error) {
      console.error('Failed to create AI conversation:', error);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation session?')) return;
    try {
      await recruiterService.deleteAIConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (activeConversationId === convId) {
        const nextId = remaining.length > 0 ? remaining[0].id : null;
        setActiveConversationId(nextId);
        if (nextId) {
          localStorage.setItem('smarthire_active_ai_conversation', String(nextId));
        } else {
          localStorage.removeItem('smarthire_active_ai_conversation');
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this document and all its indexed vector chunks?')) return;
    try {
      await recruiterService.deleteAIDocument(docId);
      await fetchDocuments();
      if (selectedDocFilter === String(docId)) {
        setSelectedDocFilter('');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const messageContent = (typeof textToSend === 'string' ? textToSend : draft).trim();
    if (!messageContent || chatLoading) return;

    let conversationIdToUse = activeConversationId;
    if (!conversationIdToUse) {
      const created = await recruiterService.createAIConversation('Recruiter AI Session');
      if (!created.success || !created.data?.id) return;
      conversationIdToUse = created.data.id;
      handleSelectConversation(conversationIdToUse);
    }

    try {
      setChatLoading(true);
      const docFilter = selectedDocFilter ? Number(selectedDocFilter) : null;
      const res = await recruiterService.sendAIMessage(conversationIdToUse, messageContent, docFilter);
      if (res.success) {
        setDraft('');
        setConversations((prev) => {
          const next = prev.filter((c) => c.id !== res.data.id);
          return [res.data, ...next];
        });
        handleSelectConversation(res.data.id);
      }
    } catch (error) {
      console.error('Failed to send AI message:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = useCallback(() => {
    if (!micSupported) return;

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interim += t;
        }
      }
      // Show interim results live in the draft
      setDraft((prev) => {
        const base = prev.replace(/\[🎤.*?\]/g, '').trimEnd();
        return finalTranscript
          ? (base ? base + ' ' + finalTranscript : finalTranscript)
          : interim
          ? (base ? base + ' [🎤 ' + interim + ']' : '[🎤 ' + interim + ']')
          : prev;
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      // Clean up any leftover interim markers
      setDraft((prev) => prev.replace(/\[🎤.*?\]/g, '').trim());
    };

    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, micSupported]);

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const res = await recruiterService.uploadAIDocument(selectedFile, documentType);
      if (res.success) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setUploadSuccess(res.data?.statusMessage || 'PDF uploaded and vector indexed successfully!');
        await fetchDocuments();
      } else {
        setUploadError(res.message || 'Document upload failed.');
      }
    } catch (error) {
      setUploadError(error.message || 'Document upload failed. Ensure the PDF is not corrupted.');
    } finally {
      setUploading(false);
    }
  };

  // Run Resume Analysis
  const handleRunAnalysis = async () => {
    if (!selectedAnalysisDocId) return;
    setAnalysisLoading(true);
    try {
      const res = await recruiterService.analyzeResume(Number(selectedAnalysisDocId));
      if (res.success) {
        setAnalysisResult(res.data);
      }
    } catch (error) {
      console.error('Resume analysis failed:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Run Resume Matching
  const handleRunMatch = async () => {
    if (!matchResumeId || !matchJdId) return;
    setMatchLoading(true);
    try {
      const res = await recruiterService.matchResume(Number(matchResumeId), Number(matchJdId));
      if (res.success) {
        setMatchResult(res.data);
      }
    } catch (error) {
      console.error('Resume match failed:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const formatMessageWithCitations = (content) => {
    const sourceRegex = /--- \[SOURCE: (.*?) \| Type: (.*?) \| Chunk #(.*?)\] ---/g;
    const parts = content.split(sourceRegex);

    return (
      <div className="space-y-2">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
              Spring AI + Gemini + RAG
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              MySQL Memory Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2.5">
            Recruitment Intelligence Assistant
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded candidate screening, resume-to-JD vector matching, and interactive recruitment intelligence.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chat & RAG QA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analyzer')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resume Analyzer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matcher')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'matcher'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resume vs JD Matcher
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-6 items-start">
        {/* ========================================================
            COLUMN 1: CONVERSATION SESSIONS
        ======================================================== */}
        <aside className="glass-card rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Chat Sessions</h2>
            </div>
            <button
              type="button"
              onClick={() => createConversation('New Screening Session')}
              className="p-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-all"
              title="Start New Session"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
                No past sessions. Click + above to begin.
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`group relative flex items-center justify-between w-full p-3 rounded-xl cursor-pointer border text-left transition-all ${
                    activeConversation.id === c.id
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{c.title || 'Recruiter AI Session'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {c.messages?.length || 0} messages • {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* New Custom Session Title */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session title (e.g. Senior Java Intake)"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => createConversation(title)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              + Create Session
            </button>
          </div>
        </aside>

        {/* ========================================================
            COLUMN 2: MAIN VIEW (CHAT / ANALYZER / MATCHER)
        ======================================================== */}
        <main className="glass-card rounded-2xl border border-slate-800 p-5 flex flex-col min-h-[660px]">
          {/* TAB 1: CHAT & RAG QA */}
          {activeTab === 'chat' && (
            <>
              {/* Chat Session Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">
                      {activeConversation.title || 'Recruiter AI Session'}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Grounded in {documents.length} verified recruitment document(s)
                    </p>
                  </div>
                </div>

                {/* Target Document Selector */}
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedDocFilter}
                    onChange={(e) => setSelectedDocFilter(e.target.value)}
                    className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Search Across All Documents</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.documentType === 'RESUME' ? '📄 [Resume] ' : '📋 [JD] '} {d.originalFileName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-xs">Loading conversational memory...</span>
                  </div>
                ) : activeConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Ask your Recruitment Assistant</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        Upload candidate resumes or job postings in the right panel, then ask targeted questions. You can also ask subject/engineering questions!
                      </p>
                    </div>

                    {/* Quick Prompt Chips */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-xl pt-2">
                      {SUGGESTED_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(p.text)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 hover:text-white transition-all text-left"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  activeConversation.messages.map((m, index) => (
                    <div
                      key={m.id || index}
                      className={`flex gap-3 max-w-[88%] ${
                        m.role === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          m.role === 'USER'
                            ? 'bg-blue-600 text-white'
                            : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {m.role === 'USER' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 shadow-md ${
                          m.role === 'USER'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                          <span>{m.role === 'USER' ? 'Recruiter' : 'SmartHire AI'}</span>
                          {m.createdAt && (
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                        {formatMessageWithCitations(m.content)}
                      </div>
                    </div>
                  ))
                )}

                {/* Thinking Indicator */}
                {chatLoading && (
                  <div className="flex items-center gap-3 mr-auto">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      Retrieving vectors & generating grounded answer...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="pt-3 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2 items-end"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Ask about candidate skills, experience fit, comparison, or subject questions..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                  />

                  {/* Mic Button */}
                  {micSupported && (
                    <button
                      type="button"
                      onClick={handleMicClick}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                      className={[
                        'relative px-3 py-2.5 rounded-2xl font-bold flex items-center justify-center transition-all',
                        isListening
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700',
                      ].join(' ')}
                    >
                      {isListening && (
                        <span className="absolute inset-0 rounded-2xl animate-ping bg-red-500 opacity-30" />
                      )}
                      {isListening ? (
                        <MicOff className="w-4 h-4 relative z-10" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={chatLoading || !draft.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center transition-all shadow-md shadow-blue-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for newline</span>
                  <span className="flex items-center gap-1.5">
                    {isListening && (
                      <span className="flex items-center gap-1 text-red-400 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                        Listening...
                      </span>
                    )}
                    {selectedDocFilter && (
                      <span className="text-blue-400">Scoped to single document</span>
                    )}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: RESUME ANALYZER */}
          {activeTab === 'analyzer' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-blue-400" />
                    Automated Candidate Resume Screener
                  </h2>
                  <p className="text-xs text-slate-400">Extracts structured candidate profile, experience, skills, and verification items.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedAnalysisDocId}
                    onChange={(e) => setSelectedAnalysisDocId(e.target.value)}
                    className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="">Select an uploaded resume</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>{d.originalFileName}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading || !selectedAnalysisDocId}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                  >
                    {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Analyze Profile
                  </button>
                </div>
              </div>

              {analysisResult ? (
                <div className="space-y-4">
                  {/* Top Candidate Bar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/20 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{analysisResult.candidateName}</h3>
                      <p className="text-xs text-blue-300 font-medium">{analysisResult.title || 'Software Professional'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                        <p className="text-[10px] uppercase text-slate-500 font-bold">Experience</p>
                        <p className="text-xs font-bold text-white">{analysisResult.estimatedYearsExperience} Years</p>
                      </div>
                      {analysisResult.contactInfo && (
                        <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
                          <p className="text-[10px] uppercase text-slate-500 font-bold">Contact</p>
                          <p className="text-xs font-bold text-white">{analysisResult.contactInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills Evidenced</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.technicalSkills?.map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {analysisResult.executiveSummary}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
                  <FileSearch className="w-10 h-10 text-slate-600" />
                  <p className="text-xs">Select an uploaded resume above and click <strong>Analyze Profile</strong> to generate screening metrics.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESUME VS JD MATCHER */}
          {activeTab === 'matcher' && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  Resume-to-Job Semantic Matcher
                </h2>
                <p className="text-xs text-slate-400">Evaluates qualifications alignment between an applicant resume and a job description.</p>
              </div>

              {/* Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Candidate Resume</label>
                  <select
                    value={matchResumeId}
                    onChange={(e) => setMatchResumeId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    <option value="">Select Resume PDF</option>
                    {documents.filter((d) => d.documentType === 'RESUME' || d.documentType === 'OTHER').map((d) => (
                      <option key={d.id} value={d.id}>{d.originalFileName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Job Description</label>
                  <select
                    value={matchJdId}
                    onChange={(e) => setMatchJdId(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200"
                  >
                    <option value="">Select Job Description PDF</option>
                    {documents.filter((d) => d.documentType === 'JOB_DESCRIPTION' || d.documentType === 'OTHER').map((d) => (
                      <option key={d.id} value={d.id}>{d.originalFileName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunMatch}
                disabled={matchLoading || !matchResumeId || !matchJdId}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                {matchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Run Alignment & Fit Evaluation
              </button>

              {matchResult && (
                <div className="space-y-4 pt-2">
                  {/* Match Score Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-emerald-400">Overall Match Score</p>
                      <h3 className="text-2xl font-black text-white">{matchResult.matchScore}%</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{matchResult.hiringRecommendation}</p>
                    </div>

                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                      {matchResult.matchScore}%
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matched Competencies
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.matchedSkills?.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing / Unverified Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missingSkills?.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ========================================================
            COLUMN 3: DOCUMENT INTELLIGENCE PANEL
        ======================================================== */}
        <aside className="glass-card rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">RAG Document Ingestion</h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {documents.length} Indexed
            </span>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleDocumentUpload} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="RESUME">Candidate Resume (PDF)</option>
                <option value="JOB_DESCRIPTION">Job Description (PDF)</option>
                <option value="RECRUITMENT_NOTE">Recruitment Notes</option>
                <option value="OTHER">General Document</option>
              </select>
            </div>

            {/* Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-900 transition-all space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  setUploadError('');
                  setUploadSuccess('');
                }}
                className="hidden"
              />
              <UploadCloud className="w-7 h-7 text-blue-400 mx-auto" />
              <div className="text-xs text-slate-300">
                {selectedFile ? (
                  <span className="font-semibold text-blue-300">{selectedFile.name}</span>
                ) : (
                  <>
                    <span className="font-semibold text-blue-400">Click to browse</span> or drag PDF here
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-500">PDF, TXT, or MD up to 15MB</p>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extracting & Indexing...
                </>
              ) : (
                'Upload & Vector Index'
              )}
            </button>
          </form>

          {/* Uploaded Documents List */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Indexed In Vector Database</h3>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No documents uploaded yet.</p>
              ) : (
                documents.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{d.originalFileName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {d.documentType}
                        </span>
                        {d.totalChunks > 0 && (
                          <span className="text-emerald-400">✓ {d.totalChunks} chunks</span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(d.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete document and vector embeddings"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RecruiterAssistantPage;
