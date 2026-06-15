'use client';

import React, { useState, useEffect } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  HardDrive,
  Info,
  Database,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  Check,
  AlertTriangle
} from 'lucide-react';
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

export default function BillingPage() {
  const { orders, customers, showToast } = useLaundry();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Storage states
  const [simulatedOverage, setSimulatedOverage] = useState<number>(0);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAutoRenew, setIsAutoRenew] = useState<boolean>(true);

  // Dynamic storage calculations
  const baseStaticSize = 142.5; // system components, configurations, static imagery
  const ordersSize = orders.length * 0.15; // 150 KB per order log
  const customersSize = customers.length * 0.08; // 80 KB per customer CRM entry
  const totalStorageUsed = baseStaticSize + ordersSize + customersSize + simulatedOverage;
  const storageLimit = 500; // MB
  const storagePercentage = Math.min(100, (totalStorageUsed / storageLimit) * 100);

  // Calculate pricing
  const baseFee = 10.00; // $10 starting price
  const overageSize = Math.max(0, totalStorageUsed - storageLimit);
  const overageUnits = Math.ceil(overageSize / 100); // 100 MB steps
  const overageFeeRate = 0.05; // $0.05 per 100 MB
  const currentOverageFee = overageUnits * overageFeeRate;
  const totalAccruedBill = baseFee + currentOverageFee;

  // Initialize simulated overage and invoice data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load simulated storage
      const savedOverage = localStorage.getItem('washops_simulated_overage_mb');
      if (savedOverage) {
        setSimulatedOverage(parseFloat(savedOverage));
      }

      // Load or seed invoices
      const savedInvoices = localStorage.getItem('washops_invoices');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices) as Invoice[];
        // Dynamic update of current month's unpaid invoice
        const updated = parsed.map(inv => {
          if (inv.status === 'Unpaid') {
            return {
              ...inv,
              storageUsedMB: parseFloat(totalStorageUsed.toFixed(1)),
              overageFee: parseFloat(currentOverageFee.toFixed(2)),
              totalAmount: parseFloat(totalAccruedBill.toFixed(2)),
            };
          }
          return inv;
        });
        setInvoices(updated);
        localStorage.setItem('washops_invoices', JSON.stringify(updated));
      } else {
        const initialInvoices: Invoice[] = [
          {
            id: 'INV-2026-003',
            billingPeriod: 'June 01 - June 30, 2026',
            dueDate: 'June 30, 2026',
            storageUsedMB: parseFloat(totalStorageUsed.toFixed(1)),
            baseFee: 10.00,
            overageFee: parseFloat(currentOverageFee.toFixed(2)),
            totalAmount: parseFloat(totalAccruedBill.toFixed(2)),
            status: 'Unpaid',
          },
          {
            id: 'INV-2026-002',
            billingPeriod: 'May 01 - May 31, 2026',
            dueDate: 'May 31, 2026',
            storageUsedMB: 395.2,
            baseFee: 10.00,
            overageFee: 0.00,
            totalAmount: 10.00,
            status: 'Paid',
            paidAt: '2026-06-01T09:30:00Z',
          },
          {
            id: 'INV-2026-001',
            billingPeriod: 'April 01 - April 30, 2026',
            dueDate: 'April 30, 2026',
            storageUsedMB: 480.0,
            baseFee: 10.00,
            overageFee: 0.00,
            totalAmount: 10.00,
            status: 'Paid',
            paidAt: '2026-05-01T10:15:00Z',
          }
        ];
        setInvoices(initialInvoices);
        localStorage.setItem('washops_invoices', JSON.stringify(initialInvoices));
      }
    }
  }, [simulatedOverage, currentOverageFee, totalAccruedBill, totalStorageUsed]);

  // Handle Stripe Success Callback Redirects
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      const savedInvoices = localStorage.getItem('washops_invoices');
      if (savedInvoices) {
        const parsed = JSON.parse(savedInvoices) as Invoice[];
        const updated = parsed.map(inv => {
          if (inv.status === 'Unpaid') {
            return {
              ...inv,
              status: 'Paid' as const,
              paidAt: new Date().toISOString(),
            };
          }
          return inv;
        });
        setInvoices(updated);
        localStorage.setItem('washops_invoices', JSON.stringify(updated));
      }

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('Stripe checkout completed successfully!', 'success');

      // Clear search query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url.pathname);
    }
  }, [searchParams, showToast]);

  // Adjust simulated overage storage logs
  const handleAddLogs = (mbToAdd: number) => {
    const nextOverage = Math.max(0, simulatedOverage + mbToAdd);
    setSimulatedOverage(nextOverage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('washops_simulated_overage_mb', nextOverage.toString());
    }
    showToast(mbToAdd > 0 ? `Simulated logs added (+${mbToAdd} MB)` : `Simulated storage cleared!`, 'info');
  };

  // Launch simulated Stripe Session redirect
  const handleCheckout = (invoice: Invoice) => {
    // Redirect to Stripe checkout simulation
    router.push(`/billing/stripe-checkout?amount=${invoice.totalAmount}&invoiceId=${invoice.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Billing & Storage Usage
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review database storage consumption limits, adjust mock file log backups, and manage simulated Stripe invoicing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Plan & Storage, Calculator controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan & Usage Dashboard Card */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-slate-800/80 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-teal-500/5 blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start border-b border-slate-800/60 pb-5">
              <div>
                <span className="text-xs text-sky-400 font-bold uppercase tracking-wider bg-sky-500/10 px-2.5 py-1 rounded-full">
                  Active Subscription
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">WashOps Starter Plan</h3>
                <p className="text-slate-400 text-xs mt-1">Starting monthly base fee covering operational data logs.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-400">Monthly Cost</p>
                <p className="text-3xl font-black text-white">$10.00<span className="text-xs font-semibold text-slate-500">/mo</span></p>
              </div>
            </div>

            {/* Storage Usage Graph Progress */}
            <div className="py-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  Database Log Storage Consumed
                </span>
                <span className="text-white font-bold">{totalStorageUsed.toFixed(1)} MB / 500.0 MB</span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-950/80 rounded-full h-3.5 border border-slate-800 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                    totalStorageUsed > storageLimit
                      ? 'from-rose-500 to-orange-400'
                      : 'from-sky-500 to-teal-400'
                  }`}
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>142.5 MB system core static metadata</span>
                <span className={totalStorageUsed > storageLimit ? 'text-rose-400 font-bold' : ''}>
                  {totalStorageUsed > storageLimit ? 'Overage limits exceeded' : 'Within free allocation tier'}
                </span>
              </div>
            </div>

            {/* Data Size Details breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/40">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center gap-3">
                <Database className="w-8 h-8 text-sky-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Orders Logs</p>
                  <p className="text-sm font-black text-slate-200">{orders.length} items ({ordersSize.toFixed(1)} MB)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center gap-3">
                <Database className="w-8 h-8 text-teal-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CRM Records</p>
                  <p className="text-sm font-black text-slate-200">{customers.length} items ({customersSize.toFixed(1)} MB)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/50 flex items-center gap-3">
                <Database className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulated Backups</p>
                  <p className="text-sm font-black text-slate-200">{simulatedOverage.toFixed(0)} MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overage Simulation Sandbox Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" />
              Recruiter Overage Simulation Sandbox
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add artificial backups or log files to exceed the 500 MB base tier and witness the automatic calculation of the Stripe invoice amount in real-time.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => handleAddLogs(120)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-sky-400 hover:text-sky-300 hover:bg-slate-800 transition shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image Backups (+120 MB)
              </button>
              <button
                onClick={() => handleAddLogs(350)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-teal-400 hover:text-teal-300 hover:bg-slate-800 transition shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Heavy Video Logs (+350 MB)
              </button>
              <button
                onClick={() => handleAddLogs(-150)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition shadow cursor-pointer"
                disabled={simulatedOverage === 0}
              >
                Delete Selected Logs (-150 MB)
              </button>
              <button
                onClick={() => handleAddLogs(-simulatedOverage)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 transition shadow ml-auto cursor-pointer"
                disabled={simulatedOverage === 0}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Sandbox Logs
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Cost Summary and Payment Method info */}
        <div className="space-y-6">
          {/* Current Due Ledger summary */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
            <h3 className="text-base font-bold text-white border-b border-slate-800/60 pb-3">
              June billing cycle
            </h3>

            <div className="space-y-4 py-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Starter Plan Base Fee</span>
                <span className="text-white">$10.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>
                  Storage Overage Fee
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    {overageSize.toFixed(0)} MB over limit
                  </span>
                </span>
                <span className="text-white">${currentOverageFee.toFixed(2)}</span>
              </div>
              {overageSize > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Overage rate active</span>
                    You are billed $0.05 per 100 MB exceeding the 500 MB base tier.
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Accrued Balance</p>
                <p className="text-[10px] text-slate-400">(Invoicing June 30)</p>
              </div>
              <p className="text-3xl font-black text-sky-400">${totalAccruedBill.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Method Details Visual display */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Payment Method</h3>

            {/* Credit Card Graphic */}
            <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-teal-500 border border-white/20 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-white text-xs font-black italic">
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">DEMO</span>
                  <span>WashOps Portal</span>
                </div>
                <CreditCard className="w-8 h-8 text-white/90" />
              </div>

              <div className="text-white">
                <p className="text-base tracking-widest font-mono">•••• •••• •••• 4242</p>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-[8px] text-white/50 uppercase font-semibold">Cardholder</p>
                    <p className="text-xs font-bold font-sans uppercase tracking-wide truncate max-w-[120px]">{user?.fullName || 'Shop Owner'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-white/50 uppercase font-semibold">Expires</p>
                    <p className="text-xs font-bold font-mono">12/29</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Auto-renew Subscriptions</span>
              <button
                onClick={() => setIsAutoRenew(!isAutoRenew)}
                className={`w-10 h-5.5 rounded-full transition relative flex items-center px-0.5 cursor-pointer ${
                  isAutoRenew ? 'bg-sky-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Invoice logs ledger list */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Invoice History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4 text-center">Storage Used</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-4 font-bold text-white font-mono">{inv.id}</td>
                  <td className="py-4 px-4">{inv.billingPeriod}</td>
                  <td className="py-4 px-4 text-center">{inv.storageUsedMB.toFixed(1)} MB</td>
                  <td className="py-4 px-4 text-right font-semibold text-slate-200">${inv.totalAmount.toFixed(2)}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {inv.status === 'Paid' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-rose-400" />
                          <span>Unpaid</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      {inv.status === 'Unpaid' ? (
                        <button
                          onClick={() => handleCheckout(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition shadow shadow-sky-500/10 cursor-pointer"
                        >
                          <span>Pay via Stripe</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice PDF details Modal Receipt */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-8 rounded-3xl space-y-6 border border-slate-800 shadow-2xl relative">
              
              {/* Header info */}
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-1 text-white font-black italic text-lg">
                    <span className="w-6 h-6 rounded bg-sky-500 flex items-center justify-center not-italic font-bold text-xs text-slate-900">W</span>
                    <span>WashOps</span>
                  </div>
                  <p className="text-slate-500 text-[10px] mt-1 font-semibold tracking-wide uppercase font-sans">Official Stripe Receipt</p>
                </div>
                <div className="text-right">
                  <h4 className="text-base font-bold text-white font-mono">{selectedInvoice.id}</h4>
                  <p className="text-xs text-slate-400 mt-1">Paid: {selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}</p>
                </div>
              </div>

              {/* Entity billing details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">From</p>
                  <p className="font-bold text-slate-300">WashOps Cloud Systems LLC</p>
                  <p className="text-slate-400">100 Stripe Way</p>
                  <p className="text-slate-400">San Francisco, CA 94103</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Billed To</p>
                  <p className="font-bold text-slate-300">{user?.fullName || 'Shop Owner'}</p>
                  <p className="text-slate-400 font-semibold text-[11px] text-sky-400">{user?.shopName || 'Laundry Shop'}</p>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>

              {/* Line items details table */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Itemized charges</p>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Starter Plan SaaS Subscription</p>
                      <p className="text-[10px] text-slate-500">Base monthly fee allocation (500 MB included)</p>
                    </div>
                    <span className="font-mono text-slate-200">${selectedInvoice.baseFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-900/60 pt-3">
                    <div>
                      <p className="font-bold text-white">Storage Overage logs charges</p>
                      <p className="text-[10px] text-slate-500">Consumed: {selectedInvoice.storageUsedMB.toFixed(1)} MB (${(selectedInvoice.storageUsedMB - 500 > 0 ? selectedInvoice.storageUsedMB - 500 : 0).toFixed(0)} MB over limit)</p>
                    </div>
                    <span className="font-mono text-slate-200">${selectedInvoice.overageFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-900 pt-3 text-sm font-bold text-white">
                    <span>Total Amount Paid</span>
                    <span className="font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      ${selectedInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Modal action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition flex items-center justify-center cursor-pointer"
                >
                  <span>Close Receipt</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
