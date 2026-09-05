import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  User, 
  ChevronRight, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Info,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { authenticateUser } from '../data/authUsers';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
  currentUser?: UserProfile | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onClose,
  isModal = true,
  currentUser
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both identifier (username, badge, or email) and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authenticateUser(identifier, password);
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Invalid supervisory credentials or unauthorized security badge ID.');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(res.user);
      setIsSubmitting(false);
      if (onClose) onClose();
    } catch (err) {
      setErrorMsg('Authentication error occurred. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141414]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-[#141414]">
        
        {/* Official Header Banner */}
        <div className="bg-[#141414] text-[#E4E3E0] px-6 py-5 border-b border-[#2A2A2A] relative">
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 text-[#888888] hover:text-white rounded transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#242424] border border-[#3E3E3E] flex items-center justify-center text-emerald-400 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-[#242424] px-2 py-0.5 rounded border border-[#3A3A3A] font-bold">
                  DEFENSE RESTRICTED • STATUTORY ENCLAVE
                </span>
                <span className="text-xs text-[#888888] font-mono">Sec 70(B) IT Act, 2000</span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 tracking-tight">
                {currentUser ? 'Switch Enclave Account / Re-Authenticate' : 'Air-Gapped Supervisory Access Portal'}
              </h2>
              <p className="text-xs text-[#A0A0A0] mt-0.5">
                National Critical Information Infrastructure Protection Centre (NCIIPC / NTRO)
              </p>
            </div>
          </div>
        </div>

        {/* Current User Indicator */}
        {currentUser && (
          <div className="bg-[#EAE9E5] border-b border-[#D0CFCB] px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#666666]">Currently logged in as:</span>
              <span className="font-bold text-[#141414]">{currentUser.name}</span>
              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#C8C7C2] font-semibold">
                {currentUser.role} ({currentUser.badge_id})
              </span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#9F1239] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#9F1239]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* CREDENTIAL SIGN IN FORM */}
          <form onSubmit={handleManualSubmit} className="space-y-4 bg-white border border-[#D0CFCB] rounded-xl p-5 shadow-xs">
            <div>
              <label className="text-xs font-bold text-[#141414] block mb-1">
                Supervisory Identifier (Username, Email, or Badge ID)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. examiner, admin, or auditor"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg pl-3 pr-9 py-2 text-xs text-[#141414] placeholder-[#888888] focus:outline-none focus:border-[#141414]"
                  autoFocus
                />
                <Fingerprint className="w-4 h-4 text-[#888888] absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#141414] block mb-1">
                Enclave Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg pl-3 pr-9 py-2 text-xs text-[#141414] placeholder-[#888888] focus:outline-none focus:border-[#141414] font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#888888] hover:text-[#141414] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-[#666666] mt-1.5 flex items-center justify-between">
                <span>Standard test accounts: <code className="font-mono text-[#141414]">examiner</code> (examiner123) • <code className="font-mono text-[#141414]">admin</code> (admin123) • <code className="font-mono text-[#141414]">auditor</code> (auditor123)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#EAE9E5]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#525252]">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Salted SHA-256 hash authentication</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#141414] hover:bg-[#2A2A2A] text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In & Verify'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* RBAC Governance Matrix Table */}
          <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#141414] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#141414]" />
                Role-Based Access Control (RBAC) Permissions Matrix
              </span>
              <span className="text-[10px] text-[#666666] font-mono">Air-Gap Security Policy</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] divide-y divide-[#EAE9E5]">
                <thead>
                  <tr className="text-[#666666] font-bold">
                    <th className="py-1.5 pr-2">Jurisdictional Capability</th>
                    <th className="py-1.5 px-2 text-center">Administrator</th>
                    <th className="py-1.5 px-2 text-center">Examiner</th>
                    <th className="py-1.5 pl-2 text-center">Read-only Reviewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE9E5] text-[#141414]">
                  <tr>
                    <td className="py-1.5 pr-2">View Dashboards, Posture Scorecards &amp; Findings</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-emerald-700 font-bold">Granted</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2">Examiner Review Determination (Modify Status / Notes)</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-rose-700 font-semibold bg-[#FFF1F2]">Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2">Periodic Submission File Ingest (CSV / JSON / ZIP)</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-rose-700 font-semibold bg-[#FFF1F2]">Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2">Re-run Deterministic Analytics &amp; Anomaly Engine</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-rose-700 font-semibold bg-[#FFF1F2]">Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2">Generate &amp; Print Official Supervisory Dossier</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-emerald-700 font-bold">Granted</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2">Export Cryptographic Run Manifest &amp; Audit Trail</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 px-2 text-center text-emerald-700 font-bold">Granted</td>
                    <td className="py-1.5 pl-2 text-center text-rose-700 font-semibold bg-[#FFF1F2]">Restricted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer / Statutory Warning */}
        <div className="px-6 py-3 bg-[#EAE9E5] border-t border-[#D0CFCB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#666666]">
          <div className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-[#141414]" />
            <span>Air-Gapped Client Terminal • Salted SHA-256 verification</span>
          </div>
          <span className="font-mono text-[10px] text-[#888888]">
            NTRO-NCIIPC-ENCLAVE-v2.6
          </span>
        </div>

      </div>
    </div>
  );
};
