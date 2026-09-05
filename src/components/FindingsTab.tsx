import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  EyeOff, 
  Clock, 
  FileText, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { FindingRecord, FindingClass } from '../types';

interface FindingsTabProps {
  findings: FindingRecord[];
  onSelectEntity?: (entityId: string) => void;
}

export const FindingsTab: React.FC<FindingsTabProps> = ({
  findings,
  onSelectEntity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(findings[0]?.finding_id || null);

  const filteredFindings = findings.filter(f => {
    const matchesSearch = 
      f.finding_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rationale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rule_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || f.finding_class === selectedClass;
    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    return matchesSearch && matchesClass && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
              Evidence-First Findings Repository (Section 9 &amp; 13)
            </span>
            <span className="text-xs text-[#666666] font-medium">• Explainable Decision Support</span>
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            Deterministic &amp; Statistical Supervisory Findings
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            Every finding provides traceable records, detector rule IDs, statistical thresholds, explicit uncertainty notes, and recommended supervisor actions.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-[#141414]">{findings.length}</div>
          <span className="text-xs text-[#666666] font-semibold">Active Findings Triggered</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by Finding, Rationale, Rule ID, or Entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-[#141414] placeholder-[#888888] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#525252]">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            <span className="font-semibold text-[#141414]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-[#F8F7F4] border border-[#D0CFCB] text-[#141414] font-medium rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Finding Classes</option>
              <option value="execution_gap">Execution Gap</option>
              <option value="negative_space">Negative Space</option>
              <option value="data_quality">Data Quality</option>
              <option value="anomaly_discovery">Anomaly Discovery</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#525252]">
            <span className="font-semibold text-[#141414]">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-xs bg-[#F8F7F4] border border-[#D0CFCB] text-[#141414] font-medium rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => {
          const isExpanded = expandedFindingId === finding.finding_id;

          const classBadge = {
            'execution_gap': 'bg-[#FFF5F5] text-[#991B1B] border-[#FECACA]',
            'negative_space': 'bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]',
            'data_quality': 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
            'anomaly_discovery': 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]'
          };

          const classLabels = {
            'execution_gap': 'Execution Gap',
            'negative_space': 'Negative Space',
            'data_quality': 'Data Quality',
            'anomaly_discovery': 'Anomaly Discovery'
          };

          return (
            <div
              key={finding.finding_id}
              className="bg-white border border-[#D0CFCB] rounded-lg shadow-xs overflow-hidden transition"
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedFindingId(isExpanded ? null : finding.finding_id)}
                className="p-4 cursor-pointer hover:bg-[#F9F9F7] flex items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    finding.severity === 'Critical' ? 'bg-rose-600' : 'bg-amber-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
                        {finding.finding_id}
                      </span>
                      <h4 className="font-bold text-sm text-[#141414]">{finding.finding_type}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mt-1">
                      <span className="font-bold text-[#141414]">{finding.entity_id}</span>
                      <span>•</span>
                      <span>Rule: <code className="font-mono text-[#141414]">{finding.rule_id}</code></span>
                      <span>•</span>
                      <span>Period: {finding.period}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${classBadge[finding.finding_class]}`}>
                    {classLabels[finding.finding_class]}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    finding.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {finding.severity}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-[#888888] transition transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Card Details when Expanded */}
              {isExpanded && (
                <div className="p-5 border-t border-[#D0CFCB] bg-[#F8F7F4] space-y-4 text-xs">
                  {/* The 6 Mandatory Answering Dimensions (Section 13) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. What was detected & Rationale */}
                    <div className="p-4 bg-white rounded-lg border border-[#D0CFCB] space-y-2">
                      <span className="font-bold text-[#141414] block text-xs uppercase tracking-wider">
                        1. What was detected? (Supervisory Rationale)
                      </span>
                      <p className="text-[#333333] leading-relaxed font-medium">{finding.rationale}</p>
                    </div>

                    {/* 2. Uncertainty Note */}
                    <div className="p-4 bg-[#FFFBEB] rounded-lg border border-[#FDE68A] space-y-2">
                      <span className="font-bold text-[#92400E] block text-xs uppercase tracking-wider">
                        2. Uncertainty &amp; Alternative Explanations
                      </span>
                      <p className="text-[#92400E] leading-relaxed font-medium">{finding.uncertainty_note}</p>
                    </div>

                    {/* 3. Threshold & Comparison Logic */}
                    <div className="p-4 bg-white rounded-lg border border-[#D0CFCB] space-y-2">
                      <span className="font-bold text-[#141414] block text-xs uppercase tracking-wider">
                        3. Threshold &amp; Statistical Comparison
                      </span>
                      <pre className="bg-[#141414] text-[#E4E3E0] p-3 rounded font-mono text-[11px] overflow-x-auto border border-[#242424]">
                        {JSON.stringify(finding.threshold_json, null, 2)}
                      </pre>
                    </div>

                    {/* 4. Supervisory Action & Record Links */}
                    <div className="p-4 bg-white rounded-lg border border-[#D0CFCB] space-y-2">
                      <span className="font-bold text-[#141414] block text-xs uppercase tracking-wider">
                        4. Recommended Supervisory Action
                      </span>
                      <p className="text-[#141414] font-bold leading-relaxed">{finding.recommended_action}</p>

                      <div className="pt-2 border-t border-[#EAE9E5]">
                        <span className="text-[#666666] block text-[11px] font-semibold">Traceable Evidence Record Links:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
                          {finding.evidence_record_ids_json.alert_ids?.map(id => (
                            <span key={id} className="bg-[#EAE9E5] text-[#141414] px-2 py-0.5 rounded border border-[#C8C7C2] font-semibold">
                              {id}
                            </span>
                          ))}
                          {finding.evidence_record_ids_json.case_ids?.map(id => (
                            <span key={id} className="bg-[#EAE9E5] text-[#141414] px-2 py-0.5 rounded border border-[#C8C7C2] font-semibold">
                              {id}
                            </span>
                          ))}
                          {finding.evidence_record_ids_json.asset_ids?.map(id => (
                            <span key={id} className="bg-[#EAE9E5] text-[#141414] px-2 py-0.5 rounded border border-[#C8C7C2] font-semibold">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
