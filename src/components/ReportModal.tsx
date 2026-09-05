import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  EyeOff, 
  Database,
  Hash
} from 'lucide-react';
import { 
  EntityRiskScore, 
  FindingRecord, 
  ReviewQueueItem, 
  DataQualityReport, 
  AnalysisRunRecord, 
  PeerBenchmarkMetric 
} from '../types';
import { formatShortHash } from '../engine/crypto';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityScores: EntityRiskScore[];
  findings: FindingRecord[];
  reviewQueue: ReviewQueueItem[];
  dataQuality: DataQualityReport;
  currentRun: AnalysisRunRecord;
  peerBenchmarks: Record<string, PeerBenchmarkMetric[]>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  entityScores,
  findings,
  reviewQueue,
  dataQuality,
  currentRun,
  peerBenchmarks
}) => {
  if (!isOpen) return null;

  const [selectedEntityId, setSelectedEntityId] = useState<string>('ALL');

  const selectedEntity = selectedEntityId !== 'ALL' 
    ? entityScores.find(e => e.entity_id === selectedEntityId) 
    : entityScores[0];

  const relevantFindings = selectedEntityId === 'ALL'
    ? findings
    : findings.filter(f => f.entity_id === selectedEntityId);

  const relevantQueue = selectedEntityId === 'ALL'
    ? reviewQueue.slice(0, 10)
    : reviewQueue.filter(q => q.entity_id === selectedEntityId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    const reportHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SAT-SA Supervisory Assessment Report - ${selectedEntityId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 900px; margin: 0 auto; line-height: 1.5; }
    h1, h2, h3 { color: #0f172a; margin-top: 24px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .box { border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; margin-bottom: 16px; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .hash { font-family: monospace; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <h1>SAT-SA Supervisory Assessment Report</h1>
  <p><strong>Authority:</strong> NTRO / NCIIPC Air-Gapped Supervisory Protocol (SIH 26157)</p>
  <p class="hash">Run ID: ${currentRun.run_id} | Dataset SHA-256: ${currentRun.dataset_hash}</p>
  <hr/>
  <h2>1. Executive Summary &amp; Risk Ranking</h2>
  <p>Batch examination of periodic SOC submissions for Critical Sector Entities.</p>
  <table>
    <tr><th>Rank</th><th>Entity ID</th><th>Entity Name</th><th>Sector</th><th>Risk Score</th><th>Priority Band</th></tr>
    ${entityScores.map(e => `<tr><td>#${e.rank}</td><td>${e.entity_id}</td><td>${e.entity_name}</td><td>${e.sector}</td><td><strong>${e.overall_risk_score}/100</strong></td><td>${e.prioritization_band}</td></tr>`).join('')}
  </table>
  <h2>2. Detailed Supervisory Findings (${relevantFindings.length})</h2>
  ${relevantFindings.map(f => `
    <div class="box">
      <h3>${f.finding_type} [${f.finding_id}] - ${f.severity} Severity</h3>
      <p><strong>Entity:</strong> ${f.entity_id} | <strong>Rule ID:</strong> ${f.rule_id} (v${f.rule_version})</p>
      <p><strong>Observed Evidence:</strong> ${f.rationale}</p>
      <p><strong>Uncertainty / Alternative Explanation:</strong> ${f.uncertainty_note}</p>
      <p><strong>Recommended Supervisory Action:</strong> ${f.recommended_action}</p>
    </div>
  `).join('')}
  <h2>3. Top Prioritized Review Queue Items</h2>
  <table>
    <tr><th>Queue ID</th><th>Alert/Case</th><th>Entity</th><th>Priority</th><th>Evidence Summary</th><th>Examiner Status</th></tr>
    ${relevantQueue.map(q => `<tr><td>${q.queue_item_id}</td><td>${q.alert_id || q.case_id}</td><td>${q.entity_name}</td><td>${q.priority_score} (${q.priority_band})</td><td>${q.evidence_summary}</td><td>${q.review_status}</td></tr>`).join('')}
  </table>
  <hr/>
  <p style="font-size: 11px; color: #64748b;">Report generated completely offline within SAT-SA air-gapped container environment.</p>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sat_sa_report_${selectedEntityId}_${currentRun.run_id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#D0CFCB] max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Controls Bar */}
        <div className="px-6 py-4 border-b border-[#D0CFCB] bg-[#F8F7F4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#EAE9E5] border border-[#C8C7C2] flex items-center justify-center text-[#141414]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#141414]">
                Supervisory Assessment Report Generator (Section 17)
              </h3>
              <p className="text-xs text-[#666666]">
                Official NCIIPC / NTRO Printable Examination Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="text-xs bg-white border border-[#D0CFCB] rounded px-2.5 py-1.5 font-bold text-[#141414] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Entities (Combined Executive Report)</option>
              {entityScores.map(e => (
                <option key={e.entity_id} value={e.entity_id}>
                  {e.entity_name} ({e.entity_id})
                </option>
              ))}
            </select>

            <button
              onClick={handleDownloadHTML}
              className="px-3.5 py-1.5 bg-[#EAE9E5] hover:bg-[#DCDAD5] text-[#141414] rounded text-xs font-bold border border-[#C8C7C2] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download HTML
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#888888] hover:text-[#141414] transition ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-[#141414] text-xs leading-relaxed bg-white">
          {/* Header of Report */}
          <div className="border-b-2 border-[#141414] pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#666666] font-bold uppercase tracking-wider">
                CONFIDENTIAL • AIR-GAPPED SUPERVISORY RECORD
              </div>
              <h1 className="text-xl font-black text-[#141414] mt-1 tracking-tight">
                SOC SUPERVISORY ASSESSMENT DOSSIER
              </h1>
              <p className="text-xs text-[#525252] mt-0.5">
                Evaluation of Critical Sector Entities under NCIIPC Framework (SIH 26157)
              </p>
            </div>

            <div className="text-right text-[11px] font-mono text-[#666666]">
              <div>Run ID: <span className="font-bold text-[#141414]">{currentRun.run_id}</span></div>
              <div>Date: {currentRun.created_at.slice(0, 10)}</div>
              <div>Ruleset: {currentRun.ruleset_version}</div>
            </div>
          </div>

          {/* Cryptographic Traceability Badge */}
          <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] font-mono text-[11px] text-[#525252] space-y-0.5">
            <div>Raw Dataset SHA-256: <span className="text-[#141414] font-semibold">{currentRun.dataset_hash}</span></div>
            <div>Normalized Dataset SHA-256: <span className="text-[#141414] font-semibold">{currentRun.normalized_dataset_hash}</span></div>
            <div>Config SHA-256: <span className="text-[#141414] font-semibold">{currentRun.configuration_hash}</span></div>
          </div>

          {/* 1. Entity Identification & Risk Breakdown */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-[#141414] uppercase tracking-wider border-b border-[#D0CFCB] pb-1.5">
              1. Entity Identification &amp; Transparent Risk Scoring
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#D0CFCB]">
              <table className="w-full text-left divide-y divide-[#EAE9E5] text-xs">
                <thead className="bg-[#F8F7F4] font-bold text-[#141414]">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Entity ID</th>
                    <th className="p-2.5">Entity Name</th>
                    <th className="p-2.5">Sector</th>
                    <th className="p-2.5 text-center">Score</th>
                    <th className="p-2.5 text-center">Prioritization Band</th>
                    <th className="p-2.5 text-center">Data Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE9E5] bg-white">
                  {entityScores.map(e => (
                    <tr key={e.entity_id} className={selectedEntityId === e.entity_id ? 'bg-[#EAE9E5]/60 font-semibold' : 'hover:bg-[#F9F9F7]'}>
                      <td className="p-2.5 font-bold text-[#141414]">#{e.rank}</td>
                      <td className="p-2.5 font-mono text-[#141414]">{e.entity_id}</td>
                      <td className="p-2.5 text-[#141414]">{e.entity_name}</td>
                      <td className="p-2.5 text-[#525252]">{e.sector}</td>
                      <td className="p-2.5 text-center font-bold text-[#141414]">{e.overall_risk_score}/100</td>
                      <td className="p-2.5 text-center text-[#141414]">{e.prioritization_band}</td>
                      <td className="p-2.5 text-center text-[#525252]">{e.data_quality_score}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Structured Findings */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-[#141414] uppercase tracking-wider border-b border-[#D0CFCB] pb-1.5">
              2. Traceable Supervisory Findings ({relevantFindings.length})
            </h2>

            <div className="space-y-3">
              {relevantFindings.map(finding => (
                <div key={finding.finding_id} className="p-4 border border-[#D0CFCB] rounded-lg bg-[#F8F7F4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#141414] text-xs">
                      [{finding.finding_id}] {finding.finding_type}
                    </span>
                    <span className="font-bold font-mono text-[11px] text-rose-800 bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FECDD3]">
                      {finding.severity} Severity ({finding.finding_class})
                    </span>
                  </div>

                  <div className="text-[#333333]">
                    <span className="font-bold text-[#141414]">Observed Evidence: </span>
                    {finding.rationale}
                  </div>

                  <div className="text-amber-900 bg-[#FEF3C7]/40 p-2.5 rounded border border-[#FDE68A] text-[11px]">
                    <span className="font-bold">Uncertainty &amp; Limitations Note: </span>
                    {finding.uncertainty_note}
                  </div>

                  <div className="text-[11px] text-[#666666] flex items-center justify-between pt-1">
                    <span>Detector: <code className="font-mono text-[#141414] font-bold">{finding.rule_id}</code></span>
                    <span className="font-bold text-[#141414]">Supervisory Action: {finding.recommended_action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Prioritized Review Queue */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-[#141414] uppercase tracking-wider border-b border-[#D0CFCB] pb-1.5">
              3. Top Prioritized Alerts &amp; Cases for Human Review
            </h2>

            <div className="overflow-x-auto rounded-lg border border-[#D0CFCB]">
              <table className="w-full text-left divide-y divide-[#EAE9E5] text-xs">
                <thead className="bg-[#F8F7F4] font-bold text-[#141414]">
                  <tr>
                    <th className="p-2.5">Item ID</th>
                    <th className="p-2.5">Alert / Case</th>
                    <th className="p-2.5">Entity</th>
                    <th className="p-2.5 text-center">Priority</th>
                    <th className="p-2.5">Evidence Summary</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE9E5] bg-white">
                  {relevantQueue.map(q => (
                    <tr key={q.queue_item_id} className="hover:bg-[#F9F9F7]">
                      <td className="p-2.5 font-mono font-bold text-[#141414]">{q.queue_item_id}</td>
                      <td className="p-2.5 font-mono text-[#525252]">{q.alert_id || q.case_id}</td>
                      <td className="p-2.5 text-[#141414] font-medium">{q.entity_name}</td>
                      <td className="p-2.5 text-center font-bold text-rose-800">{q.priority_score}</td>
                      <td className="p-2.5 max-w-xs text-[#525252]">{q.evidence_summary}</td>
                      <td className="p-2.5 text-center text-[#141414] font-semibold">{q.review_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Three-Way Evidence Distinction Mandate (Section 17) */}
          <div className="p-4 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg space-y-2 text-xs">
            <h3 className="font-bold text-[#141414] text-xs uppercase tracking-wider">
              4. Evidence Categorization Standard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                <strong className="text-[#141414] block mb-1">Observed Evidence</strong>
                <p className="text-[#525252] text-[11px] leading-relaxed">
                  Directly supported by operational records (e.g. timestamp values, closure seconds, submitted text).
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                <strong className="text-[#141414] block mb-1">Analytic Indication</strong>
                <p className="text-[#525252] text-[11px] leading-relaxed">
                  Generated by deterministic rule or statistical comparison (e.g. IQR distance, cosine similarity).
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                <strong className="text-[#141414] block mb-1">Supervisory Conclusion</strong>
                <p className="text-[#525252] text-[11px] leading-relaxed">
                  Entered or confirmed by human examiner following interview or forensic sample validation.
                </p>
              </div>
            </div>
          </div>

          {/* Examiner Sign-off Area */}
          <div className="pt-6 border-t border-[#D0CFCB] flex items-center justify-between text-xs text-[#666666]">
            <div>
              <p className="font-semibold text-[#141414]">Certified Under NTRO / NCIIPC Air-Gapped Supervisory Framework</p>
              <p className="font-mono text-[10px] text-[#888888] mt-0.5">SAT-SA v1.2.0-STABLE • Build 2026.09</p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-[#141414] mb-1" />
              <span className="font-medium text-[#141414]">Supervising Examiner Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
