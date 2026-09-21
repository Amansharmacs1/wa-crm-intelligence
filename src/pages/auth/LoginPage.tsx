import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export const LoginPage: React.FC = () => {
  const { loginWithQR, navigate, showNotification } = useApp();

  // Magic Link state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab state
  const [loginMethod, setLoginMethod] = useState<'magic' | 'qr'>('magic');

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setEmailError(null);

    if (!email.trim()) {
      setEmailError('Work email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      /**
       * POST /api/auth/magic-link  { email, redirect_to }
       *
       * The backend:
       *  1. Uses Supabase Admin API (service_role key — never in browser) to
       *     generate a real one-time magic link token.
       *  2. Calls EmailJS REST API to send the branded HTML email containing
       *     the actual Supabase magic link.
       *
       * The single EmailJS template uses:
       *   {{email_subject}}   subject line
       *   {{to_email}}        recipient
       *   {{{email_body}}}    raw HTML body (triple-brace = no escaping)
       */
      const res = await fetch(`${BACKEND_URL}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          redirect_to: `${window.location.origin}/auth/callback`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.message || 'Failed to send magic link. Please try again.');
        return;
      }

      setLinkSent(true);
      showNotification(`Magic link sent to ${email}! Check your inbox.`);
    } catch (err: any) {
      // Network error — backend unreachable
      setAuthError('Could not reach the server. Make sure the backend is running on port 8001.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) {
          setAuthError(error.message);
          setIsLoading(false);
        }
      } catch (err: any) {
        setIsLoading(false);
        setAuthError(err?.message || 'Google sign-in failed');
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
        navigate('dashboard');
        showNotification('Signed in with Google workspace account (demo).');
      }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* Left Brand Panel */}
        <div className="hidden lg:flex lg:col-span-5 bg-primary-container p-10 text-on-primary flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-on-tertiary-container/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div
              onClick={() => navigate('landing')}
              className="flex items-center gap-3 cursor-pointer group w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-secondary-container shadow-md group-hover:scale-105 transition-transform border border-white/10">
                <span className="material-symbols-outlined text-2xl">mark_chat_read</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white">WA-CRM</span>
                <span className="text-[10px] text-secondary-container tracking-wider uppercase font-semibold">Revenue Intelligence</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Your conversations already contain the answers.
              </h2>
              <p className="text-secondary-container text-base font-semibold">
                We turn them into actionable sales intelligence.
              </p>
              <p className="text-on-primary-container text-xs leading-relaxed">
                Multilingual AI intent extraction, automated deal identification, and real-time SLA breach rescue directly from your team's WhatsApp streams.
              </p>
            </div>

            {/* AI Visual Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container text-sm">auto_awesome</span>
                  <span className="font-bold text-white">Live AI Extraction</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-semibold">Urgency 92/100</span>
              </div>
              <p className="text-white/90 italic text-[11px] leading-relaxed">
                "Sir, Whitefield wala 3BHK pasand hai. Agar 80 lakh ke around final ho jaye toh kal token kar dunga."
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-black/20 p-2 rounded-lg">
                  <span className="text-[10px] text-white/70 block">Intent</span>
                  <span className="font-bold text-secondary-fixed">High Purchase</span>
                </div>
                <div className="bg-black/20 p-2 rounded-lg">
                  <span className="text-[10px] text-white/70 block">Budget Extracted</span>
                  <span className="font-bold text-white">₹80 Lakh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-white/70 text-xs">
            <span className="material-symbols-outlined text-sm text-secondary-container">lock</span>
            <span>Enterprise end-to-end access governance</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
          <div>
            {/* Mobile Brand */}
            <div
              onClick={() => navigate('landing')}
              className="lg:hidden flex items-center gap-3 mb-6 cursor-pointer w-fit"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md">
                <span className="material-symbols-outlined text-xl">mark_chat_read</span>
              </div>
              <span className="font-bold text-base text-on-surface">WA-CRM Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-on-surface-variant mb-6">Sign in to your Wa-CRM Intelligence workspace.</p>

            {/* Auth Method Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-xl mb-6 border border-surface-container">
              <button
                type="button"
                onClick={() => { setLoginMethod('magic'); setAuthError(null); setLinkSent(false); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginMethod === 'magic'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Email Magic Link</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('qr'); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginMethod === 'qr'
                    ? 'bg-surface-container-lowest text-secondary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base text-secondary">qr_code_scanner</span>
                <span>WhatsApp QR Login</span>
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container text-xs animate-in fade-in">
                <span className="material-symbols-outlined text-error text-base shrink-0">error</span>
                <span>{authError}</span>
              </div>
            )}

            {loginMethod === 'magic' ? (
              linkSent ? (
                /* ✅ Success State */
                <div className="text-center py-8 animate-in fade-in space-y-4">
                  <div className="w-16 h-16 bg-secondary-container/30 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl text-secondary">mark_email_read</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Check your inbox!</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      We've sent a secure sign-in link to
                    </p>
                    <p className="text-sm font-bold text-secondary mt-0.5">{email}</p>
                  </div>
                  <div className="bg-surface-container-low rounded-2xl p-4 text-xs text-on-surface-variant space-y-1 text-left border border-surface-container">
                    <p className="font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">info</span>
                      What to do next:
                    </p>
                    <p>1. Open the email from <b>Wa-CRM Intelligence</b></p>
                    <p>2. Click <b>"Sign in to Wa-CRM"</b></p>
                    <p>3. You'll be logged in automatically</p>
                    <p className="pt-1 text-[11px] text-on-surface-variant/70">Link expires in 10 minutes. Check your spam folder if you don't see it.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setLinkSent(false); setEmail(''); }}
                    className="text-xs text-secondary hover:underline font-medium"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                /* 📧 Magic Link Request Form */
                <form onSubmit={handleMagicLinkSubmit} noValidate className="space-y-5">
                  <div className="bg-secondary-container/20 border border-secondary/20 rounded-2xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-xl mt-0.5">verified</span>
                    <div className="text-xs text-on-surface-variant leading-relaxed">
                      <span className="font-semibold text-on-surface block mb-0.5">Passwordless Sign-In</span>
                      Enter your work email and we'll send you a secure one-click sign-in link. No password needed.
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signin-email" className="block text-xs sm:text-sm font-medium text-on-surface mb-1.5">
                      Work Email
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">mail</span>
                      <input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                        placeholder="name@company.com"
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-3 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                          emailError
                            ? 'border-error bg-error-container/10 focus:ring-error'
                            : 'border-outline-variant/40 focus:ring-secondary focus:border-transparent'
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {emailError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending secure link...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">send</span>
                        <span>Send Sign-In Link</span>
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-1">
                    <div className="border-t border-surface-container w-full" />
                    <span className="bg-surface-container-lowest px-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">OR</span>
                    <div className="border-t border-surface-container w-full" />
                  </div>

                  {/* Google SSO */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              )
            ) : (
              /* WhatsApp QR Login */
              <div className="text-center py-4 bg-surface-container-low rounded-2xl border border-surface-container p-6 animate-in fade-in">
                <div className="relative inline-block mb-4 p-3 bg-white rounded-2xl shadow-md border border-gray-100">
                  <svg className="w-40 h-40 mx-auto text-[#101a35]" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0 0h30v30H0zm5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zm5 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zm5 5h20v20H5zM10 80h10v10H10zM35 5h5v5h-5zm10 0h5v10h-5zm15 0h5v5h-5zm-20 15h5v5h-5zm10 0h10v5h-10zm-15 15h5v5h-5zm10 0h5v5h-5zm15 0h5v5h-5zm10 0h10v5h-10zm15 0h5v5h-5zm-50 10h10v5h-10zm15 0h5v5h-5zm10 0h5v5h-5zm10 0h5v5h-5zm-45 10h5v5h-5zm15 0h10v5h-10zm15 0h5v5h-5zm15 0h5v5h-5zm-40 10h5v5h-5zm10 0h5v5h-5zm20 0h10v5h-10zm15 0h5v5h-5zm-35 10h10v5h-10zm15 0h5v5h-5zm10 0h5v5h-5z"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-outlined text-xl">chat</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-on-surface font-semibold mb-1">1. Open WhatsApp on your phone</p>
                <p className="text-xs text-on-surface-variant mb-4">Tap <b>Linked Devices</b> &gt; <b>Link a Device</b> and point at this screen</p>
                <button
                  type="button"
                  onClick={() => { loginWithQR(); navigate('dashboard'); }}
                  className="px-6 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 mx-auto active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Simulate QR Scan Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-surface-container text-center space-y-2">
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="text-secondary font-bold hover:underline ml-1"
              >
                Sign Up Free
              </button>
            </p>
            <p className="text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
              <span>Your customer data is protected with secure access controls.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
