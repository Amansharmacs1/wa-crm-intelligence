import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi Aman, I am your Wa-CRM AI Assistant. How can I help you accelerate your pipeline today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMsg = inputValue.trim();
    setInputValue('');
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('http://localhost:5050/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error connecting to the intelligence engine. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      <div 
        className={`transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 visible' : 'scale-90 opacity-0 invisible'
        }`}
      >
        <div className="w-[380px] h-[550px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-apple-border/50 bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-apple-blue to-purple-500 text-white flex items-center justify-center font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-apple-text tracking-tight leading-tight">Gemini Assistant</h3>
                <span className="text-[11px] text-apple-text-secondary font-medium">Wa-CRM Intelligence</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-apple-text-secondary hover:text-apple-text transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-apple-hover"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-apple-blue text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white border border-apple-border/40 text-apple-text rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="bg-white border border-apple-border/40 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-apple-blue/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-apple-blue/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-apple-blue/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 border-t border-apple-border/50 backdrop-blur-md">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message Gemini..."
                className="w-full bg-white/80 border border-apple-border/60 rounded-full pl-4 pr-12 py-3 text-[14px] text-apple-text placeholder:text-apple-text-secondary focus:outline-none focus:ring-2 focus:ring-apple-blue/40 shadow-inner backdrop-blur-md transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center hover:bg-apple-blue/90 transition-colors disabled:opacity-50 disabled:hover:bg-apple-blue shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen 
            ? 'bg-white text-apple-text border border-apple-border shadow-sm' 
            : 'bg-gradient-to-tr from-apple-blue to-purple-600 text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? 'close' : 'auto_awesome'}
        </span>
      </button>
    </div>
  );
};
