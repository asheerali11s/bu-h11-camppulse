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
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/95 border-b border-slate-200 text-slate-800 transition-colors">
        {/* Top Trim Bar */}
        <div className="h-[2px] w-full bg-[#0f2b5c]" />

        {/* Top Announcement Ticker */}
        {activeAnnouncements.length > 0 && (
          <div className="bg-slate-100/90 border-b border-slate-200 text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden">
            <div className="flex items-center space-x-2 shrink-0 pr-3 font-semibold text-[#0f2b5c]">
              <Volume2 className="w-3.5 h-3.5 text-[#0f2b5c]" />
              <span className="uppercase tracking-wider text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-700">
                Official Campus Notice
              </span>
            </div>
            <div className="overflow-hidden relative w-full">
              <div className="whitespace-nowrap animate-marquee flex items-center space-x-8 text-slate-700 text-xs font-medium">
                {activeAnnouncements.map((ann) => (
                  <span key={ann.id} className="inline-flex items-center space-x-2">
                    <span className="font-bold text-[#0f2b5c]">[{ann.society_name}]:</span>
                    <span>{ann.message}</span>
                    <span className="text-slate-400 mx-2">•</span>
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
                <div className="w-9 h-9 rounded-xl bg-[#0f2b5c] text-white flex items-center justify-center font-serif font-black text-base shadow-sm group-hover:bg-[#0a1e42] transition-colors">
                  BU
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base tracking-tight text-slate-900">
                      Bahria University
                    </span>
                    <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      H-11
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Campus Event &amp; Society Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive('/')
                    ? 'bg-slate-100 text-[#0f2b5c] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Events Feed</span>
              </Link>

              {/* Chat Channel */}
              <Link
                href="/chat"
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive('/chat')
                    ? 'bg-slate-100 text-[#0f2b5c] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span>Notice Board &amp; Chat</span>
              </Link>

              {/* Society Head Post Event Link */}
              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isActive('/dashboard/society')
                      ? 'bg-slate-100 text-[#0f2b5c] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-slate-500" />
                  <span>Post Event</span>
                </Link>
              )}

              {/* HOD Review Link */}
              {(isHod || isDeveloper) && (
                <Link
                  href="/dashboard/dept"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isActive('/dashboard/dept')
                      ? 'bg-slate-100 text-[#0f2b5c] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>HOD Queue</span>
                </Link>
              )}

              {/* STRICT RESTRICTION: Platform Owner Admin Portal */}
              {isDeveloper && (
                <Link
                  href="/dashboard/dev"
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                    isActive('/dashboard/dev')
                      ? 'bg-[#0f2b5c] text-white shadow-sm font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#0f2b5c]'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#0f2b5c]" />
                  <span>Administrative Console</span>
                </Link>
              )}
            </nav>

            {/* Right Action: Database Status, User Info & Logout */}
            <div className="hidden md:flex items-center space-x-2.5">
              {/* GitHub Status */}
              <button
                onClick={() => triggerGitHubSync()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center space-x-1.5 transition-colors"
                title="Database Cloud Sync Status"
              >
                <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                <span>DB: {githubConfig.last_commit_hash || 'synced'}</span>
              </button>

              {/* Current User Pill */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-white border border-slate-200 shadow-xs text-left">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&q=80'}
                      alt=""
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                          {currentUser.full_name?.split(' ')[0] || 'Student'}
                        </span>
                        {currentUser.is_verified ? (
                          <span title="Verified Account">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </span>
                        ) : (
                          <span className="text-[9px] px-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                            Pending
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                        {currentUser.enrollment_id}
                      </span>
                    </div>
                  </div>

                  {/* Unlock Admin button if not yet developer */}
                  {!isDeveloper && (
                    <button
                      onClick={() => setAdminUnlockOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all flex items-center space-x-1.5 shadow-xs"
                      title="Platform Owner Root Admin Unlock"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden lg:inline">Admin Access</span>
                    </button>
                  )}

                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition-colors shadow-xs"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white text-xs font-semibold shadow-sm transition-colors"
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
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Events Feed
            </Link>

            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Notice Board &amp; Chat
            </Link>

            {(isSocietyAdmin || isDeveloper) && (
              <Link
                href="/dashboard/society"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Post Event
              </Link>
            )}

            {(isHod || isDeveloper) && (
              <Link
                href="/dashboard/dept"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                HOD Review Queue
              </Link>
            )}

            {isDeveloper && (
              <Link
                href="/dashboard/dev"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#0f2b5c] bg-slate-50"
              >
                Administrative Console
              </Link>
            )}

            {currentUser && !isDeveloper && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminUnlockOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Key className="w-4 h-4 text-slate-500" />
                <span>Admin Master Key Access</span>
              </button>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {currentUser ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 w-full text-center"
                >
                  Sign Out ({currentUser.enrollment_id})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-[#0f2b5c] text-white text-xs font-semibold w-full text-center"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#0f2b5c]" />
                <h3 className="text-sm font-bold text-slate-900">Platform Owner Authentication</h3>
              </div>
              <button
                onClick={() => {
                  setAdminUnlockOpen(false);
                  setUnlockError(null);
                  setUnlockKey('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the BU H-11 Platform Owner Master Key to elevate this active session ({currentUser?.enrollment_id || 'guest'}) to Root Administrator mode.
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
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {unlockError}
                </div>
              )}
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Admin Master Key"
                value={unlockKey}
                onChange={(e) => setUnlockKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c] font-mono text-center shadow-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                Verify &amp; Unlock Administrator Mode
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
