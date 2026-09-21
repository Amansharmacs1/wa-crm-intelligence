import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { sendWelcomeEmail } from '../../lib/emailjs';

export const SignupPage: React.FC = () => {
  const { register, navigate, showNotification } = useApp();

  // Form State
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessType, setBusinessType] = useState('Real Estate');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    workEmail?: string;
    companyName?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  // Password strength calculation
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);
  const getStrengthLabel = () => {
    if (!password) return { text: 'None', color: 'text-on-surface-variant', bg: 'bg-surface-container' };
    if (strengthScore === 1) return { text: 'Weak', color: 'text-error', bg: 'bg-error' };
    if (strengthScore === 2) return { text: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { text: 'Strong', color: 'text-secondary', bg: 'bg-secondary' };
  };

  const strength = getStrengthLabel();

  // Form validation
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    if (!workEmail.trim()) {
      newErrors.workEmail = 'Work Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
      newErrors.workEmail = 'Please enter a valid email address.';
    }

    if (!companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await register({
        name: fullName,
        email: workEmail,
        company: companyName,
        phone: phoneNumber,
        password,
        businessType
      });

      if (!res.success) {
        setIsLoading(false);
        setSignupError(res.error || 'Failed to create workspace. Please try again.');
        return;
      }

      // Send a branded welcome email via EmailJS (non-blocking)
      try {
        await sendWelcomeEmail(workEmail, fullName, companyName);
      } catch (emailErr) {
        console.warn('[EmailJS] Welcome email failed (non-critical):', emailErr);
      }

      setIsLoading(false);
      if (res.message) {
        showNotification(res.message);
      } else {
        showNotification(`Welcome to Wa-CRM Intelligence, ${fullName}! Check your inbox for a welcome email.`);
      }
      navigate('dashboard');
    } catch (err: any) {
      setIsLoading(false);
      setSignupError(err?.message || 'Error creating workspace.');
    }
  };

  const handleGoogleSignup = async () => {
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
          setSignupError(error.message);
        }
      } catch (err: any) {
        setIsLoading(false);
        setSignupError(err?.message || 'Google sign-up failed');
      }
    } else {
      setTimeout(() => {
        setIsLoading(false);
        register({
          name: 'Google Workspace User',
          email: 'workspace@growthscale.io',
          company: 'GrowthScale Enterprise',
          phone: '+91 98200 12345',
          businessType: 'Real Estate'
        });
        navigate('dashboard');
        showNotification('Signed in with Google and workspace created!');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
        {/* Left Hero Showcase Section */}
        <div className="hidden lg:col-span-5 bg-primary-container p-10 text-on-primary flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-on-tertiary-container/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Logo */}
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
                  Intelligence
                </span>
              </div>
            </div>

            {/* Statement */}
            <div className="space-y-3 pt-2">
              <h2 className="font-headline-lg text-2xl font-bold tracking-tight text-white leading-snug">
                Powering high-velocity WhatsApp sales teams.
              </h2>
              <p className="text-secondary-container text-sm font-semibold">
                Understand intent, rescue stalled deals, and accelerate pipeline velocity.
              </p>
            </div>

            {/* Value checklist */}
            <div className="space-y-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs text-white">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
                <span>Bharat multilingual NLP (Hindi, English, Hinglish)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
                <span>Automated budget &amp; timeline extraction</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
                <span>AI Lead Rescue Queue for overdue responses</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
                <span>Zero manual data entry for closers</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
            <span>Trusted across Real Estate, Auto &amp; EdTech</span>
            <span className="text-secondary-container font-semibold">99.9% Uptime</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
          <div>
            {/* Mobile Logo Header */}
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
              Create your workspace
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant mb-6">
              Start turning your WhatsApp conversations into actionable sales intelligence.
            </p>

            {/* Error Banner */}
            {signupError && (
              <div className="mb-4 p-3 bg-error-container/40 border border-error/30 rounded-xl flex items-center gap-2 text-on-error-container text-xs animate-in fade-in slide-in-from-top-1">
                <span className="material-symbols-outlined text-error text-base shrink-0">error</span>
                <span>{signupError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} noValidate className="space-y-4">
              {/* Row 1: Full Name & Work Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-name" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Full Name *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      person
                    </span>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      placeholder="e.g. Aisha Khan"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-3 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.fullName ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-email" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Work Email *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      mail
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={workEmail}
                      onChange={e => {
                        setWorkEmail(e.target.value);
                        if (errors.workEmail) setErrors({ ...errors, workEmail: undefined });
                      }}
                      placeholder="name@company.com"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-3 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.workEmail ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                  </div>
                  {errors.workEmail && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.workEmail}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Company Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-company" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Company Name *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      business
                    </span>
                    <input
                      id="signup-company"
                      type="text"
                      value={companyName}
                      onChange={e => {
                        setCompanyName(e.target.value);
                        if (errors.companyName) setErrors({ ...errors, companyName: undefined });
                      }}
                      placeholder="e.g. Zenith Realty"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-3 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.companyName ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.companyName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Phone Number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      phone
                    </span>
                    <input
                      id="signup-phone"
                      type="text"
                      autoComplete="tel"
                      value={phoneNumber}
                      onChange={e => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
                      }}
                      placeholder="+91 98200 12345"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-3 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.phoneNumber ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.phoneNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Business Type Dropdown */}
              <div>
                <label htmlFor="signup-business-type" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                  Business Type
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                    category
                  </span>
                  <select
                    id="signup-business-type"
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl pl-9 pr-8 py-2 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary appearance-none cursor-pointer"
                  >
                    <option value="Real Estate">Real Estate</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Education / EdTech">Education / EdTech</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-password" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      key
                    </span>
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      placeholder="Min 8 characters"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-9 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.password ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-on-surface-variant hover:text-on-surface p-1 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-confirm-password" className="block font-label-md text-xs sm:text-sm text-on-surface font-medium mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-lg pointer-events-none">
                      lock_reset
                    </span>
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      placeholder="Re-type password"
                      className={`w-full bg-surface-container-low border rounded-xl pl-9 pr-9 py-2 text-on-surface text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.confirmPassword ? 'border-error bg-error-container/10 focus:ring-error' : 'border-outline-variant/40 focus:ring-secondary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 text-on-surface-variant hover:text-on-surface p-1 transition-colors"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle confirm password visibility"
                    >
                      <span className="material-symbols-outlined text-base">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Password Strength:</span>
                    <span className={`font-bold ${strength.color}`}>{strength.text}</span>
                  </div>
                  <div className="flex gap-1.5 h-1.5">
                    <div className={`flex-1 rounded-full transition-all ${strengthScore >= 1 ? strength.bg : 'bg-surface-container'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strengthScore >= 2 ? strength.bg : 'bg-surface-container'}`} />
                    <div className={`flex-1 rounded-full transition-all ${strengthScore >= 3 ? strength.bg : 'bg-surface-container'}`} />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: undefined });
                    }}
                    className={`rounded mt-0.5 text-secondary focus:ring-secondary h-4 w-4 transition-colors ${
                      errors.agreeTerms ? 'border-error' : 'border-outline-variant/40'
                    }`}
                  />
                  <span className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    I agree to the{' '}
                    <a href="#terms" className="text-secondary hover:underline font-semibold" onClick={e => e.preventDefault()}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-secondary hover:underline font-semibold" onClick={e => e.preventDefault()}>
                      Privacy Policy
                    </a>.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{errors.agreeTerms}</span>
                  </p>
                )}
              </div>

              {/* Primary Button: Create Workspace */}
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
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Divider: OR */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-surface-container w-full"></div>
                <span className="bg-surface-container-lowest px-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  OR
                </span>
                <div className="border-t border-surface-container w-full"></div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignup}
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
          </div>

          {/* Bottom Link: Already have an account? Sign In */}
          <div className="mt-6 pt-4 border-t border-surface-container text-center">
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('login')}
                className="text-secondary font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
