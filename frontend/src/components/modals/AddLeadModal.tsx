import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { LeadPriority, LeadStage, LeadSentiment } from '../../types';

export const AddLeadModal: React.FC = () => {
  const { isAddLeadModalOpen, setIsAddLeadModalOpen, addLead, agents } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    dealValue: '500000',
    stage: 'New' as LeadStage,
    priority: 'Hot' as LeadPriority,
    sentiment: 'Positive' as LeadSentiment,
    assignedAgentId: agents[0]?.id || 'ag_1',
    lastMessage: 'Initial WhatsApp contact received via website widget.',
    tags: 'Inbound, High Intent'
  });

  if (!isAddLeadModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    const assigned = agents.find(a => a.id === formData.assignedAgentId) || agents[0];

    addLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      company: formData.company || 'Private Client',
      dealValue: Number(formData.dealValue),
      stage: formData.stage,
      priority: formData.priority,
      sentiment: formData.sentiment,
      assignedAgent: {
        id: assigned.id,
        name: assigned.name,
        avatar: assigned.avatar
      },
      lastMessage: formData.lastMessage,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      aiSummary: 'Newly registered lead via WhatsApp CRM Ingestion channel.'
    });

    setIsAddLeadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-primary-container text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container">person_add</span>
            <h2 className="font-headline-sm text-headline-sm text-on-primary font-semibold">Add Lead to Pipeline</h2>
          </div>
          <button
            onClick={() => setIsAddLeadModalOpen(false)}
            className="text-on-primary-container hover:text-on-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                Full Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                required
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Logistics"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                Estimated Deal Value (₹)
              </label>
              <input
                type="number"
                placeholder="500000"
                value={formData.dealValue}
                onChange={e => setFormData({ ...formData, dealValue: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={e => setFormData({ ...formData, stage: e.target.value as LeadStage })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-2.5 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">
                Lead Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as LeadPriority })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-2.5 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                <option value="Hot">🔥 Hot</option>
                <option value="Warm">⚡ Warm</option>
                <option value="Cold">❄️ Cold</option>
                <option value="At-Risk">⚠️ At-Risk</option>
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface font-medium mb-1">
                Assign Agent
              </label>
              <select
                value={formData.assignedAgentId}
                onChange={e => setFormData({ ...formData, assignedAgentId: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-2.5 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
              Latest WhatsApp Message / Requirement
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inquired about enterprise WhatsApp API pricing"
              value={formData.lastMessage}
              onChange={e => setFormData({ ...formData, lastMessage: e.target.value })}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg px-3 py-2 text-on-surface font-body-sm text-body-sm focus:ring-2 focus:ring-secondary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-surface-container">
            <button
              type="button"
              onClick={() => setIsAddLeadModalOpen(false)}
              className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-label-md text-label-md bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
