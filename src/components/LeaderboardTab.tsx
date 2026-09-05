import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { EntityRiskScore, Sector } from '../types';

interface LeaderboardTabProps {
  entityScores: EntityRiskScore[];
  onSelectEntity: (entityId: string) => void;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  entityScores,
  onSelectEntity
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Filter entities
  const filteredEntities = entityScores.filter(entity => {
    const matchesSearch = 
      entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.entity_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || entity.sector === selectedSector;
    const matchesBand = selectedBand === 'ALL' || entity.prioritization_band === selectedBand;
    return matchesSearch && matchesSector && matchesBand;
  });

  const exportLeaderboardCSV = () => {
    const headers = [
      'Rank',
      'Entity ID',
      'Entity Name',
      'Sector',
      'Peer Group',
      'Composite Risk Score',
      'Risk Band',
      'Execution Gap Score',
      'Negative Space Score',
      'Trend Deterioration Score',
      'Peer Deviation Score',
      'Data Quality Score',
      'Confidence'
    ];

    const rows = filteredEntities.map(e => [
      e.rank,
      e.entity_id,
      `"${e.entity_name}"`,
      `"${e.sector}"`,
      `"${e.peer_group}"`,
      e.overall_risk_score,
      e.prioritization_band,
      e.execution_gap_score,
      e.negative_space_score,
      e.trend_deterioration_score,
      e.unexplained_peer_deviation_score,
      e.data_quality_score,
      e.confidence_label
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sat_sa_entity_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scoring Methodology Formula */}
      <div className="bg-[#141414] text-[#E4E3E0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#141414]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-[#242424] px-2 py-0.5 rounded border border-[#3A3A3A]">
              Deterministic Scoring Engine v1.2
            </span>
            <span className="text-xs text-[#888888] font-medium">• Transparent Decomposition</span>
          </div>
          <h2 className="text-lg font-black mt-1.5 text-white tracking-tight">Entity Supervisory Risk Leaderboard</h2>
          <div className="mt-2 font-mono text-xs text-amber-300 bg-[#1C1C1C] px-3 py-1.5 rounded border border-[#333333] inline-block font-medium">
            EntityRisk = 0.40 * ExecutionGap + 0.35 * NegativeSpace + 0.15 * Trend + 0.10 * PeerDeviation
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="px-3 py-1.5 bg-[#242424] hover:bg-[#333333] text-[#E4E3E0] rounded text-xs font-semibold border border-[#3E3E3E] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            Formula Details
          </button>
          <button
            onClick={exportLeaderboardCSV}
            className="px-3.5 py-1.5 bg-white hover:bg-[#EAE9E5] text-[#141414] rounded text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Formula Explanation Callout if toggled */}
      {showFormulaModal && (
        <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-4 text-xs text-[#141414] space-y-2 shadow-xs">
          <div className="font-bold text-sm text-[#141414]">Score Interpretations &amp; Prioritization Bands (Section 11)</div>
          <p className="text-[#525252]">
            These are supervisory prioritization bands, not compliance grades or penalty notices. Every score is fully auditable and backed by row-level evidence.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 bg-white rounded border border-[#D0CFCB]">
              <span className="font-black text-rose-600 text-sm">75 – 100</span>
              <p className="text-[#525252] font-medium mt-0.5">Very High Attention</p>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#D0CFCB]">
              <span className="font-black text-amber-600 text-sm">50 – 74</span>
              <p className="text-[#525252] font-medium mt-0.5">High Attention</p>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#D0CFCB]">
              <span className="font-black text-blue-600 text-sm">25 – 49</span>
              <p className="text-[#525252] font-medium mt-0.5">Moderate Attention</p>
            </div>
            <div className="p-2.5 bg-white rounded border border-[#D0CFCB]">
              <span className="font-black text-emerald-600 text-sm">0 – 24</span>
              <p className="text-[#525252] font-medium mt-0.5">Low Attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search entity by name or ID (e.g., CSE-B, Grid, Telecom)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-[#141414] placeholder-[#888888] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#525252]">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            <span className="font-semibold text-[#141414]">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-xs bg-[#F8F7F4] border border-[#D0CFCB] text-[#141414] font-medium rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Critical Sectors</option>
              <option value="Power & Energy">Power &amp; Energy</option>
              <option value="Banking & Financial">Banking &amp; Financial</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Civil Aviation & Transport">Civil Aviation &amp; Transport</option>
              <option value="Strategic & Defense">Strategic &amp; Defense</option>
              <option value="Healthcare & Public Governance">Healthcare &amp; Public Governance</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#525252]">
            <span className="font-semibold text-[#141414]">Band:</span>
            <select
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              className="text-xs bg-[#F8F7F4] border border-[#D0CFCB] text-[#141414] font-medium rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Bands</option>
              <option value="Very High">Very High (75-100)</option>
              <option value="High">High (50-74)</option>
              <option value="Moderate">Moderate (25-49)</option>
              <option value="Low">Low (0-24)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#333333]">
            <thead className="bg-[#F8F7F4] border-b border-[#D0CFCB] text-[#141414] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Sector &amp; Cohort</th>
                <th className="py-3 px-4 text-center">Risk Score</th>
                <th className="py-3 px-4 text-center">Execution Gap (40%)</th>
                <th className="py-3 px-4 text-center">Negative Space (35%)</th>
                <th className="py-3 px-4 text-center">Trend (15%)</th>
                <th className="py-3 px-4 text-center">Data Quality</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE9E5]">
              {filteredEntities.map((entity) => {
                const bandBadge = {
                  'Very High': 'bg-[#FFF5F5] text-[#991B1B] border-[#FECACA]',
                  'High': 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
                  'Moderate': 'bg-[#F0F9FF] text-[#075985] border-[#BAE6FD]',
                  'Low': 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
                };

                return (
                  <tr 
                    key={entity.entity_id}
                    className="hover:bg-[#F9F9F7] transition cursor-pointer"
                    onClick={() => onSelectEntity(entity.entity_id)}
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-[#141414]">
                      <span className="w-6 h-6 inline-flex items-center justify-center rounded bg-[#141414] text-white text-xs font-mono font-bold">
                        {entity.rank}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#141414] text-sm">{entity.entity_name}</div>
                      <div className="text-[11px] text-[#666666] font-mono flex items-center gap-1 mt-0.5">
                        <span>ID: {entity.entity_id}</span>
                        <span>•</span>
                        <span>{entity.reporting_period}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#141414]">{entity.sector}</div>
                      <div className="text-[11px] text-[#666666]">{entity.peer_group}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="text-base font-black text-[#141414]">
                        {entity.overall_risk_score}
                      </div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${bandBadge[entity.prioritization_band]}`}>
                        {entity.prioritization_band}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-[#141414]">{entity.execution_gap_score}</div>
                      <div className="w-16 bg-[#EAE9E5] rounded h-1.5 mx-auto mt-1 overflow-hidden border border-[#D0CFCB]/50">
                        <div
                          className="bg-rose-600 h-1.5"
                          style={{ width: `${entity.execution_gap_score}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-[#141414]">{entity.negative_space_score}</div>
                      <div className="w-16 bg-[#EAE9E5] rounded h-1.5 mx-auto mt-1 overflow-hidden border border-[#D0CFCB]/50">
                        <div
                          className="bg-purple-600 h-1.5"
                          style={{ width: `${entity.negative_space_score}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-[#141414]">{entity.trend_deterioration_score}</div>
                      <div className="w-16 bg-[#EAE9E5] rounded h-1.5 mx-auto mt-1 overflow-hidden border border-[#D0CFCB]/50">
                        <div
                          className="bg-amber-600 h-1.5"
                          style={{ width: `${entity.trend_deterioration_score}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-[#141414]">{entity.data_quality_score}/100</div>
                      <span className={`text-[10px] font-bold ${entity.confidence_label === 'High' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {entity.confidence_label} Conf.
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEntity(entity.entity_id);
                        }}
                        className="px-2.5 py-1 bg-[#141414] hover:bg-[#2A2A2A] text-white rounded text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        Deep Dive
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
