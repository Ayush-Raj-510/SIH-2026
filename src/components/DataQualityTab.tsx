import React from 'react';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileQuestion, 
  Layers,
  ShieldCheck,
  Info
} from 'lucide-react';
import { DataQualityReport } from '../types';

interface DataQualityTabProps {
  report: DataQualityReport;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({ report }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
              Data Quality &amp; Submission Integrity (Section 8 &amp; 9.8)
            </span>
            <span className="text-xs text-[#666666] font-medium">• Flag, Never Silently Repair</span>
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            Structural &amp; Relational Quality Assessment
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            A high-quality analytics result from incomplete or corrupted submissions can be dangerously misleading. SAT-SA evaluates submission hygiene strictly and transparently.
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black text-[#141414]">{report.overall_score}</div>
          <span className="text-xs text-[#666666] font-semibold">/ 100 Quality Index</span>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <span className="text-[#666666] text-xs font-semibold">Records Analyzed</span>
          <div className="text-2xl font-black text-[#141414] mt-1">{report.total_records_analyzed}</div>
          <span className="text-[11px] text-[#666666] font-medium">Alerts, Cases, Escalations &amp; Assets</span>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <span className="text-[#666666] text-xs font-semibold">Temporal Inversions</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{report.temporal_inversions_count}</div>
          <span className="text-[11px] text-[#666666] font-medium">Closed before created</span>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <span className="text-[#666666] text-xs font-semibold">Orphan Records</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {report.orphan_cases_count + report.orphan_escalations_count}
          </div>
          <span className="text-[11px] text-[#666666] font-medium">Broken FK linkages</span>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <span className="text-[#666666] text-xs font-semibold">Truncated Notes</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{report.short_notes_count}</div>
          <span className="text-[11px] text-[#666666] font-medium">Sub-15 char investigations</span>
        </div>
      </div>

      {/* Data Quality Check Flags */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#141414] flex items-center justify-between">
          <span>Active Data-Quality Rules &amp; Defects Found</span>
          <span className="text-xs font-semibold text-[#666666]">{report.issues.length} Rules Flagged</span>
        </h3>

        <div className="space-y-3">
          {report.issues.map((issue) => (
            <div 
              key={issue.id}
              className="p-4 rounded-lg border border-[#D0CFCB] bg-[#F8F7F4] text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
                    {issue.id}
                  </span>
                  <span className="font-bold text-[#141414] text-sm">{issue.rule_name}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  issue.severity === 'High' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {issue.severity} Defect
                </span>
              </div>

              <p className="text-[#333333] font-medium leading-relaxed">{issue.description}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D0CFCB] text-[11px] text-[#525252]">
                <span>Table Affected: <strong className="text-[#141414]">{issue.table_affected}</strong> ({issue.affected_row_count} rows)</span>
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <span className="font-semibold text-[#666666]">Sample IDs:</span>
                  {issue.sample_identifiers.map(id => (
                    <span key={id} className="bg-[#EAE9E5] px-1.5 py-0.5 rounded border border-[#C8C7C2] text-[#141414] font-semibold">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
