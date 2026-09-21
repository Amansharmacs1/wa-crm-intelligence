import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const DASHBOARD_REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL) || 60 * 60 * 1000;

export const DashboardPage: React.FC = () => {
  const { leads, navigate, setActiveChatLead, showNotification, fetchDashboardData, isFetching, lastRefreshed, dashboardMetrics } = useApp();
  const [filter, setFilter] = useState<'all' | 'hot' | 'at-risk'>('all');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    // Fetch immediately on mount
    fetchDashboardData();

    // Start 60 minute interval
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures it only runs on mount

  const filteredLeads = leads.filter(l => {
    if (filter === 'hot') return l.priority === 'Hot';
    if (filter === 'at-risk') return l.priority === 'At-Risk';
    return true;
  });

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Company', 'Deal Value', 'Stage', 'Priority', 'Score'];
    const rows = leads.map(l => [l.name, l.phone, l.company, l.dealValue, l.stage, l.priority, l.score]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wa_crm_leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Pipeline CSV exported successfully!');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Top Action Bar */}
      <div className="px-margin pt-space-xl pb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Revenue Intelligence Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-tertiary-container font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[13px] text-secondary">auto_awesome</span>
              AI Live Stream
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            AI-powered predictive extraction and velocity logs from your synchronized WhatsApp conversations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Fetch Latest Data Button */}
          <button
            onClick={() => fetchDashboardData()}
            disabled={isFetching}
            className="flex items-center gap-space-xs px-space-md py-space-xs bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-sm font-label-md text-label-md"
          >
            <span className={`material-symbols-outlined text-label-lg ${isFetching ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isFetching ? 'Fetching...' : 'Fetch Latest Data'}</span>
          </button>
          
          <div className="flex flex-col ml-1 mr-3">
             <span className="text-[10px] text-on-surface-variant font-medium">Last updated:</span>
             <span className="text-[11px] font-semibold">{lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'}</span>
          </div>

          {/* Sync WhatsApp Web Status Chip */}
          <div className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest shadow-sm rounded-lg border border-surface-container">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">WhatsApp Sync: Live</span>
            <span className="material-symbols-outlined text-secondary text-label-md">bolt</span>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button className="flex items-center gap-space-xs px-space-md py-space-xs bg-surface-container-lowest shadow-sm rounded-lg text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md border border-surface-container">
              <span className="material-symbols-outlined text-label-lg text-on-surface-variant">calendar_today</span>
              <span>Last 30 Days (Oct 2024)</span>
            </button>
          </div>

          {/* Export CSV CTA */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-space-xs px-space-md py-space-xs bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface transition-all duration-200 rounded-lg shadow-sm font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-label-lg">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="px-margin space-y-space-xl pb-16">
        {/* Row 1: 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* 1. Total Leads */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Leads</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-label-lg">groups</span>
              </div>
            </div>
            <div className="my-space-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">{dashboardMetrics?.totalLeads !== undefined ? dashboardMetrics.totalLeads : 0}</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px] mr-0.5">trending_up</span>Live
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>All active leads</span>
              <svg className="w-16 h-5 text-secondary" fill="none" viewBox="0 0 60 20">
                <path d="M1 17L12 12L25 15L38 8L50 11L59 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* 2. Hot Leads */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group border border-surface-container">
            <div className="absolute top-0 right-0 left-0 h-1 bg-secondary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary font-semibold">Hot Leads</span>
              <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-label-lg">local_fire_department</span>
              </div>
            </div>
            <div className="my-space-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">{dashboardMetrics?.highUrgency !== undefined ? dashboardMetrics.highUrgency : 0}</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px] mr-0.5">trending_up</span>Live
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-secondary font-medium">Ready to close</span>
              <svg className="w-16 h-5 text-secondary" fill="none" viewBox="0 0 60 20">
                <path d="M1 18L14 14L28 16L40 7L50 9L59 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* 3. Leads At Risk */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group border border-surface-container">
            <div className="absolute top-0 right-0 left-0 h-1 bg-error"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-error font-semibold">Leads At Risk</span>
              <div className="w-8 h-8 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-label-lg">warning</span>
              </div>
            </div>
            <div className="my-space-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">{dashboardMetrics?.atRiskLeads !== undefined ? dashboardMetrics.atRiskLeads : 0}</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-error/10 text-error font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px] mr-0.5">priority_high</span>Action Needed
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-error font-medium">Overdue follow-ups</span>
              <span className="text-on-surface-variant font-semibold">{(dashboardMetrics?.revenueAtRisk || 0) > 0 ? '₹' + (dashboardMetrics.revenueAtRisk/100000).toFixed(1) + ' L' : '₹0'} at risk</span>
            </div>
          </div>

          {/* 4. Est. Pipeline Value */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group border border-surface-container">
            <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary font-semibold">Est. Pipeline Value</span>
              <div className="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-label-lg">payments</span>
              </div>
            </div>
            <div className="my-space-md flex items-baseline justify-between">
              <span className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">{(dashboardMetrics?.estimatedPipelineValue || 0) > 0 ? '₹' + (dashboardMetrics.estimatedPipelineValue/100000).toFixed(1) + ' L' : '₹0'}</span>
              <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-[13px] mr-0.5">trending_up</span>Live
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="text-primary font-medium">Live sync</span>
              <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Lead Distribution (35%) + Revenue Velocity Trend (65%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
          {/* 1. Lead Distribution Card */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Lead Distribution</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Segmentation by AI sentiment & engagement</p>
                </div>
                <span className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant">
                  <span className="material-symbols-outlined text-label-lg">pie_chart</span>
                </span>
              </div>

              {/* Progress bars & metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">Hot Leads</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">46</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">(18.5%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">Warm / Active</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">94</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">(37.9%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-on-primary-container"></span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">Cold / Inactive</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">90</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">(36.3%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                    <span className="font-label-md text-label-md text-on-surface font-medium">At Risk</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">18</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">(7.3%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insight Alert Ribbon */}
            <div className="mt-space-md p-space-md bg-surface-container-high/60 rounded-xl flex items-start gap-space-sm border border-secondary/20">
              <div className="w-6 h-6 rounded-md bg-primary-container text-secondary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">AI Pipeline Insight</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface font-semibold">72% of Hot leads</strong> originated from pricing queries on WhatsApp Web within 15 minutes of brochure dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Revenue & Deal Velocity Trend Card */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container mb-2">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Revenue & Deal Velocity Trend</h3>
                    <span className="px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-semibold">₹2.4 Cr Active</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Projected vs Closed value extracted across Oct 1 - Oct 30, 2024</p>
                </div>

                <div className="inline-flex p-1 bg-surface-container-low rounded-lg">
                  <button
                    onClick={() => setTimeframe('weekly')}
                    className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-all ${timeframe === 'weekly' ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant'}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimeframe('monthly')}
                    className={`px-space-sm py-1 rounded font-label-sm text-label-sm transition-all ${timeframe === 'monthly' ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant'}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              {/* Legend indicators */}
              <div className="flex items-center gap-space-lg text-label-sm font-label-sm my-space-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-primary-container rounded"></span>
                  <span className="text-on-surface font-medium">Projected Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-secondary rounded"></span>
                  <span className="text-on-surface font-medium">Closed WhatsApp Deals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-error border-b border-dashed border-error"></span>
                  <span className="text-on-surface-variant font-medium">At-Risk Band (₹42L)</span>
                </div>
              </div>

              {/* SVG Area Chart matching Stitch */}
              <div className="w-full h-56 pt-space-xs">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
                  <defs>
                    <linearGradient id="gradProjected" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#0d1841" stopOpacity="0.18"></stop>
                      <stop offset="100%" stopColor="#0d1841" stopOpacity="0.0"></stop>
                    </linearGradient>
                    <linearGradient id="gradClosed" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#006c49" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#006c49" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line stroke="#eaedff" strokeWidth="1" x1="40" x2="590" y1="20" y2="20"></line>
                  <line stroke="#eaedff" strokeWidth="1" x1="40" x2="590" y1="65" y2="65"></line>
                  <line stroke="#eaedff" strokeWidth="1" x1="40" x2="590" y1="110" y2="110"></line>
                  <line stroke="#eaedff" strokeWidth="1" x1="40" x2="590" y1="155" y2="155"></line>
                  {/* Y Axis Labels */}
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="5" y="24">₹2.5Cr</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="5" y="69">₹1.8Cr</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="5" y="114">₹1.0Cr</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="5" y="159">₹30L</text>
                  {/* At-risk dotted line */}
                  <line opacity="0.6" stroke="#ba1a1a" strokeDasharray="4 4" strokeWidth="1.5" x1="40" x2="590" y1="140" y2="140"></line>
                  {/* Area fills */}
                  <polygon fill="url(#gradProjected)" points="40,155 40,115 130,95 220,105 310,70 400,55 490,40 590,30 590,155"></polygon>
                  <polygon fill="url(#gradClosed)" points="40,155 40,140 130,130 220,118 310,95 400,82 490,65 590,48 590,155"></polygon>
                  {/* Lines */}
                  <path d="M40 115 L130 95 L220 105 L310 70 L400 55 L490 40 L590 30" fill="none" stroke="#0d1841" strokeLinecap="round" strokeWidth="2.5"></path>
                  <path d="M40 140 L130 130 L220 118 L310 95 L400 82 L490 65 L590 48" fill="none" stroke="#006c49" strokeLinecap="round" strokeWidth="2.5"></path>
                  {/* Data points */}
                  <circle cx="310" cy="70" fill="#ffffff" r="4" stroke="#0d1841" strokeWidth="2"></circle>
                  <circle cx="490" cy="65" fill="#ffffff" r="4" stroke="#006c49" strokeWidth="2"></circle>
                  <circle cx="590" cy="48" fill="#6cf8bb" r="5" stroke="#006c49" strokeWidth="2"></circle>
                  {/* X Axis ticks */}
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="40" y="180">Oct 01</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="130" y="180">Oct 06</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="220" y="180">Oct 12</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="310" y="180">Oct 18</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="400" y="180">Oct 24</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="490" y="180">Oct 28</text>
                  <text className="text-[10px] font-body-sm" fill="#7881b0" x="560" y="180">Oct 30</text>
                </svg>
              </div>
            </div>

            <div className="pt-space-xs flex flex-wrap items-center justify-between font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container mt-2">
              <span className="flex items-center gap-1 text-secondary font-medium">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Last verified AI extraction: 3 mins ago
              </span>
              <span className="text-on-surface font-semibold">Conversion Velocity: +3.2 days faster</span>
            </div>
          </div>
        </div>

        {/* Row 3: Priority Leads Table Requiring Immediate Action */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container">
          <div className="p-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest border-b border-surface-container">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Priority Leads Requiring Immediate Action
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                High deal-intent threads detected with pending response SLA breaches
              </p>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-space-md py-1 rounded-full text-label-sm font-label-sm transition-all ${filter === 'all' ? 'bg-primary-container text-on-primary shadow-sm font-semibold' : 'bg-surface-container-low text-on-surface'}`}
              >
                All Priority ({leads.length})
              </button>
              <button
                onClick={() => setFilter('at-risk')}
                className={`px-space-md py-1 rounded-full text-label-sm font-label-sm transition-all ${filter === 'at-risk' ? 'bg-error text-on-error font-semibold' : 'bg-surface-container-low text-on-surface hover:bg-error-container hover:text-on-error-container'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-error mr-1"></span>
                At Risk ({leads.filter(l => l.priority === 'At-Risk').length})
              </button>
              <button
                onClick={() => setFilter('hot')}
                className={`px-space-md py-1 rounded-full text-label-sm font-label-sm transition-all ${filter === 'hot' ? 'bg-secondary text-on-secondary font-semibold' : 'bg-surface-container-low text-on-surface hover:bg-secondary-container hover:text-on-secondary-container'}`}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-secondary mr-1"></span>
                Hot Follow-ups ({leads.filter(l => l.priority === 'Hot').length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm border-b border-surface-container">
                  <th className="py-space-sm px-space-md">Lead & Company</th>
                  <th className="py-space-sm px-space-md">Deal Value</th>
                  <th className="py-space-sm px-space-md">AI Intent & Status</th>
                  <th className="py-space-sm px-space-md">Latest Message</th>
                  <th className="py-space-sm px-space-md">Assigned Rep</th>
                  <th className="py-space-sm px-space-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer"
                    onClick={() => navigate('lead-details', { leadId: lead.id })}
                  >
                    {/* Lead info */}
                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {lead.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-secondary transition-colors">
                            {lead.name}
                          </span>
                          <span className="font-body-sm text-xs text-on-surface-variant">
                            {lead.company} • {lead.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Deal Value */}
                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">
                          {lead.dealValueFormatted}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">{lead.stage}</span>
                      </div>
                    </td>

                    {/* AI Intent & Status */}
                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${
                          lead.priority === 'Hot'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : lead.priority === 'At-Risk'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {lead.priority === 'Hot' ? 'local_fire_department' : lead.priority === 'At-Risk' ? 'warning' : 'bolt'}
                          </span>
                          {lead.priority} (Score: {lead.score})
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {lead.sentiment} Sentiment
                        </span>
                      </div>
                    </td>

                    {/* Latest Message */}
                    <td className="py-space-md px-space-md max-w-xs">
                      <p className="font-body-sm text-xs text-on-surface truncate leading-relaxed">
                        "{lead.lastMessage}"
                      </p>
                      <span className="text-[10px] text-on-surface-variant">{lead.lastMessageTime}</span>
                    </td>

                    {/* Assigned Rep */}
                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary text-xs flex items-center justify-center font-semibold">
                          {lead.assignedAgent.avatar}
                        </div>
                        <span className="font-label-sm text-xs text-on-surface font-medium">
                          {lead.assignedAgent.name}
                        </span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-space-md px-space-md text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveChatLead(lead)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#075E54] hover:bg-secondary text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => navigate('lead-details', { leadId: lead.id })}
                          className="px-2 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition-colors"
                          title="View Full Profile"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
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
    </div>
  );
};
