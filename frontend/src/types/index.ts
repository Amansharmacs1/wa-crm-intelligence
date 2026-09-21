export type LeadStage = 'New' | 'Contacted' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type LeadPriority = 'Hot' | 'Warm' | 'Cold' | 'At-Risk';
export type LeadSentiment = 'Positive' | 'Neutral' | 'Urgent' | 'Critical';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  dealValue: number;
  dealValueFormatted: string;
  stage: LeadStage;
  priority: LeadPriority;
  sentiment: LeadSentiment;
  score: number; // 0 - 100
  assignedAgent: {
    name: string;
    avatar: string;
    id: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadWhatsAppCount: number;
  tags: string[];
  aiSummary?: string;
  buyingSignals?: string[];
  blockers?: string[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  activeChats: number;
  avgResponseTime: string;
  dealsClosed: number;
  revenueWon: string;
  quotaPercent: number;
  status: 'Online' | 'In Call' | 'Away';
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  dealValueFormatted: string;
  scheduledFor: string;
  timeSlot: string;
  status: 'Overdue' | 'Due Today' | 'Scheduled' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  aiSuggestedDraft: string;
  reason: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'lead' | 'agent' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
  intentBadge?: string;
  dealValueMentioned?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  company: string;
  businessPhone: string;
  businessType?: string;
}
