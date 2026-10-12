'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Mail,
  ChevronLeft,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  // Sign In Form State
  const [loginEnrollment, setLoginEnrollment] = useState('');
  const [loginPassword, setLoginPassword] = useState('bahria2026');

  // Register Form State
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Software Engineering');
  const [regRole, setRegRole] = useState<UserRole>('student');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const res = await login(loginEnrollment, loginPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication successful. Redirecting...');
      setTimeout(() => router.push('/'), 600);
    } else {
      setErrorMsg(res.message || 'Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
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
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => router.push('/'), 600);
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  const quickSignIn = async (enrollmentId: string) => {
    setErrorMsg(null);
    await login(enrollmentId);
    setSuccessMsg('Signed in. Redirecting...');
    setTimeout(() => router.push('/'), 500);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Navy & Gold Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-gold-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campus Feed</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-gold-500/40 flex items-center justify-center shadow-gold">
            <span className="text-2xl font-serif font-black text-gold-400">BU</span>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white tracking-tight">
            CampPulse Portal
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Bahria University Verified Collegiate Network
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Toggle Tabs */}
            <div className="flex p-1 rounded-xl bg-navy-950 border border-navy-700">
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  !isRegister
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  isRegister
                    ? 'bg-navy-800 text-gold-400 border border-gold-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

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

            {!isRegister ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enrollment ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01-134221-042"
                      value={loginEnrollment}
                      onChange={(e) => setLoginEnrollment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with Enrollment ID'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-navy-800">
                  <p className="text-[11px] font-semibold text-slate-400 mb-2 text-center">
                    Quick Sign-In As Verified Campus Roles:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => quickSignIn('01-134221-042')}
                      className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors"
                    >
                      🎓 Student (CS)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickSignIn('01-134201-015')}
                      className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors"
                    >
                      🎪 Society Head (ACM)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickSignIn('00-HOD-CS-001')}
                      className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors"
                    >
                      🏛️ Dept HOD (CS)
                    </button>
                    <button
                      type="button"
                      onClick={() => quickSignIn('00-SYS-DEV-000')}
                      className="p-2 rounded-lg bg-navy-950 border border-navy-700 hover:border-gold-500/50 text-slate-300 hover:text-gold-300 text-left transition-colors"
                    >
                      ⚡ System Admin
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
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
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Fatima Ali"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@bahria.edu.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
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
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100"
                  >
                    <option value="student">🎓 Student</option>
                    <option value="society_admin">🎪 Society Executive</option>
                    <option value="hod">🏛️ Department Head (HOD)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold"
                >
                  <span>{isLoading ? 'Processing...' : 'Register Verified Account'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
