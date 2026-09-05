import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  X,
  FileSearch,
  UserCheck
} from 'lucide-react';
import { ReviewQueueItem, ReviewStatus, UserRole, UserProfile } from '../types';

interface ReviewQueueTabProps {
  queueItems: ReviewQueueItem[];
  userRole: UserRole;
  currentUser?: UserProfile;
  onUpdateStatus: (itemId: string, status: ReviewStatus, comment: string) => void;
  onViewEvidenceGraph?: (alertId?: string) => void;
}

export const ReviewQueueTab: React.FC<ReviewQueueTabProps> = ({
  queueItems,
  userRole,
  currentUser,
  onUpdateStatus,
  onViewEvidenceGraph
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBand, setSelectedBand] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [activeItem, setActiveItem] = useState<ReviewQueueItem | null>(null);
  const [examinerCommentInput, setExaminerCommentInput] = useState('');
  const [examinerStatusInput, setExaminerStatusInput] = useState<ReviewStatus>('Pending');

  // Filter queue
  const filteredItems = queueItems.filter(item => {
    const matchesSearch = 
      (item.alert_id && item.alert_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.case_id && item.case_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.evidence_summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || item.review_status === selectedStatus;
    const matchesBand = selectedBand === 'ALL' || item.priority_band === selectedBand;
    const matchesEntity = selectedEntity === 'ALL' || item.entity_id === selectedEntity;
    return matchesSearch && matchesStatus && matchesBand && matchesEntity;
  });

  const uniqueEntities = Array.from(new Set(queueItems.map(q => q.entity_name)));

  const handleOpenItem = (item: ReviewQueueItem) => {
    setActiveItem(item);
    setExaminerCommentInput(item.examiner_comment || '');
    setExaminerStatusInput(item.review_status);
  };

  const handleSaveExaminerDecision = () => {
    if (!activeItem) return;
    onUpdateStatus(activeItem.queue_item_id, examinerStatusInput, examinerCommentInput);
    setActiveItem({
      ...activeItem,
      review_status: examinerStatusInput,
      examiner_comment: examinerCommentInput
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
              Prioritized Operational Queue (Section 12)
            </span>
            <span className="text-xs text-[#666666] font-medium">• Specific Alerts &amp; Cases (Not just Entity Names)</span>
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            Examiner Triage &amp; Manual Verification Queue
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            Reduces large periodic operational submissions to a defensible, auditable priority queue weighted by <span className="font-mono text-xs font-semibold text-[#141414]">0.30(Severity) + 0.25(Execution Evidence) + 0.20(Asset Crit) + 0.15(Peer Dev) + 0.10(Chain Integrity)</span>.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-[#141414]">{queueItems.length}</div>
          <span className="text-xs text-[#666666] font-semibold">Prioritized Records</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by Alert ID, Case ID, Entity, or Evidence Keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-[#141414] placeholder-[#888888] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#525252]">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            <span className="font-semibold text-[#141414]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-[#F8F7F4] border border-[#D0CFCB] text-[#141414] font-medium rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified Issue">Verified Issue</option>
              <option value="False Positive">False Positive</option>
              <option value="Exception Noted">Exception Noted</option>
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
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#333333]">
            <thead className="bg-[#F8F7F4] border-b border-[#D0CFCB] text-[#141414] font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Score</th>
                <th className="py-3 px-4">Alert / Case ID</th>
                <th className="py-3 px-4">Entity &amp; Asset</th>
                <th className="py-3 px-4">Supervisory Evidence Summary</th>
                <th className="py-3 px-4 text-center">Review Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE9E5]">
              {filteredItems.map((item) => {
                const bandBadge = {
                  'Critical': 'bg-rose-600 text-white',
                  'High': 'bg-amber-600 text-white',
                  'Medium': 'bg-[#141414] text-white',
                  'Low': 'bg-[#666666] text-white'
                };

                const statusColors = {
                  'Pending': 'bg-[#F8F7F4] text-[#525252] border-[#D0CFCB]',
                  'Under Review': 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD]',
                  'Verified Issue': 'bg-[#FFF5F5] text-[#991B1B] border-[#FECACA] font-bold',
                  'False Positive': 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
                  'Exception Noted': 'bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]'
                };

                return (
                  <tr 
                    key={item.queue_item_id}
                    onClick={() => handleOpenItem(item)}
                    className="hover:bg-[#F9F9F7] transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded font-mono ${bandBadge[item.priority_band]}`}>
                        {item.priority_score}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#141414]">
                        {item.alert_id || item.case_id || item.queue_item_id}
                      </div>
                      {item.case_id && item.alert_id && (
                        <div className="font-mono text-[10px] text-[#666666]">
                          Case: {item.case_id}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#141414]">{item.entity_name}</div>
                      <div className="text-[11px] text-[#666666] font-mono">
                        {item.asset_id || 'Systemic'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-[#333333] line-clamp-2 leading-relaxed">{item.evidence_summary}</p>
                      {item.examiner_comment && (
                        <div className="mt-1 text-[11px] text-[#141414] font-medium flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#666666]" />
                          <span>Note: "{item.examiner_comment}"</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold ${statusColors[item.review_status]}`}>
                        {item.review_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(item);
                        }}
                        className="px-3 py-1 bg-[#141414] hover:bg-[#2A2A2A] text-white rounded text-xs font-bold inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                      >
                        Examine
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

      {/* Examiner Modal / Drawer for In-depth Triage */}
      {activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#D0CFCB] max-w-2xl w-full flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#D0CFCB] bg-[#F8F7F4] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
                    {activeItem.queue_item_id}
                  </span>
                  <span className="font-bold text-[#141414]">
                    {activeItem.alert_id || activeItem.case_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeItem.priority_band === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    Priority {activeItem.priority_score}
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-0.5 font-medium">
                  {activeItem.entity_name} ({activeItem.entity_id}) • Asset: {activeItem.asset_id || 'Global'}
                </p>
              </div>

              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#EAE9E5] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              {/* Supervisory Evidence Breakdown */}
              <div className="p-3.5 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg space-y-2">
                <span className="font-bold text-[#141414] block text-xs uppercase tracking-wider">
                  Observed Operational Evidence
                </span>
                <p className="text-[#333333] text-sm leading-relaxed">{activeItem.evidence_summary}</p>
                {activeItem.details?.closure_duration_seconds !== undefined && (
                  <div className="flex items-center gap-4 text-[#525252] pt-1.5 border-t border-[#D0CFCB]">
                    <span>Closure Duration: <strong className="text-[#141414]">{activeItem.details.closure_duration_seconds} seconds</strong></span>
                    {activeItem.details.peer_deviation && (
                      <span>Comparison: <strong className="text-[#141414]">{activeItem.details.peer_deviation}</strong></span>
                    )}
                  </div>
                )}
                {activeItem.details?.investigation_notes && (
                  <div className="pt-2 border-t border-[#D0CFCB]">
                    <span className="text-[#666666] font-medium block">Submitted Investigation Note:</span>
                    <blockquote className="italic text-[#333333] bg-white p-2.5 rounded border border-[#D0CFCB] mt-1">
                      "{activeItem.details.investigation_notes}"
                    </blockquote>
                  </div>
                )}
              </div>

              {/* Action link to Evidence Chain Graph */}
              {onViewEvidenceGraph && (
                <button
                  onClick={() => {
                    onViewEvidenceGraph(activeItem.alert_id);
                    setActiveItem(null);
                  }}
                  className="w-full py-2.5 bg-[#EAE9E5] hover:bg-[#DDDCD7] text-[#141414] font-bold rounded-md border border-[#C8C7C2] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                  <FileSearch className="w-4 h-4" />
                  Inspect Full Lifecycle in Evidence Chain Graph
                </button>
              )}

              {/* Human-in-the-loop Examiner Review Controls */}
              <div className="pt-3 border-t border-[#D0CFCB] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414] text-xs flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-[#141414]" />
                    Examiner Supervisory Determination (Human Decision)
                  </span>
                  <span className="text-[#666666] font-mono text-[11px]">Role: {userRole}</span>
                </div>

                {userRole === 'Read-only Reviewer' ? (
                  <div className="p-3.5 bg-[#FFF1F2] rounded-lg text-xs text-[#9F1239] border border-[#FECDD3] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Auditor Mode (Read-Only Jurisdictional Clearance)</span>
                    </div>
                    <p className="text-[11px] text-[#881337]">
                      Logged in as <strong>{currentUser?.name || 'Compliance Auditor'}</strong> ({currentUser?.badge_id || 'CERT-AUD-920'}). Modification of official supervisory determinations requires Examiner or Administrator clearance. Use the User Menu in the header to switch roles.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#525252] block mb-1 font-semibold">Determination Status:</label>
                        <select
                          value={examinerStatusInput}
                          onChange={(e) => setExaminerStatusInput(e.target.value as ReviewStatus)}
                          className="w-full bg-[#F8F7F4] border border-[#D0CFCB] rounded px-2.5 py-1.5 text-xs text-[#141414] font-medium focus:outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Under Review">Under Review (Assigned)</option>
                          <option value="Verified Issue">Verified Issue (Execution Failure)</option>
                          <option value="False Positive">False Positive (Benign Automation)</option>
                          <option value="Exception Noted">Exception Noted (Approved Policy Deviation)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[#525252] block mb-1 font-semibold">Examiner Signature / ID:</label>
                        <input
                          type="text"
                          readOnly
                          value={currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : `EXAMINER-${userRole.toUpperCase()}-01`}
                          className="w-full bg-[#EAE9E5] border border-[#D0CFCB] rounded px-2.5 py-1.5 text-xs text-[#141414] font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#525252] block mb-1 font-semibold">
                        Supervisory Conclusion &amp; Audit Comments:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Document human findings, interview notes, or formal justification for supervisory conclusion..."
                        value={examinerCommentInput}
                        onChange={(e) => setExaminerCommentInput(e.target.value)}
                        className="w-full bg-white border border-[#D0CFCB] rounded p-2.5 text-xs text-[#141414] focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setActiveItem(null)}
                        className="px-3.5 py-1.5 rounded bg-[#EAE9E5] text-[#141414] font-semibold hover:bg-[#DDDCD7] border border-[#C8C7C2] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveExaminerDecision}
                        className="px-4 py-1.5 rounded bg-[#141414] text-white font-bold hover:bg-[#2A2A2A] shadow-xs cursor-pointer"
                      >
                        Save Determination
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
