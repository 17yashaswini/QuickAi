const PERSONAS = [
  { id: 'default', label: 'QuickAI',  emoji: '⚡', desc: 'General assistant' },
  { id: 'coder',   label: 'Coder',    emoji: '💻', desc: 'Code & debugging' },
  { id: 'tutor',   label: 'Tutor',    emoji: '📚', desc: 'Learn anything' },
  { id: 'writer',  label: 'Writer',   emoji: '✍️', desc: 'Creative writing' },
  { id: 'analyst', label: 'Analyst',  emoji: '📊', desc: 'Data & strategy' },
];

export { PERSONAS };

export default function PersonaSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PERSONAS.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          title={p.desc}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
            value === p.id
              ? 'bg-purple-600 border-purple-500 text-white'
              : 'border-white/10 text-gray-400 hover:border-purple-500/40 hover:text-white'
          }`}
          style={{ background: value === p.id ? undefined : 'var(--bg3)' }}
        >
          <span>{p.emoji}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
