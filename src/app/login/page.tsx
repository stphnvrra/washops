'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    try {
      setFormLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setValidationError(null);
    setEmail('demo@lms-saas.com');
    setPassword('demopassword');

    try {
      setFormLoading(true);
      await login('demo@lms-saas.com', 'demopassword');
      router.push('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative border border-slate-800/80 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4 animate-pulse">
            <Logo className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            WashOps Owner Portal
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Laundry shop owner dashboard management system.
          </p>
        </div>

        {/* Errors Block */}
        {(error || validationError) && (
          <div className="p-3.5 mb-6 rounded-xl border border-rose-500/20 bg-rose-950/35 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Alert</p>
              <p className="text-rose-300/90 mt-0.5">{validationError || error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@shop.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                disabled={formLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                disabled={formLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20 mt-6"
            disabled={formLoading}
          >
            {formLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/80"></div>
          </div>
          <span className="relative px-3 text-[10px] uppercase font-bold text-slate-500 bg-[#070a13] z-10 tracking-widest">
            Portfolio Guest Access
          </span>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 transition"
          disabled={formLoading}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>One-Click Recruiter Demo Login</span>
        </button>

        {/* Signup Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need to register your shop?{' '}
          <Link
            href="/signup"
            className="text-sky-400 hover:text-sky-300 font-semibold"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
