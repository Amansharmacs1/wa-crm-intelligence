import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lead, Agent, FollowUp, User, WhatsAppMessage } from '../types';
import { initialLeads, initialAgents, initialFollowUps, currentUser, sampleRahulChat } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type AppRoute = 'landing' | 'dashboard' | 'all-leads' | 'hot-leads' | 'at-risk-leads' | 'follow-ups' | 'agents' | 'lead-details' | 'settings' | 'login' | 'register' | 'signup';

interface AppContextType {
  // Navigation & Auth
  currentRoute: AppRoute;
  navigate: (route: AppRoute, params?: { leadId?: string }) => void;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithQR: () => void;
  register: (data: { name: string; email: string; company: string; phone: string; password?: string; businessType?: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;

  // Data
  leads: Lead[];
  agents: Agent[];
  followUps: FollowUp[];
  selectedLeadId: string;
  selectedLead: Lead | undefined;
  setSelectedLeadId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  addLead: (lead: Omit<Lead, 'id' | 'dealValueFormatted' | 'unreadWhatsAppCount' | 'score' | 'lastMessageTime'>) => void;
  updateLeadStage: (id: string, newStage: Lead['stage']) => void;
  deleteLead: (id: string) => void;

  // Modals & Chat
  isAddLeadModalOpen: boolean;
  setIsAddLeadModalOpen: (open: boolean) => void;
  activeChatLead: Lead | null;
  setActiveChatLead: (lead: Lead | null) => void;
  chatMessages: WhatsAppMessage[];
  sendChatMessage: (text: string) => void;

  // Toast / Notification
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;

  // Dashboard Fetching
  dashboardMetrics: any;
  isFetching: boolean;
  lastRefreshed: Date | null;
  fetchDashboardData: () => Promise<void>;
  syncLocalData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check stored auth
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wacrm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (!path || path === '') return 'landing';
    if (path === 'login') return 'login';
    if (path === 'register' || path === 'signup') return 'register';
    if (path === 'dashboard') return 'dashboard';
    if (['all-leads', 'hot-leads', 'at-risk-leads', 'follow-ups', 'agents', 'lead-details', 'settings'].includes(path)) {
      return path as AppRoute;
    }
    return 'landing';
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('wacrm_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [agents] = useState<Agent[]>(initialAgents);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead_rahul');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [activeChatLead, setActiveChatLead] = useState<Lead | null>(null);
  const [chatMessages, setChatMessages] = useState<WhatsAppMessage[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      // Use proxy or direct backend URL
      const apiUrl = 'http://localhost:5050/api/leads/dashboard';
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.success) {
        setDashboardMetrics(data.metrics);
        
        // Map backend leads to frontend format
        const mappedLeads = data.latestLeads.map((bl: any) => {
          let computedPriority = 'Cold';
          if (bl.category === 'At Risk') {
            computedPriority = 'At-Risk';
          } else if (bl.leadScore >= 75) {
            computedPriority = 'Hot';
          } else if (bl.leadScore >= 50) {
            computedPriority = 'Warm';
          }

          return {
            id: bl.leadId,
            name: bl.contactName,
            phone: bl.contactNumber || 'N/A',
            company: 'Unknown',
            dealValue: bl.estimatedValue?.amount || 0,
            dealValueFormatted: bl.estimatedValue?.displayValue || '₹0',
            stage: 'New',
            priority: computedPriority,
            sentiment: 'Neutral',
            score: bl.leadScore || 0,
            lastMessage: bl.summary || 'No summary available',
            lastMessageTime: bl.updatedAt ? new Date(bl.updatedAt).toLocaleTimeString() : 'Unknown',
            unreadWhatsAppCount: 0,
            assignedAgent: { name: 'AI Assistant', avatar: 'AI', id: 'ai' },
            tags: [bl.intent, bl.category].filter(Boolean)
          };
        });
        
        
        const mappedFollowUps = data.latestLeads
          .filter((bl: any) => bl.followUpRequired && bl.followUpStatus !== 'Completed')
          .map((bl: any, idx: number) => {
            let status = 'Due Today';
            if (bl.followUpStatus === 'Missed') status = 'Overdue';
            if (bl.followUpStatus === 'Pending') status = 'Scheduled';

            return {
              id: 'fu_' + bl.leadId,
              leadId: bl.leadId,
              leadName: bl.contactName,
              phone: bl.contactNumber || 'N/A',
              dealValueFormatted: bl.estimatedValue?.displayValue || '₹0',
              scheduledFor: 'Today',
              timeSlot: 'ASAP',
              status: status,
              priority: bl.urgency === 'Critical' || bl.urgency === 'High' ? 'High' : (bl.category === 'At Risk' ? 'High' : 'Medium'),
              aiSuggestedDraft: bl.recommendedAction || 'Please follow up regarding their recent inquiry.',
              reason: bl.summary || 'Follow up required'
            };
          });
          
        setFollowUps(mappedFollowUps.length > 0 ? mappedFollowUps : initialFollowUps);
        
        if (mappedLeads.length > 0) {

          setLeads(mappedLeads);
        }
        setLastRefreshed(new Date());
        showNotification('Dashboard data updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to fetch');
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      showNotification(`Failed to fetch latest data: ${err.message}`, 'error');
    } finally {
      setIsFetching(false);
    }
  };

  // Sync Supabase Auth Session
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const activeUser: User = {
          id: session.user.id,
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: meta.role || 'Owner & Admin',
          avatar: (meta.full_name || session.user.email || 'U').substring(0, 2).toUpperCase(),
          company: meta.company || meta.company_name || 'Enterprise',
          businessPhone: meta.phone || meta.phone_number || '',
          businessType: meta.business_type,
        };
        setUser(activeUser);
        localStorage.setItem('wacrm_user', JSON.stringify(activeUser));
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const activeUser: User = {
          id: session.user.id,
          name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: meta.role || 'Owner & Admin',
          avatar: (meta.full_name || session.user.email || 'U').substring(0, 2).toUpperCase(),
          company: meta.company || meta.company_name || 'Enterprise',
          businessPhone: meta.phone || meta.phone_number || '',
          businessType: meta.business_type,
        };
        setUser(activeUser);
        localStorage.setItem('wacrm_user', JSON.stringify(activeUser));
      } else {
        setUser(null);
        localStorage.removeItem('wacrm_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync leads with localStorage
  useEffect(() => {
    localStorage.setItem('wacrm_leads', JSON.stringify(leads));
  }, [leads]);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (!path || path === '') {
        setCurrentRoute('landing');
      } else if (path === 'login') {
        setCurrentRoute('login');
      } else if (path === 'register' || path === 'signup') {
        setCurrentRoute('register');
      } else if (['all-leads', 'hot-leads', 'at-risk-leads', 'follow-ups', 'agents', 'lead-details', 'settings', 'dashboard'].includes(path)) {
        setCurrentRoute(path as AppRoute);
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === msg ? null : prev));
    }, 4000);
  };

  const navigate = (route: AppRoute, params?: { leadId?: string }) => {
    if (params?.leadId) {
      setSelectedLeadId(params.leadId);
    }
    setCurrentRoute(route);
    const urlPath = route === 'landing' ? '/' : `/${route}`;
    if (window.location.pathname !== urlPath) {
      window.history.pushState({}, '', urlPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const loggedInUser: User = {
            id: data.user.id,
            name: meta.full_name || meta.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || email,
            role: meta.role || 'Owner & Admin',
            avatar: (meta.full_name || data.user.email || 'U').substring(0, 2).toUpperCase(),
            company: meta.company || meta.company_name || 'Enterprise',
            businessPhone: meta.phone || meta.phone_number || '',
            businessType: meta.business_type,
          };
          setUser(loggedInUser);
          localStorage.setItem('wacrm_user', JSON.stringify(loggedInUser));
          setCurrentRoute('dashboard');
          showNotification(`Welcome back, ${loggedInUser.name}!`);
          return { success: true };
        }
        return { success: false, error: 'User data not found.' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Login failed.' };
      }
    }

    // Fallback demo/mock login when Supabase keys are not configured yet
    const demoUser: User = {
      ...currentUser,
      email: email || currentUser.email,
    };
    setUser(demoUser);
    localStorage.setItem('wacrm_user', JSON.stringify(demoUser));
    setCurrentRoute('dashboard');
    showNotification('Signed in to demo workspace (Supabase credentials pending in .env).');
    return { success: true };
  };

  const loginWithQR = () => {
    setUser(currentUser);
    localStorage.setItem('wacrm_user', JSON.stringify(currentUser));
    setCurrentRoute('dashboard');
    showNotification('WhatsApp Web Session Authenticated Successfully!');
  };

  const register = async (data: {
    name: string;
    email: string;
    company: string;
    phone: string;
    password?: string;
    businessType?: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password || 'Temporary@123',
          options: {
            data: {
              full_name: data.name,
              company: data.company,
              phone: data.phone,
              business_type: data.businessType || 'Real Estate',
              role: 'Owner & Admin',
            },
          },
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          // Attempt inserting profile into public.profiles table
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: data.name,
              company_name: data.company,
              phone_number: data.phone,
              business_type: data.businessType || 'Real Estate',
              role: 'Owner & Admin',
            });
          } catch {
            // Ignore if schema/table not created yet
          }

          const newUser: User = {
            id: authData.user.id,
            name: data.name,
            email: data.email,
            company: data.company,
            businessPhone: data.phone,
            role: 'Owner & Admin',
            avatar: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            businessType: data.businessType,
          };

          // If email confirmation is required by Supabase:
          if (!authData.session) {
            showNotification('Account created! Please check your email for verification link.');
            return {
              success: true,
              message: `Workspace created! A confirmation email has been sent to ${data.email}. Please verify your email or sign in.`,
            };
          }

          setUser(newUser);
          localStorage.setItem('wacrm_user', JSON.stringify(newUser));
          setCurrentRoute('dashboard');
          showNotification(`Welcome to WA-CRM Intelligence, ${data.name}!`);
          return { success: true };
        }
        return { success: false, error: 'Registration failed to return user data.' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Registration failed.' };
      }
    }

    // Fallback demo/mock workspace creation
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      company: data.company,
      businessPhone: data.phone,
      role: 'Owner & Admin',
      avatar: data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      businessType: data.businessType,
    };
    setUser(newUser);
    localStorage.setItem('wacrm_user', JSON.stringify(newUser));
    setCurrentRoute('dashboard');
    showNotification(`Welcome to WA-CRM Intelligence, ${data.name}!`);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('wacrm_user');
    setCurrentRoute('login');
    showNotification('Logged out successfully.');
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'dealValueFormatted' | 'unreadWhatsAppCount' | 'score' | 'lastMessageTime'>) => {
    const formattedVal = '₹' + Number(leadData.dealValue).toLocaleString('en-IN');
    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now(),
      dealValueFormatted: formattedVal,
      unreadWhatsAppCount: 0,
      score: Math.floor(Math.random() * 30) + 70,
      lastMessageTime: 'Just now'
    };
    setLeads(prev => [newLead, ...prev]);
    showNotification(`New lead "${newLead.name}" (${formattedVal}) added to pipeline!`);
  };

  const updateLeadStage = (id: string, newStage: Lead['stage']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
    showNotification(`Lead stage updated to "${newStage}"`);
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    showNotification('Lead removed from CRM.');
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: WhatsAppMessage = {
      id: 'msg_' + Date.now(),
      sender: 'agent',
      senderName: user?.name || 'Aisha Khan',
      text,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, newMsg]);

    // Simulated lead automated response after 2.5s
    setTimeout(() => {
      const responses = [
        "Sounds good! Let me check with our finance director and confirm by today evening.",
        "Got it, thanks for the quick update Aisha! Looking forward to the demo.",
        "Can you also email the revised quotation with GST breakups included?",
        "Perfect. We will proceed with the agreement signing tomorrow."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [
        ...prev,
        {
          id: 'msg_' + (Date.now() + 1),
          sender: 'lead',
          senderName: activeChatLead?.name || 'Rahul Mehta',
          text: randomResponse,
          timestamp: 'Just now',
          intentBadge: 'Customer Reply'
        }
      ]);
    }, 2000);
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigate,
        user,
        isAuthenticated: !!user,
        login,
        loginWithQR,
        register,
        logout,
        leads,
        agents,
        followUps,
        selectedLeadId,
        selectedLead,
        setSelectedLeadId,
        searchQuery,
        setSearchQuery,
        addLead,
        updateLeadStage,
        deleteLead,
        isAddLeadModalOpen,
        setIsAddLeadModalOpen,
        activeChatLead,
        setActiveChatLead,
        chatMessages,
        sendChatMessage,
        notification,
        showNotification,
        dashboardMetrics,
        isFetching,
        lastRefreshed,
        fetchDashboardData,
        syncLocalData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
