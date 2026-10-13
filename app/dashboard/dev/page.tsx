'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  ShieldAlert,
  Users,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  GitBranch,
  Key,
  ShieldCheck,
  UserCheck,
  UserX,
  PlusCircle,
  X,
  Trash2,
  Calendar,
} from 'lucide-react';

export default function DeveloperConsolePage() {
  const { isDeveloper } = useUserRole();
  const {
    currentUser,
    usersList,
    verifyUser,
    promoteUserRole,
    deleteUser,
    unlockAdminPrivilege,
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
  const [filterVerified, setFilterVerified] = useState<'all' | 'pending' | 'verified'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Master Key unlock modal state
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  // Promote Modal state
  const [elevateUserModal, setElevateUserModal] = useState<{ id: string; name: string; enrollment: string } | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>('society_admin');
  const [assignedSocietyName, setAssignedSocietyName] = useState('');

  // GitHub Sync form state
  const [gitOwner, setGitOwner] = useState(githubConfig.owner);
  const [gitRepo, setGitRepo] = useState(githubConfig.repo);
  const [gitBranch, setGitBranch] = useState(githubConfig.branch);
  const [gitToken, setGitToken] = useState(githubConfig.token || '');
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUnlockMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(null);
    const res = unlockAdminPrivilege(adminKeyInput);
    if (res.success) {
      showToast(res.message);
    } else {
      setKeyError(res.message);
    }
  };

  const handleConfirmPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elevateUserModal) return;

    await promoteUserRole(elevateUserModal.id, targetRole, assignedSocietyName);
    showToast(`Elevated ${elevateUserModal.name} to [${targetRole.toUpperCase()}]`);
    setElevateUserModal(null);
    setAssignedSocietyName('');
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
        institution: 'Bahria University H-11 Campus',
        platform: 'CampPulse Verified Database',
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
    a.download = `bu_h11_database_snapshot_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database snapshot exported.');
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const q = searchUser.toLowerCase();
    const matchSearch =
      u.full_name.toLowerCase().includes(q) ||
      u.enrollment_id.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterVerified === 'pending') return !u.is_verified;
    if (filterVerified === 'verified') return u.is_verified;
    return true;
  });

  // STRICT ACCESS CONTROL: ONLY DEVELOPER/ADMIN CAN VIEW ADMIN PORTAL
  if (!isDeveloper) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-navy-900 border border-gold-500/30 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-gold-500/30 flex items-center justify-center mx-auto text-gold-400">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-serif">
              Platform Owner Portal
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              This administrative portal is strictly restricted to the BU H-11 Platform Owner.
              Student account verification and role elevation can only be executed by Admin.
            </p>
          </div>

          <form onSubmit={handleUnlockMasterKey} className="space-y-3 pt-2">
            {keyError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {keyError}
              </div>
            )}
            <input
              type="password"
              required
              placeholder="Enter Admin Master Key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono text-center"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all"
            >
              Verify Platform Owner Key
            </button>
          </form>
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

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-navy-900 border border-gold-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 border border-gold-500/30 text-xs font-bold text-gold-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Admin Console • Platform Owner (Asheer Ali)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            BU H-11 Administration &amp; Verification Desk
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Authorize newly registered students, appoint Society Heads and Department HODs, broadcast APP updates, and sync database snapshots to GitHub in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadSnapshot}
            className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-gold-300 border border-gold-500/30 text-xs font-bold transition-all"
          >
            Export JSON
          </button>
          <button
            onClick={() => triggerGitHubSync()}
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all flex items-center space-x-1.5"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sync GitHub</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: USER VERIFICATION & ROLE ELEVATION DESK */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gold-400" />
            <h2 className="text-base font-bold text-white">
              Student Accounts Registry ({filteredUsers.length})
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search enrollment or name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-navy-900 border border-navy-750 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-750 text-xs text-slate-200 focus:border-gold-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified Only</option>
            </select>
          </div>
        </div>

        {/* User Registry Table */}
        <div className="rounded-3xl bg-navy-900 border border-navy-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-850 text-slate-400 border-b border-navy-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student Identity</th>
                  <th className="p-4">Enrollment ID</th>
                  <th className="p-4">Department &amp; Semester</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-slate-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No accounts found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-navy-850/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{user.full_name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </td>
                      <td className="p-4 font-mono text-gold-300">{user.enrollment_id}</td>
                      <td className="p-4">
                        <div>{user.department}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{user.semester || '1st Semester'}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                            user.role === 'developer'
                              ? 'bg-purple-950/60 border-purple-500 text-purple-300'
                              : user.role === 'society_admin'
                              ? 'bg-gold-500/20 border-gold-500/50 text-gold-300'
                              : user.role === 'hod'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                              : 'bg-navy-800 border-navy-700 text-slate-400'
                          }`}
                        >
                          {user.role}
                        </span>
                        {user.society_name && (
                          <div className="text-[10px] text-gold-400 font-semibold mt-0.5 truncate max-w-[140px]">
                            {user.society_name}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {user.is_verified ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => verifyUser(user.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition-colors"
                          >
                            Verify Account
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              setElevateUserModal({
                                id: user.id,
                                name: user.full_name,
                                enrollment: user.enrollment_id,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[11px] font-bold transition-colors"
                            title="Assign Role (Society Head, HOD, Developer)"
                          >
                            Assign Role
                          </button>
                          {user.enrollment_id !== '01-134221-001' && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: GITHUB REAL-TIME DATABASE SYNC CONTROL */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-navy-900 border border-navy-800 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-gold-400" />
            <h2 className="text-base font-bold text-white">
              GitHub Real-Time Database Vault &amp; Server Sync
            </h2>
          </div>
          <span className="text-xs font-mono text-gold-300">
            Target: github.com/{githubConfig.owner}/{githubConfig.repo}
          </span>
        </div>

        <form onSubmit={handleSaveAndSyncGitHub} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Owner</label>
            <input
              type="text"
              value={gitOwner}
              onChange={(e) => setGitOwner(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Server App Repository</label>
            <input
              type="text"
              value={gitRepo}
              onChange={(e) => setGitRepo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Access Token (PAT)</label>
            <input
              type="password"
              placeholder="ghp_••••••••••••••••"
              value={gitToken}
              onChange={(e) => setGitToken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSyncing}
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
            >
              {isSyncing ? 'Synchronizing...' : 'Save Config & Force GitHub Sync'}
            </button>
          </div>
        </form>
      </div>

      {/* ELEVATE ROLE MODAL (Only Admin can open and appoint Society Heads / HODs) */}
      {elevateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">
                Appoint Role for {elevateUserModal.name}
              </h3>
              <button onClick={() => setElevateUserModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enrollment ID: <strong className="text-gold-300 font-mono">{elevateUserModal.enrollment}</strong>
            </p>

            <form onSubmit={handleConfirmPromotion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Elevated Role *
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500 cursor-pointer"
                >
                  <option value="society_admin">🎪 Society Head (Can post upcoming events)</option>
                  <option value="hod">🏛️ Department Head (HOD)</option>
                  <option value="developer">⚡ Platform Administrator</option>
                  <option value="student">🎓 Reset to Standard Student</option>
                </select>
              </div>

              {targetRole === 'society_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-gold-300 mb-1">
                    Chartered Society Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BU H-11 Software Engineering Guild"
                    value={assignedSocietyName}
                    onChange={(e) => setAssignedSocietyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-950 border border-gold-500/30 text-xs text-slate-100 focus:border-gold-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setElevateUserModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Confirm Role Elevation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
