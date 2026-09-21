import React from 'react';
import { useApp } from '../context/AppContext';

export const AgentsPage: React.FC = () => {
  const { agents, showNotification } = useApp();

  return (
    <div className="flex flex-col w-full gap-space-xl p-margin max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Agent Performance &amp; Productivity
            </h1>
            <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span>Live AI Tracking</span>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time WhatsApp response velocity, deal conversion rates, and conversational quality scores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            onClick={() => showNotification('Lead queues rebalanced dynamically across available online agents.')}
            className="flex items-center gap-space-xs px-space-md py-space-xs bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface transition-colors rounded-lg shadow-md font-label-md text-label-md font-semibold"
          >
            <span className="material-symbols-outlined text-label-md text-secondary-fixed">tune</span>
            <span>Rebalance Lead Queue</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Total Active Reps</span>
              <span className="font-display-lg text-display-lg text-on-surface mt-space-xs font-bold">12 / 14</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs border-t border-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant">9 online right now</span>
            <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">+2 onboarded</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Avg Response Velocity</span>
              <span className="font-display-lg text-display-lg text-on-surface mt-space-xs font-bold">2m 14s</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-container/40 text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">bolt</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs border-t border-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant">SLA: &lt; 10m</span>
            <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-secondary-container/50 text-on-secondary-fixed-variant font-bold">2.4x faster by AI</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Leads Converted</span>
              <span className="font-display-lg text-display-lg text-on-surface mt-space-xs font-bold">142</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs border-t border-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant">57.2% conversion</span>
            <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">+14.6% MoM</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">Revenue Won</span>
              <span className="font-display-lg text-display-lg text-secondary mt-space-xs font-bold">₹1.86 Cr</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-space-md pt-space-xs border-t border-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Target ₹2.0 Cr (93%)</span>
            <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-secondary-container/40 text-on-secondary-fixed-variant font-bold">On pace</span>
          </div>
        </div>
      </div>

      {/* Agent Roster & Leaderboard */}
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Sales Leaderboard &amp; Workload
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Active WhatsApp threads and quota attainment across your closer team
            </p>
          </div>
          <span className="text-xs bg-surface-container px-3 py-1 rounded-full font-medium text-on-surface">
            Updated in real-time
          </span>
        </div>

        <div className="overflow-x-auto w-full mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-xs border-b border-surface-container">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Active Chats</th>
                <th className="py-3 px-4">Avg Response Time</th>
                <th className="py-3 px-4">Deals Closed</th>
                <th className="py-3 px-4">Revenue Won</th>
                <th className="py-3 px-4">Quota Attainment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {agents.map(agent => (
                <tr key={agent.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                        {agent.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-on-surface">{agent.name}</span>
                        <span className="text-xs text-on-surface-variant">{agent.role}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      agent.status === 'Online'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : agent.status === 'In Call'
                        ? 'bg-surface-container-high text-on-surface'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {agent.status}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-semibold text-sm text-on-surface">
                    {agent.activeChats} active threads
                  </td>

                  <td className="py-4 px-4 font-medium text-sm text-secondary">
                    {agent.avgResponseTime}
                  </td>

                  <td className="py-4 px-4 font-semibold text-sm text-on-surface">
                    {agent.dealsClosed} deals
                  </td>

                  <td className="py-4 px-4 font-bold text-sm text-on-surface">
                    {agent.revenueWon}
                  </td>

                  <td className="py-4 px-4 min-w-[160px]">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{agent.quotaPercent}%</span>
                        <span className="text-on-surface-variant">Quota</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            agent.quotaPercent >= 100 ? 'bg-secondary' : 'bg-primary-container'
                          }`}
                          style={{ width: `${Math.min(agent.quotaPercent, 100)}%` }}
                        ></div>
                      </div>
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
