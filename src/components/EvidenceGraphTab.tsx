import React, { useState, useEffect } from 'react';
import { 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDown, 
  Layers, 
  Search, 
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AlertRecord, CaseRecord, EscalationRecord, AssetRecord, EntityRecord } from '../types';

interface EvidenceGraphTabProps {
  entities: EntityRecord[];
  assets: AssetRecord[];
  alerts: AlertRecord[];
  cases: CaseRecord[];
  escalations: EscalationRecord[];
  initialAlertId?: string;
}

export const EvidenceGraphTab: React.FC<EvidenceGraphTabProps> = ({
  entities,
  assets,
  alerts,
  cases,
  escalations,
  initialAlertId
}) => {
  // Find interesting alerts to select (e.g. fast closed, un-escalated, normal)
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    initialAlertId || alerts.find(a => a.entity_id === 'CSE-B')?.alert_id || alerts[0]?.alert_id || ''
  );

  // Synchronize when parent navigates to a specific alert
  useEffect(() => {
    if (initialAlertId) {
      setSelectedAlertId(initialAlertId);
    }
  }, [initialAlertId]);

  const currentAlert = alerts.find(a => a.alert_id === selectedAlertId) || alerts[0];
  const currentEntity = entities.find(e => e.entity_id === currentAlert?.entity_id);
  const currentAsset = assets.find(a => a.asset_id === currentAlert?.asset_id);
  const currentCase = cases.find(c => c.alert_id === currentAlert?.alert_id || c.case_id === currentAlert?.case_id);
  const currentEscalations = currentCase ? escalations.filter(e => e.case_id === currentCase.case_id) : [];

  // Duration in seconds
  const closureDurationSeconds = (currentAlert?.created_at && currentAlert?.closed_at)
    ? Math.round((new Date(currentAlert.closed_at).getTime() - new Date(currentAlert.created_at).getTime()) / 1000)
    : null;

  // Evaluate chain integrity
  const isFastClosure = closureDurationSeconds !== null && closureDurationSeconds <= 120 && (currentAlert?.severity === 'Critical' || currentAlert?.severity === 'High');
  const isMissingCase = !currentCase && currentAlert?.severity === 'Critical';
  const isMissingEscalation = currentAlert?.severity === 'Critical' && currentCase && currentEscalations.length === 0;
  const isCannedNote = currentCase?.investigation_notes && currentCase.investigation_notes.length < 20;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
              Evidence Graph &amp; Relationship Chain (Section 14)
            </span>
            <span className="text-xs text-[#666666] font-medium">• Traceable Record Lineage</span>
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            End-to-End Operational Lifecycle Visualizer
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            Inspects the chain: <span className="font-mono text-xs font-semibold text-[#141414]">Entity → Asset → Alert → Case → Investigation → Escalation → Closure</span>. Automatically highlights broken policy links and suspicious fast closures.
          </p>
        </div>

        {/* Quick Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-[#525252] font-bold">Select Incident:</label>
          <select
            value={selectedAlertId}
            onChange={(e) => setSelectedAlertId(e.target.value)}
            className="text-xs bg-white border border-[#D0CFCB] rounded px-3 py-1.5 font-mono text-[#141414] font-medium focus:outline-none cursor-pointer"
          >
            {selectedAlertId && !alerts.filter(a => ['CSE-A', 'CSE-B', 'CSE-C'].includes(a.entity_id)).slice(0, 24).some(a => a.alert_id === selectedAlertId) && (
              <option value={selectedAlertId}>
                Target: {selectedAlertId} ({currentAlert?.entity_id} - {currentAlert?.severity})
              </option>
            )}
            <optgroup label="CSE-B (Fast Closure &amp; Repetitive Notes)">
              {alerts.filter(a => a.entity_id === 'CSE-B').slice(0, 10).map(a => (
                <option key={a.alert_id} value={a.alert_id}>
                  {a.alert_id} ({a.severity} - Fast Closed)
                </option>
              ))}
            </optgroup>
            <optgroup label="CSE-C (Escalation Bypass)">
              {alerts.filter(a => a.entity_id === 'CSE-C').slice(0, 10).map(a => (
                <option key={a.alert_id} value={a.alert_id}>
                  {a.alert_id} ({a.severity} - Missing Escalation)
                </option>
              ))}
            </optgroup>
            <optgroup label="CSE-A (Normal Compliant Lifecycle)">
              {alerts.filter(a => a.entity_id === 'CSE-A').slice(0, 10).map(a => (
                <option key={a.alert_id} value={a.alert_id}>
                  {a.alert_id} ({a.severity} - Fully Escalated)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Chain Viewer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Vertical Relationship Chain */}
        <div className="lg:col-span-6 bg-white border border-[#D0CFCB] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#141414] flex items-center justify-between">
            <span>Operational Relationship Flow</span>
            <span className="text-xs font-mono text-[#666666]">Alert: {currentAlert?.alert_id}</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D0CFCB]">
            {/* Step 1: Entity */}
            <div className="relative">
              <span className="absolute -left-6 top-1.5 w-5 h-5 rounded bg-[#141414] text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <div className="p-3.5 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Critical Sector Entity</span>
                  <span className="font-mono text-[#666666]">{currentEntity?.entity_id}</span>
                </div>
                <p className="text-[#333333] font-semibold mt-1">{currentEntity?.entity_name}</p>
                <div className="text-[11px] text-[#666666] mt-0.5">Sector: {currentEntity?.sector}</div>
              </div>
            </div>

            {/* Step 2: Asset */}
            <div className="relative">
              <span className="absolute -left-6 top-1.5 w-5 h-5 rounded bg-[#141414] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <div className="p-3.5 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Target Asset Inventory Record</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentAsset?.criticality === 'Critical' ? 'bg-[#FFF5F5] text-[#991B1B] border border-[#FECACA]' : 'bg-[#EAE9E5] text-[#141414]'
                  }`}>
                    {currentAsset?.criticality || 'Unknown'} Criticality
                  </span>
                </div>
                <p className="text-[#333333] font-bold mt-1">{currentAsset?.asset_type || 'Unknown Asset'}</p>
                <div className="font-mono text-[11px] text-[#666666] mt-0.5">ID: {currentAsset?.asset_id}</div>
              </div>
            </div>

            {/* Step 3: Alert Ingestion */}
            <div className="relative">
              <span className="absolute -left-6 top-1.5 w-5 h-5 rounded bg-[#141414] text-white flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <div className="p-3.5 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Telemetry Ingestion &amp; Alert</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentAlert?.severity === 'Critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {currentAlert?.severity}
                  </span>
                </div>
                <div className="font-semibold text-[#141414] mt-1">{currentAlert?.alert_category}</div>
                <div className="text-[11px] text-[#666666] mt-1 flex items-center gap-2">
                  <span>Created: {currentAlert?.created_at}</span>
                  <span>•</span>
                  <span>Sensor: {currentAlert?.source_control}</span>
                </div>
              </div>
            </div>

            {/* Step 4: Case Creation & Investigation */}
            <div className="relative">
              <span className="absolute -left-6 top-1.5 w-5 h-5 rounded bg-[#141414] text-white flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <div className={`p-3.5 rounded-lg text-xs border ${
                isMissingCase ? 'bg-[#FFF5F5] border-[#FECACA]' : 'bg-[#F8F7F4] border-[#D0CFCB]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Case Investigation Record</span>
                  {isMissingCase ? (
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      MISSING CASE
                    </span>
                  ) : (
                    <span className="font-mono text-[#666666]">{currentCase?.case_id}</span>
                  )}
                </div>
                {currentCase ? (
                  <>
                    <div className="mt-1.5 text-[#333333]">
                      <span className="font-bold text-[#141414]">Analyst Note: </span>
                      <span className="italic font-medium">"{currentCase.investigation_notes}"</span>
                    </div>
                    {isCannedNote && (
                      <div className="mt-1.5 text-[11px] text-amber-800 font-semibold">
                        ⚠️ Note appears truncated / boilerplate (&lt;20 chars)
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-rose-700 mt-1.5 font-semibold">
                    Critical alert closed without mandatory case creation!
                  </p>
                )}
              </div>
            </div>

            {/* Step 5: Escalation Link (Crucial Supervisory Signal) */}
            <div className="relative">
              <span className={`absolute -left-6 top-1.5 w-5 h-5 rounded text-white flex items-center justify-center text-[10px] font-bold ${
                isMissingEscalation ? 'bg-rose-600' : 'bg-[#141414]'
              }`}>
                5
              </span>
              <div className={`p-3.5 rounded-lg text-xs border ${
                isMissingEscalation ? 'bg-[#FFF5F5] border-[#FECACA] text-[#991B1B]' : 'bg-[#F8F7F4] border-[#D0CFCB] text-[#333333]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Incident Escalation Record</span>
                  {isMissingEscalation ? (
                    <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      BROKEN LINK (POLICY BYPASS)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Escalation Confirmed
                    </span>
                  )}
                </div>

                {isMissingEscalation ? (
                  <p className="mt-1.5 text-xs text-rose-800 leading-relaxed font-medium">
                    High/Critical impact case closed internally without notifying mandated sectoral coordination center or CISO.
                  </p>
                ) : (
                  currentEscalations.map(e => (
                    <div key={e.escalation_id} className="mt-1 text-[11px] text-[#525252]">
                      <span className="font-semibold text-[#141414]">{e.escalation_type}</span> to <span className="font-mono text-[#141414]">{e.recipient_role}</span> • Outcome: {e.outcome}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Step 6: Case Closure & Duration Verification */}
            <div className="relative">
              <span className={`absolute -left-6 top-1.5 w-5 h-5 rounded text-white flex items-center justify-center text-[10px] font-bold ${
                isFastClosure ? 'bg-amber-600' : 'bg-[#141414]'
              }`}>
                6
              </span>
              <div className={`p-3.5 rounded-lg text-xs border ${
                isFastClosure ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : 'bg-[#F8F7F4] border-[#D0CFCB] text-[#333333]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#141414]">Closure Lifecycle Verification</span>
                  {isFastClosure ? (
                    <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      SUSPICIOUS RAPID CLOSURE
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Valid Operating Envelope
                    </span>
                  )}
                </div>

                <div className="mt-1.5">
                  Closed at: <span className="font-mono text-[#141414] font-medium">{currentAlert?.closed_at}</span>
                  {closureDurationSeconds !== null && (
                    <div className="font-bold text-[#141414] mt-1">
                      Elapsed Duration: {closureDurationSeconds} seconds
                      {isFastClosure && (
                        <span className="text-amber-800 block font-medium text-[11px] mt-0.5">
                          Alert closed in {closureDurationSeconds}s against expected peer baseline of ~40 minutes.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact Underlying Row Data & Examiner Analysis */}
        <div className="lg:col-span-6 space-y-6">
          {/* Table Payload Inspector */}
          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs text-xs space-y-4">
            <h3 className="font-bold text-sm text-[#141414]">
              Raw Record Payload &amp; Traceability
            </h3>

            <div className="bg-[#141414] text-[#E4E3E0] p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1 border border-[#242424]">
              <div className="text-[#888888]">// Normalized Alert Record</div>
              <div>alert_id: "{currentAlert?.alert_id}"</div>
              <div>entity_id: "{currentAlert?.entity_id}"</div>
              <div>asset_id: "{currentAlert?.asset_id}"</div>
              <div>severity: "{currentAlert?.severity}"</div>
              <div>created_at: "{currentAlert?.created_at}"</div>
              <div>closed_at: "{currentAlert?.closed_at}"</div>
              <div>disposition: "{currentAlert?.disposition}"</div>
              <div>source_file: "{currentEntity?.source_file}"</div>
              <div>source_row: {currentAlert?.source_row_number}</div>
            </div>

            {currentCase && (
              <div className="bg-[#141414] text-[#E4E3E0] p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1 border border-[#242424]">
                <div className="text-[#888888]">// Linked Case Investigation Record</div>
                <div>case_id: "{currentCase.case_id}"</div>
                <div>investigator_id_hash: "{currentCase.investigator_id_hash}"</div>
                <div>started_at: "{currentCase.investigation_started_at}"</div>
                <div>completed_at: "{currentCase.investigation_completed_at}"</div>
                <div>impact: "{currentCase.impact}"</div>
                <div>notes: "{currentCase.investigation_notes}"</div>
                <div>source_row: {currentCase.source_row_number}</div>
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};
