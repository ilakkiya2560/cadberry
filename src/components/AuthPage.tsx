import React, { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: username.trim(),
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user && data.session) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: username.trim(),
          });

          if (profileError) {
            throw profileError;
          }
        }

        setMessage('Sign up successful. Check your email for confirmation if required.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        onAuthSuccess?.();
      }
    } catch (submitError: any) {
      setError(submitError?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#E7DFC9] bg-white p-8 shadow-[0_18px_50px_rgba(45,42,38,0.08)]">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C5AA6]">
            Cadberry
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#2D2A26]">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#F3EFEA] p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'login'
                ? 'bg-white text-[#2D2A26] shadow-sm'
                : 'text-[#6D675F]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-white text-[#2D2A26] shadow-sm'
                : 'text-[#6D675F]'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#3B3732]">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                className="w-full rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] px-4 py-3 text-[#2D2A26] outline-none transition focus:border-[#B793DA] focus:ring-2 focus:ring-[#EADDF2]"
                placeholder="How should we greet you?"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#3B3732]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] px-4 py-3 text-[#2D2A26] outline-none transition focus:border-[#B793DA] focus:ring-2 focus:ring-[#EADDF2]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#3B3732]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-2xl border border-[#E5DDD0] bg-[#FAF7F2] px-4 py-3 text-[#2D2A26] outline-none transition focus:border-[#B793DA] focus:ring-2 focus:ring-[#EADDF2]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-[#F0B4A9] bg-[#FFF3F1] px-4 py-3 text-sm text-[#7A312B]">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-[#CDE7CF] bg-[#F2FBF3] px-4 py-3 text-sm text-[#215E3E]">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#2E1E3B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#412B52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
