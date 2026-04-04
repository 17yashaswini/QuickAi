import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, MessageSquare, Trash2, Zap, LogOut, ChevronLeft, ChevronRight, Search, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

export default function Sidebar({ onNewChat, refreshTrigger }) {
  const [chats, setChats] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const renameRef = useRef(null);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { id: activeChatId } = useParams();

  useEffect(() => { fetchChats(); }, [refreshTrigger]);
  useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

  const fetchChats = async () => {
    try { const { data } = await api.get('/chat'); setChats(data); } catch {}
  };

  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/chat/new');
      setChats(p => [data, ...p]);
      navigate(`/chat/${data._id}`);
      onNewChat?.(data._id);
    } catch { toast.error('Failed to create chat'); }
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/${chatId}`);
      setChats(p => p.filter(c => c._id !== chatId));
      if (activeChatId === chatId) navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  const startRename = (e, chat) => {
    e.stopPropagation();
    setRenamingId(chat._id);
    setRenameVal(chat.title);
  };

  const submitRename = async (chatId) => {
    if (!renameVal.trim()) { setRenamingId(null); return; }
    try {
      await api.patch(`/chat/${chatId}/rename`, { title: renameVal.trim() });
      setChats(p => p.map(c => c._id === chatId ? { ...c, title: renameVal.trim() } : c));
    } catch { toast.error('Rename failed'); }
    setRenamingId(null);
  };

  const filteredChats = chats.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-screen border-r transition-all duration-300 ${collapsed ? 'w-14' : 'w-64'} shrink-0`}
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

      {/* Header */}
      <div className={`flex items-center h-14 px-3 border-b ${collapsed ? 'justify-center' : 'justify-between'}`}
        style={{ borderColor: 'var(--border)' }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>QuickAI</span>
          </div>
        )}
        <div className={`flex items-center gap-1 ${collapsed ? '' : ''}`}>
          {!collapsed && (
            <button onClick={toggle} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-xs">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* New Chat */}
      <div className="p-2">
        <button onClick={handleNewChat}
          className={`w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors text-sm font-medium ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}>
          <Plus size={16} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-2 pb-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none border"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {!collapsed && filteredChats.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text3)' }}>
            {search ? 'No results' : 'No chats yet'}
          </p>
        )}
        {filteredChats.map(chat => (
          <div key={chat._id}
            onClick={() => !renamingId && navigate(`/chat/${chat._id}`)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group cursor-pointer ${
              activeChatId === chat._id ? 'bg-white/10' : 'hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}>
            <MessageSquare size={15} className="shrink-0 text-gray-500" />
            {!collapsed && (
              renamingId === chat._id ? (
                <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    ref={renameRef}
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitRename(chat._id); if (e.key === 'Escape') setRenamingId(null); }}
                    className="flex-1 text-xs px-1 rounded border focus:outline-none"
                    style={{ background: 'var(--bg4)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                  <button onClick={() => submitRename(chat._id)} className="text-green-400 hover:text-green-300"><Check size={13} /></button>
                  <button onClick={() => setRenamingId(null)} className="text-red-400 hover:text-red-300"><X size={13} /></button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-xs truncate" style={{ color: activeChatId === chat._id ? 'var(--text)' : 'var(--text2)' }}>
                    {chat.title}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
                    <button onClick={e => startRename(e, chat)} className="text-gray-500 hover:text-blue-400 p-0.5 rounded"><Pencil size={12} /></button>
                    <button onClick={e => handleDelete(e, chat._id)} className="text-gray-500 hover:text-red-400 p-0.5 rounded"><Trash2 size={12} /></button>
                  </div>
                </>
              )
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className={`flex items-center gap-2 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{user?.username}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>{user?.email}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); toast.success('Logged out'); }}
                className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-white/5">
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
