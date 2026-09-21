import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const DASHBOARD_REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL) || 60 * 60 * 1000;

export const DashboardPage: React.FC = () => {
  const { leads, navigate, setActiveChatLead, showNotification, fetchDashboardData, syncLocalData, isFetching, lastRefreshed, dashboardMetrics } = useApp();

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(() => fetchDashboardData(), DASHBOARD_REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hot': return 'text-apple-red bg-apple-red/10';
      case 'At-Risk': return 'text-[#ff9500] bg-[#ff9500]/10'; // Apple Orange
      case 'Warm': return 'text-apple-blue bg-apple-blue/10';
      default: return 'text-apple-text-secondary bg-apple-hover';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="px-8 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-[32px] font-bold tracking-tight text-apple-text leading-tight">Overview</h1>
          <p className="text-[15px] text-apple-text-secondary mt-1">
            Real-time pipeline analytics from WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => syncLocalData()}
            className="apple-btn-secondary flex items-center gap-2 text-[13px] !py-2 !px-4"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            Sync
          </button>
          
          <button
            onClick={() => fetchDashboardData()}
            className="apple-btn-secondary flex items-center gap-2 text-[13px] !py-2 !px-4"
            disabled={isFetching}
          >
            <span className={`material-symbols-outlined text-[16px] ${isFetching ? 'animate-spin' : ''}`}>sync</span>
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="apple-btn-secondary flex items-center gap-2 text-[13px] !py-2 !px-4"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="apple-card p-6">
          <h3 className="text-[14px] font-medium text-apple-text-secondary">Pipeline Value</h3>
          <p className="text-[32px] font-semibold tracking-tight text-apple-text mt-2">
            ₹{((dashboardMetrics?.estimatedPipelineValue || leads.reduce((a,b)=>a+b.dealValue,0)) / 100000).toFixed(1)}L
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-apple-green">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12.5% this week</span>
          </div>
        </div>

        <div className="apple-card p-6">
          <h3 className="text-[14px] font-medium text-apple-text-secondary">Total Leads</h3>
          <p className="text-[32px] font-semibold tracking-tight text-apple-text mt-2">
            {dashboardMetrics?.totalLeads || leads.length}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-apple-text-secondary">
            <span>From 4 active agents</span>
          </div>
        </div>

        <div className="apple-card p-6">
          <h3 className="text-[14px] font-medium text-apple-text-secondary">Revenue at Risk</h3>
          <p className="text-[32px] font-semibold tracking-tight text-apple-text mt-2">
            ₹{((dashboardMetrics?.revenueAtRisk || leads.filter(l=>l.priority==='At-Risk').reduce((a,b)=>a+b.dealValue,0)) / 100000).toFixed(1)}L
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-apple-red">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>{dashboardMetrics?.atRiskLeads || leads.filter(l=>l.priority==='At-Risk').length} accounts need attention</span>
          </div>
        </div>

        <div className="apple-card p-6 bg-primary text-white border-transparent">
          <h3 className="text-[14px] font-medium text-white/80">Follow-ups Due</h3>
          <p className="text-[32px] font-semibold tracking-tight mt-2">
            {dashboardMetrics?.followUpsRequired || leads.filter(l=>['Hot','At-Risk'].includes(l.priority)).length}
          </p>
          <button 
            onClick={() => navigate('follow-ups')}
            className="mt-4 flex items-center gap-1 text-[12px] font-medium text-white/90 hover:text-white group"
          >
            View Schedule
            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8">
        <div className="apple-card overflow-hidden">
          <div className="px-6 py-5 border-b border-apple-border flex items-center justify-between bg-[#fbfbfd]">
            <h2 className="text-[17px] font-semibold text-apple-text">Recent AI Analysis</h2>
            <button 
              onClick={() => navigate('all-leads')}
              className="text-[13px] font-medium text-apple-blue hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-apple-border/50 text-[12px] font-medium text-apple-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Last Interaction</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Score</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/50">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-apple-hover/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-apple-text">{lead.name}</span>
                        <span className="text-[12px] text-apple-text-secondary">{lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-apple-text truncate">{lead.lastMessage}</span>
                        <span className="text-[11px] text-apple-text-secondary">{lead.lastMessageTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-apple-text">{lead.dealValueFormatted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-apple-hover rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-apple-blue rounded-full" 
                            style={{ width: `${Math.min(100, Math.max(0, lead.score))}%` }}
                          />
                        </div>
                        <span className="text-[12px] font-medium text-apple-text">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setActiveChatLead(lead);
                          navigate('all-leads');
                        }}
                        className="text-apple-blue font-medium text-[13px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
                
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-apple-text-secondary text-[14px]">
                      No leads analyzed yet. Open WhatsApp to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};
