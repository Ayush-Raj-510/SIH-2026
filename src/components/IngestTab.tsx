import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Hash, 
  ArrowRight, 
  Download,
  FileCheck,
  RefreshCw,
  Copy,
  Layers,
  Shield,
  Eye,
  Check,
  Zap,
  BarChart3,
  ListFilter,
  Archive
} from 'lucide-react';
import { computeSHA256, formatShortHash } from '../engine/crypto';
import { parseUploadedSOCData, IngestSummary, ParseResult } from '../engine/dataParser';
import { 
  SAMPLE_ALERTS_CSV, 
  SAMPLE_CASES_CSV,
  SAMPLE_ASSETS_CSV,
  SAMPLE_ENTITIES_CSV,
  SAMPLE_ESCALATIONS_CSV,
  SAMPLE_RANSOMWARE_CSV, 
  SAMPLE_JSON_DATASET,
  createSampleZipBlob
} from '../data/sampleDatasets';
import { SyntheticDataset } from '../data/syntheticGenerator';
import { UserRole, UserProfile } from '../types';

interface IngestTabProps {
  onIngestSuccess: (dataset: SyntheticDataset, summary: IngestSummary) => void;
  userRole?: UserRole;
  currentUser?: UserProfile;
  currentDataset: SyntheticDataset;
  onNavigateToOverview: () => void;
  onNavigateToLeaderboard: () => void;
  onNavigateToFindings: () => void;
  onNavigateToQueue: () => void;
  activeDatasetName?: string;
  isCustomDataset?: boolean;
  onResetBaseline?: () => void;
}

export const IngestTab: React.FC<IngestTabProps> = ({ 
  onIngestSuccess,
  userRole = 'Examiner',
  currentUser,
  currentDataset,
  onNavigateToOverview,
  onNavigateToLeaderboard,
  onNavigateToFindings,
  onNavigateToQueue,
  activeDatasetName = 'Default 6-CSE Ground-Truth Baseline',
  isCustomDataset = false,
  onResetBaseline
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [ingestMode, setIngestMode] = useState<'replace' | 'append'>('replace');
  const [activeInputMethod, setActiveInputMethod] = useState<'file' | 'paste' | 'preset'>('file');
  const [pastedContent, setPastedContent] = useState('');
  const [pastedFileName, setPastedFileName] = useState('pasted_soc_batch.csv');

  // Ingestion execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<IngestSummary | null>(null);
  const [normalizedPreview, setNormalizedPreview] = useState<SyntheticDataset | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const executeIngest = async (fileName: string, rawContent: string | ArrayBuffer) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result: ParseResult = await parseUploadedSOCData(
        fileName,
        rawContent,
        currentDataset,
        ingestMode
      );

      if (!result.success || !result.dataset || !result.summary) {
        setErrorMessage(result.error || 'Failed to parse file. Please check format.');
        setIsProcessing(false);
        return;
      }

      setLastSummary(result.summary);
      setNormalizedPreview(result.dataset);
      onIngestSuccess(result.dataset, result.summary);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during ingestion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (content) {
          executeIngest(file.name, content);
        }
      };
      if (isZip) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (content) {
          executeIngest(file.name, content);
        }
      };
      if (isZip) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleDownloadSampleZip = async () => {
    try {
      const zipBlob = await createSampleZipBlob();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'nciipc_soc_submission_bundle.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMessage('Failed to generate sample ZIP: ' + (err?.message || 'Error'));
    }
  };

  const handleLoadSampleZip = async () => {
    try {
      const zipBlob = await createSampleZipBlob();
      const buffer = await zipBlob.arrayBuffer();
      await executeIngest('nciipc_soc_submission_bundle.zip', buffer);
    } catch (err: any) {
      setErrorMessage('Failed to load sample ZIP: ' + (err?.message || 'Error'));
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedContent.trim()) {
      setErrorMessage('Please paste valid CSV or JSON text.');
      return;
    }
    executeIngest(pastedFileName || 'pasted_soc_data.csv', pastedContent);
  };

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSVTemplate = () => {
    downloadFile('soc_alerts_template.csv', SAMPLE_ALERTS_CSV, 'text/csv;charset=utf-8;');
  };

  const handleDownloadJSONTemplate = () => {
    downloadFile('soc_enclave_template.json', JSON.stringify(SAMPLE_JSON_DATASET, null, 2), 'application/json');
  };

  const handleDownloadCurrentNormalized = () => {
    if (!normalizedPreview) return;
    downloadFile(
      `normalized_${lastSummary?.fileName || 'dataset'}.json`,
      JSON.stringify(normalizedPreview, null, 2),
      'application/json'
    );
  };

  const copyTemplateToClipboard = () => {
    navigator.clipboard.writeText(SAMPLE_ALERTS_CSV);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const isReadOnly = userRole === 'Read-only Reviewer';

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Indicator */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141414] bg-[#EAE9E5] px-2 py-0.5 rounded border border-[#C8C7C2]">
              Batch Ingestion &amp; Schema Normalization (Section 8)
            </span>
            <span className="text-xs text-[#666666] font-medium">• Deterministic Recalibration</span>
            {isCustomDataset && (
              <span className="text-xs font-bold text-amber-800 bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" />
                Custom SOC Batch Active
              </span>
            )}
          </div>
          <h2 className="text-lg font-black text-[#141414] mt-1.5 tracking-tight">
            CSE Periodic Submission File Ingest
          </h2>
          <p className="text-sm text-[#525252] mt-1 max-w-3xl leading-relaxed">
            Upload raw SOC telemetry files (CSV or JSON). The ingestion pipeline parses headers, enforces referential integrity constraints, computes SHA-256 audit hashes, and recalculates supervisory risk scores across all views immediately.
          </p>
        </div>

        {isCustomDataset && onResetBaseline && (
          <button
            onClick={onResetBaseline}
            className="px-3.5 py-1.5 bg-[#EAE9E5] hover:bg-[#DCDAD5] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Revert to Default Baseline
          </button>
        )}
      </div>

      {/* Read-Only Mode Warning */}
      {isReadOnly && (
        <div className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#9F1239] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#9F1239] mt-0.5" />
          <div>
            <span className="font-bold block">Jurisdictional Access Notice: Ingestion Restricted</span>
            <span className="text-[11px] text-[#881337] mt-0.5 block">
              You are signed in as <strong>{currentUser?.name || 'Compliance Auditor'}</strong> ({currentUser?.badge_id || 'CERT-AUD-920'}) with <strong>Read-Only Reviewer</strong> clearance. New dataset uploads and schema normalization operations require Examiner or Administrator authorization. You can inspect sample schema definitions or switch roles from the user profile in the header.
            </span>
          </div>
        </div>
      )}

      {/* Control Strip: Ingestion Mode & Input Tabs */}
      <div className="bg-white border border-[#D0CFCB] rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Input Method Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveInputMethod('file')}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition ${
              activeInputMethod === 'file'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#F2F1EE] text-[#525252] hover:bg-[#E5E4E0]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>

          <button
            onClick={() => setActiveInputMethod('paste')}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition ${
              activeInputMethod === 'paste'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#F2F1EE] text-[#525252] hover:bg-[#E5E4E0]'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            Paste CSV / JSON
          </button>

          <button
            onClick={() => setActiveInputMethod('preset')}
            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition ${
              activeInputMethod === 'preset'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'bg-[#F2F1EE] text-[#525252] hover:bg-[#E5E4E0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Load Sample Presets
          </button>
        </div>

        {/* Ingest Mode: Replace vs Append */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#666666] font-medium">Dataset Mode:</span>
          <div className="inline-flex rounded-md border border-[#D0CFCB] p-0.5 bg-[#F2F1EE]">
            <button
              onClick={() => setIngestMode('replace')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                ingestMode === 'replace'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#666666] hover:text-[#141414]'
              }`}
            >
              Replace Current Dataset
            </button>
            <button
              onClick={() => setIngestMode('append')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                ingestMode === 'append'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#666666] hover:text-[#141414]'
              }`}
            >
              Append / Merge Records
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-lg text-xs text-[#9F1239] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#9F1239] mt-0.5" />
          <div>
            <span className="font-bold block">Ingestion Error</span>
            <span className="text-[11px] text-[#881337] mt-0.5 block">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Method 1: Drag & Drop File Upload */}
      {activeInputMethod === 'file' && (
        <div
          onDragEnter={!isReadOnly ? handleDrag : undefined}
          onDragLeave={!isReadOnly ? handleDrag : undefined}
          onDragOver={!isReadOnly ? handleDrag : undefined}
          onDrop={!isReadOnly ? handleDrop : undefined}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
            isReadOnly
              ? 'border-[#D0CFCB] bg-[#F2F1EE] opacity-75'
              : dragActive
              ? 'border-[#141414] bg-[#EAE9E5]'
              : 'border-[#D0CFCB] bg-[#F8F7F4] hover:border-[#141414]'
          }`}
        >
          <UploadCloud className="w-12 h-12 text-[#888888] mx-auto mb-3" />
          <h3 className="font-bold text-[#141414] text-sm">
            Drag &amp; drop periodic CSE SOC submission batch (ZIP, CSV, or JSON)
          </h3>
          <p className="text-xs text-[#666666] mt-1 max-w-xl mx-auto">
            Supports multi-table <strong>.zip</strong> archives containing <code>alerts.csv</code>, <code>cases.csv</code>, <code>assets.csv</code>, <code>entities.csv</code>, or standalone CSV/JSON files.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            {isReadOnly ? (
              <button
                disabled
                className="px-4 py-2 bg-[#D0CFCB] text-[#666666] rounded text-xs font-bold cursor-not-allowed"
              >
                Upload Restricted (Auditor Mode)
              </button>
            ) : (
              <label className="px-4 py-2 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-400" />
                {isProcessing ? 'Processing Batch...' : 'Browse Local File (.zip, .csv, .json)'}
                <input
                  type="file"
                  accept=".zip,.csv,.json,.txt"
                  onChange={handleFileInput}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Method 2: Direct Paste Textarea */}
      {activeInputMethod === 'paste' && (
        <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-[#141414]">Direct Paste SOC Submission</h4>
              <p className="text-xs text-[#666666]">Paste CSV with headers or JSON array directly into the terminal.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pastedFileName}
                onChange={(e) => setPastedFileName(e.target.value)}
                placeholder="batch_filename.csv"
                className="px-2.5 py-1 text-xs border border-[#C8C7C2] rounded bg-[#F8F7F4] font-mono text-[#141414]"
              />
              <button
                onClick={() => setPastedContent(SAMPLE_ALERTS_CSV)}
                className="px-2.5 py-1 text-xs bg-[#EAE9E5] hover:bg-[#DCDAD5] text-[#141414] border border-[#C8C7C2] rounded font-semibold transition"
              >
                Insert Sample
              </button>
            </div>
          </div>

          <textarea
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="alert_id,entity_id,asset_id,alert_category,source_control,severity,created_at,closed_at,disposition,investigation_notes&#10;ALT-01,CSE-A,AST-01,Brute Force,EDR,Critical,2026-09-01T00:00:00Z,2026-09-01T01:00:00Z,True Positive,Host quarantined"
            rows={8}
            disabled={isReadOnly || isProcessing}
            className="w-full p-3 font-mono text-xs border border-[#D0CFCB] rounded-lg bg-[#FBFBFA] focus:outline-none focus:border-[#141414] text-[#141414]"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setPastedContent('')}
              className="px-3 py-1.5 text-xs text-[#666666] hover:text-[#141414] transition"
            >
              Clear
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={isReadOnly || isProcessing || !pastedContent.trim()}
              className="px-4 py-2 bg-[#141414] hover:bg-[#282828] disabled:bg-[#A3A3A3] text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isProcessing ? 'Parsing & Normalizing...' : 'Process & Ingest Batch'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Method 3: Pre-configured Test Presets */}
      {activeInputMethod === 'preset' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-blue-500 rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Multi-Table .ZIP
                </span>
                <span className="text-xs text-[#666666]">5 Linked CSVs</span>
              </div>
              <h4 className="font-bold text-sm text-[#141414] mt-2 flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-blue-600" />
                Statutory SOC ZIP Archive
              </h4>
              <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                Complete archive containing <code>alerts.csv</code>, <code>cases.csv</code>, <code>assets.csv</code>, <code>entities.csv</code>, and <code>escalations.csv</code> extracted and normalized in one batch.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleLoadSampleZip}
                disabled={isReadOnly || isProcessing}
                className="w-full py-2 bg-[#141414] hover:bg-[#282828] disabled:bg-[#A3A3A3] text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                Load &amp; Decompress ZIP
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownloadSampleZip}
                className="w-full py-1.5 bg-[#F2F1EE] hover:bg-[#E5E4E0] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Test .zip
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                  CSV Format
                </span>
                <span className="text-xs text-[#666666]">10 Alerts • 5 CSEs</span>
              </div>
              <h4 className="font-bold text-sm text-[#141414] mt-2">Standard Multi-Entity SOC Batch</h4>
              <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                Realistic sample alerts covering SWIFT attacks, BGP route shifts, and SCADA grid fluctuations with full triage and escalation records.
              </p>
            </div>
            <button
              onClick={() => executeIngest('standard_soc_alerts_batch.csv', SAMPLE_ALERTS_CSV)}
              disabled={isReadOnly || isProcessing}
              className="w-full py-2 bg-[#141414] hover:bg-[#282828] disabled:bg-[#A3A3A3] text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Load &amp; Analyze This CSV
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FECDD3]">
                  Attack Scenario
                </span>
                <span className="text-xs text-[#666666]">5 Rapid Closures</span>
              </div>
              <h4 className="font-bold text-sm text-[#141414] mt-2">Ransomware &amp; Metric Gaming</h4>
              <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                Simulates BlackCat / LockBit ransomware alerts closed in under 60 seconds with identical triage text to trigger Rule EXEC-001.
              </p>
            </div>
            <button
              onClick={() => executeIngest('ransomware_gaming_scenario.csv', SAMPLE_RANSOMWARE_CSV)}
              disabled={isReadOnly || isProcessing}
              className="w-full py-2 bg-[#141414] hover:bg-[#282828] disabled:bg-[#A3A3A3] text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Load &amp; Analyze Scenario
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#D0CFCB] rounded-lg p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-[#FAF5FF] px-2 py-0.5 rounded border border-[#E9D5FF]">
                  Full JSON Schema
                </span>
                <span className="text-xs text-[#666666]">4 Linked Tables</span>
              </div>
              <h4 className="font-bold text-sm text-[#141414] mt-2">Complete Sovereign Enclave JSON</h4>
              <p className="text-xs text-[#525252] mt-1 leading-relaxed">
                Full 4-table dataset containing dedicated entity declarations, asset manifests, alerts, cases, and formal CERT-In escalation records.
              </p>
            </div>
            <button
              onClick={() => executeIngest('sovereign_enclave_submission.json', JSON.stringify(SAMPLE_JSON_DATASET))}
              disabled={isReadOnly || isProcessing}
              className="w-full py-2 bg-[#141414] hover:bg-[#282828] disabled:bg-[#A3A3A3] text-white rounded text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              Load &amp; Analyze JSON
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Ingestion Results & Navigation Actions */}
      {lastSummary && (
        <div className="bg-white border-2 border-emerald-500 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE9E5] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-black text-base text-[#141414] flex items-center gap-2">
                  <span>Batch Ingested &amp; Recalibrated Successfully</span>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Active in Engine
                  </span>
                </h4>
                <div className="text-xs text-[#666666] font-mono flex flex-wrap items-center gap-2 mt-1">
                  <span>File: <strong>{lastSummary.fileName}</strong></span>
                  <span>•</span>
                  <span>Size: {(lastSummary.fileSize / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>SHA-256: <strong>{formatShortHash(lastSummary.sha256Hash, 14)}</strong></span>
                  <span>•</span>
                  <span>Mode: <strong>{lastSummary.mode === 'replace' ? 'Dataset Replaced' : 'Appended'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCurrentNormalized}
              className="px-3 py-1.5 bg-[#F2F1EE] hover:bg-[#E5E4E0] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export Normalized JSON
            </button>
          </div>

          {/* ZIP Archive Multi-File Decompression Manifest */}
          {lastSummary.isZipArchive && lastSummary.archiveFiles && lastSummary.archiveFiles.length > 0 && (
            <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-black text-[#141414] flex items-center gap-1.5 uppercase tracking-wider">
                  <Archive className="w-4 h-4 text-blue-700" />
                  Decompressed Multi-Table Archive Manifest ({lastSummary.archiveFiles.length} files parsed &amp; linked)
                </span>
                <span className="text-[11px] font-mono text-[#666666]">
                  Container Integrity: SHA-256 Verified
                </span>
              </div>
              <div className="border border-[#D0CFCB] rounded-md overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F2F1EE] border-b border-[#D0CFCB] text-[#525252] font-semibold text-[11px]">
                      <th className="p-2.5">Archive Member</th>
                      <th className="p-2.5">Identified Schema Table</th>
                      <th className="p-2.5">Rows</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5 font-mono">Member SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE9E5]">
                    {lastSummary.archiveFiles.map((file, i) => (
                      <tr key={i} className="hover:bg-[#F8F7F4]">
                        <td className="p-2.5 font-mono font-bold text-[#141414] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#666666]" />
                          {file.name}
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            file.type === 'alerts' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            file.type === 'cases' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                            file.type === 'assets' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                            file.type === 'entities' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                            file.type === 'escalations' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {file.type}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-[#141414]">{file.rowCount}</td>
                        <td className="p-2.5 font-mono text-[#666666]">{(file.size / 1024).toFixed(1)} KB</td>
                        <td className="p-2.5 font-mono text-[11px] text-[#525252]">{formatShortHash(file.sha256, 12)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Record Count Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-center">
              <span className="text-[11px] text-[#666666] font-medium block">Total Entities</span>
              <span className="text-xl font-black text-[#141414] mt-0.5 block">{lastSummary.recordCounts.entities}</span>
            </div>
            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-center">
              <span className="text-[11px] text-[#666666] font-medium block">Monitored Assets</span>
              <span className="text-xl font-black text-[#141414] mt-0.5 block">{lastSummary.recordCounts.assets}</span>
            </div>
            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-center">
              <span className="text-[11px] text-[#666666] font-medium block">Alerts Parsed</span>
              <span className="text-xl font-black text-[#141414] mt-0.5 block text-amber-700">{lastSummary.recordCounts.alerts}</span>
            </div>
            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-center">
              <span className="text-[11px] text-[#666666] font-medium block">Cases &amp; Triage</span>
              <span className="text-xl font-black text-[#141414] mt-0.5 block">{lastSummary.recordCounts.cases}</span>
            </div>
            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#D0CFCB] text-center">
              <span className="text-[11px] text-[#666666] font-medium block">Escalations</span>
              <span className="text-xl font-black text-[#141414] mt-0.5 block text-blue-700">{lastSummary.recordCounts.escalations}</span>
            </div>
          </div>

          {/* Quick Navigation Action Grid */}
          <div className="p-4 bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg space-y-2">
            <span className="text-xs font-bold text-[#141414] block">
              Directly Explore Analysis Results for This Dataset:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={onNavigateToOverview}
                className="p-2.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Overview Dashboard
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToLeaderboard}
                className="p-2.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Entity Risk Ranks
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToQueue}
                className="p-2.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <ListFilter className="w-3.5 h-3.5" />
                  Review Queue
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToFindings}
                className="p-2.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold flex items-center justify-between transition cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Detector Findings
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Validation Logs */}
          <div className="bg-[#141414] text-[#E4E3E0] p-4 rounded-lg font-mono text-xs space-y-1.5 border border-[#242424]">
            <div className="text-[#888888] font-bold mb-2 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Air-Gapped Ingestion &amp; Quality Check Execution Log:
            </div>
            {lastSummary.normalizationLogs.map((log, idx) => (
              <div key={idx} className="text-[#D0CFCB]">
                {log}
              </div>
            ))}
          </div>

          {/* Data Preview Table (First 5 records) */}
          {normalizedPreview && normalizedPreview.alerts.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-[#141414] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Parsed Telemetry Preview (First {Math.min(5, normalizedPreview.alerts.length)} of {normalizedPreview.alerts.length} alerts)
              </h5>
              <div className="border border-[#D0CFCB] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F2F1EE] border-b border-[#D0CFCB] text-[#525252] font-semibold text-[11px]">
                      <th className="p-2.5">Alert ID</th>
                      <th className="p-2.5">Entity</th>
                      <th className="p-2.5">Asset ID</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Severity</th>
                      <th className="p-2.5">Disposition</th>
                      <th className="p-2.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE9E5]">
                    {normalizedPreview.alerts.slice(0, 5).map((al) => (
                      <tr key={al.alert_id} className="hover:bg-[#F8F7F4]">
                        <td className="p-2.5 font-mono font-bold text-[#141414]">{al.alert_id}</td>
                        <td className="p-2.5 font-semibold text-[#141414]">{al.entity_id}</td>
                        <td className="p-2.5 font-mono text-[#525252]">{al.asset_id}</td>
                        <td className="p-2.5 text-[#141414]">{al.alert_category}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            al.severity === 'Critical' ? 'bg-[#FFF1F2] text-[#9F1239]' :
                            al.severity === 'High' ? 'bg-[#FFFBEB] text-[#92400E]' :
                            'bg-[#F3F4F6] text-[#374151]'
                          }`}>
                            {al.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-[#525252]">{al.disposition}</td>
                        <td className="p-2.5 font-mono text-[11px] text-[#666666]">{al.created_at.slice(0, 19).replace('T', ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Starter Templates & Schema Helper Section */}
      <div className="bg-[#F8F7F4] border border-[#D0CFCB] rounded-lg p-5 text-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-[#141414] text-sm">
              Standard Ingestion Schema Formats (Section 7)
            </h4>
            <p className="text-[#666666] text-xs mt-0.5">
              Download clean starter templates to prepare your own SOC export files.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadSampleZip}
              className="px-3 py-1.5 bg-[#141414] hover:bg-[#282828] text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-blue-300" />
              Download Sample ZIP Bundle (.zip)
            </button>

            <button
              onClick={handleDownloadCSVTemplate}
              className="px-3 py-1.5 bg-white hover:bg-[#EAE9E5] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Template
            </button>

            <button
              onClick={handleDownloadJSONTemplate}
              className="px-3 py-1.5 bg-white hover:bg-[#EAE9E5] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON Template
            </button>

            <button
              onClick={copyTemplateToClipboard}
              className="px-3 py-1.5 bg-white hover:bg-[#EAE9E5] text-[#141414] border border-[#C8C7C2] rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTemplate ? 'Copied CSV Headers' : 'Copy CSV Headers'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-[11px]">
          <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
            <strong className="text-[#141414] font-bold block mb-1">alerts.csv (Mandatory)</strong>
            <p className="text-[#525252] leading-relaxed">
              <code>alert_id, entity_id, asset_id, alert_category, source_control, severity, created_at, closed_at, disposition</code>
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
            <strong className="text-[#141414] font-bold block mb-1">cases.csv (Optional)</strong>
            <p className="text-[#525252] leading-relaxed">
              <code>case_id, entity_id, alert_id, investigator_id_hash, investigation_notes, impact, closure_reason</code>
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
            <strong className="text-[#141414] font-bold block mb-1">escalations.csv (Optional)</strong>
            <p className="text-[#525252] leading-relaxed">
              <code>escalation_id, case_id, escalation_type, escalated_at, recipient_role, outcome</code>
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
            <strong className="text-[#141414] font-bold block mb-1">assets.csv (Optional)</strong>
            <p className="text-[#525252] leading-relaxed">
              <code>asset_id, entity_id, asset_type, criticality, environment, expected_controls, active_from</code>
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-[#D0CFCB]">
            <strong className="text-[#141414] font-bold block mb-1">entities.csv (Optional)</strong>
            <p className="text-[#525252] leading-relaxed">
              <code>entity_id, name, sector, tier, contact_email, jurisdiction</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
