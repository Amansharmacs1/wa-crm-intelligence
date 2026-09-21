import React from 'react';
import { useApp, type AppRoute } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigate, user, logout } = useApp();

  const navItems: { id: AppRoute; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'all-leads', label: 'All Leads', icon: 'groups' },
    { id: 'hot-leads', label: 'Hot Leads', icon: 'local_fire_department', badge: 3 },
    { id: 'at-risk-leads', label: 'At-Risk Leads', icon: 'warning', badge: 2 },
    { id: 'follow-ups', label: 'Follow-ups', icon: 'schedule', badge: 4 },
    { id: 'agents', label: 'Agents', icon: 'badge' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-primary-container text-on-primary z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => navigate('dashboard')}
          className="h-16 px-space-lg flex items-center gap-space-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-secondary-container text-headline-md">mark_chat_read</span>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-primary">WA-CRM</span>
            <span className="font-label-sm text-label-sm text-on-primary-container tracking-wider uppercase">Intelligence</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-space-xs px-space-sm pt-space-md">
          {navItems.map(item => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center justify-between px-space-md py-space-sm rounded-lg transition-colors text-left w-full ${
                  isActive
                    ? 'bg-surface-container-highest text-on-surface font-label-lg'
                    : 'text-on-primary-container hover:bg-surface-container-high/20 hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-md">
                  <span className={`material-symbols-outlined text-label-lg ${isActive ? 'text-on-surface font-semibold' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-label-lg text-label-lg">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isActive 
                      ? 'bg-secondary text-on-secondary' 
                      : 'bg-primary-fixed-dim/30 text-on-primary-container'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section: WhatsApp Web Sync Status, Settings, User Profile */}
      <div className="flex flex-col gap-space-sm p-space-sm">
        {/* Extension Connected Chip */}
        <div className="bg-surface-container-highest/20 rounded-lg p-space-sm flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-space-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
            </span>
            <span className="font-label-sm text-label-sm text-on-primary-container font-medium">Extension Connected</span>
          </div>
          <span className="material-symbols-outlined text-label-sm text-secondary-fixed">verified</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => navigate('settings')}
          className={`flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-left transition-colors w-full ${
            currentRoute === 'settings'
              ? 'bg-surface-container-highest text-on-surface font-label-lg'
              : 'text-on-primary-container hover:bg-surface-container-high/20 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-label-lg">settings</span>
          <span className="font-label-lg text-label-lg">Settings</span>
        </button>

        {/* User Card with Logout */}
        <div className="flex items-center justify-between px-space-sm py-space-xs pt-space-sm border-t border-white/10 mt-1">
          <div className="flex items-center gap-space-sm overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-label-lg text-label-lg font-bold flex-shrink-0">
              {user?.avatar || 'AK'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-label-md text-label-md text-on-primary truncate font-medium">{user?.name || 'Aisha Khan'}</span>
              <span className="font-label-sm text-label-sm text-on-primary-container truncate">{user?.role || 'Lead Admin'}</span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="text-on-primary-container hover:text-error transition-colors p-1 rounded hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-label-md">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
