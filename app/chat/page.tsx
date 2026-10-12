'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChatChannel, ChatMessage } from '@/types';
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Send,
  UserPlus,
  Lock,
  Globe,
  Sparkles,
  Check,
  CheckCheck,
  Building,
  GraduationCap,
  GitBranch,
  RefreshCw,
  X,
  ShieldCheck,
  Paperclip,
  Smile,
  ChevronLeft,
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
    usersList,
    societies,
    githubConfig,
    triggerGitHubSync,
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEnrollment, setInviteEnrollment] = useState('');
  const [inviteStatusMsg, setInviteStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'society' | 'general'>('society');
  const [newGroupSocietyId, setNewGroupSocietyId] = useState(societies[0]?.id || '');
  const [isNewGroupPrivate, setIsNewGroupPrivate] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active channel data
  const currentChannel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const channelMessages = messages.filter((m) => m.channel_id === currentChannel?.id);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !currentChannel) return;
    await sendMessage(currentChannel.id, inputContent);
    setInputContent('');
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
    if (!newGroupName.trim()) return;

    const selectedSoc = societies.find((s) => s.id === newGroupSocietyId);
    await createChannel({
      name: newGroupName,
      type: newGroupType,
      society_id: newGroupType === 'society' ? newGroupSocietyId : undefined,
      society_name: newGroupType === 'society' ? selectedSoc?.name : undefined,
      is_private: isNewGroupPrivate,
    });

    setIsNewGroupModalOpen(false);
    setNewGroupName('');
  };

  // Filter channels based on search
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchChannel.toLowerCase()) ||
    (c.society_name && c.society_name.toLowerCase().includes(searchChannel.toLowerCase()))
  );

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-navy-900 border border-gold-500/30 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-gold-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authenticating BU H-11 Session...</h2>
        <p className="text-slate-400 text-sm">Please verify your enrollment credentials to access verified society chats.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Breadcrumb & GitHub Real-Time Sync Status */}
      <div className="flex items-center justify-between pb-3 text-xs">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-slate-400 hover:text-gold-400 flex items-center space-x-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Campus Feed</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
            <span>Verified Society & Campus Chats</span>
          </span>
        </div>

        {/* GitHub Database Status Pill */}
        <button
          onClick={() => triggerGitHubSync()}
          className="flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-900 border border-gold-500/30 text-[11px] text-slate-300 hover:border-gold-500 transition-colors"
          title="Click to force real-time database commit to GitHub repository"
        >
          <GitBranch className="w-3.5 h-3.5 text-gold-400" />
          <span>
            DB Synced: <strong className="text-gold-300 font-mono">{githubConfig.last_commit_hash || 'main'}</strong>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
        </button>
      </div>

      {/* Main WhatsApp-Style Frame */}
      <div className="flex-1 rounded-3xl bg-navy-950 border border-gold-500/20 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* LEFT SIDEBAR: Channels & Conversations */}
        <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-navy-800 bg-navy-900 flex flex-col shrink-0">
          {/* User Profile Bar */}
          <div className="p-4 border-b border-navy-800 bg-navy-850 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                alt=""
                className="w-10 h-10 rounded-full border border-gold-500/40 object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                  <span>{currentUser.full_name}</span>
                </div>
                <div className="text-[10px] text-gold-400 font-mono flex items-center space-x-1 truncate">
                  <span>ID: {currentUser.enrollment_id}</span>
                  <span>•</span>
                  <span>{currentUser.department.split(' ')[0]}</span>
                </div>
              </div>
            </div>

            {/* Create New Group Button */}
            <button
              onClick={() => setIsNewGroupModalOpen(true)}
              className="p-2 rounded-xl bg-navy-950 border border-gold-500/30 text-gold-400 hover:text-white hover:bg-gold-500/20 transition-all shrink-0"
              title="Create new Society Group Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-navy-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search campus channels..."
                value={searchChannel}
                onChange={(e) => setSearchChannel(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-navy-950 border border-navy-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500/50"
              />
            </div>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto divide-y divide-navy-850">
            {filteredChannels.map((channel) => {
              const isSelected = channel.id === currentChannel?.id;
              const isMember = channel.member_enrollments.includes(currentUser.enrollment_id);

              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannelId(channel.id)}
                  className={`w-full text-left p-3.5 flex items-start space-x-3 transition-colors ${
                    isSelected
                      ? 'bg-navy-800/90 border-l-4 border-gold-400'
                      : 'hover:bg-navy-850'
                  }`}
                >
                  {/* Channel Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={channel.avatar_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&q=80'}
                      alt=""
                      className="w-11 h-11 rounded-2xl border border-navy-700 object-cover"
                    />
                    {channel.is_private && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-navy-950 text-gold-400 border border-gold-500/40">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {/* Channel Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{channel.name}</h4>
                      {channel.last_message_time && (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap ml-1 font-mono">
                          {new Date(channel.last_message_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate line-clamp-1">
                      {channel.last_message || channel.description || 'Tap to chat'}
                    </p>

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-navy-950 text-gold-400 border border-gold-500/20">
                        {channel.type === 'general' ? 'PUBLIC' : 'SOCIETY'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {channel.member_enrollments.length} members
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT MAIN PANEL: Active Chat Conversation */}
        <section className="flex-1 flex flex-col bg-[#070e1c] relative min-w-0">
          {/* Active Chat Header */}
          <div className="px-5 py-3.5 border-b border-navy-800 bg-navy-900/90 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src={currentChannel?.avatar_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&q=80'}
                alt=""
                className="w-10 h-10 rounded-2xl border border-navy-700 object-cover shrink-0"
              />
              <div className="overflow-hidden">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white truncate">{currentChannel?.name}</h3>
                  {currentChannel?.is_private && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-gold-500/10 text-gold-400 border border-gold-500/30">
                      Private Society Room
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentChannel?.society_name
                    ? `${currentChannel.society_name} • ${currentChannel.member_enrollments.length} Verified Members`
                    : `${currentChannel?.member_enrollments.length || 0} Students & Faculty Active`}
                </p>
              </div>
            </div>

            {/* Action Buttons: Invite Member Button */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                title="Invite student by Enrollment ID"
              >
                <UserPlus className="w-3.5 h-3.5 text-gold-400" />
                <span className="hidden sm:inline">Invite Student</span>
              </button>
            </div>
          </div>

          {/* Messages Thread Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Encryption & Verified Student Notice */}
            <div className="max-w-md mx-auto p-2.5 rounded-xl bg-navy-900/90 border border-gold-500/20 text-center text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-gold-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Campus Discussion Room</span>
              </div>
              <p>
                All participants are verified Bahria University students and society executives.
                Messages are synced in real-time.
              </p>
            </div>

            {channelMessages.map((msg) => {
              const isMine = msg.sender_enrollment === currentUser.enrollment_id;

              if (msg.is_system) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-navy-850 border border-gold-500/30 text-[11px] text-gold-300 font-medium">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-md relative ${
                      isMine
                        ? 'bg-navy-800 border border-gold-500/30 text-slate-100 rounded-tr-sm'
                        : 'bg-navy-900 border border-navy-700 text-slate-100 rounded-tl-sm'
                    }`}
                  >
                    {/* Header: Sender Name, Enrollment ID badge, Department */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1 text-[11px]">
                      <span className={`font-bold ${isMine ? 'text-gold-300' : 'text-slate-200'}`}>
                        {msg.sender_name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-navy-950 text-gold-400 border border-gold-500/20">
                        {msg.sender_enrollment}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({msg.sender_dept.split(' ')[0]})
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>

                    {/* Timestamp & Sent Checks */}
                    <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck className="w-3.5 h-3.5 text-gold-400" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-navy-800 bg-navy-900/90 backdrop-blur-md flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={`Message as ${currentUser.full_name} (${currentUser.enrollment_id})...`}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-navy-950 border border-navy-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputContent.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 disabled:opacity-40 text-navy-950 font-black shadow-gold transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>

      {/* INVITE TO SOCIETY CHAT MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-gold-400" />
                <h3 className="text-base font-bold text-white">Invite Student to Society Group</h3>
              </div>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Group: <strong>{currentChannel?.name}</strong>. Enter the verified Enrollment ID to grant access to this room.
            </p>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Enrollment ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01-134221-042 or 02-134211-089"
                  value={inviteEnrollment}
                  onChange={(e) => setInviteEnrollment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              {/* Quick Select from Verified Campus Directory */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Or pick from Verified Students Registry:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {usersList.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setInviteEnrollment(u.enrollment_id)}
                      className="w-full text-left p-2 rounded-lg bg-navy-950 hover:bg-navy-850 border border-navy-800 text-xs flex items-center justify-between text-slate-300 hover:text-gold-300 transition-colors"
                    >
                      <div className="truncate">
                        <strong className="text-white">{u.full_name}</strong>
                        <span className="text-slate-400 font-mono text-[11px] ml-1">({u.enrollment_id})</span>
                      </div>
                      <span className="text-[10px] text-gold-400 shrink-0 font-mono">{u.department.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {inviteStatusMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium ${
                    inviteStatusMsg.error
                      ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                      : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  }`}
                >
                  {inviteStatusMsg.text}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-navy-900 border border-gold-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white">Create New Society Group Chat</h3>
              <button onClick={() => setIsNewGroupModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Group Chat Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM Hackathon Organizing Committee"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Affiliated Society
                </label>
                <select
                  value={newGroupSocietyId}
                  onChange={(e) => setNewGroupSocietyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Private Society Group</div>
                  <div className="text-[11px] text-slate-400">
                    Only students with explicit enrollment invites can read/send
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isNewGroupPrivate}
                  onChange={(e) => setIsNewGroupPrivate(e.target.checked)}
                  className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  Create Group Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
