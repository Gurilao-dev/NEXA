import React, { useState } from 'react';
import { GlassSurface } from '@nexa/ui';
import {
  MessageSquarePlus,
  Users,
  Contact,
  Settings,
  Search,
  Smartphone,
  Check,
  CheckCheck,
  Radio,
} from 'lucide-react';
import { Conversation, ChatProfile } from '@nexa/types';

interface SidebarProps {
  profile: ChatProfile | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenContacts: () => void;
  onOpenSettings: () => void;
  onlineCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profile,
  conversations,
  activeConversation,
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenContacts,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = conv.title?.toLowerCase().includes(q);
    const memberMatch = conv.memberUids?.some((u: string) => u.toLowerCase().includes(q));
    const lastMsgMatch = conv.lastMessage?.text?.toLowerCase().includes(q);
    return titleMatch || memberMatch || lastMsgMatch;
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-[#090D16]/95 border-r border-white/10 shrink-0">
      {/* Top Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20">
              {profile?.displayName?.substring(0, 2).toUpperCase() || 'NX'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate font-display">
              {profile?.displayName || 'NEXA Chat'}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <Smartphone className="w-3 h-3" />
              <span className="truncate">{profile?.formattedNumber || 'Conectado'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={onOpenNewChat}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            title="Nova Conversa"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            title="Novo Grupo"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenContacts}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            title="Contatos"
          >
            <Contact className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar conversas ou mensagens..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {conversations.length === 0 ? (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Radio className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="font-medium text-slate-300">Nenhuma conversa ainda</div>
                <p className="text-[11px] leading-relaxed">
                  Inicie uma conversa direta clicando no ícone de nova mensagem acima informando um número NEXA.
                </p>
              </div>
            ) : (
              'Nenhuma conversa encontrada na busca.'
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversation?.conversationId === conv.conversationId;
            const isGroup = conv.type === 'GROUP';
            const title = conv.title || (isGroup ? 'Grupo sem nome' : 'Conversa Direta');
            const initials = isGroup ? 'GP' : title.substring(0, 2).toUpperCase();

            return (
              <button
                key={conv.conversationId}
                type="button"
                onClick={() => onSelectConversation(conv)}
                className={`w-full p-3.5 text-left transition-all flex items-start gap-3 relative group ${
                  isSelected
                    ? 'bg-emerald-500/15 border-l-4 border-l-emerald-500'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs ${
                      isGroup
                        ? 'bg-purple-900/40 border border-purple-500/30 text-purple-300'
                        : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {initials}
                  </div>
                  {!isGroup && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white truncate">
                      {title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 truncate flex-1">
                      {conv.lastMessage ? (
                        <span>
                          {conv.lastMessage.senderUid === profile?.uid && (
                            <span className="text-emerald-400 mr-1 font-medium">Você:</span>
                          )}
                          {conv.lastMessage.text}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Conversa iniciada</span>
                      )}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
