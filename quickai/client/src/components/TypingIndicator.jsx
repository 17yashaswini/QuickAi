import { Zap } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0 mt-0.5">
        <Zap size={15} className="text-white" />
      </div>
      <div className="bg-dark-700 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
