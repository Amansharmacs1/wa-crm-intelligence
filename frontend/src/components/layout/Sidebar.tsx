import React from 'react';
import { useApp, type AppRoute } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigate, user, logout } = useApp();

  const navItems: { id: AppRoute; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: 'grid_view' },
    { id: 'all-leads', label: 'All Leads', icon: 'people' },
    { id: 'hot-leads', label: 'Hot Leads', icon: 'local_fire_department', badge: 3 },
    { id: 'at-risk-leads', label: 'At-Risk', icon: 'warning', badge: 2 },
    { id: 'follow-ups', label: 'Follow-ups', icon: 'calendar_today', badge: 4 },
    { id: 'agents', label: 'Agents', icon: 'badge' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#fbfbfd] border-r border-apple-border text-apple-text z-50 flex flex-col justify-between">
      <div className="flex flex-col px-4 pt-6">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => navigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity mb-8 px-2"
        >
          <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-apple-sm">
            <span className="material-symbols-outlined text-[18px]">mark_chat_read</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold tracking-tight text-primary leading-tight">WA-CRM</span>
            <span className="text-[11px] font-medium text-apple-text-secondary tracking-wide uppercase">Intelligence</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-apple-sm' 
                    : 'text-apple-text-secondary hover:bg-apple-border/50 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-white' : ''}`}>{item.icon}</span>
                  <span className="text-[14px] font-medium tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-apple-border text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-apple-border bg-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-apple-border flex items-center justify-center text-primary font-semibold shrink-0">
            {user?.avatar || 'W'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-medium text-primary truncate">{user?.name || 'Workspace User'}</span>
            <span className="text-[12px] text-apple-text-secondary truncate">{user?.role || 'Admin'}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-medium text-apple-text-secondary hover:bg-apple-hover hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};
