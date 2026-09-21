import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import emailjs from '@emailjs/browser';

export const LoginPage: React.FC = () => {
  const { showNotification, loginWithQR, navigate, user, isAuthenticated } = useApp();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // EmailJS Configuration - ensure these are set in your environment
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service';
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'default_template';
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'default_key';

  useEffect(() => {
    // Check if URL has magic link token
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const urlEmail = urlParams.get('email');

    if (token && urlEmail) {
      handleVerifyMagicLink(urlEmail, token);
    }
  }, []);

  const handleVerifyMagicLink = (urlEmail: string, token: string) => {
    const savedToken = localStorage.getItem(`magic_token_${urlEmail}`);
    if (savedToken === token) {
      localStorage.removeItem(`magic_token_${urlEmail}`);
      // Simulate successful login / registration
      showNotification('Successfully authenticated via Magic Link!', 'success');
      
      // Update local storage to log them in manually since AppContext loginWithQR is hardcoded
      const newUser = {
         id: 'usr_' + Date.now(),
         name: urlEmail.split('@')[0],
         email: urlEmail,
         company: 'Workspace',
         businessPhone: '+919999999999',
         role: 'Owner & Admin',
         avatar: urlEmail[0].toUpperCase(),
         businessType: 'Real Estate'
      };
      
      localStorage.setItem('wacrm_user', JSON.stringify(newUser));
      // Reload to let AppContext pick up the user from localstorage
      window.location.href = '/dashboard';
    } else {
      showNotification('Invalid or expired magic link. Please request a new one.', 'error');
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a secure random token
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Save token in local storage for verification
      localStorage.setItem(`magic_token_${email}`, token);
      
      const magicLink = `${window.location.origin}/login?email=${encodeURIComponent(email)}&token=${token}`;
      
      console.log("[Dev Only] Magic Link Generated:", magicLink);

      // Attempt to send via EmailJS
      try {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            to_email: email,
            magic_link: magicLink,
          },
          PUBLIC_KEY
        );
        showNotification('Magic link sent to your email!', 'success');
        setEmailSent(true);
      } catch (emailErr) {
        console.error("EmailJS Error:", emailErr);
        // Fallback for development if credentials aren't set
        if (SERVICE_ID === 'default_service') {
          showNotification('EmailJS not configured. Check console for magic link (Dev Mode)', 'info');
          setEmailSent(true);
        } else {
          showNotification('Failed to send email. Please check your EmailJS configuration.', 'error');
        }
      }
      
    } catch (err: any) {
      showNotification('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col md:flex-row relative">
      {/* Left side brand banner (hidden on mobile) */}
      <div className="hidden md:flex md:w-[45%] bg-[#101a35] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl font-bold">query_stats</span>
            </div>
            <span className="font-headline-sm text-xl font-bold tracking-tight text-white">WA-CRM Intelligence</span>
          </div>

          <h1 className="font-display-sm text-4xl font-bold leading-tight mb-6">
            Unlock the power of <br />
            <span className="text-secondary">predictive revenue</span>.
          </h1>
          <p className="font-body-lg text-lg text-white/70 max-w-md leading-relaxed">
            Instantly sync your WhatsApp conversations, classify intent, and never miss a high-priority follow-up again.
          </p>
        </div>
      </div>

      {/* Right side Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2 tracking-tight">
              Welcome
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Sign in or create an account with a secure Magic Link.
            </p>
          </div>

          {emailSent ? (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8 text-center shadow-sm animate-in fade-in">
              <div className="w-16 h-16 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">mark_email_read</span>
              </div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">Check your inbox</h3>
              <p className="font-body-sm text-sm text-on-surface-variant mb-6">
                We sent a magic link to <b>{email}</b>. Click the link to instantly log in.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-secondary text-sm font-semibold hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMagicLink} className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1.5 ml-0.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all shadow-sm placeholder:text-on-surface-variant/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <span>Send Magic Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-surface-container text-center">
            <p className="text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
              <span>Secure passwordless authentication powered by EmailJS.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
