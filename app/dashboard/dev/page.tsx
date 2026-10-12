'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  ShieldAlert,
  Terminal,
  Users,
  Database,
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Lock,
  Radio,
  Server,
  Zap,
} from 'lucide-react';

export default function DeveloperConsolePage() {
  const { role, isDeveloper, switchRole } = useUserRole();
  const {
    usersList,
    updateUserRole,
    auditLogs,
    purgeCache,
    events,
    societies,
    announcements,
    isLiveSupabase,
  } = useApp();

  const [searchUser, setSearchUser] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [isPurging, setIsPurging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
    showToast(`Role updated for user to [${newRole.toUpperCase()}]`);
  };

  const handlePurgeCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      purgeCache();
      setIsPurging(false);
      showToast('Cache purged! Seed data reloaded.');
    }, 600);
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (log) => filterSeverity === 'all' || log.severity === filterSeverity
  );

  // Security gate if not in developer mode
  if (!isDeveloper) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-fuchsia-500/40 shadow-2xl shadow-fuchsia-950/40 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center mx-auto text-fuchsia-400">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">
              Access Denied: Root Privilege Required
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              The Developer Console provides raw database control and RBAC promotion. Your current
              role is <strong>{role.toUpperCase()}</strong>.
            </p>
          </div>

          <button
            onClick={() => switchRole('developer')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Elevate Session to Developer Mode</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-fuchsia-600 text-white text-xs font-bold shadow-2xl border border-fuchsia-400 flex items-center space-x-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cyber Control Header */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-fuchsia-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center space-x-1.5">
                <Radio className="w-3 h-3 animate-ping text-fuchsia-400" />
                <span>ROOT SYSTEM CONSOLE</span>
              </span>
              <span className="text-xs font-mono text-slate-400">• v2.4-PROD</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Platform & RBAC Administration
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Super Admin telemetry, role promotion table, database cache override, and real-time
              system audit trails.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handlePurgeCache}
              disabled={isPurging}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-rose-950/30"
              title="Purge local storage state and reload baseline seed data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
              <span>{isPurging ? 'Purging...' : 'Purge DB Cache'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* System Telemetry Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Database Engine</span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-white mt-1">
              {isLiveSupabase ? 'Supabase Postgres' : 'Postgres (Local Hybrid)'}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>RLS Policies Enforced</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Campus Events</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{events.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {events.filter((e) => e.approved_by_hod).length} Approved / {events.filter((e) => !e.approved_by_hod).length} Pending
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Registered Societies</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1">{societies.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {societies.filter((s) => s.is_recruiting).length} Recruiting
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Audit Trail Entries</span>
              <Terminal className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">{auditLogs.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Full Security Auditing</div>
          </div>
        </div>

        {/* USER MANAGEMENT & ROLE PROMOTION SECTION */}
        <section className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">
                  User Management & RBAC Role Promotion
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Promote or reassign user roles across student, society_admin, hod, and developer.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search user email or name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">User Profile</th>
                  <th className="px-6 py-3.5">Current Role</th>
                  <th className="px-6 py-3.5">Promote / Reassign Role</th>
                  <th className="px-6 py-3.5">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            u.avatar_url ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&q=80'
                          }
                          alt=""
                          className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                        />
                        <div>
                          <div className="font-bold text-white">{u.full_name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase ${
                          u.role === 'developer'
                            ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                            : u.role === 'hod'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : u.role === 'society_admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="student">🎓 student</option>
                        <option value="society_admin">🎪 society_admin</option>
                        <option value="hod">🏛️ hod</option>
                        <option value="developer">⚡ developer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SYSTEM AUDIT LOG VIEWER */}
        <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">System Security & Audit Log Viewer</h2>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Filter:</span>
              {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-mono font-semibold transition-colors ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-black/60 border border-slate-800 p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2.5">
            {filteredLogs.map((log) => {
              const severityColor =
                log.severity === 'critical'
                  ? 'text-rose-400'
                  : log.severity === 'warning'
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center space-x-2">
                    <span className={`font-bold ${severityColor}`}>[{log.severity.toUpperCase()}]</span>
                    <span className="text-fuchsia-300 font-semibold">{log.action}:</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 text-[11px] text-slate-500">
                    <span>by {log.user_email}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
