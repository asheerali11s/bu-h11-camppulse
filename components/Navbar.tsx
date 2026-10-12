'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { AuthModal } from '@/components/AuthModal';
import {
  Compass,
  Calendar,
  Building2,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Volume2,
  MessageSquare,
  GitBranch,
  User,
  LogOut,
  LogIn,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, isDeveloper, isHod, isSocietyAdmin, switchRole } = useUserRole();
  const {
    currentUser,
    announcements,
    githubConfig,
    triggerGitHubSync,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.active);

  const roleLabels: Record<UserRole, { label: string; icon: string; badgeClass: string }> = {
    student: {
      label: 'Student',
      icon: '🎓',
      badgeClass: 'bg-navy-800 text-slate-200 border-navy-700',
    },
    society_admin: {
      label: 'Society Head',
      icon: '🎪',
      badgeClass: 'bg-gold-500/10 text-gold-300 border-gold-500/30',
    },
    hod: {
      label: 'Department HOD',
      icon: '🏛️',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    developer: {
      label: 'System Admin',
      icon: '⚡',
      badgeClass: 'bg-navy-700 text-gold-400 border-gold-400/50',
    },
  };

  const currentRoleMeta = roleLabels[role] || roleLabels.student;
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-navy-950/90 border-b border-navy-800 text-slate-100 transition-colors">
        {/* Top Gold Trim Bar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-navy-800 via-gold-500 to-navy-800" />

        {/* Top Flash Announcement Ticker if announcements exist */}
        {activeAnnouncements.length > 0 && (
          <div className="bg-navy-900 border-b border-navy-800 text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden">
            <div className="flex items-center space-x-2 shrink-0 pr-3 font-semibold text-gold-400">
              <Volume2 className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span className="uppercase tracking-wider text-[10px] font-mono bg-gold-500/10 px-1.5 py-0.5 rounded border border-gold-500/30">
                Campus Bulletin
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
            {/* Logo & Tagline */}
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
                    Bahria University • Event & Society Hub
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive('/')
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <Compass className="w-4 h-4 text-gold-400" />
                <span>Campus Radar</span>
              </Link>

              {/* WhatsApp-Style Chat Link */}
              <Link
                href="/chat"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isActive('/chat')
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-gold-400" />
                <span>Society Chats</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-gold-500 text-navy-950 font-black">
                  LIVE
                </span>
              </Link>

              {/* Society Admin Mode Link */}
              {(isSocietyAdmin || isDeveloper) && (
                <Link
                  href="/dashboard/society"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isActive('/dashboard/society')
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-850'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-gold-400" />
                  <span>Society Dashboard</span>
                </Link>
              )}

              {/* Department (HOD) Mode Link */}
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

              {/* Developer Mode Link */}
              {isDeveloper && (
                <Link
                  href="/dashboard/dev"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                    isActive('/dashboard/dev')
                      ? 'bg-navy-800 text-gold-300 border-gold-500 shadow-gold'
                      : 'text-gold-400 bg-navy-900 border-gold-500/30 hover:bg-navy-850'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-gold-400" />
                  <span>System Console</span>
                </Link>
              )}
            </nav>

            {/* Right Action: GitHub Sync Pill, User Badge, and Login/Switch */}
            <div className="hidden md:flex items-center space-x-3">
              {/* GitHub Database Status Button */}
              <button
                onClick={() => triggerGitHubSync()}
                className="px-2.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-850 border border-navy-700 hover:border-gold-500/40 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5 transition-colors"
                title="Real-time GitHub Database Sync"
              >
                <GitBranch className="w-3.5 h-3.5 text-gold-400" />
                <span>DB: {githubConfig.last_commit_hash || 'synced'}</span>
              </button>

              {/* Role Mode Simulator Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-2 transition-all ${currentRoleMeta.badgeClass}`}
                  title="Switch active role to test different RBAC modes"
                >
                  <span>{currentRoleMeta.icon}</span>
                  <span>{currentRoleMeta.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {roleDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-navy-900 border border-gold-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setRoleDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-navy-800 mb-1">
                      <p className="text-xs font-bold text-white">RBAC Mode Simulator</p>
                      <p className="text-[11px] text-slate-400">
                        Preview interface permissions across all campus modes:
                      </p>
                    </div>

                    {(Object.keys(roleLabels) as UserRole[]).map((rKey) => {
                      const item = roleLabels[rKey];
                      const selected = role === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            switchRole(rKey);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            selected
                              ? 'bg-navy-800 text-gold-400 border border-gold-500/30'
                              : 'text-slate-300 hover:bg-navy-850 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          {selected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* User Profile Pill & Login Trigger */}
              {currentUser ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-navy-900 border border-navy-700 hover:border-gold-500/40 transition-colors text-left group"
                  title="Click to view profile or sign in with another Enrollment ID"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&q=80'}
                    alt=""
                    className="w-8 h-8 rounded-full border border-gold-500/40 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-gold-300 transition-colors truncate max-w-[110px]">
                      {currentUser.full_name?.split(' ')[0] || 'Student'}
                    </span>
                    <span className="text-[10px] text-gold-400 font-mono truncate max-w-[110px]">
                      {currentUser.enrollment_id}
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-gold-500/20 border border-gold-500/50 text-gold-300 hover:bg-gold-500/30 text-xs font-bold transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-1.5 rounded-lg border text-xs bg-navy-900 border-gold-500/30 text-gold-400"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-800 bg-navy-900 px-4 pt-2 pb-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
            >
              🧭 Campus Radar
            </Link>

            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-gold-300 hover:bg-navy-850"
            >
              💬 WhatsApp-Style Society Chats
            </Link>

            {(isSocietyAdmin || isDeveloper) && (
              <Link
                href="/dashboard/society"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
              >
                🎪 Society Dashboard
              </Link>
            )}

            {(isHod || isDeveloper) && (
              <Link
                href="/dashboard/dept"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-navy-850"
              >
                🏛️ HOD Approval Queue
              </Link>
            )}

            {isDeveloper && (
              <Link
                href="/dashboard/dev"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-gold-400 hover:bg-navy-850"
              >
                ⚡ System Console
              </Link>
            )}

            <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="px-3 py-2 rounded-lg bg-navy-950 border border-gold-500/30 text-xs font-bold text-gold-400 w-full text-center"
              >
                Sign In / Switch Enrollment Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
