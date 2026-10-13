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
  X,
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
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

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
      enrollment_id: regEnrollment.trim(),
      full_name: regFullName.trim(),
      email: regEmail.trim(),
      department: regDepartment,
      semester: regSemester,
      password: regPassword,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Student account created successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#0f2b5c] text-white flex items-center justify-center shadow-sm">
            <span className="font-serif font-black text-xl">BU</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Bahria University H-11 Portal
          </h2>
          <p className="text-xs text-slate-500">
            Student &amp; Society Gateway • Sector H-11/4 Islamabad
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#0f2b5c] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'register'
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

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrollment ID *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="01-134221-042"
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
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bilal Tariq"
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
              <input
                type="email"
                required
                placeholder="student@bahria.edu.pk"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] shadow-xs"
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
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] cursor-pointer shadow-xs"
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
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] cursor-pointer shadow-xs"
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
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-[#0f2b5c] shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#0a1e42] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <span>{isLoading ? 'Creating...' : 'Register Student'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
