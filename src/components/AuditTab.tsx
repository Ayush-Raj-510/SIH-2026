import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Hash, 
  FileCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  UserCheck,
  Download,
  AlertTriangle
} from 'lucide-react';
import { AnalysisRunRecord, ExaminerAuditEntry, UserRole, UserProfile } from '../types';
import { formatShortHash } from '../engine/crypto';

interface AuditTabProps {
  currentRun: AnalysisRunRecord;
  auditTrail: ExaminerAuditEntry[];
  userRole: UserRole;
  currentUser?: UserProfile;
  onClearLogs?: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  currentRun,
  auditTrail,
  userRole,
  currentUser
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const exportAuditManifest = () => {
    const manifest = {
      run_id: currentRun.run_id,
      timestamp: currentRun.created_at,
      ruleset_version: currentRun.ruleset_version,
      application_version: currentRun.application_version,
      dataset_sha256: currentRun.dataset_hash,
      normalized_dataset_sha256: currentRun.normalized_dataset_hash,
      configuration_sha256: currentRun.configuration_hash,
      record_counts: currentRun.record_counts,
      examiner_activity_trail: auditTrail
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `sat_sa_run_manifest_${currentRun.run_id}.json`);
    dl.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141414] text-[#E4E3E0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#242424]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-[#242424] px-2 py-0.5 rounded border border-[#333333] flex items-center gap-1 font-bold tracking-wider">
              <Lock className="w-3 h-3 text-emerald-400" />
              AIR-GAP ENCLAVE AUDIT VERIFIED
            </span>
            <span className="text-xs text-[#888888] font-medium">• NTRO / NCIIPC Protocol</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1.5 tracking-tight">
            Run Reproducibility Manifest &amp; Immutable Audit Trail
          </h2>
          <p className="text-sm text-[#A0A0A0] mt-1 max-w-3xl leading-relaxed">
            Every analysis run is deterministically hashed with SHA-256 to guarantee that identical datasets and rulesets produce exactly identical supervisory findings.
          </p>
        </div>

        {userRole === 'Read-only Reviewer' ? (
          <button
            disabled
            className="px-3.5 py-2 bg-[#262626] text-[#888888] rounded text-xs font-bold transition flex items-center gap-1.5 cursor-not-allowed border border-[#3A3A3A] opacity-75"
            title="Forensic JSON export is restricted to Examiners and Administrators"
          >
            <Lock className="w-3.5 h-3.5 text-[#888888]" />
            Export Restricted (Auditor)
          </button>
        ) : (
          <button
            onClick={exportAuditManifest}
            className="px-3.5 py-2 bg-white hover:bg-[#EAE9E5] text-[#141414] rounded text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Run Manifest JSON
          </button>
        )}
      </div>

      {/* Cryptographic Manifest Checksums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span className="font-bold uppercase tracking-wider text-[#141414]">Raw Dataset SHA-256</span>
            <Hash className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2 font-mono text-xs text-[#141414] break-all bg-[#F8F7F4] p-2.5 rounded border border-[#D0CFCB]">
            {currentRun.dataset_hash}
          </div>
          <button
            onClick={() => handleCopy(currentRun.dataset_hash, 'raw')}
            className="mt-2 text-[11px] text-[#141414] hover:underline font-bold cursor-pointer"
          >
            {copiedHash === 'raw' ? '✓ Copied to clipboard' : 'Copy Full Checksum'}
          </button>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span className="font-bold uppercase tracking-wider text-[#141414]">Normalized Data SHA-256</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 font-mono text-xs text-[#141414] break-all bg-[#F8F7F4] p-2.5 rounded border border-[#D0CFCB]">
            {currentRun.normalized_dataset_hash}
          </div>
          <button
            onClick={() => handleCopy(currentRun.normalized_dataset_hash, 'norm')}
            className="mt-2 text-[11px] text-[#141414] hover:underline font-bold cursor-pointer"
          >
            {copiedHash === 'norm' ? '✓ Copied to clipboard' : 'Copy Full Checksum'}
          </button>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span className="font-bold uppercase tracking-wider text-[#141414]">Ruleset &amp; Config SHA-256</span>
            <CheckCircle2 className="w-4 h-4 text-[#141414]" />
          </div>
          <div className="mt-2 font-mono text-xs text-[#141414] break-all bg-[#F8F7F4] p-2.5 rounded border border-[#D0CFCB]">
            {currentRun.configuration_hash}
          </div>
          <button
            onClick={() => handleCopy(currentRun.configuration_hash, 'cfg')}
            className="mt-2 text-[11px] text-[#141414] hover:underline font-bold cursor-pointer"
          >
            {copiedHash === 'cfg' ? '✓ Copied to clipboard' : 'Copy Full Checksum'}
          </button>
        </div>
      </div>

      {/* Run Metadata Details */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs text-xs space-y-4">
        <h3 className="font-bold text-[#141414] text-sm">Active Run Metadata Specification</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
            <span className="text-[#666666] font-semibold block">Analysis Run ID</span>
            <span className="font-mono font-bold text-[#141414] mt-0.5 block">{currentRun.run_id}</span>
          </div>
          <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
            <span className="text-[#666666] font-semibold block">Ruleset Engine Version</span>
            <span className="font-mono font-bold text-[#141414] mt-0.5 block">{currentRun.ruleset_version}</span>
          </div>
          <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
            <span className="text-[#666666] font-semibold block">Execution Timestamp</span>
            <span className="font-mono font-bold text-[#141414] mt-0.5 block">{currentRun.created_at.slice(0, 19)}Z</span>
          </div>
          <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
            <span className="text-[#666666] font-semibold block">Initiated By (Role)</span>
            <span className="font-bold text-[#141414] mt-0.5 block">{currentRun.created_by} ({userRole})</span>
          </div>
        </div>
      </div>

      {/* Immutable Examiner Activity Trail */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-[#141414] text-sm flex items-center justify-between">
          <span>Examiner Activity &amp; Audit Log</span>
          <span className="text-xs font-semibold text-[#666666]">{auditTrail.length} recorded events</span>
        </h3>

        <div className="divide-y divide-[#EAE9E5] border border-[#D0CFCB] rounded-lg overflow-hidden text-xs bg-white">
          {auditTrail.map((entry) => (
            <div key={entry.id} className="p-3 flex items-start justify-between gap-4 hover:bg-[#F9F9F7] transition">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#141414]">{entry.action}</span>
                  <span className="font-mono text-[10px] text-[#141414] bg-[#EAE9E5] px-1.5 py-0.5 rounded border border-[#C8C7C2] font-semibold">
                    {entry.target_id}
                  </span>
                  <span className="text-[10px] text-[#666666] font-mono font-semibold">[{entry.role}]</span>
                </div>
                <p className="text-[#525252] text-[11px] font-medium">{entry.details}</p>
              </div>

              <div className="text-right text-[11px] font-mono text-[#888888] whitespace-nowrap">
                {entry.timestamp.slice(11, 19)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
