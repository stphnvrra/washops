'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { ExpenseCategory } from '@/types/laundry';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Plus
} from 'lucide-react';

export default function FinancePage() {
  const { orders, expenses, addExpense, showToast } = useLaundry();

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>('all');
  
  // Modal state
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Expense form state
  const [formAmount, setFormAmount] = useState<number>(0.0);
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Supplies');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Combine Orders and Expenses into a unified transaction list
  const incomeTransactions = orders
    .filter(o => o.paymentStatus === 'Paid')
    .map(o => ({
      id: o.id,
      type: 'income' as const,
      category: 'Laundry Order' as const,
      description: `Payment for Order ${o.orderNumber} (${o.serviceType})`,
      amount: o.totalPrice,
      date: o.createdAt.split('T')[0],
      createdAt: o.createdAt,
    }));

  const expenseTransactions = expenses.map(e => ({
    id: e.id,
    type: 'expense' as const,
    category: e.category,
    description: e.description,
    amount: e.amount,
    date: e.date,
    createdAt: e.createdAt,
  }));

  const allTransactions = [...incomeTransactions, ...expenseTransactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter logic
  const filteredTransactions = allTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = 
      expenseFilterCategory === 'all' || 
      (t.type === 'expense' && t.category === expenseFilterCategory);
    return matchesType && matchesCategory;
  });

  // Summary Card Calculations
  const grossIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = grossIncome - totalExpenses;

  // Add Expense submit handler
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) {
      showToast('Amount must be greater than zero!', 'error');
      return;
    }

    try {
      await addExpense({
        category: formCategory,
        description: formDescription,
        amount: formAmount,
        date: formDate,
      });

      // Reset Form
      setFormAmount(0.0);
      setFormDescription('');
      setIsExpenseOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error recording expense.', 'error');
    }
  };

  const categories: ExpenseCategory[] = ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Maintenance', 'Other'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Finance &amp; Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Audit store expenditures, review cash flows, and manage operations costs.
          </p>
        </div>
        <button
          onClick={() => setIsExpenseOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-400 text-white transition shadow-lg shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Cash Flow Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Gross Income */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Income</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2">
                ₱{grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold uppercase tracking-wide">
            Collected from invoices
          </p>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenses</p>
              <h3 className="text-3xl font-bold text-rose-400 mt-2">
                ₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/15">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold uppercase tracking-wide">
            Store operations costs
          </p>
        </div>

        {/* Card 3: Net Cash Flow */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Flow</p>
              <h3 className={`text-3xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-teal-400' : 'text-slate-300'}`}>
                {netCashFlow < 0 ? '-' : ''}₱{Math.abs(netCashFlow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl border border-slate-700">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold uppercase tracking-wide">
            Net aggregate capital
          </p>
        </div>
      </div>

      {/* Filters & Ledger Listing */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/60">
        <div className="p-5 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Unified Ledger</h3>
            <p className="text-xs text-slate-400 mt-0.5">Chronological record of transactions.</p>
          </div>
          
          {/* Filters Panel */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex border border-slate-800 bg-slate-950/40 rounded-xl p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'expense' ? 'bg-rose-500/10 text-rose-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Expenses
              </button>
            </div>

            {/* Expense Category filter */}
            {filterType !== 'income' && (
              <select
                value={expenseFilterCategory}
                onChange={(e) => setExpenseFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-950/40 border border-slate-800 text-slate-300 focus:outline-none focus:border-sky-500/30"
              >
                <option value="all">All Expense Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/40 bg-slate-900/20 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-800/30 hover:bg-slate-900/10 text-xs transition"
                  >
                    {/* Date */}
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {/* Description */}
                    <td className="py-4 px-6 text-white font-semibold">
                      {tx.description}
                    </td>
                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    {/* Amount */}
                    <td className={`py-4 px-6 text-right font-bold text-sm ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} ₱{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <h3 className="text-lg font-bold text-white">Record Shop Expense</h3>
              <button
                onClick={() => setIsExpenseOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Expense Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Explain what was purchased or paid (e.g. Electric bill for May, 20L detergent replenishment...)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition shadow-lg shadow-rose-500/10"
                >
                  Record Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 text-sm hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
