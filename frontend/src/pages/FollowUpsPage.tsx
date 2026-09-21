import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const FollowUpsPage: React.FC = () => {
  const { followUps, leads, setActiveChatLead, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'All' | 'Overdue' | 'Due Today' | 'Scheduled'>('All');

  const filtered = followUps.filter(f => {
    if (activeTab === 'All') return true;
    return f.status === activeTab;
  });

  const sendDraft = (leadName: string, draft: string) => {
    const lead = leads.find(l => l.name === leadName) || leads[0];
    setActiveChatLead(lead);
    showNotification(`Prepared WhatsApp draft for ${leadName}: "${draft.substring(0, 40)}..."`);
  };

  return (
    <div className="flex flex-col w-full px-margin py-space-xl gap-space-lg max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Follow-ups
            </h1>
            <span className="inline-flex items-center px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm shadow-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5 animate-pulse"></span>
              {followUps.length} Scheduled
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mt-0.5">
            AI-prioritized WhatsApp response SLAs, overdue nudge automation, and scheduled re-engagements.
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => showNotification('Dispatched 4 automated WhatsApp follow-up nudges with sub-500ms latency.')}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-tertiary-container shadow-sm hover:shadow-md transition-all font-label-md text-label-md border border-surface-container font-semibold"
          >
            <span className="material-symbols-outlined text-label-md text-secondary">auto_awesome</span>
            <span>Bulk WhatsApp Nudge</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Follow-ups Due Today</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined text-label-lg">schedule</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">32</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-label-sm mr-0.5">trending_up</span> +8 today
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
              14 High Priority
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Missed / Overdue</span>
            <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
              <span className="material-symbols-outlined text-label-lg">warning</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-display-lg text-display-lg text-error tracking-tight font-bold">12</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                Action Required
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-error mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              SLA breached &gt; 1 hr
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Upcoming (Next 48h)</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-label-lg">arrow_forward</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">45</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                On track
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary-container"></span>
              Pipeline value ₹1.1 Cr
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">Completed Today</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-label-lg">check_circle</span>
            </div>
          </div>
          <div className="mt-space-md">
            <div className="flex items-baseline gap-space-sm">
              <span className="font-display-lg text-display-lg text-secondary tracking-tight font-bold">28</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                87% Responded
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              ₹18.4L deal value advanced
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2">
        {(['All', 'Overdue', 'Due Today', 'Scheduled'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-surface-container'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Follow-up Queue Cards */}
      <div className="space-y-4">
        {filtered.map(fu => (
          <div
            key={fu.id}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            {/* Left Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-sm flex-shrink-0">
                {fu.leadName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {fu.leadName}
                  </span>
                  <span className="font-semibold text-secondary text-sm">
                    {fu.dealValueFormatted}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    fu.status === 'Overdue'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}>
                    {fu.timeSlot}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  <b>Reason:</b> {fu.reason}
                </p>

                {/* AI Draft Box */}
                <div className="mt-2 p-3 bg-surface-container-low rounded-xl border border-surface-container text-xs text-on-surface relative">
                  <div className="flex items-center gap-1 text-[11px] text-secondary font-bold mb-1">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>AI Recommended WhatsApp Draft</span>
                  </div>
                  <p className="italic text-on-surface-variant">"{fu.aiSuggestedDraft}"</p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
              <button
                onClick={() => sendDraft(fu.leadName, fu.aiSuggestedDraft)}
                className="px-4 py-2.5 bg-[#075E54] hover:bg-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Send WhatsApp Draft</span>
              </button>
              <button
                onClick={() => showNotification(`Follow-up with ${fu.leadName} marked as completed.`)}
                className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl text-xs font-medium transition-colors"
              >
                Mark Done
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
