'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Shirt,
  CircleDollarSign,
  Cpu,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CreditCard
} from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Laundry Orders', href: '/orders', icon: Shirt },
    { name: 'Finance & Ledger', href: '/finance', icon: CircleDollarSign },
    { name: 'Machine Monitor', href: '/machines', icon: Cpu },
    { name: 'Customer CRM', href: '/crm', icon: Users },
    { name: 'Inventory Stock', href: '/inventory', icon: Package },
    { name: 'Billing & Usage', href: '/billing', icon: CreditCard },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 glass-panel ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent truncate max-w-[160px]">
              <Logo className="w-6 h-6 flex-shrink-0" />
              <span className="truncate">{user?.shopName || 'WashOps'}</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="mx-auto">
              <Logo className="w-6 h-6" />
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium transition duration-200">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out & Tenant Control */}
      <div className="px-4 py-2 border-t border-slate-800/40">
        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-semibold">Sign Out</span>}
        </button>
      </div>

    </aside>
  );
}
