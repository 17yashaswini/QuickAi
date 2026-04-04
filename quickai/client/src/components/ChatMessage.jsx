import ReactMarkdown from 'react-markdown';
import { Zap, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 group py-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
          <Zap size={15} className="text-white" />
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? 'order-first' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'rounded-bl-sm border'
        }`}
          style={!isUser ? { background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' } : {}}
        >
          {/* Image preview if attached */}
          {message.image && (
            <img
              src={message.image}
              alt="uploaded"
              className="rounded-lg mb-2 max-h-52 max-w-full object-contain"
            />
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300 flex items-center gap-1 text-xs"
          >
            {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
          </button>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'var(--bg4)', borderColor: 'var(--border)' }}>
          <User size={15} className="text-gray-300" />
        </div>
      )}
    </div>
  );
}
