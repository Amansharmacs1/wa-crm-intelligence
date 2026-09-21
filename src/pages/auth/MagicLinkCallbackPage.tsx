import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

/**
 * MagicLinkCallbackPage
 *
 * Supabase appends the session to the URL hash after the user clicks the magic link:
 *   http://localhost:5173/auth/callback#access_token=...&refresh_token=...&type=magiclink
 *
 * This page:
 *  1. Reads the hash fragment
 *  2. Calls supabase.auth.getSession() — Supabase SDK auto-detects the hash and
 *     exchanges the token for a real session
 *  3. Persists the user into AppContext via loginWithMagicLink()
 *  4. Redirects to /dashboard
 */
export const MagicLinkCallbackPage: React.FC = () => {
  const { navigate, showNotification, loginWithMagicLink } = useApp();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

    // -- Demo mode (Supabase not configured) ----------------------------------
    if (isDemoMode) {
      setStatus('success');
      showNotification('Demo sign-in successful! Welcome back.');
      setTimeout(() => navigate('dashboard'), 1500);
      return;
    }

    // -- Real Supabase magic link callback -------------------------------------
    const handleCallback = async () => {
      try {
        // supabase-js automatically reads the URL hash and exchanges the token
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setErrorMsg(error.message);
          return;
        }

        if (data?.session?.user) {
          const u = data.session.user;
          // Persist into AppContext so the rest of the app knows the user is logged in
          await loginWithMagicLink({
            id: u.id,
            email: u.email || '',
            name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
          });
          setStatus('success');
          showNotification(`Welcome back, ${u.email}!`);
          setTimeout(() => navigate('dashboard'), 1200);
        } else {
          // No session yet — might still be processing
          setStatus('error');
          setErrorMsg('Session not found. The link may have expired or already been used.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err?.message || 'An unexpected error occurred.');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-10 max-w-sm w-full text-center space-y-5">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary-container text-2xl">mark_chat_read</span>
          </div>
          <span className="font-bold text-lg text-on-surface tracking-tight">Wa-CRM</span>
        </div>

        {status === 'loading' && (
          <>
            <svg className="animate-spin h-10 w-10 text-secondary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-on-surface font-semibold text-base">Signing you in…</p>
            <p className="text-on-surface-variant text-sm">Verifying your magic link. Please wait.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
            </div>
            <p className="text-on-surface font-bold text-lg">You're signed in!</p>
            <p className="text-on-surface-variant text-sm">Redirecting to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-error text-3xl">error</span>
            </div>
            <p className="text-on-surface font-bold text-lg">Sign-in failed</p>
            <p className="text-sm text-error">{errorMsg}</p>
            <button
              onClick={() => navigate('login')}
              className="mt-4 w-full py-2.5 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};
