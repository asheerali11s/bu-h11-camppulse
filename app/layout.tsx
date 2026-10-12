import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CampPulse - Campus Event & Society Hub',
  description: 'Real-time visual feed and interactive radar of everything happening on campus today.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">CampPulse</span>
                <span>•</span>
                <span>Campus Event & Society Hub</span>
              </div>
              <p className="text-slate-400">
                Built with Next.js 14 App Router, Supabase PostgreSQL, Leaflet & Tailwind CSS.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Real-time Active</span>
                </span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
