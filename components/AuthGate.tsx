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
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, login, register, loading } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  // Sign In Form State
  const [loginEnrollment, setLoginEnrollment] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Department of Computer Science & Software Engineering');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regSocietyName, setRegSocietyName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If loading local storage state, show brief collegiate loader
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-gold-500/40 flex items-center justify-center shadow-gold animate-pulse mb-3">
          <span className="font-serif font-black text-gold-400 text-2xl">BU</span>
        </div>
        <p className="text-xs font-mono text-gold-300">Verifying BU H-11 Credentials...</p>
      </div>
    );
  }

  // If user is logged in, render the application!
  if (isAuthenticated && currentUser) {
    return <>{children}</>;
  }

  // Otherwise, FORCE USER LOGIN / REGISTRATION FIRST!
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
      enrollment_id: regEnrollment,
      full_name: regFullName,
      email: regEmail,
      department: regDepartment,
      role: regRole,
      society_name: regRole === 'society_admin' ? regSocietyName : undefined,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-800/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* BU Crest */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 border-2 border-gold-500/40 flex items-center justify-center shadow-gold">
            <span className="font-serif font-black text-gold-400 text-3xl">BU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            BU (Bahria University H-11 CAMPUS)
          </h1>
          <p className="text-xs text-gold-300 font-medium">
            Plot 83, Sector H-11/4 Islamabad • Official Collegiate Event &amp; Society Hub
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-navy-900 border border-gold-500/30 text-[11px] text-slate-300 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span>Collegiate Gate: Sign in with your Enrollment ID to proceed</span>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Tabs */}
          <div className="flex p-1 rounded-2xl bg-navy-950 border border-navy-750">
            <button
              onClick={() => {
                setIsRegister(false);
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isRegister
                  ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Enrollment ID)
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isRegister
                  ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student / Faculty Enrollment ID *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01-134221-042"
                    value={loginEnrollment}
                    onChange={(e) => setLoginEnrollment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 font-mono"
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
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold hover:shadow-gold-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Sign In to BU H-11 Hub'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-2xl bg-navy-950/70 border border-navy-800 text-[11px] text-slate-400 space-y-1 text-center">
                <p>New student or executive at Bahria University H-11 Campus?</p>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-gold-400 hover:underline font-bold"
                >
                  Register your real Enrollment ID and Department →
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Enrollment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01-134221-042"
                    value={regEnrollment}
                    onChange={(e) => setRegEnrollment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 font-mono focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Asheer Ali"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
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
                    placeholder="your.name@bahria.edu.pk"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  BU H-11 Academic Department *
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500 cursor-pointer"
                >
                  <option value="Department of Computer Science & Software Engineering">
                    Department of Computer Science &amp; Software Engineering (1st Floor)
                  </option>
                  <option value="Department of Electrical Engineering & Robotics">
                    Department of Electrical Engineering &amp; Robotics (2nd Floor)
                  </option>
                  <option value="Department of Earth & Environmental Sciences">
                    Department of Earth &amp; Environmental Sciences (3rd Floor)
                  </option>
                  <option value="Department of Media & Management Sciences">
                    Department of Media &amp; Management Sciences
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Campus Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500 cursor-pointer"
                >
                  <option value="student">🎓 Student (General Campus)</option>
                  <option value="society_admin">🎪 Society Head / Executive</option>
                  <option value="hod">🏛️ Department Head (HOD)</option>
                  <option value="developer">⚡ Campus Platform Admin</option>
                </select>
              </div>

              {regRole === 'society_admin' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gold-300 mb-1">
                    Your Society Name to Register *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BU H-11 Computing Society or Sports Guild"
                    value={regSocietyName}
                    onChange={(e) => setRegSocietyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-gold-500/40 text-xs text-gold-200 focus:border-gold-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:border-gold-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-navy-950 font-black text-xs uppercase tracking-wider shadow-gold transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isSubmitting ? 'Registering...' : 'Register Verified Enrollment ID'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
