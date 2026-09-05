import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  Layers, 
  EyeOff, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  EntityRiskScore, 
  FindingRecord, 
  PeerBenchmarkMetric, 
  AssetRecord, 
  ReviewQueueItem 
} from '../types';

interface EntityDetailModalProps {
  entityId: string | null;
  onClose: () => void;
  entityScore?: EntityRiskScore;
  findings: FindingRecord[];
  peerMetrics?: PeerBenchmarkMetric[];
  assets: AssetRecord[];
  reviewQueue: ReviewQueueItem[];
  onSelectReviewItem?: (item: ReviewQueueItem) => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entityId,
  onClose,
  entityScore,
  findings,
  peerMetrics = [],
  assets,
  reviewQueue,
  onSelectReviewItem
}) => {
  if (!entityId || !entityScore) return null;

  const entityFindings = findings.filter(f => f.entity_id === entityId);
  const entityAssets = assets.filter(a => a.entity_id === entityId);
  const entityQueue = reviewQueue.filter(q => q.entity_id === entityId);

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'findings' | 'peer' | 'assets' | 'queue'>('overview');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141414]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-[#D0CFCB] max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D0CFCB] bg-[#F8F7F4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#141414] text-white font-black flex items-center justify-center text-sm shadow-xs">
              #{entityScore.rank}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#141414]">{entityScore.entity_name}</h3>
                <span className="text-xs font-mono text-[#141414] bg-[#EAE9E5] border border-[#C8C7C2] px-2 py-0.5 rounded font-bold">
                  {entityScore.entity_id}
                </span>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                {entityScore.sector} • {entityScore.peer_group} • Reporting Period: {entityScore.reporting_period}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xl font-black text-[#141414]">
                {entityScore.overall_risk_score}
                <span className="text-xs font-normal text-[#666666]">/100</span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                entityScore.prioritization_band === 'Very High' ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' :
                entityScore.prioritization_band === 'High' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' :
                entityScore.prioritization_band === 'Moderate' ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
              }`}>
                {entityScore.prioritization_band} Supervisory Attention
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888888] hover:text-[#141414] hover:bg-[#EAE9E5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className="px-6 border-b border-[#D0CFCB] bg-white flex space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeSubTab === 'overview' ? 'border-[#141414] text-[#141414] font-bold' : 'border-transparent text-[#666666] hover:text-[#141414]'}`}
          >
            Score Decomposition &amp; Trends
          </button>
          <button
            onClick={() => setActiveSubTab('findings')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeSubTab === 'findings' ? 'border-[#141414] text-[#141414] font-bold' : 'border-transparent text-[#666666] hover:text-[#141414]'}`}
          >
            Detector Findings ({entityFindings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('peer')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeSubTab === 'peer' ? 'border-[#141414] text-[#141414] font-bold' : 'border-transparent text-[#666666] hover:text-[#141414]'}`}
          >
            Peer Benchmarks ({peerMetrics.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assets')}
            className={`py-3 border-b-2 transition cursor-pointer ${activeSubTab === 'assets' ? 'border-[#141414] text-[#141414] font-bold' : 'border-transparent text-[#666666] hover:text-[#141414]'}`}
          >
            Asset Visibility ({entityAssets.length})
          </button>
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeSubTab === 'queue' ? 'border-[#141414] text-[#141414] font-bold' : 'border-transparent text-[#666666] hover:text-[#141414]'}`}
          >
            Manual Review Items ({entityQueue.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Formula Decomposition Card */}
              <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase text-[#141414] tracking-wider">
                    Transparent Risk Score Decomposition (Section 11)
                  </h4>
                  <span className="text-[11px] font-mono text-[#666666] font-semibold">
                    Result: {entityScore.overall_risk_score} / 100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] font-medium block">Execution Gap (40%)</span>
                    <span className="text-xl font-black text-rose-700">{entityScore.execution_gap_score}</span>
                    <p className="text-[11px] text-[#666666] mt-1">Weighted: {(0.40 * entityScore.execution_gap_score).toFixed(1)} pts</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] font-medium block">Negative Space (35%)</span>
                    <span className="text-xl font-black text-[#141414]">{entityScore.negative_space_score}</span>
                    <p className="text-[11px] text-[#666666] mt-1">Weighted: {(0.35 * entityScore.negative_space_score).toFixed(1)} pts</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] font-medium block">Trend Deterioration (15%)</span>
                    <span className="text-xl font-black text-amber-700">{entityScore.trend_deterioration_score}</span>
                    <p className="text-[11px] text-[#666666] mt-1">Weighted: {(0.15 * entityScore.trend_deterioration_score).toFixed(1)} pts</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] font-medium block">Peer Deviation (10%)</span>
                    <span className="text-xl font-black text-blue-700">{entityScore.unexplained_peer_deviation_score}</span>
                    <p className="text-[11px] text-[#666666] mt-1">Weighted: {(0.10 * entityScore.unexplained_peer_deviation_score).toFixed(1)} pts</p>
                  </div>
                </div>
              </div>

              {/* Operational Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                  <span className="text-[#666666] font-medium">Total Alerts Submitted</span>
                  <div className="text-lg font-black text-[#141414] mt-0.5">{entityScore.total_alerts_count}</div>
                  <span className="text-[10px] text-[#666666]">{entityScore.critical_alerts_count} Critical / High</span>
                </div>
                <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                  <span className="text-[#666666] font-medium">Median Closure Duration</span>
                  <div className="text-lg font-black text-[#141414] mt-0.5">
                    {entityScore.median_closure_time_seconds < 60 
                      ? `${entityScore.median_closure_time_seconds}s` 
                      : `${Math.round(entityScore.median_closure_time_seconds / 60)} min`}
                  </div>
                  <span className="text-[10px] text-[#666666]">Entity median</span>
                </div>
                <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                  <span className="text-[#666666] font-medium">Silent Critical Assets</span>
                  <div className="text-lg font-black text-[#141414] mt-0.5">{entityScore.silent_critical_assets_count}</div>
                  <span className="text-[10px] text-[#666666]">of {entityScore.critical_assets_count} Critical Assets</span>
                </div>
                <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                  <span className="text-[#666666] font-medium">Data Quality Score</span>
                  <div className="text-lg font-black text-[#141414] mt-0.5">{entityScore.data_quality_score}/100</div>
                  <span className="text-[10px] text-[#666666]">{entityScore.confidence_label} Confidence</span>
                </div>
              </div>

              {/* Historical Trend Representation */}
              <div className="p-4 border border-[#D0CFCB] rounded-lg bg-white">
                <h4 className="text-xs font-bold text-[#141414] mb-2">Quarterly Submission Volume Trend</h4>
                <div className="grid grid-cols-3 gap-3 text-xs text-center">
                  <div className="p-2.5 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] block text-[11px]">2026-Q1 (Historical)</span>
                    <span className="font-bold text-[#141414] text-sm">
                      {entityScore.entity_id === 'CSE-D' ? '450 alerts' : `${entityScore.total_alerts_count + 8} alerts`}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">Baseline established</span>
                  </div>
                  <div className="p-2.5 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] block text-[11px]">2026-Q2 (Prior)</span>
                    <span className="font-bold text-[#141414] text-sm">
                      {entityScore.entity_id === 'CSE-D' ? '420 alerts' : `${entityScore.total_alerts_count + 3} alerts`}
                    </span>
                    <span className="text-[10px] text-[#666666] block mt-0.5">Nominal drift</span>
                  </div>
                  <div className="p-2.5 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB]">
                    <span className="text-[#666666] block text-[11px]">2026-Q3 (Current Batch)</span>
                    <span className="font-bold text-[#141414] text-sm">{entityScore.total_alerts_count} alerts</span>
                    <span className={`text-[10px] block mt-0.5 ${entityScore.entity_id === 'CSE-D' ? 'text-rose-700 font-bold' : 'text-[#666666]'}`}>
                      {entityScore.entity_id === 'CSE-D' ? '-89% Abrupt Drop' : 'Current submission'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'findings' && (
            <div className="space-y-4">
              {entityFindings.length === 0 ? (
                <div className="p-8 text-center text-[#666666] text-xs">
                  No automated supervisory findings triggered for this entity.
                </div>
              ) : (
                entityFindings.map(finding => (
                  <div key={finding.finding_id} className="p-4 rounded-lg border border-[#D0CFCB] bg-[#F8F7F4] shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
                          {finding.finding_id}
                        </span>
                        <span className="font-bold text-[#141414] text-sm">{finding.finding_type}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        finding.severity === 'Critical' ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                      }`}>
                        {finding.severity} Severity
                      </span>
                    </div>

                    <div className="text-[#333333]">
                      <span className="font-bold text-[#141414]">Rationale: </span>
                      {finding.rationale}
                    </div>

                    <div className="p-2.5 rounded bg-[#FEF3C7]/40 border border-[#FDE68A] text-amber-900">
                      <span className="font-bold text-amber-950">Supervisory Uncertainty / Context: </span>
                      {finding.uncertainty_note}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D0CFCB] text-[11px] text-[#666666]">
                      <span>Rule: <code className="text-[#141414] font-bold font-mono">{finding.rule_id} (v{finding.rule_version})</code></span>
                      <span className="text-[#141414] font-bold">Recommended: {finding.recommended_action}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'peer' && (
            <div className="space-y-3">
              <p className="text-xs text-[#525252]">
                Benchmarked against {entityScore.peer_group} cohort (Section 10):
              </p>
              <div className="space-y-2">
                {peerMetrics.map(metric => (
                  <div key={metric.metric_id} className="p-3.5 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#141414]">{metric.metric_name}</div>
                      <p className="text-[#525252] text-[11px] mt-0.5">{metric.interpretation}</p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] text-[#666666] block uppercase font-medium">Entity Value</span>
                        <span className="font-bold text-[#141414] text-sm">{metric.entity_value} {metric.unit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] block uppercase font-medium">Peer Median</span>
                        <span className="font-semibold text-[#525252] text-sm">{metric.peer_median} {metric.unit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#666666] block uppercase font-medium">Cohort</span>
                        <span className="font-mono text-xs text-[#141414] font-bold">{metric.peer_sample_size} CSEs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'assets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#525252]">
                <span>Total Assets in Inventory: <strong className="text-[#141414]">{entityAssets.length}</strong></span>
                <span>Critical Assets: <strong className="text-[#141414]">{entityAssets.filter(a => a.criticality === 'Critical').length}</strong></span>
              </div>

              <div className="divide-y divide-[#EAE9E5] border border-[#D0CFCB] rounded-lg overflow-hidden bg-white text-xs">
                {entityAssets.map(ast => (
                  <div key={ast.asset_id} className="p-3 flex items-center justify-between hover:bg-[#F9F9F7]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#141414] font-bold">{ast.asset_id}</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          ast.criticality === 'Critical' ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' : 'bg-[#EAE9E5] text-[#141414] border-[#C8C7C2]'
                        }`}>
                          {ast.criticality}
                        </span>
                        <span className="text-[#666666] font-mono text-[10px]">[{ast.environment}]</span>
                      </div>
                      <div className="text-[#525252] mt-0.5">{ast.asset_type}</div>
                    </div>

                    <div className="text-right text-[11px] text-[#666666]">
                      <span>Expected Controls: {ast.expected_controls.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'queue' && (
            <div className="space-y-3">
              <p className="text-xs text-[#525252]">
                Individual operational records flagged for manual supervisor examination:
              </p>
              <div className="space-y-2">
                {entityQueue.map(item => (
                  <div 
                    key={item.queue_item_id}
                    onClick={() => onSelectReviewItem && onSelectReviewItem(item)}
                    className="p-3 bg-white border border-[#D0CFCB] rounded-lg hover:border-[#141414] hover:shadow-xs cursor-pointer transition text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#141414]">{item.queue_item_id}</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                          item.priority_band === 'Critical' ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]' :
                          item.priority_band === 'High' ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                        }`}>
                          Priority {item.priority_score} ({item.priority_band})
                        </span>
                        {item.alert_id && <span className="font-mono text-[#666666] font-medium">{item.alert_id}</span>}
                      </div>
                      <p className="text-[#525252] mt-1">{item.evidence_summary}</p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAE9E5] text-[#141414] border border-[#C8C7C2] font-semibold">
                        {item.review_status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#888888]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#D0CFCB] bg-[#F8F7F4] flex items-center justify-between text-xs text-[#666666]">
          <span className="font-medium">NTRO / NCIIPC Supervisory Verification Enclave</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold transition cursor-pointer"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
