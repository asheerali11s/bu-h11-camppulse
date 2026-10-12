'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  Lock,
  User,
  GraduationCap,
  Building,
  Mail,
  ShieldCheck,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, usersList, departments } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sign In Form State
  const [loginEnrollment, setLoginEnrollment] = useState('');
  const [loginPassword, setLoginPassword] = useState('bahria2026');

  // Register Form State
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Software Engineering');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPassword, setRegPassword] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await login(loginEnrollment, loginPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Successfully authenticated!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } else {
      setErrorMsg(res.message || 'Authentication failed');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regEnrollment.trim() || !regFullName.trim() || !regEmail.trim()) {
      setErrorMsg('Please fill out all required academic fields.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      enrollment_id: regEnrollment,
      full_name: regFullName,
      email: regEmail,
      department: regDepartment,
      role: regRole,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account registered and verified!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  const quickLoginAs = async (enrollmentId: string) => {
    setErrorMsg(null);
    await login(enrollmentId);
    setSuccessMsg('Signed in!');
    setTimeout(() => {
      onClose();
      setSuccessMsg(null);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-navy-900 border border-gold-500/30 rounded-3xl shadow-2xl shadow-navy-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Gold & Navy Trim Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-navy-700 via-gold-500 to-navy-700" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Monogram */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-navy-800 via-navy-850 to-navy-950 border border-gold-500/40 flex items-center justify-center shadow-gold">
              <span className="text-2xl font-serif font-black text-gold-400">BU</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              CampPulse Portal
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Verified Collegiate Authentication • Bahria University
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-navy-950 border border-navy-700">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-navy-800 text-gold-400 shadow-sm border border-gold-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Enrollment ID)
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-navy-800 text-gold-400 shadow-sm border border-gold-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register Verified Account
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enrollment ID or University Email *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01-134221-042 or 01-134201-015"
                    value={loginEnrollment}
                    onChange={(e) => setLoginEnrollment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In with Enrollment ID'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Sign-In Pills for Demo / Instant Evaluation */}
              <div className="pt-4 border-t border-navy-800">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 text-center">
                  Quick Sign-In As Verified Campus Roles:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => quickLoginAs('01-134221-042')}
                    className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors truncate"
                  >
                    🎓 <strong>Student</strong> (CS)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('01-134201-015')}
                    className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors truncate"
                  >
                    🎪 <strong>Society Head</strong> (ACM)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('00-HOD-CS-001')}
                    className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors truncate"
                  >
                    🏛️ <strong>Dept HOD</strong> (CS)
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('00-SYS-DEV-000')}
                    className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors truncate"
                  >
                    ⚡ <strong>System Admin</strong>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enrollment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01-134221-099"
                    value={regEnrollment}
                    onChange={(e) => setRegEnrollment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Ali"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Official Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@bahria.edu.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Academic Department *
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="Computer Science & Software Engineering">
                    Computer Science & Software Engineering
                  </option>
                  <option value="Electrical & Computer Engineering">
                    Electrical & Computer Engineering
                  </option>
                  <option value="Management & Business Studies">
                    Management & Business Studies
                  </option>
                  <option value="Media & Communication Studies">
                    Media & Communication Studies
                  </option>
                  <option value="Humanities & Social Sciences">
                    Humanities & Social Sciences
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Primary Campus Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="student">🎓 Student (General Campus)</option>
                  <option value="society_admin">🎪 Society Executive / Head</option>
                  <option value="hod">🏛️ Department Head (HOD)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isLoading ? 'Creating Record...' : 'Complete Verified Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
