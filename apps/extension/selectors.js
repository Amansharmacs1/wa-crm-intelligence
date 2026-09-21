// Centralized DOM selectors for WhatsApp Web
const WA_SELECTORS = {
  // Main chat area container
  mainChat: '#main',
  
  // Header section where the contact name is displayed
  headerTitle: 'header [title], header span[dir="auto"]',
  
  // Message rows container
  messageRow: '[role="row"]',
  
  // The message text element
  messageText: 'span.selectable-text span',
  
  // Fallback for older versions or copied text structures
  altMessageText: '.copyable-text',
  
  // Classes for incoming and outgoing messages
  messageInClassPart: 'message-in',
  messageOutClassPart: 'message-out'
};
