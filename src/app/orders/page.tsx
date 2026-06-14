'use client';

import React, { useState, useEffect } from 'react';

import { useLaundry } from '@/context/LaundryContext';
import { Order, OrderStatus, ServiceType } from '@/types/laundry';
import {
  Search,
  Plus,
  Mail,
  MessageSquare,
  QrCode,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrdersPage() {
  const {
    orders,
    customers,
    addOrder,
    updateOrderStatus,
    updateOrderPaymentStatus,
    sendMockEmail,
    sendMockSms,
    showToast
  } = useLaundry();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Modals state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Order Form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formServiceType, setFormServiceType] = useState<ServiceType>('Wash-Dry-Fold');
  const [formWeight, setFormWeight] = useState<number>(5.0);
  const [formExtraPrice, setFormExtraPrice] = useState<number>(0.0);
  const [formNotes, setFormNotes] = useState('');

  // Dynamic pricing calculations
  const [priceCalculations, setPriceCalculations] = useState({
    basePrice: 0,
    discount: 0,
    totalPrice: 0,
  });

  // Check URL parameters for triggering 'New Order' modal directly (e.g. from Dashboard quick link)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setIsNewOrderOpen(true);
        // Clear param to avoid re-opening
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Update price preview in real-time when weight, service, or customer selection changes
  useEffect(() => {
    // Pricing table
    const serviceRates: Record<ServiceType, number> = {
      'Wash-Dry-Fold': 35.00,
      'Wash-Dry-Press': 45.00,
      'Dry Clean': 100.00,
      'Ironing Only': 25.00,
    };

    const rate = serviceRates[formServiceType] || 35.00;
    const base = Number((formWeight * rate).toFixed(2));
    
    // Check if customer qualifies for 10% loyalty discount (e.g., points > 100)
    const selectedCust = customers.find(c => c.id === formCustomerId);
    const disc = selectedCust && selectedCust.loyaltyPoints >= 100 
      ? Number((base * 0.1).toFixed(2)) 
      : 0.0;

    const total = Math.max(0, Number((base + formExtraPrice - disc).toFixed(2)));

    setPriceCalculations({
      basePrice: base,
      discount: disc,
      totalPrice: total,
    });
  }, [formServiceType, formWeight, formExtraPrice, formCustomerId, customers]);

  // Set default customer on modal open
  useEffect(() => {
    if (isNewOrderOpen && customers.length > 0 && !formCustomerId) {
      setFormCustomerId(customers[0].id);
    }
  }, [isNewOrderOpen, customers, formCustomerId]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId) {
      showToast('Please register/select a customer first!', 'error');
      return;
    }

    try {
      await addOrder({
        customerId: formCustomerId,
        weight: formWeight,
        basePrice: priceCalculations.basePrice,
        extraPrice: formExtraPrice,
        discount: priceCalculations.discount,
        totalPrice: priceCalculations.totalPrice,
        serviceType: formServiceType,
        paymentStatus: 'Unpaid',
        orderStatus: 'Received',
        notes: formNotes,
        hasEmailReceipt: false,
        hasSmsNotification: false,
      });

      // Reset form
      setFormServiceType('Wash-Dry-Fold');
      setFormWeight(5.0);
      setFormExtraPrice(0.0);
      setFormNotes('');
      setIsNewOrderOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error registering order.', 'error');
    }
  };

  const handleStatusUpdate = async (orderId: string, currentStatus: OrderStatus, nextStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, nextStatus);
    if (success && nextStatus === 'Completed') {
      // Trigger canvas-confetti blast
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleOpenQr = (order: Order) => {
    setSelectedOrder(order);
    setIsQrOpen(true);
  };

  // Filter orders by search term and status tab
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || o.orderStatus.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const statusPipeline: { label: string; value: string; color: string }[] = [
    { label: 'All', value: 'all', color: 'bg-slate-700' },
    { label: 'Received 📥', value: 'received', color: 'bg-blue-500' },
    { label: 'Washing 🫧', value: 'washing', color: 'bg-sky-500' },
    { label: 'Drying 🌀', value: 'drying', color: 'bg-indigo-500' },
    { label: 'Folding 👕', value: 'folding', color: 'bg-purple-500' },
    { label: 'Ready 📦', value: 'ready', color: 'bg-teal-500' },
    { label: 'Completed ✅', value: 'completed', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Laundry Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage processing queues, record payments, and track order tags.
          </p>
        </div>
        <button
          onClick={() => setIsNewOrderOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Order Check-in</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="glass-card p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition"
            />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-t border-slate-800/40 pt-4">
          {statusPipeline.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`text-xs px-3.5 py-2 rounded-lg font-semibold border transition-all ${
                activeTab === tab.value
                  ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Workspace */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="glass-card py-12 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <AlertCircle className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
            <p className="text-sm font-medium">No matching laundry orders found.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isCompleted = order.orderStatus === 'Completed';

            return (
              <div
                key={order.id}
                className="glass-card p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* ID & Customer Metadata */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex-shrink-0 flex flex-col items-center justify-center min-w-[70px]">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Number</span>
                    <span className="text-sm font-black text-sky-400 mt-1">{order.orderNumber}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-5">
                      {order.customerName || 'Walk-in Customer'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.serviceType} • <span className="font-semibold text-slate-300">{order.weight} kg</span> • ₱{order.totalPrice.toFixed(2)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Order Status Badge */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        order.orderStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.orderStatus === 'Ready' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        order.orderStatus === 'Folding' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        order.orderStatus === 'Drying' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        order.orderStatus === 'Washing' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {order.orderStatus}
                      </span>
                      {/* Payment Status Badge */}
                      <button
                        onClick={() => updateOrderPaymentStatus(order.id, order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid')}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-950/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-950/20 animate-pulse'
                        }`}
                      >
                        {order.paymentStatus}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tracking & Mock Integration Panel */}
                <div className="flex flex-wrap items-center gap-2 lg:justify-end border-t lg:border-t-0 border-slate-800/40 pt-3 lg:pt-0">
                  {/* QR Tracking Modal trigger */}
                  <button
                    onClick={() => handleOpenQr(order)}
                    title="Generate QR Tracking Tag"
                    className="p-2 rounded-xl border border-slate-800 bg-slate-950/20 text-slate-400 hover:text-sky-400 hover:bg-slate-900 transition flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Tag</span>
                  </button>

                  {/* Email Receipt Trigger */}
                  <button
                    onClick={() => sendMockEmail(order.id)}
                    title="Send Email Receipt"
                    className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                      order.hasEmailReceipt
                        ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-sky-400 hover:bg-slate-900'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email {order.hasEmailReceipt && '✓'}</span>
                  </button>

                  {/* SMS Alert Trigger */}
                  <button
                    onClick={() => sendMockSms(order.id)}
                    title="Send SMS Pickup Notification"
                    className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                      order.hasSmsNotification
                        ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:text-sky-400 hover:bg-slate-900'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>SMS {order.hasSmsNotification && '✓'}</span>
                  </button>

                  {/* Pipeline Stepper Control */}
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        const states: OrderStatus[] = ['Received', 'Washing', 'Drying', 'Folding', 'Ready', 'Completed'];
                        const currIdx = states.indexOf(order.orderStatus);
                        if (currIdx < states.length - 1) {
                          handleStatusUpdate(order.id, order.orderStatus, states[currIdx + 1]);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-sky-500/10 ml-auto lg:ml-0"
                    >
                      <span>Advance</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Tag Modal */}
      {isQrOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-white">Order Tracking Tag</h3>
            <p className="text-xs text-slate-400">Scan or click to view tracking history</p>
            
            {/* Mock QR SVG */}
            <div className="mx-auto w-40 h-40 bg-white p-3 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center relative group">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                <rect x="0" y="0" width="100" height="100" fill="none" />
                {/* Outer corners */}
                <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                <rect x="13" y="13" width="14" height="14" fill="white" />
                <rect x="16" y="16" width="8" height="8" fill="currentColor" />

                <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                <rect x="73" y="13" width="14" height="14" fill="white" />
                <rect x="76" y="16" width="8" height="8" fill="currentColor" />

                <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                <rect x="13" y="73" width="14" height="14" fill="white" />
                <rect x="16" y="76" width="8" height="8" fill="currentColor" />
                
                {/* Random QR code pixels */}
                <rect x="35" y="15" width="5" height="10" fill="currentColor" />
                <rect x="45" y="10" width="10" height="5" fill="currentColor" />
                <rect x="50" y="25" width="10" height="10" fill="currentColor" />
                <rect x="35" y="40" width="15" height="5" fill="currentColor" />
                <rect x="15" y="45" width="5" height="15" fill="currentColor" />
                <rect x="35" y="55" width="10" height="10" fill="currentColor" />
                <rect x="55" y="45" width="15" height="10" fill="currentColor" />
                <rect x="75" y="40" width="10" height="5" fill="currentColor" />
                <rect x="70" y="55" width="5" height="15" fill="currentColor" />
                <rect x="75" y="75" width="15" height="10" fill="currentColor" />
                <rect x="45" y="70" width="10" height="15" fill="currentColor" />
              </svg>
              {/* Inner water icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 rounded-xl text-sky-400">
                <span className="text-[10px] font-bold">LMS Portal</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl text-left border border-slate-800 text-xs space-y-1 text-slate-300">
              <p><span className="text-slate-500 font-medium">Tag ID:</span> {selectedOrder.orderNumber}</p>
              <p><span className="text-slate-500 font-medium">Customer:</span> {selectedOrder.customerName}</p>
              <p><span className="text-slate-500 font-medium">Weight:</span> {selectedOrder.weight} kg</p>
              <p><span className="text-slate-500 font-medium">Service:</span> {selectedOrder.serviceType}</p>
              <p><span className="text-slate-500 font-medium">Status:</span> {selectedOrder.orderStatus}</p>
            </div>

            <div className="flex gap-2">
              <a
                href={selectedOrder.trackingQr}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 text-xs font-bold text-center rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition"
              >
                Scan Link
              </a>
              <button
                onClick={() => setIsQrOpen(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Order / Check-in Modal */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <h3 className="text-lg font-bold text-white">Laundry Check-in Form</h3>
              <button
                onClick={() => setIsNewOrderOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Customer</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                >
                  <option value="" disabled>-- Choose Registered Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.loyaltyPoints} pts)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Don't see your customer? Register them in the CRM tab first.
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Service Type</label>
                <select
                  value={formServiceType}
                  onChange={(e) => setFormServiceType(e.target.value as ServiceType)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                >
                  <option value="Wash-Dry-Fold">Wash-Dry-Fold (₱35.00/kg)</option>
                  <option value="Wash-Dry-Press">Wash-Dry-Press (₱45.00/kg)</option>
                  <option value="Dry Clean">Dry Clean (₱100.00/kg)</option>
                  <option value="Ironing Only">Ironing Only (₱25.00/kg)</option>
                </select>
              </div>

              {/* Weight & Extra charges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={formWeight}
                    onChange={(e) => setFormWeight(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Extra Charges (₱)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formExtraPrice}
                    onChange={(e) => setFormExtraPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="E.g., separate whites, wool garments, hangers requested..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500/50 resize-none"
                />
              </div>

              {/* Pricing breakdown summary */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Cost:</span>
                  <span>₱{priceCalculations.basePrice.toFixed(2)}</span>
                </div>
                {formExtraPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Extra Option:</span>
                    <span>+ ₱{formExtraPrice.toFixed(2)}</span>
                  </div>
                )}
                {priceCalculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>10% Loyalty Discount:</span>
                    <span>- ₱{priceCalculations.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white border-t border-slate-800/60 pt-1.5 mt-1">
                  <span>Grand Total:</span>
                  <span className="text-sky-400">₱{priceCalculations.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition shadow-lg shadow-sky-500/10"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewOrderOpen(false)}
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
