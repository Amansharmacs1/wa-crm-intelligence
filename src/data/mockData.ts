import type { Lead, Agent, FollowUp, WhatsAppMessage, User } from '../types';

export const currentUser: User = {
  id: 'usr_01',
  name: 'Aisha Khan',
  email: 'aisha.khan@growthscale.io',
  role: 'Lead Admin',
  avatar: 'AK',
  company: 'GrowthScale Technologies',
  businessPhone: '+91 98200 12345'
};

export const initialAgents: Agent[] = [
  {
    id: 'ag_1',
    name: 'Aisha Khan',
    email: 'aisha.khan@growthscale.io',
    avatar: 'AK',
    role: 'Lead Admin & Closers',
    activeChats: 18,
    avgResponseTime: '1.4 min',
    dealsClosed: 24,
    revenueWon: '₹42,80,000',
    quotaPercent: 128,
    status: 'Online'
  },
  {
    id: 'ag_2',
    name: 'Arjun Verma',
    email: 'arjun.v@growthscale.io',
    avatar: 'AV',
    role: 'Senior Sales Executive',
    activeChats: 14,
    avgResponseTime: '2.1 min',
    dealsClosed: 19,
    revenueWon: '₹31,50,000',
    quotaPercent: 105,
    status: 'Online'
  },
  {
    id: 'ag_3',
    name: 'Vikram Patel',
    email: 'vikram.p@growthscale.io',
    avatar: 'VP',
    role: 'Enterprise Specialist',
    activeChats: 9,
    avgResponseTime: '3.4 min',
    dealsClosed: 12,
    revenueWon: '₹28,20,000',
    quotaPercent: 94,
    status: 'In Call'
  },
  {
    id: 'ag_4',
    name: 'Neha Sharma',
    email: 'neha.s@growthscale.io',
    avatar: 'NS',
    role: 'Product Specialist',
    activeChats: 11,
    avgResponseTime: '1.8 min',
    dealsClosed: 15,
    revenueWon: '₹22,90,000',
    quotaPercent: 88,
    status: 'Away'
  }
];

export const initialLeads: Lead[] = [
  {
    id: 'lead_rahul',
    name: 'Rahul Mehta',
    phone: '+91 98201 44552',
    email: 'rahul.mehta@zenithlogistics.in',
    company: 'Zenith Logistics & Fleet',
    dealValue: 1250000,
    dealValueFormatted: '₹12,50,000',
    stage: 'Negotiation',
    priority: 'Hot',
    sentiment: 'Positive',
    score: 94,
    assignedAgent: {
      name: 'Aisha Khan',
      avatar: 'AK',
      id: 'ag_1'
    },
    lastMessage: "Yes, approved the pilot budget. Can we deploy WhatsApp API integration by next Tuesday?",
    lastMessageTime: '10 mins ago',
    unreadWhatsAppCount: 2,
    tags: ['Enterprise', 'Ready to Close', 'High Velocity'],
    aiSummary: "Strong purchasing intent detected. Decision maker has secured budget approval for multi-tier WhatsApp automated routing. Seeking deployment timeline confirmation for upcoming fiscal quarter.",
    buyingSignals: [
      "Explicit budget approval confirmed for ₹12.5L",
      "Immediate rollout requested before next Tuesday",
      "Key decision maker actively responding in under 3 minutes"
    ],
    blockers: [
      "Requires SLA confirmation on webhook delivery speed (<500ms)",
      "Pending GST invoice structure verification"
    ]
  },
  {
    id: 'lead_sneha',
    name: 'Sneha Kapur',
    phone: '+91 98110 99823',
    email: 'sneha@fintechorbit.com',
    company: 'Fintech Orbit Digital',
    dealValue: 840000,
    dealValueFormatted: '₹8,40,000',
    stage: 'Proposal Sent',
    priority: 'Hot',
    sentiment: 'Urgent',
    score: 88,
    assignedAgent: {
      name: 'Arjun Verma',
      avatar: 'AV',
      id: 'ag_2'
    },
    lastMessage: "Looking at the pricing proposal now. If we add 5 more agent seats, what discount applies?",
    lastMessageTime: '24 mins ago',
    unreadWhatsAppCount: 1,
    tags: ['Fintech', 'Seat Expansion', 'Pricing Query'],
    aiSummary: "Evaluating volume discounts on additional seats. High probability of closure if customized tier offered today.",
    buyingSignals: ["Requesting expansion discount for immediate signoff"],
    blockers: ["Comparing pricing against legacy SMS aggregators"]
  },
  {
    id: 'lead_rajesh',
    name: 'Rajesh Gopinath',
    phone: '+91 97400 33411',
    email: 'rajesh.g@karnatakatraders.co',
    company: 'Karnataka Traders Consortium',
    dealValue: 620000,
    dealValueFormatted: '₹6,20,000',
    stage: 'Contacted',
    priority: 'At-Risk',
    sentiment: 'Critical',
    score: 42,
    assignedAgent: {
      name: 'Vikram Patel',
      avatar: 'VP',
      id: 'ag_3'
    },
    lastMessage: "Haven't received the demo credentials yet. We are also reviewing Twilio today.",
    lastMessageTime: '2 hours ago',
    unreadWhatsAppCount: 3,
    tags: ['Competitor Threat', 'Delayed Response', 'At-Risk'],
    aiSummary: "Lead sentiment deteriorating due to slow initial setup response. Mentioned active evaluation of competitor Twilio. Needs immediate VIP outreach.",
    buyingSignals: ["Urgent intent to modernize communication channel"],
    blockers: ["Demo account access delayed", "Competitor evaluation in progress"]
  },
  {
    id: 'lead_priya',
    name: 'Priya Sundaram',
    phone: '+91 99401 77123',
    email: 'priya.s@medicarewellness.in',
    company: 'Medicare Health Networks',
    dealValue: 1500000,
    dealValueFormatted: '₹15,00,000',
    stage: 'Proposal Sent',
    priority: 'Hot',
    sentiment: 'Positive',
    score: 91,
    assignedAgent: {
      name: 'Aisha Khan',
      avatar: 'AK',
      id: 'ag_1'
    },
    lastMessage: "Compliance team approved the HIPAA & data privacy agreement! Sending signed document shortly.",
    lastMessageTime: '3 hours ago',
    unreadWhatsAppCount: 0,
    tags: ['Healthcare', 'Compliance Passed', 'High Value'],
    aiSummary: "Legal and compliance clearance achieved. Expected to execute enterprise contract within 48 hours.",
    buyingSignals: ["Compliance signoff completed", "Signed contract incoming"],
    blockers: []
  },
  {
    id: 'lead_vikas',
    name: 'Vikas Agarwal',
    phone: '+91 98300 55192',
    email: 'vikas@bengaltextiles.in',
    company: 'Bengal Smart Fabrics',
    dealValue: 450000,
    dealValueFormatted: '₹4,50,000',
    stage: 'New',
    priority: 'Warm',
    sentiment: 'Neutral',
    score: 65,
    assignedAgent: {
      name: 'Neha Sharma',
      avatar: 'NS',
      id: 'ag_4'
    },
    lastMessage: "Saw your WhatsApp CRM ad on LinkedIn. Do you support Shopify order updates and automated abandon cart recovery?",
    lastMessageTime: '4 hours ago',
    unreadWhatsAppCount: 1,
    tags: ['Inbound Ad', 'E-Commerce', 'Shopify'],
    aiSummary: "Inbound inquiry seeking specific e-commerce integration features. Fast response will secure demo conversion.",
    buyingSignals: ["Direct feature inquiries matching our core product"],
    blockers: ["Needs Shopify automated workflow walkthrough"]
  },
  {
    id: 'lead_anil',
    name: 'Anil Deshmukh',
    phone: '+91 98220 88471',
    email: 'anil@puneautocrafts.com',
    company: 'Pune Auto Precision',
    dealValue: 380000,
    dealValueFormatted: '₹3,80,000',
    stage: 'Contacted',
    priority: 'Warm',
    sentiment: 'Positive',
    score: 72,
    assignedAgent: {
      name: 'Arjun Verma',
      avatar: 'AV',
      id: 'ag_2'
    },
    lastMessage: "Let's schedule a call tomorrow afternoon with our customer service head.",
    lastMessageTime: '5 hours ago',
    unreadWhatsAppCount: 0,
    tags: ['Manufacturing', 'Team Demo', 'Mid-Market'],
    aiSummary: "Stakeholder expansion in progress. Meeting booked for tomorrow afternoon.",
    buyingSignals: ["Involving customer service head"],
    blockers: []
  },
  {
    id: 'lead_kavita',
    name: 'Kavita Menon',
    phone: '+91 94470 12890',
    email: 'kavita@cochinestates.com',
    company: 'Cochin Prime Estates',
    dealValue: 920000,
    dealValueFormatted: '₹9,20,000',
    stage: 'Negotiation',
    priority: 'At-Risk',
    sentiment: 'Urgent',
    score: 55,
    assignedAgent: {
      name: 'Vikram Patel',
      avatar: 'VP',
      id: 'ag_3'
    },
    lastMessage: "Our founder asked if WhatsApp broadcast green tick verification is guaranteed. Please confirm.",
    lastMessageTime: '6 hours ago',
    unreadWhatsAppCount: 2,
    tags: ['Real Estate', 'Green Tick Verification', 'At-Risk'],
    aiSummary: "Green tick verification is a dealbreaker condition. Requires guidance documentation on Meta criteria.",
    buyingSignals: ["Ready to proceed if official Meta verification assistance is provided"],
    blockers: ["Founder insistence on guaranteed green tick verification"]
  }
];

export const initialFollowUps: FollowUp[] = [
  {
    id: 'fu_1',
    leadId: 'lead_rahul',
    leadName: 'Rahul Mehta',
    phone: '+91 98201 44552',
    dealValueFormatted: '₹12,50,000',
    scheduledFor: 'Today',
    timeSlot: '11:30 AM',
    status: 'Due Today',
    priority: 'High',
    aiSuggestedDraft: "Hi Rahul, following up on our pilot integration discussion. Our technical team has reserved Tuesday 10 AM for your kickoff call. Shall I send over the calendar invite?",
    reason: "Budget approved; waiting on deployment kickoff date confirmation"
  },
  {
    id: 'fu_2',
    leadId: 'lead_rajesh',
    leadName: 'Rajesh Gopinath',
    phone: '+91 97400 33411',
    dealValueFormatted: '₹6,20,000',
    scheduledFor: 'Today',
    timeSlot: '09:00 AM (Overdue by 2h)',
    status: 'Overdue',
    priority: 'High',
    aiSuggestedDraft: "Hello Rajesh! Apologies for the brief delay—your custom staging environment has been activated with priority webhooks. Would 2:30 PM work for a 10-minute guided tour?",
    reason: "Competitor risk (Twilio). Demo access credentials delivered."
  },
  {
    id: 'fu_3',
    leadId: 'lead_sneha',
    leadName: 'Sneha Kapur',
    phone: '+91 98110 99823',
    dealValueFormatted: '₹8,40,000',
    scheduledFor: 'Today',
    timeSlot: '03:00 PM',
    status: 'Due Today',
    priority: 'High',
    aiSuggestedDraft: "Hi Sneha! We've updated the proposal to include a 15% volume waiver on the additional 5 seats as requested. I've sent the revised PDF to your email.",
    reason: "Seat expansion pricing review requested"
  },
  {
    id: 'fu_4',
    leadId: 'lead_vikas',
    leadName: 'Vikas Agarwal',
    phone: '+91 98300 55192',
    dealValueFormatted: '₹4,50,000',
    scheduledFor: 'Tomorrow',
    timeSlot: '12:00 PM',
    status: 'Scheduled',
    priority: 'Medium',
    aiSuggestedDraft: "Hello Vikas, following up on your inquiry regarding Shopify automated notifications. Here is a 2-minute video demo showing how cart recovery works out-of-the-box.",
    reason: "Shopify integration inquiry from inbound LinkedIn campaign"
  }
];

export const sampleRahulChat: WhatsAppMessage[] = [
  {
    id: 'msg_1',
    sender: 'lead',
    senderName: 'Rahul Mehta',
    text: "Hi Aisha! We tested the WhatsApp CRM test webhook you sent yesterday. The message dispatch speed is very impressive.",
    timestamp: 'Yesterday 04:15 PM'
  },
  {
    id: 'msg_2',
    sender: 'agent',
    senderName: 'Aisha Khan',
    text: "Thanks Rahul! We maintain sub-200ms latency globally through direct Meta cloud edge nodes. Did the fleet management team have any questions on the multi-agent routing?",
    timestamp: 'Yesterday 04:18 PM'
  },
  {
    id: 'msg_3',
    sender: 'lead',
    senderName: 'Rahul Mehta',
    text: "Yes, they loved the auto-assignment rules. One question: can we tag priority shipments and route them to senior dispatchers automatically?",
    timestamp: 'Yesterday 04:25 PM',
    intentBadge: 'Technical Feasibility'
  },
  {
    id: 'msg_4',
    sender: 'agent',
    senderName: 'Aisha Khan',
    text: "Absolutely! You can define regex or AI keyword triggers (like 'Urgent Consignment' or 'Delayed Delivery') to assign them directly to Tier-1 managers with sound notifications.",
    timestamp: 'Yesterday 04:30 PM'
  },
  {
    id: 'msg_5',
    sender: 'lead',
    senderName: 'Rahul Mehta',
    text: "That's exactly what our COO needed to see. We just reviewed the final proposal in our weekly steering committee.",
    timestamp: 'Today 10:12 AM',
    intentBadge: 'Executive Review'
  },
  {
    id: 'msg_6',
    sender: 'lead',
    senderName: 'Rahul Mehta',
    text: "Yes, approved the pilot budget. Can we deploy WhatsApp API integration by next Tuesday?",
    timestamp: 'Today 10:14 AM',
    intentBadge: 'Budget Approved (₹12,50,000)',
    dealValueMentioned: '₹12,50,000'
  }
];
