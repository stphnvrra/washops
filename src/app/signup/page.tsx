'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Store, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function SignupPage() {
  const { signUp, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!fullName || !shopName || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    try {
      setFormLoading(true);
      await signUp(email, password, fullName, shopName);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl relative border border-slate-800/80 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4 animate-pulse">
            <Logo className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Register Business
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Create a shop owner account to manage workflows.
          </p>
        </div>

        {/* Errors Block */}
        {(error || validationError) && (
          <div className="p-3.5 mb-6 rounded-xl border border-rose-500/20 bg-rose-950/35 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registration Alert</p>
              <p className="text-rose-300/90 mt-0.5">{validationError || error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm transition"
                disabled={formLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Shop / Laundry Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Store className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="WashOps Express"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm transition"
                disabled={formLoading}
              />
            </div>
          </div>

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
                placeholder="owner@laundry.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm transition"
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
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm transition"
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

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm transition"
                disabled={formLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                disabled={formLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition shadow-lg shadow-teal-500/20 mt-6"
            disabled={formLoading}
          >
            {formLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Register & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-teal-400 hover:text-teal-300 font-semibold"
          >
            Log In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
