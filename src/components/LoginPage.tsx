import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  User, 
  Mail,
  AlertCircle, 
  Eye, 
  EyeOff, 
  ChevronRight,
  CheckCircle2,
  BadgeCheck,
  Building2,
  Clock,
  UserPlus,
  LogIn
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { 
  authenticateUser, 
  registerUser, 
  getFailedAttempts, 
  saveSession 
} from '../data/authUsers';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  
  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Examiner');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Common UI State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Rate limiting lockout countdown
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Check rate limit on mount and poll if locked
  useEffect(() => {
    const status = getFailedAttempts();
    if (status.isLocked) {
      setLockoutSeconds(status.remainingSeconds);
    }
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (lockoutSeconds > 0) {
      setErrorMsg(`System locked for ${lockoutSeconds}s due to failed attempts.`);
      return;
    }

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your username, email, or badge ID.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authenticateUser(loginIdentifier, loginPassword);
      if (!result.success || !result.user) {
        const status = getFailedAttempts();
        if (status.isLocked) {
          setLockoutSeconds(status.remainingSeconds);
        }
        setErrorMsg(result.error || 'Authentication failed.');
        setIsSubmitting(false);
        return;
      }

      saveSession(result.user, rememberMe);
      setSuccessMsg('Authentication verified. Loading supervisory session...');
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 350);
    } catch (err) {
      setErrorMsg('Authentication service error occurred. Please retry.');
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid official email address.');
      return;
    }
    if (!regUsername.trim() || regUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: regRole
      });

      if (!result.success || !result.user) {
        setErrorMsg(result.error || 'Registration failed.');
        setIsSubmitting(false);
        return;
      }

      saveSession(result.user, true);
      setSuccessMsg(`Account created for ${result.user.name} (${result.user.badge_id}). Entering enclave...`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 500);
    } catch (err) {
      setErrorMsg('Failed to create account. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEB] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-[#F0EFEB]">
      {/* Top Classification Header */}
      <header className="bg-[#141414] text-[#D0CECA] px-6 py-2.5 text-xs flex items-center justify-between border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-emerald-400 font-bold tracking-wider text-[11px]">
            NCIIPC STATUTORY OVERSIGHT ENCLAVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#888888]">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Section 70(B) IT Act Mandate • SHA-256 Auth</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#D5D3CE] shadow-lg p-6 sm:p-8 space-y-5">
          
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#141414] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#141414] tracking-tight">
                SOC Supervisory Enclave
              </h1>
              <p className="text-xs text-[#666666] mt-0.5">
                Statutory Assessment & Comparative Risk Platform
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F2F0EC] p-1 rounded-xl border border-[#DCDAD4]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#666666] hover:text-[#141414]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#666666] hover:text-[#141414]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Alert Notifications */}
          {errorMsg && (
            <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#9F1239] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#9F1239] mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-xs text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Rate Limit Lockout Banner */}
          {lockoutSeconds > 0 && (
            <div className="p-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-lg text-xs text-[#92400E] flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-[#D97706] animate-spin" />
              <span>Authentication locked. Retrying permitted in <strong>{lockoutSeconds}s</strong>.</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label 
                  htmlFor="login-identifier" 
                  className="block text-xs font-bold text-[#222222] mb-1.5"
                >
                  Username, Email, or Badge ID
                </label>
                <div className="relative">
                  <input
                    id="login-identifier"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. examiner or examiner@ntro.gov.in"
                    className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition"
                    autoComplete="username"
                    disabled={isSubmitting || lockoutSeconds > 0}
                    autoFocus
                  />
                  <User className="w-4 h-4 text-[#888888] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="login-password" 
                    className="block text-xs font-bold text-[#222222]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg pl-9 pr-10 py-2.5 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition font-mono text-[11px]"
                    autoComplete="current-password"
                    disabled={isSubmitting || lockoutSeconds > 0}
                  />
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-[#888888] hover:text-[#141414] transition cursor-pointer p-1"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#666666]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D0CECA] text-[#141414] focus:ring-[#141414] w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>Keep session authenticated</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || lockoutSeconds > 0}
                id="sign-in-button"
                className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#2A2A2A] active:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSubmitting ? 'Verifying Hash...' : 'Sign In'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Supervisory Credentials Reference Note */}
              <div className="pt-2.5 border-t border-[#EAE8E3] text-[11px] text-[#666666] space-y-1.5">
                <div className="flex items-center justify-between text-[#525252]">
                  <span className="font-semibold text-[11px]">Authorized Enclave Accounts:</span>
                  <span className="text-[#888888] font-mono text-[10px]">Air-Gap Seeded</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-[#FAF9F6] p-2 rounded-lg border border-[#E5E3DE]">
                  <div>
                    <span className="font-bold text-[#141414] block">Examiner</span>
                    <span className="font-mono text-[#525252] block">examiner</span>
                    <span className="text-[#888888] font-mono text-[9px]">examiner123</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#141414] block">Admin</span>
                    <span className="font-mono text-[#525252] block">admin</span>
                    <span className="text-[#888888] font-mono text-[9px]">admin123</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#141414] block">Auditor</span>
                    <span className="font-mono text-[#525252] block">auditor</span>
                    <span className="text-[#888888] font-mono text-[9px]">auditor123</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#888888] text-center pt-0.5">
                  Or switch to <strong>Create Account</strong> to register a new examiner identity.
                </p>
              </div>
            </form>
          )}

          {/* REGISTER / CREATE ACCOUNT FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Inspector Akash Roy"
                    className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg pl-8 pr-3 py-2 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition"
                    required
                  />
                  <User className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. aroy_soc"
                    className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg px-3 py-2 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@org.gov.in"
                      className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg pl-7 pr-2.5 py-2 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition"
                      required
                    />
                    <Mail className="w-3.5 h-3.5 text-[#888888] absolute left-2 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#222222] mb-1">
                  Jurisdictional Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg px-3 py-2 text-xs text-[#141414] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition"
                >
                  <option value="Examiner">Senior Supervisory Examiner (Review & Findings)</option>
                  <option value="Administrator">Enclave Administrator (Full System & Telemetry)</option>
                  <option value="Read-only Reviewer">Statutory Compliance Auditor (Read-only)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    Password (6+ chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-[#FAF9F6] border border-[#D0CECA] rounded-lg pl-3 pr-8 py-2 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:border-[#141414] focus:ring-1 focus:ring-[#141414] transition font-mono text-[11px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 top-2 text-[#888888] hover:text-[#141414] transition cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#222222] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full bg-[#FAF9F6] border rounded-lg px-3 py-2 text-xs text-[#141414] placeholder-[#999999] focus:outline-none focus:ring-1 transition font-mono text-[11px] ${
                      regConfirmPassword && regConfirmPassword !== regPassword 
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500' 
                        : 'border-[#D0CECA] focus:border-[#141414] focus:ring-[#141414]'
                    }`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                id="register-button"
                className="w-full py-2.5 px-4 bg-[#141414] hover:bg-[#2A2A2A] active:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2 disabled:opacity-50"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSubmitting ? 'Hashing & Registering...' : 'Create Account & Enter'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Secure Environment Footer Note */}
          <div className="pt-2 border-t border-[#EAE8E3] text-center text-[11px] text-[#888888] flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Encrypted credentials with salted SHA-256 derivation</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="bg-[#E7E5E0] border-t border-[#CECCC6] px-6 py-2 text-xs text-[#666666] flex items-center justify-between">
        <span>Government of India • Critical Infrastructure Protection</span>
        <span className="font-mono text-[11px]">Enclave v2.6 • Air-Gapped Station</span>
      </footer>
    </div>
  );
};
