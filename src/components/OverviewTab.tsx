import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  ShieldAlert, 
  AlertTriangle, 
  EyeOff, 
  Database, 
  Activity, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  FileCheck,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { EntityRiskScore, FindingRecord, ReviewQueueItem, DataQualityReport } from '../types';

interface OverviewTabProps {
  entityScores: EntityRiskScore[];
  findings: FindingRecord[];
  reviewQueue: ReviewQueueItem[];
  dataQuality: DataQualityReport;
  onSelectEntity: (entityId: string) => void;
  onNavigateTab: (tab: string) => void;
  datasetHash: string;
  runId: string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  entityScores,
  findings,
  reviewQueue,
  dataQuality,
  onSelectEntity,
  onNavigateTab,
  datasetHash,
  runId
}) => {
  const highRiskEntities = entityScores.filter(e => e.overall_risk_score >= 50);
  const executionGapFindings = findings.filter(f => f.finding_class === 'execution_gap');
  const negativeSpaceFindings = findings.filter(f => f.finding_class === 'negative_space');
  const silentCriticalAssets = entityScores.reduce((acc, e) => acc + e.silent_critical_assets_count, 0);
  const criticalWithoutEscalation = findings.filter(f => f.rule_id === 'EXEC-ESC-BYPASS-002').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Supervisory Mandate Notice */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2.5 py-0.5 rounded border border-[#C8C7C2]">
              Air-Gapped Supervisory Decision Support
            </span>
            <span className="text-xs text-[#666666] font-medium">• Human-In-The-Loop Examiner Enclave</span>
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            Critical Sector Entity (CSE) Periodic Assessment Overview
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            SAT-SA examines batch operational records to detect <span className="font-bold text-[#141414]">Execution Gaps</span> (nominal controls with superficial triage) and <span className="font-bold text-[#141414]">Negative Space</span> (unmonitored critical assets and sudden coverage drops).
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('queue')}
            className="px-4 py-2 bg-[#141414] hover:bg-[#2A2A2A] text-white rounded-md text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            Review Priority Queue ({reviewQueue.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigateTab('benchmark')}
            className="px-3.5 py-2 bg-[#EAE9E5] hover:bg-[#DDDCD7] text-[#141414] border border-[#C8C7C2] rounded-md text-xs font-semibold transition"
          >
            Synthetic Ground-Truth Matrix
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>High Supervisory Attention</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{highRiskEntities.length}</span>
            <span className="text-xs text-[#666666] font-medium">/ {entityScores.length} Entities</span>
          </div>
          <p className="text-xs text-[#525252] mt-1.5">
            Entities with composite score ≥ 50 requiring priority supervisory review.
          </p>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Critical Alerts Missing Escalation</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">{criticalWithoutEscalation > 0 ? 'Policy Bypass' : '0'}</span>
            <span className="text-xs text-[#666666] font-mono">EXEC-002</span>
          </div>
          <p className="text-xs text-[#525252] mt-1.5">
            High/Critical cases closed without mandatory CISO/Tier-2 escalation.
          </p>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Silent Critical Assets</span>
            <EyeOff className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{silentCriticalAssets}</span>
            <span className="text-xs text-[#666666] font-medium">Negative Space</span>
          </div>
          <p className="text-xs text-[#525252] mt-1.5">
            Critical OT/SCADA assets with zero telemetry in submitted period.
          </p>
        </div>

        <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#666666] text-xs font-semibold">
            <span>Data-Quality Integrity Score</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#141414]">{dataQuality.overall_score}</span>
            <span className="text-xs text-[#666666] font-medium">/ 100 Index</span>
          </div>
          <p className="text-xs text-[#525252] mt-1.5">
            {dataQuality.issues.length} structural flags (temporal inversions, orphan IDs).
          </p>
        </div>
      </div>

      {/* Two-Column Layout: High Priority Entities & Active Supervisory Detectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Entities Requiring Immediate Attention */}
        <div className="lg:col-span-7 bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#141414] text-sm">
                Entities Requiring Supervisory Attention
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Ranked by transparent formula: 0.40(Execution) + 0.35(Negative Space) + 0.15(Trend) + 0.10(Peer)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('leaderboard')}
              className="text-xs text-[#141414] hover:text-black font-bold flex items-center gap-1 bg-[#EAE9E5] hover:bg-[#DDDCD7] px-2.5 py-1 rounded border border-[#C8C7C2] transition"
            >
              Full Leaderboard
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Recharts Multi-Metric Comparative Bar Chart */}
          <div className="mb-5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="text-xs font-bold text-neutral-800 mb-2 flex items-center justify-between">
              <span>Comparative Supervisory Risk Vector (Recharts)</span>
              <span className="text-[11px] font-mono text-neutral-500">Scores 0–100</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={entityScores.map(e => ({
                    name: e.entity_id,
                    'Composite Risk': e.overall_risk_score ?? 0,
                    'Execution Gap': e.execution_gap_score ?? 0,
                    'Negative Space': e.negative_space_score ?? 0
                  }))} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#777' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '6px', color: '#fff', fontSize: '11px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="Composite Risk" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Execution Gap" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Negative Space" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            {entityScores.map((score) => {
              const bandColors = {
                'Very High': 'bg-[#FFF5F5] border-[#FCA5A5]',
                'High': 'bg-[#FFFBEB] border-[#FCD34D]',
                'Moderate': 'bg-[#F0F9FF] border-[#BAE6FD]',
                'Low': 'bg-[#F0FDF4] border-[#BBF7D0]'
              };

              const badgeColors = {
                'Very High': 'bg-rose-600 text-white',
                'High': 'bg-amber-600 text-white',
                'Moderate': 'bg-[#0284C7] text-white',
                'Low': 'bg-emerald-600 text-white'
              };

              return (
                <div
                  key={score.entity_id}
                  onClick={() => onSelectEntity(score.entity_id)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
                    bandColors[score.prioritization_band]
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-[#141414] text-white flex items-center justify-center text-xs font-bold font-mono">
                      #{score.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#141414]">{score.entity_name}</span>
                        <span className="text-xs text-[#666666] font-mono">({score.entity_id})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#525252] mt-0.5">
                        <span className="font-semibold text-[#141414]">{score.sector}</span>
                        <span>•</span>
                        <span>{score.peer_group}</span>
                        <span>•</span>
                        <span>DQ: {score.data_quality_score}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="text-lg font-black text-[#141414]">
                        {score.overall_risk_score}
                        <span className="text-xs font-normal text-[#666666]">/100</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${badgeColors[score.prioritization_band]}`}>
                        {score.prioritization_band}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#888888]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Supervisory Failure Modes & Core Detectors */}
        <div className="lg:col-span-5 space-y-6">
          {/* Failure Modes Box */}
          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs">
            <h3 className="font-bold text-[#141414] text-sm mb-3">
              Supervisory Failure Modes Detected
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-[#FFF5F5] border border-[#FECACA] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#991B1B] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-600" />
                    Execution Gaps ({executionGapFindings.length} findings)
                  </span>
                  <button 
                    onClick={() => onNavigateTab('findings')}
                    className="text-[11px] text-[#991B1B] font-bold underline cursor-pointer"
                  >
                    View
                  </button>
                </div>
                <p className="text-xs text-[#7F1D1D] mt-1 leading-relaxed">
                  Nominal controls are documented, but operational records indicate superficial triage (e.g. 40s closures, boilerplate notes, un-escalated high impacts).
                </p>
              </div>

              <div className="p-3 bg-[#FAF5FF] border border-[#E9D5FF] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#6B21A8] flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-purple-600" />
                    Negative Space ({negativeSpaceFindings.length} findings)
                  </span>
                  <button 
                    onClick={() => onNavigateTab('findings')}
                    className="text-[11px] text-[#6B21A8] font-bold underline cursor-pointer"
                  >
                    View
                  </button>
                </div>
                <p className="text-xs text-[#581C87] mt-1 leading-relaxed">
                  Expected evidence is missing: critical SCADA/domain controller assets with zero telemetry, or sudden 85% coverage drops across quarters.
                </p>
              </div>
            </div>
          </div>

          {/* 7 Core Detectors Status */}
          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#141414] text-sm">
                Deterministic Decision Support Layer
              </h3>
              <span className="text-[10px] font-mono font-semibold text-[#666666] bg-[#EAE9E5] px-1.5 py-0.5 rounded border border-[#C8C7C2]">
                v1.2.0-STABLE
              </span>
            </div>

            <div className="text-xs space-y-2 text-[#333333]">
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#141414]" />
                  9.1 Fast Closure Detector (&lt;120s vs peer IQR)
                </span>
                <span className="font-bold text-rose-600 text-[11px]">Triggered</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  9.2 Escalation Bypass Detector (Unlinked cases)
                </span>
                <span className="font-bold text-rose-600 text-[11px]">Triggered</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                  9.3 Repetitive Notes (Cosine/TF-IDF)
                </span>
                <span className="font-bold text-rose-600 text-[11px]">Triggered</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <EyeOff className="w-3.5 h-3.5 text-purple-600" />
                  9.4 Silent Critical Asset Detector
                </span>
                <span className="font-bold text-purple-700 text-[11px]">Triggered</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  9.5 Coverage-Drop Detector (&gt;50% Delta)
                </span>
                <span className="font-bold text-amber-600 text-[11px]">Triggered</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#525252]" />
                  9.6 Peer-Relative Low Activity (Normalized)
                </span>
                <span className="font-bold text-[#525252] text-[11px]">Active</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#F8F7F4] border border-[#E5E4DE]">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  9.8 Data Quality Integrity Assessor
                </span>
                <span className="font-bold text-emerald-700 text-[11px]">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
