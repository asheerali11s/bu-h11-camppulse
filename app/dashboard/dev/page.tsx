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
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  GitBranch,
  Server,
  Zap,
  Download,
  Key,
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
    githubConfig,
    updateGitHubConfig,
    triggerGitHubSync,
    channels,
    messages,
  } = useApp();

  const [searchUser, setSearchUser] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [isPurging, setIsPurging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // GitHub Sync form state
  const [gitOwner, setGitOwner] = useState(githubConfig.owner);
  const [gitRepo, setGitRepo] = useState(githubConfig.repo);
  const [gitBranch, setGitBranch] = useState(githubConfig.branch);
  const [gitToken, setGitToken] = useState(githubConfig.token || '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole);
    showToast(`Role updated to [${newRole.toUpperCase()}]`);
  };

  const handlePurgeCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      purgeCache();
      setIsPurging(false);
      showToast('Cache purged! Slate reset.');
    }, 600);
  };

  const handleSaveAndSyncGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    updateGitHubConfig({
      owner: gitOwner.trim(),
      repo: gitRepo.trim(),
      branch: gitBranch.trim(),
      token: gitToken.trim(),
    });

    const res = await triggerGitHubSync();
    setIsSyncing(false);
    showToast(res.message);
  };

  const handleDownloadSnapshot = () => {
    const data = {
      _metadata: {
        export_time: new Date().toISOString(),
        institution: 'Bahria University',
        engine: 'CampPulse Online Database',
      },
      users: usersList,
      events,
      societies,
      channels,
      messages,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camppulse_database_snapshot_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database snapshot JSON downloaded.');
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.enrollment_id.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.department.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(
    (log) => filterSeverity === 'all' || log.severity === filterSeverity
  );

  if (!isDeveloper) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-navy-900 border border-gold-500/30 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-serif">
              Root Console Privilege Required
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              The System Console manages the online database, GitHub real-time sync, and RBAC promotion.
              Your active role is <strong>{role.toUpperCase()}</strong>.
            </p>
          </div>

          <button
            onClick={() => switchRole('developer')}
            className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all"
          >
            <span>Elevate to System Administrator</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-navy-900 text-gold-300 border border-gold-500/40 text-xs font-bold shadow-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Header */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold-500/10 text-gold-300 border border-gold-500/30 flex items-center space-x-1.5">
                <Server className="w-3 h-3 text-gold-400" />
                <span>CENTRAL IT OPERATIONS CONSOLE</span>
              </span>
              <span className="text-xs font-mono text-slate-400">• Bahria University</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Platform &amp; Online Database Administration
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Real-time GitHub sync engine, enrollment role promotion, and security audit logging.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleDownloadSnapshot}
              className="px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-gold-400" />
              <span>Export JSON DB</span>
            </button>

            <button
              onClick={handlePurgeCache}
              disabled={isPurging}
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
              <span>{isPurging ? 'Purging...' : 'Reset Slate'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* GITHUB REAL-TIME DATABASE SYNC CONFIGURATION SECTION */}
        <section className="rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-bold text-white">
                  GitHub Real-Time Database Sync Engine
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically serializes and commits verified campus events, profiles, and chats to GitHub.
              </p>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-slate-400">Sync Status:</span>
              <span className="px-2.5 py-1 rounded bg-navy-950 text-gold-400 border border-gold-500/30 uppercase font-bold">
                {githubConfig.sync_status}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveAndSyncGitHub} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GitHub Owner / Org *
              </label>
              <input
                type="text"
                required
                value={gitOwner}
                onChange={(e) => setGitOwner(e.target.value)}
                placeholder="e.g. bahria-campus"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Repository Name *
              </label>
              <input
                type="text"
                required
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                placeholder="e.g. camppulse-db"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Branch
              </label>
              <input
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Personal Access Token (PAT)
              </label>
              <input
                type="password"
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                placeholder="ghp_••••••••••••"
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Last synced commit: <strong className="text-gold-300 font-mono">{githubConfig.last_commit_hash || 'None'}</strong>
                {githubConfig.last_synced && ` at ${new Date(githubConfig.last_synced).toLocaleTimeString()}`}
              </span>

              <button
                type="submit"
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all flex items-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Committing to GitHub...' : 'Commit Live Database to GitHub'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* USER MANAGEMENT & ROLE PROMOTION SECTION */}
        <section className="rounded-3xl bg-navy-900 border border-gold-500/30 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gold-400" />
                <h2 className="text-lg font-bold text-white">
                  Verified Campus Directory &amp; Role Promotion
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Search verified students by Enrollment ID or department to assign leadership roles.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search enrollment ID or name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-navy-950 border border-navy-750 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-navy-950/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-navy-800">
                <tr>
                  <th className="px-6 py-3.5">Verified Profile</th>
                  <th className="px-6 py-3.5">Enrollment ID</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Current Role</th>
                  <th className="px-6 py-3.5">Reassign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&q=80'}
                          alt=""
                          className="w-8 h-8 rounded-full border border-gold-500/30 object-cover"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{u.full_name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gold-400 font-bold">
                      {u.enrollment_id}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">
                      {u.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-navy-950 text-gold-300 border border-gold-500/20">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-xs font-semibold text-slate-200 focus:outline-none focus:border-gold-500 cursor-pointer"
                      >
                        <option value="student">🎓 student</option>
                        <option value="society_admin">🎪 society_admin</option>
                        <option value="hod">🏛️ hod</option>
                        <option value="developer">⚡ developer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SYSTEM AUDIT LOG VIEWER */}
        <section className="rounded-3xl bg-navy-900 border border-gold-500/30 p-6 space-y-4 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-bold text-white">System Security &amp; Audit Logs</h2>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Filter:</span>
              {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded-lg uppercase font-mono font-semibold transition-colors ${
                    filterSeverity === sev
                      ? 'bg-gold-500 text-navy-950'
                      : 'bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-navy-950 border border-navy-800 p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2.5">
            {filteredLogs.map((log) => {
              const severityColor =
                log.severity === 'critical'
                  ? 'text-rose-400'
                  : log.severity === 'warning'
                  ? 'text-amber-400'
                  : 'text-gold-400';

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-start sm:items-center space-x-2">
                    <span className={`font-bold ${severityColor}`}>[{log.severity.toUpperCase()}]</span>
                    <span className="text-gold-300 font-semibold">{log.action}:</span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 text-[11px] text-slate-500">
                    <span>{log.user_enrollment || log.user_email}</span>
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
