import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { LeadPriority } from '../types';

interface LeadsPageProps {
  initialFilter?: LeadPriority;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ initialFilter }) => {
  const { leads, navigate, setActiveChatLead, setIsAddLeadModalOpen, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'Hot' | 'At-Risk' | 'Warm' | 'Cold'>(initialFilter || 'all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (initialFilter) {
      setActiveTab(initialFilter);
    }
  }, [initialFilter]);

  const filteredLeads = leads.filter(l => {
    if (activeTab !== 'all' && l.priority !== activeTab) return false;
    if (selectedStage !== 'all' && l.stage !== selectedStage) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPipeline = leads.reduce((acc, l) => acc + l.dealValue, 0);

  return (
    <div className="flex flex-col w-full px-margin py-space-xl gap-space-lg pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              {activeTab === 'Hot' ? 'Hot Leads' : activeTab === 'At-Risk' ? 'At-Risk Leads' : 'All Leads'}
            </h1>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
              {filteredLeads.length} active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage, extract, and convert revenue opportunities synchronized directly from WhatsApp streams
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => showNotification('Force sync completed! WhatsApp messages up to date.')}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container transition-colors font-label-md text-label-md border border-surface-container"
          >
            <span className="material-symbols-outlined text-label-md text-secondary">sync</span>
            <span>Force WA Sync</span>
          </button>
          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary shadow-md hover:bg-surface-container-highest hover:text-on-surface transition-all font-label-md text-label-md font-semibold"
          >
            <span className="material-symbols-outlined text-label-md">add</span>
            <span>+ Add Lead</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="flex items-center justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Total Pipeline</span>
            <span className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
              ₹{(totalPipeline / 100000).toFixed(1)} Lakhs
            </span>
            <span className="font-label-sm text-label-sm text-on-secondary-container mt-1 flex items-center gap-0.5 font-medium">
              <span className="material-symbols-outlined text-label-sm">trending_up</span> +18.4% this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">payments</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Hot Probability</span>
            <span className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
              {leads.filter(l => l.priority === 'Hot').length} Deals
            </span>
            <span className="font-label-sm text-label-sm text-secondary mt-1 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-label-sm">local_fire_department</span> Score &gt; 80
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">At Risk & Stalled</span>
            <span className="font-headline-md text-headline-md text-error mt-1 font-bold">
              {leads.filter(l => l.priority === 'At-Risk').length} Leads
            </span>
            <span className="font-label-sm text-label-sm text-error mt-1 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-label-sm">warning</span> Action required
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container">
            <span className="material-symbols-outlined">crisis_alert</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">Avg Lead Score</span>
            <span className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">78 / 100</span>
            <span className="font-label-sm text-label-sm text-on-tertiary-container mt-1 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined text-label-sm">auto_awesome</span> AI calculated
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
            <span className="material-symbols-outlined">speed</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex flex-col gap-space-md p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
        {/* Tab filters & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-container pb-space-md">
          {/* Priority Tabs */}
          <div className="flex items-center gap-space-xs overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-space-xs transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span>All Leads</span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed-dim text-on-primary-fixed text-xs font-semibold">
                {leads.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('Hot')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-space-xs transition-colors ${
                activeTab === 'Hot'
                  ? 'bg-secondary text-on-secondary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Hot</span>
              <span className="text-xs">{leads.filter(l => l.priority === 'Hot').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('At-Risk')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-space-xs transition-colors ${
                activeTab === 'At-Risk'
                  ? 'bg-error text-on-error shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span>At Risk</span>
              <span className="text-xs">{leads.filter(l => l.priority === 'At-Risk').length}</span>
            </button>
            <button
              onClick={() => setActiveTab('Warm')}
              className={`px-space-md py-space-xs rounded-lg font-label-md text-label-md flex items-center gap-space-xs transition-colors ${
                activeTab === 'Warm'
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              <span>Warm</span>
              <span className="text-xs">{leads.filter(l => l.priority === 'Warm').length}</span>
            </button>
          </div>

          {/* Search & Stage Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-base">search</span>
              <input
                type="text"
                placeholder="Filter by name or tag..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-surface-container-low border border-surface-container rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary w-48"
              />
            </div>

            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="bg-surface-container-low border border-surface-container rounded-lg px-3 py-1.5 text-xs text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="all">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/70 text-on-surface-variant font-label-sm text-label-sm border-b border-surface-container">
                <th className="py-space-sm px-space-md">Lead Details</th>
                <th className="py-space-sm px-space-md">Deal Value</th>
                <th className="py-space-sm px-space-md">Stage</th>
                <th className="py-space-sm px-space-md">AI Score & Priority</th>
                <th className="py-space-sm px-space-md">Latest Message Snippet</th>
                <th className="py-space-sm px-space-md">Rep</th>
                <th className="py-space-sm px-space-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => navigate('lead-details', { leadId: lead.id })}
                  className="hover:bg-surface-container-low/60 transition-colors cursor-pointer group"
                >
                  {/* Lead Info */}
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-xs">
                          {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        {lead.unreadWhatsAppCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#25D366] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {lead.unreadWhatsAppCount}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-secondary transition-colors">
                          {lead.name}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {lead.company} • {lead.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Deal Value */}
                  <td className="py-space-md px-space-md">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {lead.dealValueFormatted}
                    </span>
                  </td>

                  {/* Stage Pill */}
                  <td className="py-space-md px-space-md">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                      {lead.stage}
                    </span>
                  </td>

                  {/* Score & Priority */}
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        lead.priority === 'Hot'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : lead.priority === 'At-Risk'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container-high text-on-surface'
                      }`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {lead.priority === 'Hot' ? 'local_fire_department' : lead.priority === 'At-Risk' ? 'warning' : 'bolt'}
                        </span>
                        {lead.score}
                      </span>
                      <span className="text-xs text-on-surface-variant">{lead.sentiment}</span>
                    </div>
                  </td>

                  {/* Last message */}
                  <td className="py-space-md px-space-md max-w-xs">
                    <p className="text-xs text-on-surface truncate">
                      "{lead.lastMessage}"
                    </p>
                    <span className="text-[10px] text-on-surface-variant">{lead.lastMessageTime}</span>
                  </td>

                  {/* Rep */}
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-xs flex items-center justify-center font-bold">
                        {lead.assignedAgent.avatar}
                      </div>
                      <span className="text-xs font-medium text-on-surface">{lead.assignedAgent.name}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-space-md px-space-md text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveChatLead(lead)}
                        className="px-2.5 py-1 rounded-lg bg-[#075E54] hover:bg-secondary text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => navigate('lead-details', { leadId: lead.id })}
                        className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs transition-colors"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
