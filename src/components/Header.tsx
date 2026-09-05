import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  RefreshCw, 
  FileText, 
  User, 
  LogOut, 
  KeyRound, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Fingerprint,
  ShieldAlert
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { formatShortHash } from '../engine/crypto';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  runId: string;
  datasetHash: string;
  userRole: UserRole;
  currentUser: UserProfile;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  onReRunAnalysis: () => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  runId,
  datasetHash,
  userRole,
  currentUser,
  onOpenLoginModal,
  onLogout,
  selectedPeriod,
  setSelectedPeriod,
  onReRunAnalysis,
  onOpenReport
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leaderboard', label: 'Entity Leaderboard' },
    { id: 'queue', label: 'Review Queue' },
    { id: 'evidence-graph', label: 'Evidence Chain' },
    { id: 'findings', label: 'Detector Findings' },
    { id: 'data-quality', label: 'Data Quality' },
    { id: 'benchmark', label: 'Synthetic Benchmark' },
    { id: 'ingest', label: 'Ingest & Upload' },
    { id: 'audit', label: 'Air-Gap & Audit' },
  ];

  const canRunAnalytics = currentUser.permissions.can_re_run_analytics;

  return (
    <header className="border-b border-[#D0CFCB] bg-[#F8F7F4] text-[#141414] sticky top-0 z-40 shadow-xs">
      {/* Top Security & Air-Gap Status Bar */}
      <div className="bg-[#141414] text-[#E4E3E0] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400 tracking-wide text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            NCIIPC AIR-GAPPED SUPERVISORY ENCLAVE
          </span>
          <span className="text-[#444444]">|</span>
          <span className="text-[#B8B6B0] flex items-center gap-1 text-[11px]">
            <Lock className="w-3 h-3 text-[#888888]" />
            Zero External Network Calls
          </span>
          <span className="text-[#444444]">|</span>
          <span className="text-[#B8B6B0] font-mono text-[11px]">
            Active Run: <span className="text-amber-300 font-semibold">{runId}</span>
          </span>
          <span className="text-[#444444] hidden md:inline">|</span>
          <span className="text-[#B8B6B0] font-mono text-[11px] hidden md:inline">
            SHA-256: <span className="text-[#E4E3E0]">{formatShortHash(datasetHash, 8)}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* User Account & Role Badge with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#242424] hover:bg-[#2F2F2F] border border-[#3E3E3E] text-xs text-[#E4E3E0] transition cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#141414] border border-[#555555] flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {currentUser.avatar_initials}
              </div>
              <span className="font-semibold">{currentUser.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                userRole === 'Administrator' ? 'bg-[#3A3A3A] text-white' :
                userRole === 'Examiner' ? 'bg-[#FEF3C7] text-[#92400E]' :
                'bg-[#374151] text-[#E5E7EB]'
              }`}>
                {userRole}
              </span>
              <ChevronDown className="w-3 h-3 text-[#888888]" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl shadow-2xl z-50 p-4 text-[#E4E3E0] text-xs space-y-3">
                <div className="flex items-start justify-between border-b border-[#2E2E2E] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#242424] border border-[#444444] flex items-center justify-center text-xs font-black text-emerald-400">
                      {currentUser.avatar_initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{currentUser.name}</h4>
                      <p className="text-[11px] text-[#A0A0A0]">{currentUser.designation}</p>
                      <p className="text-[10px] font-mono text-[#888888]">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] bg-[#222222] p-2.5 rounded-lg border border-[#2E2E2E]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">Supervisory Role:</span>
                    <span className="font-bold text-white">{currentUser.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">Security Badge ID:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{currentUser.badge_id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">Clearance Level:</span>
                    <span className="text-amber-300 font-medium">{currentUser.clearance_level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888888]">Organization:</span>
                    <span className="text-[#CCCCCC] truncate max-w-[170px]" title={currentUser.organization}>
                      {currentUser.organization}
                    </span>
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div>
                  <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                    Jurisdictional Authority
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      {currentUser.permissions.can_update_review_status 
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 
                        : <XCircle className="w-3 h-3 text-rose-400" />}
                      <span className={currentUser.permissions.can_update_review_status ? 'text-[#CCCCCC]' : 'text-[#666666]'}>
                        Triage Decisions
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentUser.permissions.can_re_run_analytics 
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 
                        : <XCircle className="w-3 h-3 text-rose-400" />}
                      <span className={currentUser.permissions.can_re_run_analytics ? 'text-[#CCCCCC]' : 'text-[#666666]'}>
                        Re-run Analytics
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentUser.permissions.can_ingest_files 
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 
                        : <XCircle className="w-3 h-3 text-rose-400" />}
                      <span className={currentUser.permissions.can_ingest_files ? 'text-[#CCCCCC]' : 'text-[#666666]'}>
                        File Ingestion
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {currentUser.permissions.can_export_audit 
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 
                        : <XCircle className="w-3 h-3 text-rose-400" />}
                      <span className={currentUser.permissions.can_export_audit ? 'text-[#CCCCCC]' : 'text-[#666666]'}>
                        Forensic Export
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Switch Role / Sign Out */}
                <div className="pt-2 border-t border-[#2E2E2E] flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenLoginModal();
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white text-xs font-semibold rounded transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#444444]"
                  >
                    <KeyRound className="w-3 h-3" />
                    Switch Role
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="py-1.5 px-2.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#9F1239] text-xs font-bold rounded transition flex items-center justify-center gap-1 cursor-pointer border border-[#FECDD3]"
                    title="Terminate active air-gap session"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sign Out Button */}
          <button
            onClick={onLogout}
            className="px-2 py-1 bg-[#242424] hover:bg-[#381F24] hover:border-[#882233] text-[#CCCCCC] hover:text-[#FFAAAA] border border-[#3E3E3E] rounded text-xs transition cursor-pointer flex items-center gap-1.5"
            title="Terminate active session and return to Login page"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline font-medium">Sign Out</span>
          </button>

          <div className="flex items-center gap-1 text-[#B8B6B0] text-xs">
            <span>Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-[#242424] text-[#E4E3E0] text-xs rounded px-2 py-0.5 border border-[#3E3E3E] focus:outline-none cursor-pointer"
            >
              <option value="2026-Q3">2026-Q3 (Current Batch)</option>
              <option value="2026-Q2">2026-Q2 (Prior Submission)</option>
              <option value="2026-Q1">2026-Q1 (Historical Baseline)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Title Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#141414] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs border border-[#141414]">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#141414] tracking-tight">SAT-SA</h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAE9E5] text-[#141414] font-semibold border border-[#C8C7C2]">
                SIH 26157 • NTRO / NCIIPC
              </span>
            </div>
            <p className="text-xs text-[#525252] font-medium">
              Supervisory Analytics Tool for SOC Assessment • Evidence-First &amp; Offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {canRunAnalytics ? (
            <button
              onClick={onReRunAnalysis}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-[#EAE9E5] hover:bg-[#DDDCD7] text-[#141414] border border-[#C8C7C2] transition shadow-xs cursor-pointer"
              title="Recalculate all 7 detectors with deterministic rules and robust stats"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run Analytics
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-[#EAE9E5] text-[#888888] border border-[#D0CFCB] cursor-not-allowed opacity-60"
              title="Analytics re-execution requires Examiner or Administrator authorization"
            >
              <Lock className="w-3 h-3 text-[#888888]" />
              Re-run Analytics (Restricted)
            </button>
          )}

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded bg-[#141414] hover:bg-[#2A2A2A] text-white shadow-xs transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Supervisory Report
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-6 flex space-x-1 border-t border-[#D0CFCB] bg-[#F8F7F4] overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs whitespace-nowrap border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-[#141414] text-[#141414] font-bold bg-[#EFEFEA]'
                  : 'border-transparent text-[#666666] hover:text-[#141414] hover:bg-[#EFEFEA]/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
