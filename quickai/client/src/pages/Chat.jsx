import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Send, Square, Mic, MicOff, Paperclip, X, Download, Printer, Coins } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import Welcome from '../components/Welcome';
import PersonaSelector from '../components/PersonaSelector';
import api from '../api/axios';

const SUGGESTIONS = [
  { icon: '💻', text: 'Explain how async/await works in JavaScript' },
  { icon: '📝', text: 'Write a professional email declining a meeting' },
  { icon: '💡', text: 'Give me 5 startup ideas in the EdTech space' },
  { icon: '🌐', text: 'Summarize REST vs GraphQL differences' },
];

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [persona, setPersona] = useState('default');
  const [sessionTokens, setSessionTokens] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (id) { loadChat(id); setCurrentChatId(id); }
    else { setMessages([]); setCurrentChatId(null); setSessionTokens(0); }
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isStreaming]);

  const loadChat = async (chatId) => {
    setLoadingChat(true);
    try {
      const { data } = await api.get(`/chat/${chatId}`);
      setMessages(data.messages || []);
      setPersona(data.persona || 'default');
      setSessionTokens(data.totalTokens || 0);
    } catch { toast.error('Chat not found'); navigate('/'); }
    finally { setLoadingChat(false); }
  };

  const getOrCreateChat = async () => {
    if (currentChatId || id) return currentChatId || id;
    const { data } = await api.post('/chat/new');
    setCurrentChatId(data._id);
    navigate(`/chat/${data._id}`, { replace: true });
    return data._id;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = '24px'; }
    try {
      const chatId = await getOrCreateChat();
      await streamMessage(text, chatId, imagePreview);
    } catch { toast.error('Failed to create chat'); }
  };

  const streamMessage = async (text, chatId, image = null) => {
    const userMsg = { role: 'user', content: text, image, _id: Date.now() };
    const aiMsg   = { role: 'assistant', content: '', _id: Date.now() + 1 };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setImageFile(null);
    setImagePreview(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://quickai-server-qs6h.onrender.com/api/chat/${chatId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, image, persona })
      });

      if (!response.ok) throw new Error('Stream error');

      setMessages(prev => [...prev, aiMsg]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              accContent += data.delta;
              setMessages(prev => prev.map(m =>
                m._id === aiMsg._id ? { ...m, content: accContent } : m
              ));
            }
            if (data.done) {
              setSessionTokens(prev => prev + (data.totalTokens || 0));
              setRefreshSidebar(n => n + 1);
            }
            if (data.error) toast.error(data.error);
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== userMsg._id && m._id !== aiMsg._id));
      toast.error('Stream failed: ' + err.message);
    } finally {
      setIsStreaming(false);
    }
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error('Image must be under 4MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageFile(file); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice input
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice not supported in this browser'); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); toast.error('Voice error'); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      textareaRef.current?.focus();
    };
    recognition.start();
  };

  // Export as text
  const exportText = () => {
    const content = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quickai-chat.txt';
    a.click();
    toast.success('Exported as text!');
  };

  // Export as PDF (print)
  const exportPDF = () => {
    window.print();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Print-only area */}
      <div className="print-area hidden">
        <h2 style={{ marginBottom: '1rem', fontWeight: 700 }}>QuickAI Chat Export</h2>
        {messages.map((m, i) => (
          <div key={i} className={`print-msg ${m.role === 'user' ? 'user' : 'ai'}`}>
            <div className="print-label">{m.role === 'user' ? 'You' : 'QuickAI'}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>

      <div className="no-print flex w-full h-full overflow-hidden">
        <Sidebar onNewChat={setCurrentChatId} refreshTrigger={refreshSidebar} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b px-4 py-2 flex items-center justify-between gap-3 shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
            <div className="flex-1 min-w-0">
              <PersonaSelector value={persona} onChange={setPersona} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Token counter */}
              {sessionTokens > 0 && (
                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text2)', background: 'var(--bg3)' }}>
                  <Coins size={12} className="text-yellow-500" />
                  <span>{sessionTokens.toLocaleString()} tokens</span>
                </div>
              )}
              {hasMessages && (
                <>
                  <button onClick={exportText} title="Export as text"
                    className="p-1.5 rounded-lg border text-gray-400 hover:text-white transition-colors"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                    <Download size={14} />
                  </button>
                  <button onClick={exportPDF} title="Print / Save as PDF"
                    className="p-1.5 rounded-lg border text-gray-400 hover:text-white transition-colors"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                    <Printer size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {loadingChat ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !hasMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
                  style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
                  <span className="text-3xl">⚡</span>
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>How can I help you?</h2>
                <p className="text-sm mb-8" style={{ color: 'var(--text3)' }}>
                  Powered by Groq LLaMA 3 — ultra fast AI
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => { setInput(s.text); textareaRef.current?.focus(); }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all border hover:border-purple-500/40"
                      style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text2)' }}>
                      <span>{s.icon}</span><span>{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
                {messages.map((msg, i) => <ChatMessage key={msg._id || i} message={msg} />)}
                {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-sm">⚡</span>
                    </div>
                    <div className="rounded-2xl px-4 py-3 border flex items-center gap-1.5"
                      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="border-t p-4 shrink-0" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-3xl mx-auto">
              {/* Image preview */}
              {imagePreview && (
                <div className="relative inline-block mb-2">
                  <img src={imagePreview} alt="preview" className="h-20 rounded-lg object-cover border"
                    style={{ borderColor: 'var(--border)' }} />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={11} className="text-white" />
                  </button>
                </div>
              )}

              <div className="relative flex items-end gap-2 rounded-2xl px-4 py-3 border focus-within:border-purple-500/60 transition-colors"
                style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

                {/* Image upload */}
                <button onClick={() => fileInputRef.current?.click()} title="Attach image"
                  className="shrink-0 text-gray-500 hover:text-purple-400 transition-colors mb-0.5">
                  <Paperclip size={18} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message QuickAI… (Enter to send, Shift+Enter for newline)"
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-sm resize-none focus:outline-none max-h-40 leading-relaxed disabled:opacity-50"
                  style={{ height: '24px', color: 'var(--text)' }}
                />

                {/* Voice */}
                <button onClick={toggleVoice} title="Voice input"
                  className={`shrink-0 mb-0.5 transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500 hover:text-purple-400'}`}>
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Send / Stop */}
                <button
                  onClick={isStreaming ? () => setIsStreaming(false) : handleSubmit}
                  disabled={!isStreaming && !input.trim() && !imagePreview}
                  className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isStreaming ? 'bg-red-500 hover:bg-red-400 text-white'
                    : (input.trim() || imagePreview) ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'text-gray-600 cursor-not-allowed'
                  }`}
                  style={{ background: (!isStreaming && !input.trim() && !imagePreview) ? 'var(--bg4)' : undefined }}>
                  {isStreaming ? <Square size={14} fill="white" /> : <Send size={14} />}
                </button>
              </div>

              <p className="text-center text-xs mt-2" style={{ color: 'var(--text3)' }}>
                QuickAI can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
