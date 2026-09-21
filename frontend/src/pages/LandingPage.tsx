import React from 'react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { navigate } = useApp();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-secondary-container selection:text-on-secondary-container">
      {/* 1. Top Navbar */}
      <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div 
            onClick={() => navigate('landing')}
            className="flex items-center gap-space-sm cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl">mark_chat_read</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-base sm:text-lg tracking-tight text-on-surface font-bold">WA-CRM</span>
              <span className="font-label-sm text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
            <button 
              onClick={() => scrollToSection('preview')}
              className="hover:text-on-surface transition-colors"
            >
              Product
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-on-surface transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="hover:text-on-surface transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('solutions')}
              className="hover:text-on-surface transition-colors"
            >
              Solutions
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('register')}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-secondary-container/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container/40 text-on-secondary-container border border-secondary/20 text-xs font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-secondary">auto_awesome</span>
            <span>Bharat Multilingual AI for High-Velocity Sales</span>
          </div>

          {/* Headline */}
          <h1 className="font-headline-lg text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.15]">
            Turn WhatsApp Conversations <br className="hidden sm:inline" />
            Into <span className="text-secondary">Revenue Intelligence.</span>
          </h1>

          {/* Supporting Text */}
          <p className="font-body-lg text-base sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            AI-powered conversation intelligence that understands your customers, identifies high-value leads and helps your sales team rescue opportunities before they are lost.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigate('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-on-surface hover:bg-surface-container-low font-semibold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-secondary text-lg">play_circle</span>
              <span>See How It Works</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant font-medium">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-sm">verified</span>
              Understands Hindi &amp; Hinglish
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-sm">verified</span>
              Zero Manual CRM Entry
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-sm">verified</span>
              Sub-500ms Extraction SLA
            </span>
          </div>
        </div>

        {/* 3. Product & Live Ingestion Preview Section */}
        <div id="preview" className="max-w-6xl mx-auto mt-12 sm:mt-16">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden">
            {/* Mock Window Header */}
            <div className="px-6 py-3.5 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-error/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-secondary/70" />
                <span className="ml-2 font-mono text-xs text-on-surface-variant font-medium">
                  wa-crm.intelligence / live-stream
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
                <span className="text-[11px] font-semibold text-secondary">
                  WhatsApp Web Sync: Active
                </span>
              </div>
            </div>

            {/* Dashboard Top Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-surface-container bg-surface-container-lowest">
              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                  Hot Leads
                </span>
                <span className="text-xl font-bold text-on-surface">46 Deals</span>
                <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  Score &gt; 80
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                  Revenue Risk Score
                </span>
                <span className="text-xl font-bold text-error">₹42 Lakhs</span>
                <span className="text-[10px] text-error font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  18 Leads Stalled
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                  Lead Rescue Queue
                </span>
                <span className="text-xl font-bold text-secondary">12 High Value</span>
                <span className="text-[10px] text-on-tertiary-container font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  AI Drafts Ready
                </span>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold block">
                  Follow-up SLA
                </span>
                <span className="text-xl font-bold text-on-surface">2m 14s</span>
                <span className="text-[10px] text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  2.4x Faster
                </span>
              </div>
            </div>

            {/* Core Feature Demonstration: The Example Conversation & AI Extraction */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface-container-low/30">
              {/* Left: Incoming WhatsApp Conversation Bubble */}
              <div className="lg:col-span-6 flex flex-col justify-between bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        <span className="material-symbols-outlined text-base">chat</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-on-surface block">Customer WhatsApp Thread</span>
                        <span className="text-[10px] text-on-surface-variant">Inbound message received 4m ago</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      Hinglish NLP
                    </span>
                  </div>

                  {/* Customer Chat Bubble */}
                  <div className="bg-[#efeae2]/50 p-4 rounded-2xl border border-surface-container space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                      <span>Rohan Deshmukh (High-Net-Worth Prospect)</span>
                      <span>11:42 AM</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl rounded-tl-none border border-gray-100 shadow-sm text-xs sm:text-sm text-gray-800 leading-relaxed font-sans">
                      "Sir, Whitefield wala 3BHK pasand hai. Agar 80 lakh ke around final ho jaye toh kal site visit karke token kar dunga."
                    </div>
                  </div>

                  {/* Lead Rescue Alert Banner */}
                  <div className="p-3.5 bg-error-container/40 rounded-xl border border-error/30 flex items-start gap-2.5 text-on-error-container">
                    <span className="material-symbols-outlined text-error text-lg mt-0.5 shrink-0">
                      crisis_alert
                    </span>
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold block text-error">
                        Lead Rescue Alert: High-value lead requires attention
                      </span>
                      <span className="text-[11px] text-on-surface-variant block">
                        Agent response overdue (SLA threshold breached &gt; 10m). Opportunity placed in manager rescue queue.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Channel: WhatsApp Business Cloud</span>
                  <span className="text-secondary font-semibold">Latency: 142ms</span>
                </div>
              </div>

              {/* Right: AI Extraction Matrix */}
              <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
                      <span className="text-xs font-bold text-on-surface">Gemini Entity Extraction</span>
                    </div>
                    <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
                      Confidence 98.4%
                    </span>
                  </div>

                  {/* Extracted Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Customer Intent</span>
                      <span className="text-xs sm:text-sm font-bold text-secondary flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        High Purchase Intent
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Extracted Budget</span>
                      <span className="text-xs sm:text-sm font-bold text-on-surface mt-0.5">₹80 Lakh</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Location</span>
                      <span className="text-xs sm:text-sm font-bold text-on-surface mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                        Whitefield
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Requirement</span>
                      <span className="text-xs sm:text-sm font-bold text-on-surface mt-0.5">3BHK Apartment</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Timeline</span>
                      <span className="text-xs sm:text-sm font-bold text-secondary mt-0.5">Tomorrow (Site Visit)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Urgency Score</span>
                      <span className="text-xs sm:text-sm font-bold text-error mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">local_fire_department</span>
                        92 / 100
                      </span>
                    </div>
                  </div>

                  {/* AI Suggested 1-Click Action */}
                  <div className="p-3.5 bg-secondary-container/25 rounded-xl border border-secondary/20">
                    <span className="text-[11px] font-bold text-secondary flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-sm">forward_to_inbox</span>
                      Suggested Manager Follow-up Action
                    </span>
                    <p className="text-xs text-on-surface-variant italic">
                      "Namaste Rohan ji, Whitefield 3BHK ke liye kal 2:00 PM par site visit confirm kar di hai. Senior manager visit ke dauran special pricing review karenge."
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">Automated Rescue Trigger: Active</span>
                  <button
                    onClick={() => navigate('register')}
                    className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                  >
                    <span>Test In Your Workspace</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-surface-container-low border-y border-surface-container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-secondary">
              End-To-End Ingestion Flow
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-4xl font-bold text-on-surface tracking-tight">
              WhatsApp → AI Analysis → Lead Intelligence → Manager Action
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
              Every message is converted into structured pipeline intelligence without your sales agents typing a single CRM log.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#075E54] flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Step 01</span>
              <h3 className="text-base font-bold text-on-surface">WhatsApp Ingestion</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Connect your business numbers via Meta Cloud API or zero-friction Chrome extension for WhatsApp Web.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Step 02</span>
              <h3 className="text-base font-bold text-on-surface">AI Analysis</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Custom Gemini NLP decodes mixed Hindi-English dialogues, extracting budgets, locations, timelines, and buying signals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Step 03</span>
              <h3 className="text-base font-bold text-on-surface">Lead Intelligence</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Computes conversion probabilities, detects competitor threats, and flags neglected prospects into the rescue queue.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block">Step 04</span>
              <h3 className="text-base font-bold text-on-surface">Manager Action</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Managers receive real-time breach alerts with 1-click WhatsApp follow-up suggestions to save the deal immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-secondary">
              Core Capabilities
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-4xl font-bold text-on-surface tracking-tight">
              Designed Specifically for Indian Commercial Dynamics
            </h2>
            <p className="font-body-md text-sm sm:text-base text-on-surface-variant">
              Generic Western CRMs miss the nuances of customer conversations on WhatsApp. Wa-CRM is purpose-built to close the gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1: Bharat Language Intelligence */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">translate</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Bharat Language Intelligence</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Native parsing for English, Hindi, and colloquial Hinglish. Understands industry idioms like <em>"site visit", "token amount", "on-road price", "bhk"</em>, and commercial negotiating phrasing without manual configuration.
              </p>
            </div>

            {/* Feature 2: Explainable Lead Rescue */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-error-container text-on-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">crisis_alert</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Explainable Lead Rescue</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                No black-box scores. When a lead is flagged at-risk, Wa-CRM clearly displays the root cause: competitor mentions, unresolved pricing objections, or agent response delays exceeding SLA thresholds.
              </p>
            </div>

            {/* Feature 3: Zero-Entry CRM */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Zero-Entry CRM</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Sales reps hate entering notes into conventional CRMs. Wa-CRM continuously indexes chats in the background, updating deal stages, pipeline values, and follow-up reminders automatically.
              </p>
            </div>

            {/* Feature 4: Manager Intelligence */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest text-on-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">leaderboard</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Manager Intelligence</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Comprehensive visibility into team performance. Monitor average response velocities, active chat loads per closer, and pipeline health metrics across all sales channels in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Industry Solutions Section */}
      <section id="solutions" className="py-16 bg-surface-container-low border-t border-surface-container px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-wider font-bold text-secondary">
              Proven Verticals
            </span>
            <h2 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface">
              Tailored for High-Value WhatsApp Sales
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-secondary">apartment</span>
              <h3 className="font-bold text-base text-on-surface">Real Estate &amp; Builders</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Capture site visit requests, floor plan inquiries, and token commitments before buyers switch to competing developers.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-secondary">directions_car</span>
              <h3 className="font-bold text-base text-on-surface">Automobile Dealerships</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Track test drive bookings, exchange evaluations, and on-road quotation chats with zero dropped follow-ups.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-secondary">school</span>
              <h3 className="font-bold text-base text-on-surface">Education &amp; EdTech</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Accelerate enrollment counseling, fee structure inquiries, and parent decision timelines with instant intent triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-primary-container text-on-primary relative overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-on-tertiary-container/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="font-headline-lg text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Stop losing revenue between WhatsApp and your CRM.
          </h2>
          <p className="text-sm sm:text-base text-on-primary-container max-w-2xl mx-auto leading-relaxed">
            Equip your sales team with AI conversation intelligence and rescue high-value leads in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('login')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base transition-all border border-white/20 flex items-center justify-center"
            >
              Sign In to Workspace
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-surface-container-lowest border-t border-surface-container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-secondary-container shadow-sm">
              <span className="material-symbols-outlined text-xl">mark_chat_read</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-on-surface">WA-CRM Intelligence</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">WhatsApp Revenue Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-on-surface-variant font-medium">
            <button onClick={() => scrollToSection('preview')} className="hover:text-on-surface">Product</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-on-surface">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-on-surface">Features</button>
            <button onClick={() => navigate('login')} className="hover:text-on-surface">Sign In</button>
            <button onClick={() => navigate('register')} className="hover:text-on-surface">Create Account</button>
          </div>

          <span className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} WA-CRM Intelligence. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};
