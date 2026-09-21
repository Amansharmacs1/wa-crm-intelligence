import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
  const { login, loginWithQR, navigate, showNotification } = useApp();

  // Form State
  const [email, setEmail] = useState('aisha.khan@growthscale.io');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Field validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Tab: Standard Email/Pass vs WhatsApp QR scan
  const [loginMethod, setLoginMethod] = useState<'password' | 'qr'>('password');

  // Validate form fields
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Invalid credentials. Please verify your email and password.');
      } else {
        navigate('dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      setAuthError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard',
          },
        });
        if (error) {
          setIsLoading(false);
          setAuthError(error.message);
        }
      } catch (err: any) {
        setIsLoading(false);
        setAuthError(err?.message || 'Google sign-in failed');
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
        login('google.workspace@example.com', 'google-oauth');
        navigate('dashboard');
        showNotification('Signed in with Google workspace account.');
      }, 500);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      showNotification('Please enter a valid email address.');
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
          redirectTo: window.location.origin + '/login',
        });
        if (error) {
          showNotification(error.message);
          return;
        }
      } catch (err: any) {
        showNotification(err?.message || 'Failed to send reset email.');
        return;
      }
    }

    setForgotSubmitted(true);
    showNotification(`Password recovery link sent to ${forgotEmail}`);
    setTimeout(() => {
      setIsForgotOpen(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Section: Stitch Brand & AI Intelligence Visual Elements */}
        <div className="hidden lg:col-span-5 bg-primary-container p-10 text-on-primary flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-on-tertiary-container/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Wa-CRM Branding */}
            <div 
              onClick={() => navigate('landing')}
              className="flex items-center gap-space-sm cursor-pointer group w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-secondary-container shadow-md group-hover:scale-105 transition-transform border border-white/10">
                <span className="material-symbols-outlined text-2xl">mark_chat_read</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-lg tracking-tight text-white font-bold">WA-CRM</span>
                <span className="font-label-sm text-[10px] text-secondary-container tracking-wider uppercase font-semibold">
                  Revenue Intelligence
                </span>
              </div>
            </div>

            {/* Short Product Statement */}
            <div className="space-y-3 pt-4">
              <h2 className="font-headline-lg text-2xl font-bold tracking-tight text-white leading-snug">
                Your conversations already contain the answers.
              </h2>
              <p className="text-secondary-container text-base font-semibold">
                We turn them into actionable sales intelligence.
              </p>
              <p className="text-on-primary-container text-xs leading-relaxed">
                Multilingual AI intent extraction, automated deal identification, and real-time SLA breach rescue directly from your team's WhatsApp streams.
              </p>
            </div>

            {/* AI/Lead Intelligence Visual Element Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-container text-sm">auto_awesome</span>
                  <span className="font-bold text-white">Live AI Extraction</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-semibold">
                  Urgency 92/100
                </span>
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

          {/* Bottom Security / Trust indicator */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-white/70 text-xs">
            <span className="material-symbols-outlined text-sm text-secondary-container">lock</span>
            <span>Enterprise end-to-end access governance</span>
          </div>
        </div>

        {/* Right Section: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
          <div>
            {/* Mobile Brand Header */}
            <div 
              onClick={() => navigate('landing')}
              className="lg:hidden flex items-center gap-space-sm mb-6 cursor-pointer group w-fit"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-secondary-container shadow-md">
                <span className="material-symbols-outlined text-xl">mark_chat_read</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-base tracking-tight text-on-surface font-bold">WA-CRM</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Intelligence
                </span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="font-headline-lg text-2xl sm:text-3xl text-on-surface font-bold tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Sign in to your Wa-CRM Intelligence workspace.
            </p>

            {/* Auth Method Tabs */}
            <div className="flex bg-surface-container-low p-1 rounded-xl mb-6 border border-surface-container">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setAuthError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  loginMethod === 'password'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Work Email</span>
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
              <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container text-xs animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined text-error text-base shrink-0">error</span>
                <span>{authError}</span>
              </div>
            )}

            {loginMethod === 'password' ? (
              <form onSubmit={handleLogin} noValidate className="space-y-4">
                {/* Work Email */}
                <div>
                  <label htmlFor="signin-email" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1.5">
                    Work Email
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                      mail
                    </span>
                    <input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="name@company.com"
                      className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-2.5 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-error bg-error-container/10 focus:ring-error'
                          : 'border-outline-variant/40 focus:ring-secondary focus:border-transparent'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="signin-password" className="font-label-md text-xs sm:text-sm text-on-surface font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(email); setIsForgotOpen(true); }}
                      className="font-label-sm text-xs text-secondary hover:underline font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
                      key
                    </span>
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="Enter your password"
                      className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-11 py-2.5 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.password
                          ? 'border-error bg-error-container/10 focus:ring-error'
                          : 'border-outline-variant/40 focus:ring-secondary focus:border-transparent'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors focus:outline-none"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Options: Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded border-outline-variant/40 text-secondary focus:ring-secondary h-4 w-4 transition-colors"
                    />
                    <span className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface font-label-lg text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
                </button>

                {/* Divider: OR */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-surface-container w-full"></div>
                  <span className="bg-surface-container-lowest px-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    OR
                  </span>
                  <div className="border-t border-surface-container w-full"></div>
                </div>

                {/* Continue with Google */}
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
            ) : (
              /* WhatsApp QR Scanner Login Flow */
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

                <p className="font-body-sm text-sm text-on-surface font-semibold mb-1">
                  1. Open WhatsApp on your phone
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant mb-4">
                  Tap <b>Linked Devices</b> &gt; <b>Link a Device</b> and point at this screen
                </p>

                <button
                  type="button"
                  onClick={() => {
                    loginWithQR();
                    navigate('dashboard');
                  }}
                  className="px-6 py-2.5 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 mx-auto active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Simulate QR Scan Instant Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Link & Security Text */}
          <div className="mt-8 pt-4 border-t border-surface-container text-center space-y-2">
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('register')}
                className="text-secondary font-bold hover:underline ml-1"
              >
                Sign Up
              </button>
            </p>

            <p className="text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
              <span>Your customer data is protected with secure access controls.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-surface-container p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">lock_reset</span>
                </div>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">Reset Password</h3>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-secondary-container/30 rounded-xl text-xs text-on-secondary-container text-center space-y-1">
                <span className="material-symbols-outlined text-2xl text-secondary block mx-auto">mark_email_read</span>
                <p className="font-semibold">Check your inbox</p>
                <p>We've sent password reset instructions to <b>{forgotEmail}</b>.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enter your registered work email address. We'll send you a secure link to reset your password.
                </p>
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:ring-2 focus:ring-secondary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-primary-container text-on-primary hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-colors shadow-sm"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
