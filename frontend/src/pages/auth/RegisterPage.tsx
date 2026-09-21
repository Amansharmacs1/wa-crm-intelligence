import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { register, navigate } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    name: 'Aisha Khan',
    email: 'aisha.khan@growthscale.io',
    password: 'Password@123',
    company: 'GrowthScale Technologies',
    industry: 'SaaS & Enterprise Tech',
    teamSize: '10-25 agents',
    phone: '+91 98200 12345',
    agreeTerms: true
  });

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-4 bg-primary-container text-on-primary">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary-container text-3xl">mark_chat_read</span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary font-bold">WA-CRM</span>
                <span className="font-label-sm text-[10px] text-on-primary-container tracking-wider uppercase font-semibold">Intelligence Setup</span>
              </div>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-secondary-container font-medium border border-white/10">
              Step {step} of 3
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl font-bold tracking-tight text-white mb-2">
            {step === 1 && "Create your Administrator Account"}
            {step === 2 && "Tell us about your organization"}
            {step === 3 && "Connect WhatsApp Business API"}
          </h1>
          <p className="text-on-primary-container text-xs md:text-sm">
            {step === 1 && "Start turning unstructured WhatsApp communications into actionable pipeline intelligence."}
            {step === 2 && "Customize your AI deal extraction rules and team velocity parameters."}
            {step === 3 && "Link your verified business number or install our secure browser extension."}
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex gap-2 mt-6">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-secondary-container' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aisha Khan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="text-xs text-on-surface-variant hover:text-on-surface font-medium"
                >
                  Already have an account? Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GrowthScale Technologies"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={formData.industry}
                    onChange={e => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                  >
                    <option value="SaaS & Enterprise Tech">SaaS & Tech</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Real Estate & Infrastructure">Real Estate</option>
                    <option value="Healthcare & Wellness">Healthcare</option>
                    <option value="Finance & Fintech">Fintech & Banking</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                    Sales Team Size
                  </label>
                  <select
                    value={formData.teamSize}
                    onChange={e => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                  >
                    <option value="1-5 agents">1 - 5 Reps</option>
                    <option value="6-20 agents">6 - 20 Reps</option>
                    <option value="20-50 agents">20 - 50 Reps</option>
                    <option value="50+ agents">50+ Enterprise Reps</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-2"
                >
                  <span>Continue</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-1">
                  Primary WhatsApp Business Phone Number *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-lg">chat</span>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 12345"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  This number will be designated as the central revenue router for your team.
                </p>
              </div>

              {/* Sync Protocol Selection Box */}
              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Instant Pairing Mode</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Our background worker will link to your WhatsApp Web session and automatically stream chat messages into your CRM dashboard in real time.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeTerms}
                    onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="rounded text-secondary focus:ring-secondary h-4 w-4 mt-0.5"
                  />
                  <span className="text-xs text-on-surface-variant leading-tight">
                    I agree to the <b>Terms of Service</b>, <b>Data Processing Addendum</b>, and authorize WA-CRM to index sales conversations for internal CRM extraction.
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                  <span>Launch Workspace</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
