import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { UserRole } from '../../types';
import {
  X,
  Lock,
  Building2,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
  KeyRound,
  Shield,
  Briefcase
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const {
    users,
    login,
    registerUser,
    authMode,
    setAuthMode
  } = useRealEstate();

  // Sign In State
  const [identifier, setIdentifier] = useState('sdhoni752@gmail.com');
  const [password, setPassword] = useState('manager123');
  const [loginError, setLoginError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 9');
  const [regRole, setRegRole] = useState<UserRole>('tenant');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(identifier, password);
    if (res.success) {
      setAuthSuccessMsg('Authentication successful! Welcome to APNA GHAR.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setLoginError(res.message || 'Login failed. Please verify your credentials or select a 1-click role profile.');
    }
  };

  const handleFastDemoLogin = (userEmail: string, role: UserRole) => {
    setLoginError('');
    const res = login(userEmail, undefined, role);
    if (res.success) {
      setAuthSuccessMsg(`Logged in successfully as ${role.toUpperCase()}!`);
      setTimeout(() => {
        onClose();
      }, 600);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regName.trim() || !regEmail.trim()) {
      setLoginError('Please fill in required fields (Name and Email).');
      return;
    }

    registerUser({
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      city: regCity,
      company: regCompany,
      password: regPassword || 'apnaghar123',
    });

    setAuthSuccessMsg('Account created successfully! Welcome to APNA GHAR.');
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-6 text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wide text-slate-900 uppercase">
                  APNA GHAR
                </span>
                <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  भारत Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Role-Based Authentication · RERA Compliant Security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => {
              setAuthMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In to Account
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setLoginError('');
            }}
            className={`flex-1 py-3 font-semibold text-center transition-colors cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register New Indian User
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Success Message */}
          {authSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {loginError}
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {authMode === 'login' && (
            <div className="space-y-6">
              {/* Quick 1-Click Fast Indian Demo Logins */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Select Role to Authenticate
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Admin: Rajat Yadav */}
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('rajat.yadav@apnaghar.in', 'admin')}
                    className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide px-1.5 py-0.5 bg-purple-100 rounded">
                        System Admin
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">Rajat Yadav</div>
                    <div className="text-[11px] text-slate-500">rajat.yadav@apnaghar.in · New Delhi</div>
                  </button>

                  {/* Manager: Dhoni Kumar Singh */}
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('sdhoni752@gmail.com', 'manager')}
                    className="p-3 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide px-1.5 py-0.5 bg-amber-100 rounded">
                        Mumbai Manager
                      </span>
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">Dhoni Kumar Singh</div>
                    <div className="text-[11px] text-slate-500">sdhoni752@gmail.com · Mumbai</div>
                  </button>

                  {/* Manager: Vikram Kumar */}
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('vikram.kumar@apnaghar.in', 'manager')}
                    className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide px-1.5 py-0.5 bg-indigo-100 rounded">
                        Bengaluru Manager
                      </span>
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">Vikram Kumar</div>
                    <div className="text-[11px] text-slate-500">vikram.kumar@apnaghar.in · Bengaluru</div>
                  </button>

                  {/* Tenant: Aanya Seth */}
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('aanya.seth@designstudio.in', 'tenant')}
                    className="p-3 rounded-xl border border-pink-300 bg-pink-50/70 hover:bg-pink-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wide px-1.5 py-0.5 bg-pink-100 rounded">
                        Verified Tenant
                      </span>
                      <User className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">Aanya Seth</div>
                    <div className="text-[11px] text-slate-500">aanya.seth@designstudio.in · New Delhi</div>
                  </button>

                  {/* Tenant: Aarav Patel */}
                  <button
                    type="button"
                    onClick={() => handleFastDemoLogin('aarav.patel@techcorp.in', 'tenant')}
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide px-1.5 py-0.5 bg-emerald-100 rounded">
                        Verified Tenant
                      </span>
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1.5">Aarav Patel</div>
                    <div className="text-[11px] text-slate-500">aarav.patel@techcorp.in · Mumbai</div>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-medium absolute">
                  Or sign in with custom credentials
                </span>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Registered Email Address or Mobile (+91)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="e.g. sdhoni752@gmail.com, rajat.yadav@apnaghar.in, or +91 98200 45678"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Security Password / PIN</label>
                    <span className="text-[11px] text-orange-600 font-medium">Demo password: manager123 / admin / tenant</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Enter Apna Ghar</span>
                </button>
              </form>
            </div>
          )}

          {/* MODE 2: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="rohan@example.in"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Indian Mobile (+91)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select User Role</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="tenant">Tenant / Renter</option>
                    <option value="manager">Property Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Operating City</label>
                  <select
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  >
                    <option value="Mumbai">Mumbai (Maharashtra)</option>
                    <option value="Bengaluru">Bengaluru (Karnataka)</option>
                    <option value="New Delhi">New Delhi / NCR</option>
                    <option value="Gurgaon">Gurgaon (Haryana)</option>
                    <option value="Pune">Pune (Maharashtra)</option>
                    <option value="Hyderabad">Hyderabad (Telangana)</option>
                    <option value="Chennai">Chennai (Tamil Nadu)</option>
                    <option value="Kolkata">Kolkata (West Bengal)</option>
                  </select>
                </div>
              </div>

              {regRole === 'manager' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Agency or Realty Company Name</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={regCompany}
                      onChange={e => setRegCompany(e.target.value)}
                      placeholder="e.g. Royal Heritage Estates Pvt Ltd"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Create Password / Security PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Indian User Account</span>
              </button>
            </form>
          )}

          {/* Privacy & RERA Compliance badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aadhaar & PAN e-KYC Ready</span>
            </span>
            <span>Model Tenancy Act (MTA) 2021</span>
          </div>
        </div>
      </div>
    </div>
  );
};
