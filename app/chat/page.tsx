'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  UserPlus,
  Lock,
  GitBranch,
  ShieldCheck,
  ChevronLeft,
  CheckCheck,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const {
    currentUser,
    channels,
    messages,
    activeChannelId,
    setActiveChannelId,
    sendMessage,
    inviteToSocietyChannel,
    createChannel,
    githubConfig,
    triggerGitHubSync,
  } = useApp();
  const { isDeveloper } = useUserRole();

  const [inputContent, setInputContent] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEnrollment, setInviteEnrollment] = useState('');
  const [inviteStatusMsg, setInviteStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active channel
  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channel_id === currentChannel?.id);

  const isReadOnlyChannel = currentChannel?.is_announcements_only && !isDeveloper;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !currentChannel) return;
    const res = await sendMessage(currentChannel.id, inputContent);
    if (res.success) {
      setInputContent('');
    } else if (res.error) {
      alert(res.error);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEnrollment.trim() || !currentChannel) return;
    const res = await inviteToSocietyChannel(currentChannel.id, inviteEnrollment);
    setInviteStatusMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteEnrollment('');
        setInviteStatusMsg(null);
      }, 1400);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !isDeveloper) return;

    await createChannel({
      name: newGroupName.trim(),
      type: 'general',
      is_private: false,
    });

    setIsNewGroupModalOpen(false);
    setNewGroupName('');
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchChannel.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <MessageSquare className="w-7 h-7 text-[#0f2b5c] animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Authenticating BU H-11 Session...</h2>
        <p className="text-slate-500 text-sm">Please sign in with your Enrollment ID to access updates.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-slate-500 hover:text-slate-900 flex items-center space-x-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Campus Feed</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#0f2b5c]" />
            <span>Campus Channels &amp; Notice Board</span>
          </span>
        </div>

        <button
          onClick={() => triggerGitHubSync()}
          className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
          title="Force real-time GitHub sync"
        >
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
          <span>DB: <strong className="text-[#0f2b5c] font-mono">{githubConfig.last_commit_hash || 'synced'}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* LEFT SIDEBAR: Channels */}
        <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col shrink-0">
          {/* User Profile Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                alt=""
                className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 truncate">
                  <span>ID: {currentUser.enrollment_id}</span>
                  <span>•</span>
                  <span>{currentUser.department}</span>
                </div>
              </div>
            </div>

            {isDeveloper && (
              <button
                onClick={() => setIsNewGroupModalOpen(true)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-100 shadow-sm transition-all shrink-0"
                title="Create New Channel"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchChannel}
                onChange={(e) => setSearchChannel(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredChannels.map((channel) => {
              const isSelected = channel.id === currentChannel?.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-center space-x-3 ${
                    isSelected
                      ? 'bg-slate-100 border-l-4 border-[#0f2b5c]'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={channel.avatar_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-xl border border-slate-200 object-cover"
                    />
                    {channel.is_announcements_only && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center text-[10px] shadow-sm">
                        <Megaphone className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {channel.name}
                      </span>
                      {channel.is_announcements_only && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          Official
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {channel.last_message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT MAIN PANEL: Active Conversation */}
        <section className="flex-1 flex flex-col bg-slate-50 relative min-w-0">
          {/* Active Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={currentChannel?.avatar_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&q=80'}
                alt=""
                className="w-10 h-10 rounded-xl border border-slate-200 object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{currentChannel?.name}</h3>
                  {currentChannel?.is_announcements_only && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Admin Broadcast Only</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentChannel?.description || 'Bahria University H-11 official communications'}
                </p>
              </div>
            </div>

            {/* Invite Button for non-broadcast channels */}
            {!currentChannel?.is_announcements_only && (
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Invite Member</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages Thread Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="max-w-md mx-auto p-3 rounded-xl bg-white border border-slate-200 text-center text-[11px] text-slate-500 shadow-sm space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0f2b5c]" />
                <span>Verified Campus Channel</span>
              </div>
              <p>
                {currentChannel?.is_announcements_only
                  ? 'This channel is restricted to official announcements broadcast by the Platform Administrator.'
                  : 'Participants are verified Bahria University students.'}
              </p>
            </div>

            {channelMessages.map((msg) => {
              const isMine = msg.sender_enrollment === currentUser.enrollment_id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-sm relative ${
                      isMine
                        ? 'bg-[#0f2b5c] text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[11px]">
                      <span className={`font-semibold ${isMine ? 'text-white' : 'text-slate-900'}`}>
                        {msg.sender_name}
                      </span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                        isMine
                          ? 'bg-white/10 text-slate-200 border-white/20'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {msg.sender_enrollment}
                      </span>
                      <span className={`text-[10px] ${isMine ? 'text-slate-300' : 'text-slate-500'}`}>
                        ({msg.sender_dept})
                      </span>
                    </div>

                    <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isMine ? 'text-slate-100' : 'text-slate-700'
                    }`}>
                      {msg.content}
                    </p>

                    <div className={`flex items-center justify-end space-x-1 mt-1 text-[10px] font-mono ${
                      isMine ? 'text-slate-300' : 'text-slate-400'
                    }`}>
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input or Read-Only Notice */}
          {isReadOnlyChannel ? (
            <div className="p-4 border-t border-slate-200 bg-white text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Official broadcast channel. Only the <strong>Platform Administrator</strong> can post announcements.
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder={
                  isDeveloper
                    ? 'Broadcast announcement to all students as Admin...'
                    : `Message as ${currentUser.full_name}...`
                }
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0f2b5c] transition-colors"
              />

              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="p-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] disabled:opacity-40 text-white font-semibold shadow-sm transition-all shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </section>
      </div>

      {/* CREATE NEW CHANNEL MODAL (Admin Only) */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Channel</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <input
                type="text"
                placeholder="Channel Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f2b5c]"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0f2b5c] text-white font-semibold text-xs shadow-sm hover:bg-[#0a1e42]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Invite Student to Channel</h3>
            <p className="text-xs text-slate-500">
              Enter the enrollment ID of the verified student you want to invite.
            </p>
            {inviteStatusMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium ${
                  inviteStatusMsg.error
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                {inviteStatusMsg.text}
              </div>
            )}
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. 01-134221-045"
                value={inviteEnrollment}
                onChange={(e) => setInviteEnrollment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0f2b5c] font-mono"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteStatusMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0f2b5c] text-white font-semibold text-xs shadow-sm hover:bg-[#0a1e42]"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
