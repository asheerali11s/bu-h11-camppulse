'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
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
  BellRing,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, role, isDeveloper, isHod, isSocietyAdmin, switchRole } = useUserRole();
  const { announcements } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const activeAnnouncements = announcements.filter((a) => a.active);

  const roleLabels: Record<UserRole, { label: string; icon: string; badgeClass: string }> = {
    student: {
      label: 'Student (Normal)',
      icon: '🎓',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    society_admin: {
      label: 'Society Admin',
      icon: '🎪',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    hod: {
      label: 'Department HOD',
      icon: '🏛️',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    developer: {
      label: 'Developer (Super Admin)',
      icon: '⚡',
      badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30 animate-pulse',
    },
  };

  const currentRoleMeta = roleLabels[role] || roleLabels.student;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-900/90 border-b border-slate-800 text-slate-100 transition-colors">
      {/* Top Flash Announcement Ticker if announcements exist */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-b border-indigo-800/40 text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center space-x-2 shrink-0 pr-3 font-semibold text-amber-300">
            <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="uppercase tracking-wider text-[11px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30">
              Campus Flash
            </span>
          </div>
          <div className="overflow-hidden relative w-full">
            <div className="whitespace-nowrap animate-marquee flex items-center space-x-8 text-slate-200">
              {activeAnnouncements.map((ann) => (
                <span key={ann.id} className="inline-flex items-center space-x-2">
                  <span className="font-semibold text-indigo-300">[{ann.society_name}]:</span>
                  <span>{ann.message}</span>
                  <span className="text-slate-500 mx-2">•</span>
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
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <span className="text-xl">📡</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                    CampPulse
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Campus Event & Society Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Dynamic RBAC Display) */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                isActive('/')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Campus Feed</span>
            </Link>

            {/* Society Admin Mode Link */}
            {(isSocietyAdmin || isDeveloper) && (
              <Link
                href="/dashboard/society"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  isActive('/dashboard/society')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Society Dashboard</span>
              </Link>
            )}

            {/* Department (HOD) Mode Link */}
            {(isHod || isDeveloper) && (
              <Link
                href="/dashboard/dept"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  isActive('/dashboard/dept')
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>HOD Queue</span>
              </Link>
            )}

            {/* Developer Mode Link (Visible ONLY to Developer role) */}
            {isDeveloper && (
              <Link
                href="/dashboard/dev"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 border shadow-sm ${
                  isActive('/dashboard/dev')
                    ? 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50 shadow-fuchsia-500/20'
                    : 'text-fuchsia-300 bg-fuchsia-950/30 border-fuchsia-500/30 hover:bg-fuchsia-900/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-fuchsia-400" />
                <span>⚡ Dev Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action: Role Simulator & User Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Interactive Role Switcher Modal / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 transition-all ${currentRoleMeta.badgeClass}`}
                title="Switch active role to test different RBAC modes"
              >
                <span>{currentRoleMeta.icon}</span>
                <span className="capitalize">{currentRoleMeta.label}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-300">RBAC Mode Simulator</p>
                    <p className="text-[11px] text-slate-500">
                      Switch active mode to preview UI & permissions instantly:
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
                            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* User Avatar & Name */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&q=80'}
                alt={user.full_name}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {user.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`p-1.5 rounded-lg border text-xs flex items-center ${currentRoleMeta.badgeClass}`}
            >
              <span>{currentRoleMeta.icon}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            🧭 Campus Feed
          </Link>

          {(isSocietyAdmin || isDeveloper) && (
            <Link
              href="/dashboard/society"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-indigo-300 hover:bg-slate-800"
            >
              🎪 Society Dashboard
            </Link>
          )}

          {(isHod || isDeveloper) && (
            <Link
              href="/dashboard/dept"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-300 hover:bg-slate-800"
            >
              🏛️ HOD Approval Queue
            </Link>
          )}

          {isDeveloper && (
            <Link
              href="/dashboard/dev"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-fuchsia-300 hover:bg-slate-800"
            >
              ⚡ Developer Console
            </Link>
          )}

          {/* Role selector inside mobile */}
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2">Switch Active RBAC Mode:</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleLabels) as UserRole[]).map((rKey) => (
                <button
                  key={rKey}
                  onClick={() => {
                    switchRole(rKey);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded text-xs font-medium text-left border ${
                    role === rKey
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {roleLabels[rKey].icon} {roleLabels[rKey].label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
