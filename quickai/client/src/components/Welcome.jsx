import { Zap, Code2, FileText, Lightbulb, Globe } from 'lucide-react';

const SUGGESTIONS = [
  { icon: <Code2 size={16} />, text: 'Explain how async/await works in JavaScript' },
  { icon: <FileText size={16} />, text: 'Write a professional email declining a meeting' },
  { icon: <Lightbulb size={16} />, text: 'Give me 5 startup ideas in the EdTech space' },
  { icon: <Globe size={16} />, text: 'Summarize the key differences between REST and GraphQL' },
];

export default function Welcome({ onSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30">
        <Zap size={30} className="text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">How can I help you?</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        Powered by Groq's ultra-fast LLaMA 3 model. Ask me anything.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="flex items-center gap-3 bg-dark-700 hover:bg-dark-600 border border-white/10 hover:border-purple-500/40 rounded-xl px-4 py-3 text-left text-sm text-gray-300 hover:text-white transition-all group"
          >
            <span className="text-purple-400 group-hover:text-purple-300 shrink-0">{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
