'use client';

import React from 'react';
import { useLaundry } from '@/context/LaundryContext';
import {
  TrendingUp,
  AlertTriangle,
  Shirt,
  Cpu,
  Coins,
  ArrowUpRight,
  Plus,
  Clock,
  PackageCheck,
  Package2,
  CalendarCheck
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { orders, inventory, machines } = useLaundry();

  // 1. Calculations for Stats Cards
  const activeOrders = orders.filter(o => o.orderStatus !== 'Completed');
  const activeOrdersCount = activeOrders.length;

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const runningMachines = machines.filter(m => m.status === 'Running').length;
  const totalMachines = machines.length;

  const lowStockItems = inventory.filter(item => item.quantity <= item.threshold);
  const lowStockCount = lowStockItems.length;

  // 2. Data processing for Area Chart (Sales Trend)
  // Group orders by date
  const salesByDate: { [date: string]: number } = {};
  orders.forEach(o => {
    const date = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    salesByDate[date] = (salesByDate[date] || 0) + o.totalPrice;
  });

  const chartData = Object.entries(salesByDate)
    .map(([date, amount]) => ({ date, Amount: Number(amount.toFixed(2)) }))
    .reverse(); // Match chronological order

  // Fallback if no order history
  const salesChartData = chartData.length > 0 ? chartData : [
    { date: 'Jun 10', Amount: 297.75 },
    { date: 'Jun 11', Amount: 590.00 },
    { date: 'Jun 12', Amount: 175.00 },
    { date: 'Jun 13', Amount: 1195.00 },
  ];

  // 3. Data processing for Pie Chart (Service Distribution)
  const serviceDistribution: { [key: string]: number } = {};
  orders.forEach(o => {
    serviceDistribution[o.serviceType] = (serviceDistribution[o.serviceType] || 0) + 1;
  });

  const pieColors = ['#38bdf8', '#0d9488', '#818cf8', '#fb7185'];
  const pieData = Object.entries(serviceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const servicePieData = pieData.length > 0 ? pieData : [
    { name: 'Wash-Dry-Fold', value: 4 },
    { name: 'Wash-Dry-Press', value: 2 },
    { name: 'Dry Clean', value: 1 },
  ];

  // 4. Quick Alerts (Pended Invoices, Low Stock, etc.)
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'Unpaid').slice(0, 3);
  const activeAlertsCount = lowStockCount + unpaidOrders.length;

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Operations Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and laundry store workflows at a glance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/orders?new=true"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white transition shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </Link>
          <Link
            href="/crm?new=true"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 transition"
          >
            <span>Register Customer</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Orders */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</p>
              <h3 className="text-3xl font-bold text-white mt-2">{activeOrdersCount} Orders</h3>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/15">
              <Shirt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-4">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Currently in washing/folding</span>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gross Income</p>
              <h3 className="text-3xl font-bold text-white mt-2">₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Aggregate paid transactions</span>
          </div>
        </div>

        {/* Card 3: Machines */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Machinery Load</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {runningMachines}/{totalMachines}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-4">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-1"></span>
            <span>Running active wash/dry cycles</span>
          </div>
        </div>

        {/* Card 4: Inventory Alerts */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inventory Status</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {lowStockCount} Warnings
              </h3>
            </div>
            <div className={`p-3 rounded-xl border ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/15 animate-pulse' : 'bg-teal-500/10 text-teal-400 border-teal-500/15'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-4">
            {lowStockCount > 0 ? (
              <span className="text-amber-400 font-semibold">Low detergent or softeners</span>
            ) : (
              <span className="text-teal-400 font-semibold">All supplies restocked</span>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2/3 width) */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Income Trend Lines</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily gross earnings from completed orders.</p>
            </div>
            <Link href="/finance" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5">
              <span>View Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                  formatter={(value) => [`₱${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="Amount" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Chart (1/3 width) */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-base font-bold text-white">Service Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ratio of orders across service types.</p>
          </div>
          <div className="flex-1 w-full h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {servicePieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }}></span>
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alerts & Quick Tasks Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Operational Warnings */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Operational Warnings ({activeAlertsCount})</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">Action Required</span>
          </div>
          <div className="space-y-3 mt-4 flex-1">
            {lowStockItems.length === 0 && unpaidOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-sm">
                <PackageCheck className="w-8 h-8 mb-2" />
                <p>System clean. No pending alerts.</p>
              </div>
            )}

            {/* Low Inventory items */}
            {lowStockItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-900/30">
                <div className="flex items-center gap-3">
                  <Package2 className="w-4 h-4 text-amber-400" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Remaining: {item.quantity} {item.unit}</p>
                  </div>
                </div>
                <Link href="/inventory" className="text-[10px] font-bold text-sky-400 hover:text-sky-300">Restock</Link>
              </div>
            ))}

            {/* Unpaid orders invoices */}
            {unpaidOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <div className="flex items-center gap-3">
                  <Coins className="w-4 h-4 text-slate-400" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{order.customerName}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Invoice: {order.orderNumber} • ₱{order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <Link href="/orders" className="text-[10px] font-bold text-sky-400 hover:text-sky-300">Collect</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Store Calendar & Bills Due */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-teal-400" />
              <span>Upcoming Bills & Actions</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-slate-700">June Schedule</span>
          </div>
          <div className="space-y-3 mt-4 flex-1">
            {/* Rent Bill mock */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Shop Commercial Space Rent</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Due: June 30 • Amount: ₱12,000.00</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold">Planned</span>
            </div>

            {/* Utility Dues mock */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-900/30">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Broadband Internet Subscription</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Due: June 20 • Amount: ₱1,500.00</p>
              </div>
              <Link href="/finance" className="text-[10px] font-bold text-rose-400 hover:text-rose-300">Pay Dues</Link>
            </div>

            {/* Employee Salary mock */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
              <div>
                <h5 className="text-xs font-bold text-slate-200">Staff Payroll Disbursement</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Scheduled: June 15 • Amount: ₱7,500.00</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
