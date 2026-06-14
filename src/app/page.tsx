'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Cpu, 
  Coins, 
  Users, 
  Package, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Database,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Storage Usage Calculator State
  const [storageMB, setStorageMB] = useState(500); // starts at 500MB
  const [projectedCost, setProjectedCost] = useState(10);
  const [estimatedOrders, setEstimatedOrders] = useState(10000);

  // Dynamic pricing calculation based on storage consumption
  useEffect(() => {
    // Base is $10 for up to 500MB (0.5GB)
    if (storageMB <= 500) {
      setProjectedCost(10);
      setEstimatedOrders(Math.floor(storageMB * 20)); // ~20 orders per MB including histories & customers
    } else {
      // Each additional 100MB is $0.50 ($5.00 per GB)
      const excessMB = storageMB - 500;
      const excessCost = (excessMB / 100) * 0.50;
      setProjectedCost(Number((10 + excessCost).toFixed(2)));
      setEstimatedOrders(Math.floor(storageMB * 20));
    }
  }, [storageMB]);

  // Fallback Intersection Observer scroll reveals
  useEffect(() => {
    if (typeof window !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
            }
          });
        },
        { threshold: 0.15 }
      );

      document.querySelectorAll('.reveal-item').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* 1. NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900/60 bg-[#070a13]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
            <Logo className="w-6 h-6" />
            <span>WashOps</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition">Features</a>
            <a href="#pricing" className="hover:text-slate-200 transition">Usage Pricing</a>
            <a href="#testimonials" className="hover:text-slate-200 transition">Testimonials</a>
            <a href="#faq" className="hover:text-slate-200 transition">FAQ</a>
          </nav>

          {/* Nav CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition"
                >
                  Go to Console
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-400 hover:text-slate-200 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#070a13] p-6 space-y-4">
            <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-400">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-200">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-200">Usage Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-200">Testimonials</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-200">FAQ</a>
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-sky-500/10 border border-sky-500/20 text-sky-400"
                  >
                    Go to Console
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-slate-400"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-sky-500 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Laundry Management</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
            The Operating System for Modern <span className="bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">Laundry Shops</span>.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl">
            Streamline active orders, automate machinery load diagnostics, track chemical inventory depletion, and audit store ledger metrics from a single unified SaaS platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
              >
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 transition"
                >
                  <span>Demo Access</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero Interactive Photo Container */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 blur-3xl rounded-full"></div>
          <div className="relative glass-card p-2 rounded-3xl overflow-hidden max-w-lg shadow-2xl border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/laundry_hero.png" 
              alt="High-tech laundry shop" 
              className="rounded-2xl object-cover w-full h-[380px]"
            />
            {/* Embedded Mini-Widget */}
            <div className="absolute bottom-6 left-6 right-6 glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/25 text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Status</p>
                  <p className="text-xs font-bold text-white">4 Active Machines running</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">Online</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE BENEFITS / FEATURE HIGHLIGHTS */}
      <section id="features" className="py-20 border-t border-slate-900/40 max-w-7xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto reveal-item">
          <h2 className="text-3xl font-extrabold text-white font-sans">
            Engineered for Total Operational Control
          </h2>
          <p className="text-slate-400 text-sm">
            Tired of paper tickets and spreadsheets? WashOps combines machinery states, supply pipelines, and invoicing ledgers under one roof.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Machinery */}
          <div className="glass-card p-6 rounded-2xl text-left space-y-4 reveal-item">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15 inline-block">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Machinery Controls</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Monitor washer and dryer cycle timers in real-time. Emulate machine run schedules and maintenance blocks.
            </p>
          </div>

          {/* Card 2: Financials */}
          <div className="glass-card p-6 rounded-2xl text-left space-y-4 reveal-item">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15 inline-block">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Business Cash Ledgers</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Track paid invoices, record operational utility costs, and estimate net margins automatically from a unified finance book.
            </p>
          </div>

          {/* Card 3: CRM */}
          <div className="glass-card p-6 rounded-2xl text-left space-y-4 reveal-item">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/15 inline-block">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">CRM & Rewards Programs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Save client profiles, track recurring blanket/fabric weights, and disburse customer loyalty scores on order checkouts.
            </p>
          </div>

          {/* Card 4: Inventory */}
          <div className="glass-card p-6 rounded-2xl text-left space-y-4 reveal-item">
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/15 inline-block">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Auto-Inventory Depletion</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our smart context depletes detergents and softeners in real-time based on the weight of orders processed.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PRICING & STORAGE CALCULATOR SECTION */}
      <section id="pricing" className="py-20 border-t border-slate-900/40 bg-[#0a0d18]/40">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Slider Calculator Block */}
          <div className="lg:col-span-7 space-y-6 text-left reveal-item">
            <h2 className="text-3xl font-extrabold text-white font-sans">
              Usage-Based Storage Billing
            </h2>
            <p className="text-slate-400 text-sm">
              We bill strictly based on the database storage and system files consumed by your shop records. Starting at **$10/month** (which covers up to 500 MB), expand dynamically as your shop grows. Pay only for the capacity you need.
            </p>

            {/* Storage Consumption Slider */}
            <div className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Allocated Database Storage</h4>
                  <p className="text-slate-400 text-[10px]">Adjust slider to match your monthly transaction capacity</p>
                </div>
                <span className="text-lg font-extrabold text-sky-400">
                  {storageMB >= 1000 ? `${(storageMB / 1000).toFixed(1)} GB` : `${storageMB} MB`}
                </span>
              </div>

              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="100"
                value={storageMB}
                onChange={(e) => setStorageMB(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-slate-800 accent-sky-400 cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Est. Monthly Tickets</p>
                  <p className="text-lg font-extrabold text-slate-300">~{estimatedOrders.toLocaleString()} Orders</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Storage Tier</p>
                  <p className="text-lg font-extrabold text-slate-300">
                    {storageMB <= 500 ? 'Starter Capacity' : storageMB <= 2000 ? 'Growth Scale' : 'Enterprise Level'}
                  </p>
                </div>
              </div>
            </div>

            {/* Overage Policy Alert */}
            <div className="p-4 rounded-xl border border-teal-500/10 bg-teal-950/20 text-teal-200 text-xs flex gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <p className="leading-relaxed">
                <span className="font-bold">Scale Protection Guarantee:</span> Starter plans are capped at $10. Any additional consumption beyond 500 MB is billed at a transparent rate of just <span className="font-bold text-teal-300">$0.05 per 100 MB</span>.
              </p>
            </div>
          </div>

          {/* Pricing Tier Card */}
          <div className="lg:col-span-5 relative flex justify-center reveal-item">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-teal-500/10 blur-3xl rounded-full"></div>
            
            {/* Visual Storage Card */}
            <div className="relative w-full max-w-sm glass-card rounded-3xl overflow-hidden p-8 border border-slate-800 shadow-2xl flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 font-bold uppercase tracking-wider">Active Choice</span>
                  <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-400">
                    <Database className="w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold text-white">WashOps Cloud</h3>
                  <p className="text-xs text-slate-400 mt-1">Pay-as-you-scale database storage.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white">${projectedCost}</span>
                  <span className="text-slate-400 text-xs">/ month</span>
                </div>

                {/* Benefits checklist */}
                <ul className="space-y-3 pt-4 border-t border-slate-800/80 text-left text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>Includes {storageMB >= 1000 ? `${(storageMB / 1000).toFixed(1)} GB` : `${storageMB} MB`} database storage</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>Unlimited active machine cycle trackers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>Customer CRM loyalty program points</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>SMS pickup alert & email receipt mock simulations</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/signup"
                  className="w-full block text-center py-3 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
                >
                  Deploy Shop Console
                </Link>
                <p className="text-[10px] text-slate-500 text-center">No credit card required for 14-day evaluation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL GRAPHIC REPRESENTATION (PHOTO & TEXT) */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Storage Graphic Photo Container */}
        <div className="lg:col-span-6 relative flex justify-center order-last lg:order-first reveal-item">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-indigo-500/10 blur-3xl rounded-full"></div>
          <div className="relative glass-card p-2 rounded-3xl overflow-hidden max-w-lg shadow-2xl border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/storage_billing.png" 
              alt="Usage billing storage" 
              className="rounded-2xl object-cover w-full h-[360px]"
            />
          </div>
        </div>

        {/* Descriptive Text Block */}
        <div className="lg:col-span-6 space-y-6 text-left reveal-item">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>Efficient Data Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans leading-tight">
            How Storage Consumption Pricing Saves You Money
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            In standard SaaS platforms, you are forced to pay for expensive user tiers or purchase features you never use. WashOps redefines this with a **consumption-based model**.
          </p>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex gap-3 items-start">
              <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 font-bold">1</span>
              <div>
                <h5 className="font-bold text-slate-200">Lightweight Entry Cost</h5>
                <p className="text-slate-400 mt-0.5">Perfect for newly opened outlets starting out with minimal traffic. Just $10/mo covers all database and ledger history needs.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 font-bold">2</span>
              <div>
                <h5 className="font-bold text-slate-200">Scalable Overage Tolerances</h5>
                <p className="text-slate-400 mt-0.5">As your business scales with thousands of laundry tickets, only pay a microscopic $0.05 per 100 MB of extra data consumed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 border-t border-slate-900/40 max-w-7xl mx-auto px-6 text-center space-y-12">
        <div className="space-y-4 max-w-2xl mx-auto reveal-item">
          <h2 className="text-3xl font-extrabold text-white font-sans">
            Trusted by Store Operators
          </h2>
          <p className="text-slate-400 text-sm">
            Read how owners utilize WashOps to cut machinery downtime and simplify billing cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[200px] reveal-item">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "Switching our shops to WashOps has cut sheet-tracking errors by 90%. The storage pricing is highly transparent—we only pay $12.50/mo because our logs are tiny!"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60 mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-xs">
                MC
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Maria Clara Santos</h5>
                <p className="text-[10px] text-slate-500">Owner, Clara's Soft Wash</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[200px] reveal-item">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "The smart inventory auto-depletion is a game changer. The system accurately estimates detergent consumption based on order weights, preventing emergency stockouts."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60 mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-xs">
                JD
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Juan Dela Cruz</h5>
                <p className="text-[10px] text-slate-500">Director, Express Wash Inc.</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col justify-between min-h-[200px] reveal-item">
            <p className="text-slate-300 text-xs italic leading-relaxed">
              "Being able to send mock SMS alerts to customers when their sheets are folded has dramatically increased customer pick-up rates. Very convincing SaaS execution."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60 mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sky-400 text-xs">
                JR
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">Jose Rizal</h5>
                <p className="text-[10px] text-slate-500">Operator, Rizal Laundry Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-20 border-t border-slate-900/40 bg-[#0a0d18]/40">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4 reveal-item">
            <h2 className="text-3xl font-extrabold text-white font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-sm">
              Got questions about storage limits, pricing, or setup? We have answers.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {/* FAQ 1 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 reveal-item">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>How is my database storage calculated?</span>
              </h4>
              <p className="text-slate-400 text-xs mt-2 pl-6 leading-relaxed">
                We measure the raw storage occupied by your customer accounts, active orders, machine maintenance history, and financial transactions. 500 MB covers approximately 10,000 complete customer and checkout records.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 reveal-item">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>What happens if I exceed my storage quota?</span>
              </h4>
              <p className="text-slate-400 text-xs mt-2 pl-6 leading-relaxed">
                If you exceed 500 MB on the Starter plan, your account will not be blocked. We simply apply an overage charge of $0.05 per 100 MB at the end of the billing cycle, giving you absolute continuity of operations.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 reveal-item">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Does it support multi-tenant database synchronization?</span>
              </h4>
              <p className="text-slate-400 text-xs mt-2 pl-6 leading-relaxed">
                Yes! If you are on the Enterprise plan and configure Supabase environment variables, the system automatically redirects read/write operations to your dedicated Supabase PostgreSQL database tables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-slate-900/60 bg-[#070a13] py-12 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-400">
            <Logo className="w-4 h-4" />
            <span>WashOps SaaS</span>
          </div>
          <p>© {new Date().getFullYear()} WashOps. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-slate-300 transition">Features</a>
            <a href="#pricing" className="hover:text-slate-300 transition">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
