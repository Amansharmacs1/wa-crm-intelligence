import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const QuickChatModal: React.FC = () => {
  const { activeChatLead, setActiveChatLead, chatMessages, sendChatMessage, navigate } = useApp();
  const [inputMessage, setInputMessage] = useState('');

  if (!activeChatLead) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendChatMessage(inputMessage);
    setInputMessage('');
  };

  const quickReplies = [
    "I'll have our integration specialist contact you today.",
    "Sending over the updated proposal right away!",
    "Can we jump on a 5-minute Google Meet to review?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[560px] animate-in slide-in-from-bottom-5">
      {/* WhatsApp Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-sm">
              {activeChatLead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-white"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight text-white">{activeChatLead.name}</span>
            <span className="text-[11px] text-white/80">{activeChatLead.phone} • {activeChatLead.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              navigate('lead-details', { leadId: activeChatLead.id });
              setActiveChatLead(null);
            }}
            title="Open Full Profile"
            className="text-white/80 hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
          </button>
          <button
            onClick={() => setActiveChatLead(null)}
            className="text-white/80 hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* AI Extraction Bar */}
      <div className="bg-surface-container-low px-3 py-1.5 border-b border-surface-container flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-on-surface">
          <span className="material-symbols-outlined text-[14px] text-secondary">auto_awesome</span>
          <span className="font-medium">Deal Intent: {activeChatLead.dealValueFormatted}</span>
        </div>
        <span className="bg-secondary-container/50 text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-semibold">
          {activeChatLead.priority} Priority
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="p-3 overflow-y-auto flex-1 space-y-2.5 bg-[#efeae2]/30 min-h-[220px]">
        {chatMessages.map(msg => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[82%] ${isAgent ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                  isAgent
                    ? 'bg-[#dcf8c6] text-[#075e54] rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}
              >
                <p>{msg.text}</p>
                {msg.intentBadge && (
                  <div className="mt-1 pt-1 border-t border-black/10 flex items-center gap-1 text-[10px] font-medium text-secondary">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>{msg.intentBadge}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 px-1">{msg.timestamp}</span>
            </div>
          );
        })}
      </div>

      {/* AI Quick Reply Chips */}
      <div className="px-3 py-1.5 bg-surface-container-low/50 border-t border-surface-container overflow-x-auto whitespace-nowrap flex gap-1.5">
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => setInputMessage(reply)}
            className="text-[10px] bg-white border border-surface-container hover:bg-surface-container-high px-2 py-1 rounded-full text-on-surface-variant transition-colors flex-shrink-0"
          >
            ⚡ {reply}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-surface-container flex items-center gap-2">
        <input
          type="text"
          placeholder="Type WhatsApp message..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          className="flex-1 bg-surface-container-low rounded-full px-3.5 py-1.5 text-xs text-on-surface border-none focus:outline-none focus:ring-1 focus:ring-secondary"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-full bg-[#075E54] hover:bg-secondary text-white flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
};
