'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AcademicDepartment } from '@/types';
import { ACADEMIC_DEPARTMENTS, SEMESTERS } from '@/utils/mockData';
import {
  Lock,
  User,
  GraduationCap,
  Building,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, login, register, unlockAdminPrivilege, loading } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');

  // Sign In Form State
  const [loginEnrollment, setLoginEnrollment] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State (STRICTLY STUDENTS ONLY)
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState<AcademicDepartment>('Software Engineering');
  const [regSemester, setRegSemester] = useState('1st Semester');
  const [regPassword, setRegPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <div className="w-14 h-14 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow-md mb-3 font-serif font-black text-xl">
          BU
        </div>
        <p className="text-xs font-mono text-slate-500">Loading Bahria University H-11 Portal...</p>
      </div>
    );
  }

  // If user is authenticated, render application!
  if (isAuthenticated && currentUser) {
    return <>{children}</>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await login(loginEnrollment, loginPassword);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid Enrollment ID or password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regEnrollment.trim() || !regFullName.trim() || !regEmail.trim()) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      enrollment_id: regEnrollment.trim(),
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      department: regDepartment,
      semester: regSemester,
      password: regPassword,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  const handleAdminMasterUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = unlockAdminPrivilege(adminKeyInput);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* BU Crest */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow-md">
            <span className="font-serif font-black text-2xl">BU</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bahria University (H-11 Campus)
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Plot 83, Sector H-11/4 Islamabad • Campus Event &amp; Society Portal
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0f2b5c]" />
            <span>Sign in with your verified Enrollment ID to access</span>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
                setShowAdminUnlock(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                !isRegister && !showAdminUnlock
                  ? 'bg-white text-[#0f2b5c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
                setShowAdminUnlock(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                isRegister && !showAdminUnlock
                  ? 'bg-white text-[#0f2b5c] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Student
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ADMIN MASTER KEY UNLOCK OVERLAY (For platform owner Asheer) */}
          {showAdminUnlock ? (
            <form onSubmit={handleAdminMasterUnlock} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-[#0f2b5c] shrink-0" />
                <span>Restricted to Platform Owner: Enter Master Admin Key to unlock administrator session.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Master Admin Secret Key *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Admin Master Key"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c] font-mono shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Unlock Platform Owner Access
              </button>

              <button
                type="button"
                onClick={() => setShowAdminUnlock(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                Back to standard student sign in
              </button>
            </form>
          ) : !isRegister ? (
            /* SIGN IN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Enrollment ID *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01-134221-042 or asheer"
                    value={loginEnrollment}
                    onChange={(e) => setLoginEnrollment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c] font-mono shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0f2b5c] shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Sign In to Campus Hub'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-[#0f2b5c] hover:underline font-semibold"
                >
                  New Student? Register here
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminUnlock(true)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  Platform Owner Access
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER STUDENT FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#0f2b5c] shrink-0" />
                <span>All registrations are enrolled as Students. Society Executive roles are appointed by Admin.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Enrollment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01-134221-042"
                    value={regEnrollment}
                    onChange={(e) => setRegEnrollment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:border-[#0f2b5c] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Muhammad Bilal"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] shadow-xs"
                  />
                </div>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Academic Department *
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value as AcademicDepartment)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] cursor-pointer shadow-xs"
                >
                  {ACADEMIC_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Current Semester *
                </label>
                <select
                  value={regSemester}
                  onChange={(e) => setRegSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] cursor-pointer shadow-xs"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isSubmitting ? 'Registering...' : 'Register Student Account'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
