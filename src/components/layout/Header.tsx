import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsAddLeadModalOpen, user, navigate } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { title: "Rahul Mehta approved ₹12.5L budget", time: "10m ago", icon: "task_alt", color: "text-secondary" },
    { title: "Rajesh Gopinath at-risk: Twilio review", time: "2h ago", icon: "warning", color: "text-error" },
    { title: "Sneha Kapur requested 5-seat quote", time: "25m ago", icon: "payments", color: "text-secondary" }
  ];

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-margin border-b border-surface-container">
      {/* Omnibar Search */}
      <div className="flex items-center gap-space-md w-96">
        <div className="flex items-center w-full bg-surface-container-low px-space-md py-space-xs rounded-lg text-on-surface-variant focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
          <span className="material-symbols-outlined text-label-lg mr-space-sm text-on-surface-variant">search</span>
          <input
            className="bg-transparent border-none outline-none font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant w-full"
            placeholder="Search contacts, leads, conversations..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-on-surface-variant hover:text-on-surface text-xs ml-1"
            >
              <span className="material-symbols-outlined text-body-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-lg">
        {/* WhatsApp Web Sync Status Chip */}
        <div className="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-container/30 text-on-secondary-container font-label-sm text-label-sm border border-secondary/20 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="font-medium">WhatsApp Web Sync: Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center text-on-surface-variant hover:text-on-surface cursor-pointer p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-headline-sm">notifications</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-on-error font-label-sm text-[10px] font-bold">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-surface-container flex items-center justify-between">
                <span className="font-label-lg text-label-lg text-on-surface">Live Alerts</span>
                <span className="text-[11px] bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded-full font-medium">3 Unread</span>
              </div>
              <div className="divide-y divide-surface-container">
                {notifications.map((n, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3">
                    <span className={`material-symbols-outlined text-xl ${n.color}`}>{n.icon}</span>
                    <div className="flex flex-col flex-1">
                      <span className="font-body-sm text-body-sm text-on-surface">{n.title}</span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Lead Primary CTA */}
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface transition-colors font-label-md text-label-md shadow-sm"
        >
          <span className="material-symbols-outlined text-label-md">add</span>
          <span>Add Lead</span>
        </button>

        {/* User Profile Avatar */}
        <div 
          onClick={() => navigate('settings')}
          className="w-9 h-9 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-lg text-label-lg font-semibold border-2 border-secondary-container cursor-pointer shadow-sm"
          title={`${user?.name} (${user?.role})`}
        >
          {user?.avatar || 'AK'}
        </div>
      </div>
    </header>
  );
};
