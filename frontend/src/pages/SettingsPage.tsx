import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { user, showNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'ai' | 'team'>('whatsapp');
  const [phone, setPhone] = useState(user?.businessPhone || '+91 98200 12345');
  const [webhookUrl, setWebhookUrl] = useState('https://api.growthscale.io/v1/whatsapp/webhook');
  const [autoExtract, setAutoExtract] = useState(true);
  const [slaMinutes, setSlaMinutes] = useState('10');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Settings updated successfully!');
  };

  return (
    <div className="flex flex-col w-full px-margin py-space-xl gap-space-lg max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Workspace Settings
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Configure WhatsApp Web pairing, Meta Cloud API credentials, and Gemini AI intent extraction parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low p-1 rounded-xl border border-surface-container w-fit">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'whatsapp'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          WhatsApp Web Integration
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ai'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          AI Extraction Engine
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'team'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Team &amp; Roles
        </button>
      </div>

      {/* Content */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-surface-container">
        {activeTab === 'whatsapp' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-on-surface mb-1">WhatsApp Web Browser Extension</h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Our Chrome/Edge extension captures messages directly from web.whatsapp.com and securely pipes them to your CRM.
              </p>

              <div className="p-4 bg-secondary-container/20 rounded-xl border border-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-on-surface block">Extension Status: Active &amp; Synced</span>
                    <span className="text-xs text-on-surface-variant">Version 2.4.0 • Device ID: WA-DESKTOP-98200</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => showNotification('Extension health check passed. Heartbeat latency: 18ms')}
                  className="px-3 py-1.5 bg-surface-container-lowest border border-surface-container rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container-high transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Central Business Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-xs text-on-surface"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Cloud Webhook Ingestion URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-lg px-3 py-2 text-xs text-on-surface font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-container">
              <button
                type="submit"
                className="px-6 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Save Integration Settings
              </button>
            </div>
          </form>
        )}

        {activeTab === 'ai' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-on-surface mb-1">Gemini AI Model Configuration</h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Tune the sensitivity of budget extraction, competitor risk alerts, and sentiment evaluation.
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container cursor-pointer">
                  <div>
                    <span className="text-sm font-semibold text-on-surface block">Automatic Deal Intent Extraction</span>
                    <span className="text-xs text-on-surface-variant">Extract budgets, timelines, and decision makers from chat threads</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoExtract}
                    onChange={e => setAutoExtract(e.target.checked)}
                    className="rounded text-secondary focus:ring-secondary h-5 w-5"
                  />
                </label>

                <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-on-surface">Response SLA Warning Threshold</span>
                    <span className="text-xs font-bold text-error">{slaMinutes} Minutes</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={slaMinutes}
                    onChange={e => setSlaMinutes(e.target.value)}
                    className="w-full accent-secondary"
                  />
                  <span className="text-[11px] text-on-surface-variant block mt-1">
                    Triggers "At-Risk" alert if customer message is unanswered after {slaMinutes} minutes.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-container">
              <button
                type="submit"
                className="px-6 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Save AI Configuration
              </button>
            </div>
          </form>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-on-surface mb-1">Team Workspace Members</h2>
              <p className="text-xs text-on-surface-variant mb-4">
                Administrators, Sales Reps, and Closer agents assigned to WhatsApp chat queues.
              </p>

              <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                      AK
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">Aisha Khan (You)</span>
                      <span className="text-[11px] text-on-surface-variant">aisha.khan@growthscale.io</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-secondary-container px-2.5 py-0.5 rounded-full text-on-secondary-container">
                    Lead Admin &amp; Owner
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
