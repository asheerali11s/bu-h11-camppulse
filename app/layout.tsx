import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { AuthGate } from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'BU (Bahria University H-11 CAMPUS) - Society & Event Hub',
  description: 'Verified collegiate network, interactive campus floor radar, society management, and WhatsApp-style group chats for BU H-11 Islamabad.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-[#0f2b5c] selection:text-white">
        <AppProvider>
          <AuthGate>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white py-7 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-black text-[#0f2b5c] text-sm">BU</span>
                  <span className="font-semibold text-slate-900">Bahria University (H-11 Campus)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">Plot 83, Sector H-11/4 Islamabad</span>
                </div>
                <p className="text-slate-500">
                  Campus Society &amp; Event Management Portal • Real-Time Synchronization
                </p>
                <div className="flex items-center space-x-2 text-slate-600 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Portal Active</span>
                </div>
              </div>
            </footer>
          </AuthGate>
        </AppProvider>
      </body>
    </html>
  );
}
