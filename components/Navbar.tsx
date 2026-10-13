'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { AuthModal } from '@/components/AuthModal';
import {
  Compass,
  Calendar,
  Building2,
  ShieldAlert,
  Menu,
  X,
  Volume2,
  MessageSquare,
  GitBranch,
  User,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Key,
  Lock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isDeveloper, isHod, isSocietyAdmin } = useUserRole();
  const {
    currentUser,
    announcements,
    githubConfig,
    triggerGitHubSync,
    unlockAdminPrivilege,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminUnlockOpen, setAdminUnlockOpen] = useState(false);
  const [unlockKey, setUnlockKey] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const activeAnnouncements = announcements.filter((a) => a.active);
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-navy-950/95 border-b border-navy-800 text-slate-100 transition-colors">
        {/* Top Gold Trim Bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-navy-800 via-gold-500 to-navy-800" />

        {/* Top Announcement Ticker */}
        {activeAnnouncements.length > 0 && (
          <div className="bg-navy-900 border-b border-navy-800 text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden">
            <div className="flex items-center space-x-2 shrink-0 pr-3 font-semibold text-gold-400">
              <Volume2 className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span className="uppercase tracking-wider text-[10px] font-mono bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/30">
                BU H-11 Notice
              </span>
            </div>
            <div className="overflow-hidden relative w-full">
              <div className="whitespace-nowrap animate-marquee flex items-center space-x-8 text-slate-300 text-xs">
                {activeAnnouncements.map((ann) => (
                  <span key={ann.id} className="inline-flex items-center space-x-2">
                    <span className="font-bold text-gold-300">[{ann.society_name}]:</span>
                    <span>{ann.message}</span>
                    <span className="text-slate-600 mx-2">•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border border-gold-500/40 flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
                  <span className="font-serif font-black text-gold-400 text-lg">BU</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-xl tracking-tight text-white">
                      Camp<span className="text-gold-400 font-serif">Pulse</span>
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                    Bahria University H-11 Campus
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive('/')
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <Compass className="w-4 h-4 text-gold-400" />
                <span>Events &amp; Posts Feed</span>
              </Link>

              {/* Chat Channel */}
              <Link
                href="/chat"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive('/chat')
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-gold-400" />
                <span>APP Updates &amp; Chat</span>
              </Link>

              {/* Society Head Post Event Link (Only if user has society_admin role or developer) */}
              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isActive('/dashboard/society')
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-gold-400" />
                  <span>Post Event</span>
                </Link>
              )}

              {/* HOD Review Link (Only if HOD or Developer) */}
              {(isHod || isDeveloper) && (
                <Link
                  href="/dashboard/dept"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isActive('/dashboard/dept')
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-gold-400" />
                  <span>HOD Queue</span>
                </Link>
              )}

              {/* STRICT RESTRICTION: ONLY DEVELOPER / ADMIN CAN SEE AND ACCESS ADMIN PORTAL */}
              {isDeveloper && (
                <Link
                  href="/dashboard/dev"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                    isActive('/dashboard/dev')
                      ? 'bg-gold-500 text-navy-950 border-gold-400 font-black shadow-gold'
                      : 'text-gold-400 bg-navy-900 border-gold-500/40 hover:bg-navy-850'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>⚡ Admin Portal</span>
                </Link>
              )}
            </nav>

            {/* Right Action: GitHub Sync Pill, User Info & Logout */}
            <div className="hidden md:flex items-center space-x-3">
              {/* GitHub Status */}
              <button
                onClick={() => triggerGitHubSync()}
                className="px-2.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-850 border border-navy-750 hover:border-gold-500/40 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5 transition-colors"
                title="GitHub Database Sync"
              >
                <GitBranch className="w-3.5 h-3.5 text-gold-400" />
                <span>DB: {githubConfig.last_commit_hash || 'synced'}</span>
              </button>

              {/* Current User Pill */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-navy-900 border border-navy-750 text-left">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full border border-gold-500/40 object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                          {currentUser.full_name?.split(' ')[0] || 'Student'}
                        </span>
                        {currentUser.is_verified ? (
                          <span title="Verified Account">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </span>
                        ) : (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gold-400 font-mono truncate max-w-[120px]">
                        {currentUser.enrollment_id}
                      </span>
                    </div>
                  </div>

                  {/* Unlock Admin button if not yet developer */}
                  {!isDeveloper && (
                    <button
                      onClick={() => setAdminUnlockOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-navy-900 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[11px] font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                      title="Platform Owner Root Admin Unlock"
                    >
                      <Key className="w-3.5 h-3.5 text-gold-400" />
                      <span className="hidden lg:inline">Unlock Admin</span>
                    </button>
                  )}

                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl bg-navy-900 hover:bg-rose-950/60 border border-navy-750 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-black transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-800 bg-navy-900 px-4 pt-2 pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
            >
              🧭 Events &amp; Posts Feed
            </Link>

            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-gold-300 hover:bg-navy-850"
            >
              💬 APP Updates &amp; Chat
            </Link>

            {(isSocietyAdmin || isDeveloper) && (
              <Link
                href="/dashboard/society"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
              >
                🎪 Post Event
              </Link>
            )}

            {(isHod || isDeveloper) && (
              <Link
                href="/dashboard/dept"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
              >
                🏛️ HOD Review Queue
              </Link>
            )}

            {isDeveloper && (
              <Link
                href="/dashboard/dev"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-gold-400 hover:bg-navy-850"
              >
                ⚡ Admin Portal
              </Link>
            )}

            {currentUser && !isDeveloper && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminUnlockOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gold-400 hover:bg-navy-850 flex items-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>🔑 Platform Owner Admin Unlock</span>
              </button>
            )}

            <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
              {currentUser ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-950/60 border border-rose-800 text-xs font-bold text-rose-300 w-full text-center"
                >
                  Sign Out ({currentUser.enrollment_id})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-gold-500 text-navy-950 text-xs font-black w-full text-center"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Platform Owner Master Key Unlock Modal */}
      {adminUnlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-navy-900 border border-gold-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-gold-400" />
                <h3 className="text-base font-bold text-white">Platform Owner Unlock</h3>
              </div>
              <button
                onClick={() => {
                  setAdminUnlockOpen(false);
                  setUnlockError(null);
                  setUnlockKey('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter the BU H-11 Platform Owner Master Key to elevate this session ({currentUser?.enrollment_id || 'guest'}) to Root Developer/Admin privileges.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUnlockError(null);
                const res = unlockAdminPrivilege(unlockKey);
                if (res.success) {
                  setAdminUnlockOpen(false);
                  setUnlockKey('');
                } else {
                  setUnlockError(res.message);
                }
              }}
              className="space-y-3"
            >
              {unlockError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                  {unlockError}
                </div>
              )}
              <input
                type="password"
                required
                autoFocus
                placeholder="Admin Master Key"
                value={unlockKey}
                onChange={(e) => setUnlockKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono text-center"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all"
              >
                Elevate to Platform Owner
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
