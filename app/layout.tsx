import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CampPulse - Bahria University Event & Society Hub',
  description: 'Verified collegiate network, interactive campus radar, society management, and WhatsApp-style group chats.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-navy-950 text-slate-100 antialiased selection:bg-gold-500 selection:text-navy-950">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-navy-800 bg-navy-950/90 py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-gold-400">BU</span>
                <span className="font-bold text-white">CampPulse</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">Bahria University Verified Collegiate Network</span>
              </div>
              <p className="text-slate-400">
                Online Database • Real-Time GitHub Synchronization • OpenStreetMap Radar
              </p>
              <div className="flex items-center space-x-3 text-gold-400 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping inline-block" />
                <span>Collegiate Portal Online</span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
