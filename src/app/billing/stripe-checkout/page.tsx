'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Invoice {
  id: string;
  billingPeriod: string;
  dueDate: string;
  storageUsedMB: number;
  baseFee: number;
  overageFee: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid';
  paidAt?: string;
}

export default function StripeCheckoutSimulation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params
  const rawAmount = searchParams.get('amount') || '10.00';
  const invoiceId = searchParams.get('invoiceId') || 'INV-2026-003';
  const amount = parseFloat(rawAmount);

  // Form states
  const [email, setEmail] = useState('demo@lms-saas.com');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('United States');
  const [zipCode, setZipCode] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Card brand detection helper
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    if (clean.startsWith('3')) return 'amex';
    return 'generic';
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length > 16) value = value.slice(0, 16);
    
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNumber(parts.join(' '));
    setValidationError('');
  };

  // Format Expiry Date (adds '/' automatically)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
    setValidationError('');
  };

  // Format CVC (3-4 digits max)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    const maxLen = getCardBrand(cardNumber) === 'amex' ? 4 : 3;
    if (value.length > maxLen) value = value.slice(0, maxLen);
    setCvc(value);
    setValidationError('');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setValidationError('Please enter a valid credit card number.');
      return;
    }

    if (expiry.length < 5) {
      setValidationError('Please enter a valid expiration date (MM/YY).');
      return;
    }

    const month = parseInt(expiry.split('/')[0]);
    if (month < 1 || month > 12) {
      setValidationError('Expiration month must be between 01 and 12.');
      return;
    }

    const minCvc = getCardBrand(cardNumber) === 'amex' ? 4 : 3;
    if (cvc.length < minCvc) {
      setValidationError(`Please enter a valid ${minCvc}-digit security code (CVC).`);
      return;
    }

    if (!cardName.trim()) {
      setValidationError('Please enter the cardholder name.');
      return;
    }

    if (!zipCode.trim()) {
      setValidationError('Please enter a ZIP/Postal Code.');
      return;
    }

    // Process payment simulation
    setIsLoading(true);

    setTimeout(() => {
      // Mark invoice as paid in local storage
      if (typeof window !== 'undefined') {
        const savedInvoices = localStorage.getItem('washops_invoices');
        if (savedInvoices) {
          const parsed = JSON.parse(savedInvoices);
          const updated = parsed.map((inv: Invoice) => {
            if (inv.id === invoiceId) {
              return {
                ...inv,
                status: 'Paid',
                paidAt: new Date().toISOString()
              };
            }
            return inv;
          });
          localStorage.setItem('washops_invoices', JSON.stringify(updated));
        }
      }

      setIsLoading(false);
      setIsSuccess(true);

      // Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Redirect back to billing with success callback
      setTimeout(() => {
        router.push('/billing?success=true');
      }, 1500);

    }, 2000);
  };

  // Card Brand SVG Icons (styled to fit inside card input)
  const renderCardIcon = () => {
    const brand = getCardBrand(cardNumber);
    if (brand === 'visa') {
      return (
        <svg className="w-8 h-5 text-[#1A1F71]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.88 4h-2.92c-.67 0-1.21.36-1.47.93l-5.11 11.23h3.19l.64-1.68h3.91l.37 1.68h2.82L19.88 4zm-4.32 8.16l1.64-4.38 1.05 4.38h-2.69zM8.33 4H5.2L1.87 11.83l.25.13 2.11-4.22h4.1H8.33V4zm-4.8 11.23h3.04l2.12-11.23H5.66l-2.13 11.23z" />
        </svg>
      );
    }
    if (brand === 'mastercard') {
      return (
        <div className="flex -space-x-1.5 items-center">
          <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-90"></div>
          <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90"></div>
        </div>
      );
    }
    if (brand === 'amex') {
      return (
        <div className="bg-[#0070d2] text-white font-bold text-[8px] px-1 py-0.5 rounded leading-none flex items-center tracking-wider font-mono">
          AMEX
        </div>
      );
    }
    return (
      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#30313d] flex flex-col md:flex-row antialiased font-sans">
      
      {/* LEFT COLUMN: Stripe Order Overview (Dark Theme Pane) */}
      <div className="w-full md:w-[45%] bg-[#1a1f36] text-white p-8 md:p-16 flex flex-col justify-between relative border-r border-slate-200/5">
        <div className="space-y-12">
          {/* Top return anchor */}
          <button 
            onClick={() => router.push('/billing')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to WashOps</span>
          </button>

          {/* Product details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center font-bold text-xs text-slate-900 not-italic">W</span>
              <span className="text-sm font-bold text-slate-400 tracking-tight">WashOps Cloud</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-400">Subscribe to WashOps Starter</p>
              <h2 className="text-5xl font-extrabold tracking-tight text-white">${amount.toFixed(2)}</h2>
            </div>

            {/* Bill breakdown list */}
            <div className="pt-8 space-y-4 border-t border-slate-800 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Starter Plan (500 MB base)</span>
                <span className="text-white font-medium">$10.00</span>
              </div>
              {amount > 10 && (
                <div className="flex justify-between">
                  <span>Storage Overage Logs</span>
                  <span className="text-white font-medium">${(amount - 10).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-4 text-white font-bold text-base">
                <span>Total due today</span>
                <span>${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info: Stripe wordmark logo */}
        <div className="pt-12 md:pt-0 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Powered by</span>
          <svg className="w-12 h-5 text-slate-400 hover:text-white transition" viewBox="0 0 512 214" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M512 110.08c0-36.409-17.636-65.138-51.342-65.138c-33.85 0-54.33 28.73-54.33 64.854c0 42.808 24.179 64.426 58.88 64.426c16.925 0 29.725-3.84 39.396-9.244v-28.445c-9.67 4.836-20.764 7.823-34.844 7.823c-13.796 0-26.027-4.836-27.591-21.618h69.547c0-1.85.284-9.245.284-12.658m-70.258-13.511c0-16.071 9.814-22.756 18.774-22.756c8.675 0 17.92 6.685 17.92 22.756zm-90.31-51.627c-13.939 0-22.899 6.542-27.876 11.094l-1.85-8.818h-31.288v165.83l35.555-7.537l.143-40.249c5.12 3.698 12.657 8.96 25.173 8.96c25.458 0 48.64-20.48 48.64-65.564c-.142-41.245-23.609-63.716-48.498-63.716m-8.534 97.991c-8.391 0-13.37-2.986-16.782-6.684l-.143-52.765c3.698-4.124 8.818-6.968 16.925-6.968c12.942 0 21.902 14.506 21.902 33.137c0 19.058-8.818 33.28-21.902 33.28M241.493 36.551l35.698-7.68V0l-35.698 7.538zm0 10.809h35.698v124.444h-35.698zm-38.257 10.524L200.96 47.36h-30.72v124.444h35.556V87.467c8.39-10.951 22.613-8.96 27.022-7.396V47.36c-4.551-1.707-21.191-4.836-29.582 10.524m-71.112-41.386l-34.702 7.395l-.142 113.92c0 21.05 15.787 36.551 36.836 36.551c11.662 0 20.195-2.133 24.888-4.693V140.8c-4.55 1.849-27.022 8.391-27.022-12.658V77.653h27.022V47.36h-27.022zM35.982 83.484c0-5.546 4.551-7.68 12.09-7.68c10.808 0 24.461 3.272 35.27 9.103V51.484c-11.804-4.693-23.466-6.542-35.27-6.542C19.2 44.942 0 60.018 0 85.192c0 39.252 54.044 32.995 54.044 49.92c0 6.541-5.688 8.675-13.653 8.675c-11.804 0-26.88-4.836-38.827-11.378v33.849c13.227 5.689 26.596 8.106 38.827 8.106c29.582 0 49.92-14.648 49.92-40.106"/>
          </svg>
        </div>
      </div>

      {/* RIGHT COLUMN: Stripe Elements Form (White Pane) */}
      <div className="w-full md:w-[55%] bg-white p-8 md:p-16 lg:p-24 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          
          {/* Authentic Stripe Test Mode Banner */}
          <div className="bg-[#fff9f2] border border-[#ffe6cc] text-[#c25800] text-xs p-3.5 rounded-md flex gap-2.5 items-start">
            <div className="bg-[#ff8f00] text-white text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded leading-none mt-0.5 uppercase">
              Test Mode
            </div>
            <div className="leading-relaxed font-medium">
              <span className="font-bold text-[#8f4700]">Use a test card.</span> You can use card number <span className="font-mono bg-[#ffe3c6] px-1 py-0.25 rounded font-bold">4242 4242 4242 4242</span> with any future date and CVC to pay this simulated Stripe invoice.
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            
            {/* Form Validation Errors */}
            {validationError && (
              <div className="p-3.5 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold">
                {validationError}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#30313d]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-md border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#635bff] focus:shadow-[0_0_0_3px_rgba(99,91,255,0.12)] text-sm shadow-sm transition"
                placeholder="email@example.com"
              />
            </div>

            {/* Consolidated Card Info Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#30313d]">Card information</label>
              <div className="rounded-md border border-slate-200 overflow-hidden divide-y divide-slate-200 focus-within:border-[#635bff] focus-within:shadow-[0_0_0_3px_rgba(99,91,255,0.12)] shadow-sm transition">
                
                {/* Card Number Row */}
                <div className="flex items-center px-3 py-2.5 relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    placeholder="1234 5678 1234 5678"
                    className="w-full bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-sm pr-10"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {renderCardIcon()}
                  </div>
                </div>

                {/* Expiry & CVC Row */}
                <div className="flex divide-x divide-slate-200">
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    required
                    placeholder="MM / YY"
                    className="w-1/2 px-3 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-sm"
                  />
                  <div className="w-1/2 flex items-center pr-3">
                    <input
                      type="password"
                      value={cvc}
                      onChange={handleCvcChange}
                      required
                      placeholder="CVC"
                      className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-sm"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  </div>
                </div>

              </div>
            </div>

            {/* Name on Card */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#30313d]">Name on card</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-md border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#635bff] focus:shadow-[0_0_0_3px_rgba(99,91,255,0.12)] text-sm shadow-sm transition"
                placeholder="Cardholder Name"
              />
            </div>

            {/* Billing Address block */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#30313d]">Billing address</label>
              <div className="rounded-md border border-slate-200 overflow-hidden divide-y divide-slate-200 focus-within:border-[#635bff] focus-within:shadow-[0_0_0_3px_rgba(99,91,255,0.12)] shadow-sm transition">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-slate-800 text-sm"
                >
                  <option>United States</option>
                  <option>Philippines</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Singapore</option>
                </select>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="ZIP / Postal Code"
                  className="w-full px-3 py-2.5 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Stripe checkout action CTA button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-3 mt-6 rounded-md font-bold text-white bg-[#635bff] hover:bg-[#0a2540] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-90 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Payment Successful</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>

          {/* Secure disclaimer links */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-6 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Secure transaction checkout
            </span>
            <div className="flex gap-2.5">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
