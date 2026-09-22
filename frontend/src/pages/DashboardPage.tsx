import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const DASHBOARD_REFRESH_INTERVAL_MS = Number(import.meta.env.VITE_REFRESH_INTERVAL) || 60 * 60 * 1000;

export const DashboardPage: React.FC = () => {
  const { leads, navigate, showNotification, fetchDashboardData, syncLocalData, isFetching, lastRefreshed, dashboardMetrics, setSelectedLeadId } = useApp();

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
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Lead ID</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Activity Timeline</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Intent</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Language</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Urgency</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Category</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Deal Value</th>
                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/50">
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} className="hover:bg-apple-hover/50 transition-colors group cursor-pointer" onClick={() => navigate('lead-details', { leadId: lead.id || lead.leadId })}>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-medium text-apple-text-secondary bg-apple-hover px-2 py-1 rounded-md">{lead.leadId || lead.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-apple-text">{lead.name}</span>
                        <span className="text-[11px] text-apple-text-secondary">{lead.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-apple-text">First Contact: {lead.chatTime?.firstMessageAt ? new Date(lead.chatTime.firstMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</span>
                        <span className="text-[11px] text-apple-text-secondary">Last Interaction: {lead.chatTime?.lastMessageAt ? new Date(lead.chatTime.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-medium text-apple-text">{lead.intent || 'Unknown'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-apple-text-secondary">{lead.language || 'English'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${lead.urgency === 'High' || lead.urgency === 'Critical' ? 'bg-apple-red/10 text-apple-red' : lead.urgency === 'Festival based' ? 'bg-apple-blue/10 text-apple-blue' : 'bg-apple-hover text-apple-text-secondary'}`}>{lead.urgency || 'Low'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${lead.category === 'At Risk' ? 'bg-[#ff9500]/10 text-[#ff9500]' : 'bg-apple-green/10 text-apple-green'}`}>{lead.category || 'Safe'}</span>
                    </td>
                                        <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold text-apple-text">{lead.dealValueFormatted}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={(e) => {
      e.stopPropagation();
      console.log('Button clicked, navigating to:', lead.id || lead.leadId);
      navigate('lead-details', { leadId: lead.id || lead.leadId });
    }}
                        className="inline-flex items-center gap-1 text-apple-blue font-medium text-[13px] hover:text-apple-blue/80 transition-colors"
                      >
                        <span>Details</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </td>
                  </tr>
                ))}
                
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-apple-text-secondary text-[14px]">
                      No active leads analyzed yet. Sync with WhatsApp to populate your pipeline.
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
