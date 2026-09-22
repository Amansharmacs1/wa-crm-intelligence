import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { LeadStage } from '../types';

export const LeadDetailPage: React.FC = () => {
  const { selectedLead, navigate, updateLeadStage, chatMessages, sendChatMessage } = useApp();
  const [showPhone, setShowPhone] = useState(false);
  const [replyText, setReplyText] = useState('');

  if (!selectedLead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-apple-text-secondary text-[15px] mb-4">No lead selected.</p>
        <button
          onClick={() => navigate('all-leads')}
          className="apple-btn-primary px-6"
        >
          Return to Leads
        </button>
      </div>
    );
  }

  const stages: LeadStage[] = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won'];
  const currentIndex = stages.indexOf(selectedLead.stage);

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'High':
      case 'Critical':
        return 'text-apple-red bg-apple-red/10';
      case 'Festival based':
        return 'text-[#ff9500] bg-[#ff9500]/10';
      case 'Medium':
        return 'text-apple-blue bg-apple-blue/10';
      default:
        return 'text-apple-text-secondary bg-apple-hover';
    }
  };

  const getCategoryColor = (cat?: string) => {
    return cat === 'At Risk' ? 'text-[#ff9500] bg-[#ff9500]/10' : 'text-apple-green bg-apple-green/10';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendChatMessage(replyText);
    setReplyText('');
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-8 py-8 gap-8 h-screen overflow-hidden">
      
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-1.5 text-[14px] text-apple-text-secondary hover:text-apple-text transition-colors group font-medium"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse"></span>
           <span className="text-[13px] text-apple-text-secondary font-medium">Live Connection</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col max-w-3xl mx-auto w-full gap-8 h-full pb-20">
        
        {/* Left Column: Customer Profile & AI Insights (span 5) */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-none pb-12">
          
          {/* Identity Card */}
          <div className="apple-card p-6 flex flex-col gap-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-apple-hover text-apple-text flex items-center justify-center text-[22px] font-bold tracking-tight shrink-0">
                {selectedLead.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h1 className="text-[22px] font-semibold text-apple-text tracking-tight leading-tight">
                  {selectedLead.name}
                </h1>
                <span className="text-[13px] text-apple-text-secondary">
                  {selectedLead.company !== 'Unknown' ? selectedLead.company : 'Individual Client'}
                </span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-apple-border/50"></div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-apple-text-secondary font-medium">Lead ID</span>
                <span className="text-apple-text font-semibold">{selectedLead.leadId || selectedLead.id}</span>
              </div>
              
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-apple-text-secondary font-medium">Phone</span>
                <div className="flex items-center gap-2">
                  <span className="text-apple-text font-semibold tracking-wide">
                    {showPhone ? selectedLead.phone : selectedLead.phone.replace(/.(?=.{4})/g, '•')}
                  </span>
                  <button 
                    onClick={() => setShowPhone(!showPhone)}
                    className="text-apple-blue hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPhone ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[14px]">
                <span className="text-apple-text-secondary font-medium">Estimated Value</span>
                <span className="text-apple-text font-semibold">{selectedLead.dealValueFormatted}</span>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-apple-border/50"></div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[12px] font-semibold text-apple-text-secondary uppercase tracking-wider">Classification</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${getCategoryColor(selectedLead.category)}`}>
                  {selectedLead.category || 'Safe'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${getUrgencyColor(selectedLead.urgency)}`}>
                  {selectedLead.urgency || 'Low'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold bg-apple-hover text-apple-text-secondary">
                  {selectedLead.intent || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="apple-card p-6 flex flex-col gap-4 shrink-0">
            <div className="flex items-center justify-between pb-4 border-b border-apple-border/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-apple-blue">auto_awesome</span>
                <h2 className="text-[16px] font-semibold text-apple-text tracking-tight">AI Executive Summary</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-apple-blue/10 text-apple-blue text-[11px] font-bold tracking-wide uppercase">
                Gemini Pro
              </span>
            </div>

            <div className="bg-[#fbfbfd] p-5 rounded-xl border border-apple-border/30">
              <p className="text-[14px] text-apple-text leading-relaxed">
                {selectedLead.aiSummary || selectedLead.lastMessage || "Analysis is currently pending. Please ensure the chat has been synchronized."}
              </p>
            </div>

            {selectedLead.chatTime && (
              <div className="flex items-center justify-between mt-2 text-[12px] text-apple-text-secondary font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {selectedLead.chatTime.firstMessageAt ? new Date(selectedLead.chatTime.firstMessageAt).toLocaleString([], {hour:'2-digit', minute:'2-digit', day:'numeric', month:'short'}) : '--'}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">update</span>
                  {selectedLead.chatTime.lastMessageAt ? new Date(selectedLead.chatTime.lastMessageAt).toLocaleString([], {hour:'2-digit', minute:'2-digit', day:'numeric', month:'short'}) : '--'}
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Stage Controller */}
          <div className="apple-card p-6 shrink-0 mb-4">
            <h2 className="text-[15px] font-semibold text-apple-text tracking-tight mb-5">Pipeline Stage</h2>
            <div className="relative flex justify-between items-center w-full">
              {/* Background Line */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-apple-hover -translate-y-1/2 z-0 rounded-full"></div>
              {/* Progress Line */}
              <div 
                className="absolute top-1/2 left-4 h-1 bg-apple-blue -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                style={{ width: `calc(${(currentIndex / (stages.length - 1)) * 100}% - 2rem)` }}
              ></div>

              {stages.map((stage, idx) => {
                const isActive = idx === currentIndex;
                const isPast = idx <= currentIndex;
                
                return (
                  <button
                    key={stage}
                    onClick={() => updateLeadStage(selectedLead.id, stage)}
                    className="relative z-10 flex flex-col items-center gap-2 group focus:outline-none"
                  >
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 shadow-sm
                        ${isActive ? 'bg-apple-blue text-white scale-125 ring-4 ring-apple-blue/20' : 
                          isPast ? 'bg-apple-blue text-white' : 'bg-white border-2 border-apple-border text-apple-text-secondary'}`}
                    >
                      {isPast ? <span className="material-symbols-outlined text-[10px]">check</span> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 transition-colors ${isPast ? 'text-apple-text' : 'text-apple-text-secondary'}`}>
                      {stage}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
        </div>

        
      </div>
    </div>
  );
};
