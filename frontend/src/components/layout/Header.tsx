import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { searchQuery, setSearchQuery, setIsAddLeadModalOpen, user, navigate } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { title: "Rahul Mehta approved ₹12.5L budget", time: "10m ago", icon: "check_circle", color: "text-apple-green" },
    { title: "Rajesh Gopinath at-risk: Twilio review", time: "2h ago", icon: "warning", color: "text-apple-red" },
    { title: "Sneha Kapur requested 5-seat quote", time: "25m ago", icon: "shopping_cart", color: "text-apple-blue" }
  ];

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 glass z-40 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex items-center w-[360px]">
        <div className="flex items-center w-full bg-apple-hover/80 px-4 py-2 rounded-xl text-apple-text-secondary focus-within:ring-2 focus-within:ring-apple-blue/30 transition-all border border-apple-border/50">
          <span className="material-symbols-outlined text-[18px] mr-2">search</span>
          <input
            className="bg-transparent border-none outline-none text-[14px] text-apple-text placeholder:text-apple-text-secondary w-full"
            placeholder="Search leads, chats, contacts..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-apple-text-secondary hover:text-apple-text ml-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Sync Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-apple-green/10 text-apple-green text-[12px] font-medium border border-apple-green/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-apple-green"></span>
          </span>
          WhatsApp Sync: Live
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center text-apple-text-secondary hover:text-apple-text cursor-pointer p-2 rounded-full hover:bg-apple-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-apple-red text-white text-[9px] font-bold ring-2 ring-white">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-apple-hover border border-apple-border py-2 z-50">
              <div className="px-4 py-2 border-b border-apple-border flex items-center justify-between">
                <span className="text-[13px] font-semibold text-apple-text">Alerts</span>
                <span className="text-[10px] bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full font-medium">3 New</span>
              </div>
              <div className="divide-y divide-apple-border/50">
                {notifications.map((n, idx) => (
                  <div key={idx} className="px-4 py-3 hover:bg-apple-hover transition-colors cursor-pointer flex gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${n.color}`}>{n.icon}</span>
                    <div className="flex flex-col flex-1">
                      <span className="text-[13px] font-medium text-apple-text">{n.title}</span>
                      <span className="text-[11px] text-apple-text-secondary mt-0.5">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Lead */}
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="apple-btn-primary flex items-center gap-1.5 text-[13px] !py-2 !px-4"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Lead
        </button>

      </div>
    </header>
  );
};
