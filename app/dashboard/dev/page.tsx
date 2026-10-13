'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useApp } from '@/context/AppContext';
import { UserRole, CampusEvent } from '@/types';
import {
  ShieldAlert,
  Users,
  Database,
  Search,
  CheckCircle2,
  Lock,
  GitBranch,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  X,
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
    events,
    approveEvent,
    rejectEvent,
    deleteEvent,
    societies,
    githubConfig,
    updateGitHubConfig,
    triggerGitHubSync,
    channels,
    messages,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'github'>('events');
  const [searchUser, setSearchUser] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'pending' | 'verified'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reject event modal state
  const [rejectingEvent, setRejectingEvent] = useState<CampusEvent | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

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
        platform: 'Verified Campus Database',
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

  const pendingEvents = events.filter((e) => !e.approved_by_hod && !e.rejection_reason);
  const approvedEvents = events.filter((e) => e.approved_by_hod);
  const pendingUsers = usersList.filter((u) => !u.is_verified);

  const handleApproveEvent = async (id: string) => {
    await approveEvent(id);
    showToast('Event post approved and published to Live Campus Feed.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvent || !rejectReason.trim()) return;
    await rejectEvent(rejectingEvent.id, rejectReason);
    showToast(`Rejected "${rejectingEvent.title}" with feedback.`);
    setRejectingEvent(null);
    setRejectReason('');
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete event "${title}"?`)) {
      await deleteEvent(id);
      showToast(`Deleted event "${title}"`);
    }
  };

  // STRICT ACCESS CONTROL: ONLY DEVELOPER/ADMIN CAN VIEW ADMIN PORTAL
  if (!isDeveloper) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-[#0f2b5c]">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Platform Owner Portal
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              This administrative portal is restricted to the BU H-11 Platform Owner.
              Student account verification and society post approvals can only be executed by Admin.
            </p>
          </div>

          <form onSubmit={handleUnlockMasterKey} className="space-y-3 pt-2">
            {keyError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {keyError}
              </div>
            )}
            <input
              type="password"
              required
              placeholder="Enter Admin Master Key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0f2b5c] font-mono text-center"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
            >
              Verify Platform Owner Key
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-white text-slate-900 border border-slate-200 text-xs font-semibold shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="max-w-7xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0f2b5c]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Admin Console • Platform Owner (Asheer Ali)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Administration &amp; Verification Desk
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Approve society event posts, verify registered student accounts, appoint Society Heads and HODs, and synchronize campus data with GitHub.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadSnapshot}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all"
          >
            Export JSON
          </button>
          <button
            onClick={() => triggerGitHubSync()}
            className="px-4 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Sync GitHub</span>
          </button>
        </div>
      </div>

      {/* ADMIN WORKSPACE NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 border ${
            activeTab === 'events'
              ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Society Event Approvals</span>
          {pendingEvents.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold">
              {pendingEvents.length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 border ${
            activeTab === 'users'
              ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Accounts Registry</span>
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
              {pendingUsers.length} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 border ${
            activeTab === 'github'
              ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>GitHub Database Vault</span>
        </button>
      </div>

      {/* TAB 1: SOCIETY EVENT APPROVALS & POST MANAGEMENT */}
      {activeTab === 'events' && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Pending Event Approvals Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#0f2b5c]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Pending Society Posts Awaiting Approval ({pendingEvents.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Posts only appear on public feed after your approval
              </span>
            </div>

            {pendingEvents.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">All Event Posts Cleared</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no pending society event submissions waiting for review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {ev.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            Society: <strong className="text-slate-800">{ev.society?.name || 'Society'}</strong>
                          </span>
                          <span className="text-xs text-slate-500">
                            Target: <strong className="text-slate-800 font-mono">{ev.target_department || 'All Departments'}</strong>
                          </span>
                          <span className="text-xs text-slate-500">
                            Poster: <strong className="text-slate-800 font-mono">{ev.created_by_enrollment || 'Society Head'}</strong>
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                          {ev.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{ev.location_name}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                              •{' '}
                              {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              -{' '}
                              {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center justify-end gap-2.5 shrink-0">
                        <button
                          onClick={() => handleApproveEvent(ev.id)}
                          className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve &amp; Publish</span>
                        </button>

                        <button
                          onClick={() => setRejectingEvent(ev)}
                          className="w-full sm:w-44 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <XCircle className="w-4 h-4 text-rose-500" />
                          <span>Reject Post</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Published Events Feed Manager */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Live Published Campus Posts ({approvedEvents.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">Currently active on the Campus Feed</span>
            </div>

            {approvedEvents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No active published events.
              </div>
            ) : (
              <div className="space-y-3">
                {approvedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ev.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>{ev.society?.name}</span>
                        <span>•</span>
                        <span>{ev.location_name}</span>
                        <span>•</span>
                        <span className="text-slate-700 font-mono font-medium">
                          {ev.registered_students?.length || ev.attendee_count || 0} Registered
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ACCOUNTS REGISTRY & VERIFICATION DESK */}
      {activeTab === 'users' && (
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-[#0f2b5c]" />
              <h2 className="text-sm font-bold text-slate-900">
                Student Accounts Registry ({filteredUsers.length})
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search enrollment or name..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>

              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:border-[#0f2b5c] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified Only</option>
              </select>
            </div>
          </div>

          {/* User Registry Table */}
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-4">Student Identity</th>
                    <th className="p-4">Enrollment ID</th>
                    <th className="p-4">Department &amp; Semester</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No accounts found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{user.full_name}</div>
                          <div className="text-[10px] text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-4 font-mono text-[#0f2b5c] font-medium">{user.enrollment_id}</td>
                        <td className="p-4">
                          <div>{user.department}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.semester || '1st Semester'}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                              user.role === 'developer'
                                ? 'bg-purple-50 border-purple-200 text-purple-700'
                                : user.role === 'society_admin'
                                ? 'bg-blue-50 border-blue-200 text-[#0f2b5c]'
                                : user.role === 'hod'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {user.role}
                          </span>
                          {user.society_name && (
                            <div className="text-[10px] text-slate-600 font-medium mt-0.5 truncate max-w-[140px]">
                              {user.society_name}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {user.is_verified ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => verifyUser(user.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-[11px] transition-colors"
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
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors"
                              title="Assign Role (Society Head, HOD, Developer)"
                            >
                              Assign Role
                            </button>
                            {user.enrollment_id !== '01-134221-001' && (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
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
      )}

      {/* TAB 3: GITHUB REAL-TIME DATABASE SYNC CONTROL */}
      {activeTab === 'github' && (
        <div className="max-w-7xl mx-auto rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#0f2b5c]" />
              <h2 className="text-sm font-bold text-slate-900">
                GitHub Real-Time Database Vault &amp; Server Sync
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Target: github.com/{githubConfig.owner}/{githubConfig.repo}
            </span>
          </div>

          <form onSubmit={handleSaveAndSyncGitHub} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Owner</label>
              <input
                type="text"
                value={gitOwner}
                onChange={(e) => setGitOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Server App Repository</label>
              <input
                type="text"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Access Token (PAT)</label>
              <input
                type="password"
                placeholder="ghp_••••••••••••••••"
                value={gitToken}
                onChange={(e) => setGitToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm"
              >
                {isSyncing ? 'Synchronizing...' : 'Save Config & Force GitHub Sync'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ELEVATE ROLE MODAL (Only Admin can open and appoint Society Heads / HODs) */}
      {elevateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Appoint Role for {elevateUserModal.name}
              </h3>
              <button onClick={() => setElevateUserModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enrollment ID: <strong className="text-slate-800 font-mono">{elevateUserModal.enrollment}</strong>
            </p>

            <form onSubmit={handleConfirmPromotion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Elevated Role *
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c] cursor-pointer"
                >
                  <option value="society_admin">Society Head (Society Executive)</option>
                  <option value="hod">Department Head (HOD)</option>
                  <option value="developer">Platform Administrator</option>
                  <option value="student">Student (Standard User)</option>
                </select>
              </div>

              {targetRole === 'society_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chartered Society Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BU H-11 Software Engineering Guild"
                    value={assignedSocietyName}
                    onChange={(e) => setAssignedSocietyName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-[#0f2b5c]"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setElevateUserModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs shadow-sm"
                >
                  Confirm Role Elevation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT REJECTION MODAL */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reject Society Post</h3>
              <button onClick={() => setRejectingEvent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Post: <strong>{rejectingEvent.title}</strong> by {rejectingEvent.created_by_enrollment}
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Rejection / Modification instructions:
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Please update the venue timing or provide faculty approval letter."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
