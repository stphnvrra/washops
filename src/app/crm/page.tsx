'use client';

import React, { useState, useEffect } from 'react';
import { useLaundry } from '@/context/LaundryContext';
import { Customer, Order } from '@/types/laundry';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Award,
  History,
  Coins,
  Search,
  ChevronRight,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export default function CRMPage() {
  const { customers, orders, addCustomer, showToast } = useLaundry();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');

  // Check URL parameters for triggering 'New Customer' modal directly (e.g. from Dashboard quick link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setIsNewCustomerOpen(true);
        // Clear param to avoid re-opening
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Filter customers by search term
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Name is required!', 'error');
      return;
    }

    try {
      await addCustomer({
        name: formName,
        phone: formPhone,
        email: formEmail,
        address: formAddress,
        loyaltyPoints: 0,
      });

      // Reset form
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormAddress('');
      setIsNewCustomerOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error registering customer.', 'error');
    }
  };

  const handleOpenHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Find all orders for this customer
    const history = orders.filter(o => o.customerId === customer.id);
    setCustomerOrders(history);
  };

  // Helper calculations for selected customer modal
  const customerStats = React.useMemo(() => {
    if (!selectedCustomer) return { totalSpent: 0, totalWeight: 0, unpaidCount: 0 };
    
    const customerHistory = orders.filter(o => o.customerId === selectedCustomer.id);
    const totalSpent = customerHistory.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalWeight = customerHistory.reduce((sum, o) => sum + o.weight, 0);
    const unpaidCount = customerHistory.filter(o => o.paymentStatus === 'Unpaid').length;

    return { totalSpent, totalWeight, unpaidCount };
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Customer CRM
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Register shop customers, audit historical laundry logs, and review loyalty tiers.
          </p>
        </div>
        <button
          onClick={() => setIsNewCustomerOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Register Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const isVip = cust.loyaltyPoints >= 100;

          return (
            <div key={cust.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white leading-5">{cust.name}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
                      Joined: {new Date(cust.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {/* Loyalty Level Badge */}
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                    isVip 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <Award className="w-3.5 h-3.5" />
                    <span>{isVip ? 'VIP Tier' : 'Standard'}</span>
                  </span>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-2 mt-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cust.phone || 'No phone recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{cust.email || 'No email recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{cust.address || 'No address recorded'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-3 mt-4">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-slate-300">{cust.loyaltyPoints}</span>
                  <span>pts</span>
                </div>
                
                <button
                  onClick={() => handleOpenHistory(cust)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-400 text-xs font-semibold text-slate-300 transition flex items-center gap-1"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit History</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer History Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card max-w-lg w-full p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">Account Audit Details</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            {/* Quick stats totals */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Spent</p>
                <p className="text-sm font-black text-sky-400 mt-1">₱{customerStats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Weight Washed</p>
                <p className="text-sm font-black text-white mt-1">{customerStats.totalWeight.toFixed(1)} kg</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unpaid Orders</p>
                <p className={`text-sm font-black mt-1 ${customerStats.unpaidCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                  {customerStats.unpaidCount}
                </p>
              </div>
            </div>

            {/* Orders list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Laundry Logs</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No order records registered for this account.</p>
                ) : (
                  customerOrders.map(order => (
                    <div key={order.id} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/40 text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{order.orderNumber}</span>
                        <span className="text-slate-500 mx-2">•</span>
                        <span className="text-slate-400">{order.serviceType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-medium">₱{order.totalPrice.toFixed(2)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
            >
              Finish Audit
            </button>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-400" />
                <span>Customer Registration</span>
              </h3>
              <button
                onClick={() => setIsNewCustomerOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="E.g., John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="E.g., +63 912 345 6789"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="E.g., john.doe@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Home Address</label>
                <input
                  type="text"
                  placeholder="E.g., Libertad, Butuan City"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition shadow-lg shadow-sky-500/10"
                >
                  Register Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerOpen(false)}
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
