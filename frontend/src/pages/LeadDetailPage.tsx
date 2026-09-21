import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { LeadStage } from '../types';

export const LeadDetailPage: React.FC = () => {
  const { selectedLead, navigate, updateLeadStage, chatMessages, sendChatMessage, showNotification } = useApp();
  const [showPhone, setShowPhone] = useState(false);
  const [replyText, setReplyText] = useState('');

  if (!selectedLead) {
    return (
      <div className="p-12 text-center">
        <p className="text-on-surface-variant mb-4">No lead selected.</p>
        <button
          onClick={() => navigate('all-leads')}
          className="px-4 py-2 bg-primary-container text-on-primary rounded-lg"
        >
          Return to Leads
        </button>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendChatMessage(replyText);
    setReplyText('');
    showNotification('WhatsApp message dispatched to client.');
  };

  const stages: LeadStage[] = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won'];

  return (
    <div className="flex flex-col w-full px-margin py-space-xl gap-space-lg max-w-[1720px] mx-auto pb-16">
      {/* Top Customer Card */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('all-leads')}
            className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors group"
          >
            <span className="material-symbols-outlined text-label-md group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span>Back to All Leads</span>
          </button>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Last active: 5 min ago on WhatsApp Web</span>
          </div>
        </div>

        {/* Main Profile Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg pt-space-xs">
          <div className="flex items-start md:items-center gap-space-md flex-wrap sm:flex-nowrap">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary font-headline-md text-headline-md flex items-center justify-center tracking-tight shadow-sm shrink-0 font-bold">
              {selectedLead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div className="flex flex-col gap-space-xs min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold truncate">
                  {selectedLead.name}
                </h1>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-space-sm py-0.5 rounded font-medium">
                  {selectedLead.company}
                </span>
                {selectedLead.priority === 'At-Risk' ? (
                  <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-medium">
                    <span className="material-symbols-outlined text-label-sm">warning</span>
                    <span>AT RISK • Competitor comparison detected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-space-sm py-0.5 rounded-full font-medium">
                    <span className="material-symbols-outlined text-label-sm">local_fire_department</span>
                    <span>HOT LEAD • Budget Approved</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-label-sm text-secondary">verified</span>
                  <span>{showPhone ? selectedLead.phone : selectedLead.phone.substring(0, 9) + ' •••••'} (WhatsApp Verified)</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-label-sm text-on-surface-variant">schedule</span>
                  <span>{selectedLead.lastMessageTime} awaiting response</span>
                </span>
              </div>
            </div>
          </div>

          {/* Intent Gauge + Actions */}
          <div className="flex items-center gap-space-lg self-end lg:self-center">
            {/* Circular Lead Score Widget */}
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-xl border border-surface-container">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle className="text-surface-container-high" cx="24" cy="24" fill="none" r="19" stroke="currentColor" strokeWidth="4"></circle>
                  <circle
                    className="text-secondary"
                    cx="24"
                    cy="24"
                    fill="none"
                    r="19"
                    stroke="currentColor"
                    strokeDasharray="119.38"
                    strokeDashoffset={119.38 - (119.38 * selectedLead.score) / 100}
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-none font-bold">
                    {selectedLead.score}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">Lead Intent</span>
                <span className="font-label-sm text-label-sm text-secondary font-bold">High Intent</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => showNotification('Syncing WhatsApp thread with cloud database... Completed.')}
                className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-white hover:bg-primary-container font-label-md text-label-md transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-label-md text-secondary-container">sync</span>
                <span>Sync Chat Now</span>
              </button>
              <button
                onClick={() => {
                  const nextStageIndex = (stages.indexOf(selectedLead.stage) + 1) % stages.length;
                  updateLeadStage(selectedLead.id, stages[nextStageIndex]);
                }}
                className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors border border-surface-container"
              >
                <span className="material-symbols-outlined text-label-md">arrow_forward</span>
                <span>Advance Stage</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout Matching Stitch Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Customer Info (span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-headline-sm text-primary-container">badge</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Customer Info</h2>
              </div>
              <span className="font-label-sm text-label-sm bg-secondary-container/40 text-on-secondary-container px-space-sm py-0.5 rounded-full font-semibold">
                Enterprise Tier
              </span>
            </div>

            <div className="flex flex-col divide-y divide-surface-container text-on-surface">
              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Full Name</span>
                <span className="font-semibold text-on-surface">{selectedLead.name}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Phone</span>
                <div className="flex items-center gap-1.5 font-medium text-on-surface">
                  <span>{showPhone ? selectedLead.phone : selectedLead.phone.substring(0, 9) + ' •••••'}</span>
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                    title={showPhone ? 'Mask Phone' : 'Reveal Phone'}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showPhone ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Company</span>
                <span className="font-medium text-on-surface">{selectedLead.company}</span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Ingestion Source</span>
                <span className="font-medium text-on-surface flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-sm">cloud_sync</span>
                  WhatsApp Web Extension
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Assigned Rep</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary-container text-on-primary text-[10px] flex items-center justify-center font-bold">
                    {selectedLead.assignedAgent.avatar}
                  </div>
                  <span className="font-medium text-on-surface">{selectedLead.assignedAgent.name}</span>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Estimated Value</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold text-right">
                  {selectedLead.dealValueFormatted}
                </span>
              </div>

              <div className="py-2.5 flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Pipeline Stage</span>
                <span className="font-semibold text-on-tertiary-container bg-surface-container px-2.5 py-0.5 rounded text-xs">
                  {selectedLead.stage}
                </span>
              </div>

              <div className="py-2.5 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Deal Probability</span>
                  <span className="font-bold text-secondary">{selectedLead.score}% Confidence</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full transition-all" style={{ width: `${selectedLead.score}%` }}></div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Applied Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedLead.tags.map((t, idx) => (
                  <span key={idx} className="bg-surface-container-high text-on-surface text-xs px-2.5 py-1 rounded-full font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement Velocity */}
            <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between mt-2 border border-surface-container">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant">Sync Velocity</span>
                <span className="font-semibold text-sm text-on-surface">18 msgs / 48 hrs</span>
              </div>
              <svg className="w-24 h-7 text-secondary" fill="none" viewBox="0 0 100 30">
                <path d="M0 25 L15 20 L30 24 L45 12 L60 18 L75 5 L90 14 L100 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                <circle cx="100" cy="8" fill="currentColor" r="3"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: AI Summary & Signals (span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: AI Summary */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-headline-sm text-on-tertiary-container">auto_awesome</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">AI Summary</h2>
              </div>
              <span className="font-label-sm text-xs text-on-tertiary-container bg-surface-container px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-xs">bolt</span>
                Live Model
              </span>
            </div>

            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed bg-surface-container-low/70 p-space-md rounded-lg border border-surface-container">
              {selectedLead.aiSummary || "Strong purchasing intent detected. Decision maker has secured budget approval for multi-tier WhatsApp automated routing."}
            </p>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">psychology</span>
                Intent: <strong>Commercial High</strong>
              </span>
              <span className="text-secondary font-bold">Confidence 96%</span>
            </div>
          </div>

          {/* Card 2: Buying Signals & Risk Indicators */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-headline-sm text-secondary">insights</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Signals & Risks</h2>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Real-time NLP</span>
            </div>

            {/* Buying Signals */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Buying Signals ({selectedLead.buyingSignals?.length || 3})
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                {(selectedLead.buyingSignals || [
                  "Explicit budget approval confirmed for deal size",
                  "Immediate rollout requested before next Tuesday",
                  "Key decision maker actively responding in under 3 minutes"
                ]).map((signal, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-surface-container-low p-2 rounded-lg text-xs text-on-surface">
                    <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">check_circle</span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Indicators */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container">
              <span className="text-xs text-error font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">report_problem</span>
                Active Risk Alerts
              </span>
              <div className="flex flex-col gap-1.5 mt-1">
                {(selectedLead.blockers?.length ? selectedLead.blockers : [
                  "Requires SLA confirmation on webhook delivery speed (<500ms)",
                  "Pending GST invoice structure verification"
                ]).map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-error-container/30 p-2 rounded-lg text-xs text-on-surface">
                    <span className="material-symbols-outlined text-sm text-error shrink-0 mt-0.5">error</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Conversation Feed (span 4) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col h-full gap-space-md border border-surface-container">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-headline-sm text-secondary">chat</span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Conversation</h2>
                  <span className="text-xs text-on-surface-variant block">{chatMessages.length} messages indexed</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-secondary-container/40 px-2.5 py-0.5 rounded-full text-on-secondary-container text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span>Live Sync</span>
              </div>
            </div>

            {/* Chat Box */}
            <div className="bg-[#efeae2]/30 rounded-xl p-3 flex flex-col gap-2.5 overflow-y-auto max-h-[480px] min-h-[360px] border border-surface-container">
              <div className="flex justify-center">
                <span className="text-[11px] bg-surface-container text-on-surface-variant px-3 py-0.5 rounded-full font-medium">
                  Today
                </span>
              </div>

              {chatMessages.map(msg => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isAgent ? 'ml-auto items-end' : 'mr-auto items-start'}`}
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
                        <div className="mt-1 pt-1 border-t border-black/10 flex items-center gap-1 text-[10px] font-semibold text-secondary">
                          <span className="material-symbols-outlined text-[12px]">verified</span>
                          <span>{msg.intentBadge}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                      {msg.senderName} • {msg.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendMessage} className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Send direct WhatsApp reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#075E54] hover:bg-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Send</span>
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pt-1">
                {[
                  "Sending over calendar invite for Tuesday 10 AM.",
                  "Yes, we guarantee sub-200ms API dispatch SLA.",
                  "Reviewing the volume discount tier for 150 seats."
                ].map((quick, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(quick)}
                    className="text-[10px] bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant px-2 py-1 rounded-full border border-surface-container transition-colors flex-shrink-0"
                  >
                    ⚡ {quick}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
