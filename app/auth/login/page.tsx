'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AcademicDepartment } from '@/types';
import { ACADEMIC_DEPARTMENTS, SEMESTERS } from '@/utils/mockData';
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
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State (Strictly Student)
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState<AcademicDepartment>('Software Engineering');
  const [regSemester, setRegSemester] = useState('1st Semester');
  const [regPassword, setRegPassword] = useState('');

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
      enrollment_id: regEnrollment.trim(),
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      department: regDepartment,
      semester: regSemester,
      password: regPassword,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account registered successfully! Redirecting...');
      setTimeout(() => router.push('/'), 600);
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Back to Home Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 px-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Campus Feed</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#0f2b5c] text-white flex items-center justify-center shadow-sm">
            <span className="text-xl font-serif font-black">BU</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
            Bahria University H-11 Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sector H-11/4 Islamabad • Campus Event &amp; Society Hub
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            {/* Toggle Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  !isRegister
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
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isRegister
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

            {!isRegister ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Authenticating...' : 'Sign In with Enrollment ID'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enrollment ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="01-134221-099"
                      value={regEnrollment}
                      onChange={(e) => setRegEnrollment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono shadow-xs"
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
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@bahria.edu.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as AcademicDepartment)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 cursor-pointer shadow-xs"
                    >
                      {ACADEMIC_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Semester *
                    </label>
                    <select
                      value={regSemester}
                      onChange={(e) => setRegSemester(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 cursor-pointer shadow-xs"
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <span>{isLoading ? 'Registering...' : 'Register Student Account'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
