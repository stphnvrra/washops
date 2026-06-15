'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLaundry, LaundryProvider } from '@/context/LaundryContext';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function ToastContainer() {
  const { toasts, dismissToast } = useLaundry();

  const iconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const borderMap = {
    success: 'border-emerald-500/20 bg-emerald-950/35 text-emerald-100',
    error: 'border-rose-500/20 bg-rose-950/35 text-rose-100',
    warning: 'border-amber-500/20 bg-amber-950/35 text-amber-100',
    info: 'border-sky-500/20 bg-sky-950/35 text-sky-100',
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg pointer-events-auto animate-fade-in ${
            borderMap[toast.type]
          }`}
          role="alert"
        >
          <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>
          <div className="flex-1 text-sm font-medium leading-5">{toast.message}</div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition p-0.5 rounded-lg hover:bg-slate-800/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function InnerShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { loading: laundryLoading } = useLaundry();
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!authLoading && !user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, authLoading, isPublicRoute, router]);

  // Public routing components - render immediately without shell or checks
  if (isPublicRoute) {
    return <main className="min-h-screen w-full relative z-10">{children}</main>;
  }

  // Session verification stage
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070a13]">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Verifying session credentials...</p>
      </div>
    );
  }

  // Redirect stage (not logged in, page is locked)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070a13]">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Redirecting to login portal...</p>
      </div>
    );
  }

  // Authenticated section shell
  return (
    <div className="min-h-screen flex flex-col">
      {/* Collapsible Sidebar */}
      <Sidebar onToggleCollapse={(c) => setCollapsed(c)} />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          collapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          {laundryLoading ? (
            <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-400">Loading business ledger...</p>
            </div>
          ) : (
            <div>{children}</div>
          )}
        </main>
      </div>

      {/* Toast Alert Popups */}
      <ToastContainer />
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <LaundryProvider>
      <InnerShell>{children}</InnerShell>
    </LaundryProvider>
  );
}
