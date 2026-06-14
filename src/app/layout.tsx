import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import DashboardShell from '@/components/DashboardShell';
import { AuthProvider } from '@/context/AuthContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'WashOps | Laundry Management System',
  description: 'A premium, high-performance SaaS dashboard for tracking laundry operations, analytics, CRM, and active machines.',
  openGraph: {
    title: 'WashOps | Laundry Management System',
    description: 'A premium, high-performance SaaS dashboard for tracking laundry operations, financials, CRM, and machinery cycles.',
    url: '/',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 bg-[#070a13] font-sans" suppressHydrationWarning>
        {/* Animated Fluid Mesh Background */}
        <div className="mesh-bg">
          <div className="mesh-blob blob-1"></div>
          <div className="mesh-blob blob-2"></div>
          <div className="mesh-blob blob-3"></div>
        </div>

        {/* Subtle Grid overlay */}
        <div className="grid-bg"></div>

        {/* Workspace Shell */}
        <AuthProvider>
          <DashboardShell>{children}</DashboardShell>
        </AuthProvider>
      </body>
    </html>
  );
}
