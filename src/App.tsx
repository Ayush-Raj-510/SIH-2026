/**
 * SAT-SA — Supervisory Analytics Tool for SOC Assessment
 * Problem Statement: SIH 26157 | Organization: NTRO / NCIIPC
 * Air-gapped, evidence-first supervisory decision support platform
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { EntityDetailModal } from './components/EntityDetailModal';
import { ReviewQueueTab } from './components/ReviewQueueTab';
import { EvidenceGraphTab } from './components/EvidenceGraphTab';
import { FindingsTab } from './components/FindingsTab';
import { DataQualityTab } from './components/DataQualityTab';
import { SyntheticBenchmarkTab } from './components/SyntheticBenchmarkTab';
import { IngestTab } from './components/IngestTab';
import { AuditTab } from './components/AuditTab';
import { ReportModal } from './components/ReportModal';

import { generateComprehensiveDataset, SyntheticDataset } from './data/syntheticGenerator';
import { executeSupervisoryAnalytics, AnalyticsRunResult } from './engine/analyticsEngine';
import { runDataQualityAssessment } from './engine/dataQuality';
import { computeSHA256 } from './engine/crypto';
import { IngestSummary } from './engine/dataParser';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { PRECONFIGURED_USERS, getStoredSession, saveSession, clearSession } from './data/authUsers';
import { UserRole, UserProfile, ReviewStatus, AnalysisRunRecord, ExaminerAuditEntry, ReviewQueueItem } from './types';
import { Zap, RefreshCw, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return getStoredSession(); // Null on cold start so simple login is the first page!
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const session = getStoredSession();
    return session?.role || 'Examiner';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Core application state
  const [dataset, setDataset] = useState<SyntheticDataset>(() => generateComprehensiveDataset());
  const [activeDatasetInfo, setActiveDatasetInfo] = useState<{
    name: string;
    isCustom: boolean;
    timestamp: string;
    recordCounts: { entities: number; assets: number; alerts: number; cases: number; escalations: number };
  }>({
    name: 'Default 6-CSE Ground-Truth Baseline (2026-Q3)',
    isCustom: false,
    timestamp: new Date().toISOString(),
    recordCounts: {
      entities: 6,
      assets: 22,
      alerts: 120,
      cases: 110,
      escalations: 40
    }
  });
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q3');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [targetAlertForGraph, setTargetAlertForGraph] = useState<string | undefined>(undefined);

  // Cryptographic and run state
  const [runId, setRunId] = useState<string>('RUN-NCIIPC-2026Q3-8419');
  const [datasetHash, setDatasetHash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [normalizedHash, setNormalizedHash] = useState<string>('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  const [configHash, setConfigHash] = useState<string>('5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8');

  // Compute Hashes on initial load or dataset change
  useEffect(() => {
    async function calculateHashes() {
      const dHash = await computeSHA256(dataset.alerts);
      const nHash = await computeSHA256(dataset.cases);
      const cHash = await computeSHA256({
        ruleset: 'v1.2.0-STABLE',
        weights: { exec: 0.40, neg: 0.35, trend: 0.15, peer: 0.10 }
      });
      setDatasetHash(dHash);
      setNormalizedHash(nHash);
      setConfigHash(cHash);
    }
    calculateHashes();
  }, [dataset]);

  // Execute deterministic analytics
  const analytics: AnalyticsRunResult = useMemo(() => {
    return executeSupervisoryAnalytics(
      dataset.entities,
      dataset.assets,
      dataset.alerts,
      dataset.cases,
      dataset.escalations,
      runId
    );
  }, [dataset, runId]);

  // Review queue mutable state (for examiner decisions)
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueItem[]>(() => analytics.review_queue);

  // Sync queue if analytics re-runs
  useEffect(() => {
    setReviewQueue(analytics.review_queue);
  }, [analytics]);

  // Run data quality assessment
  const dataQuality = useMemo(() => {
    return runDataQualityAssessment(
      dataset.entities,
      dataset.assets,
      dataset.alerts,
      dataset.cases,
      dataset.escalations
    );
  }, [dataset]);

  // Audit trail log
  const [auditTrail, setAuditTrail] = useState<ExaminerAuditEntry[]>([
    {
      id: 'AUD-001',
      timestamp: new Date().toISOString(),
      actor: 'system_airgap_init',
      role: 'Administrator',
      action: 'BATCH_INGEST_VERIFIED',
      target_id: 'SUBMISSION-2026Q3',
      details: 'Loaded 6 Critical Sector Entities with SHA-256 integrity check.'
    },
    {
      id: 'AUD-002',
      timestamp: new Date().toISOString(),
      actor: 'examiner_session',
      role: 'Examiner',
      action: 'ANALYTICS_RUN_EXECUTED',
      target_id: runId,
      details: 'Triggered 7 core deterministic detectors; computed transparent risk ranking.'
    }
  ]);

  // Update Review Queue status handler
  const handleUpdateReviewStatus = (itemId: string, status: ReviewStatus, comment: string) => {
    setReviewQueue(prev => prev.map(item => {
      if (item.queue_item_id === itemId) {
        return {
          ...item,
          review_status: status,
          examiner_comment: comment
        };
      }
      return item;
    }));

    // Add entry to audit log
    const auditEntry: ExaminerAuditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : `examiner_${userRole.toLowerCase()}`,
      role: userRole,
      action: 'EXAMINER_STATUS_UPDATED',
      target_id: itemId,
      details: `Determination set to "${status}". Note: "${comment || 'No comment provided'}"`
    };
    setAuditTrail(prev => [auditEntry, ...prev]);
  };

  // Login handler
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setUserRole(user.role);
    saveSession(user);
    setIsLoginModalOpen(false);

    const auditEntry: ExaminerAuditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: user.badge_id,
      role: user.role,
      action: 'USER_AUTHENTICATED',
      target_id: user.session_token || 'TOKEN-ACTIVE',
      details: `${user.name} authenticated into terminal with ${user.clearance_level}. Organization: ${user.organization}. Role: ${user.role}.`
    };
    setAuditTrail(prev => [auditEntry, ...prev]);
  };

  // Logout handler
  const handleLogout = () => {
    if (currentUser) {
      const auditEntry: ExaminerAuditEntry = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        actor: currentUser.badge_id,
        role: currentUser.role,
        action: 'USER_LOGGED_OUT',
        target_id: currentUser.session_token || 'TOKEN-EXPIRED',
        details: `${currentUser.name} signed out. Terminal locked into air-gap authentication gateway.`
      };
      setAuditTrail(prev => [auditEntry, ...prev]);
    }
    clearSession();
    setCurrentUser(null);
    setIsLoginModalOpen(false);
  };

  // Re-run analytics
  const handleReRunAnalytics = () => {
    const newRunId = `RUN-NCIIPC-2026Q3-${Math.floor(1000 + Math.random() * 9000)}`;
    setRunId(newRunId);

    const auditEntry: ExaminerAuditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : `examiner_${userRole.toLowerCase()}`,
      role: userRole,
      action: 'RE_EXECUTE_ANALYTICS',
      target_id: newRunId,
      details: 'Deterministic rules and IQR percentiles recomputed across active dataset.'
    };
    setAuditTrail(prev => [auditEntry, ...prev]);
  };

  // Regenerate synthetic benchmark
  const handleRegenerateBenchmark = () => {
    const fresh = generateComprehensiveDataset();
    setDataset(fresh);
    handleReRunAnalytics();
  };

  // Ingest new SOC data (CSV or JSON)
  const handleIngestDataset = (newDataset: SyntheticDataset, summary: IngestSummary) => {
    setDataset(newDataset);
    const newRunId = `RUN-INGEST-${Math.floor(1000 + Math.random() * 9000)}`;
    setRunId(newRunId);

    setActiveDatasetInfo({
      name: summary.fileName,
      isCustom: true,
      timestamp: new Date().toISOString(),
      recordCounts: summary.recordCounts
    });

    const auditEntry: ExaminerAuditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : `examiner_${userRole.toLowerCase()}`,
      role: userRole,
      action: 'BATCH_INGEST_VERIFIED',
      target_id: summary.sha256Hash.slice(0, 16),
      details: `Ingested ${summary.fileName} (${(summary.fileSize / 1024).toFixed(1)} KB). Loaded: ${summary.recordCounts.entities} entities, ${summary.recordCounts.assets} assets, ${summary.recordCounts.alerts} alerts, ${summary.recordCounts.cases} cases, ${summary.recordCounts.escalations} escalations. Mode: ${summary.mode}. Hash: ${summary.sha256Hash}.`
    };
    setAuditTrail(prev => [auditEntry, ...prev]);
  };

  // Revert to default 6-CSE baseline
  const handleResetToBaseline = () => {
    const fresh = generateComprehensiveDataset();
    setDataset(fresh);
    const newRunId = `RUN-NCIIPC-2026Q3-${Math.floor(1000 + Math.random() * 9000)}`;
    setRunId(newRunId);
    setActiveDatasetInfo({
      name: 'Default 6-CSE Ground-Truth Baseline (2026-Q3)',
      isCustom: false,
      timestamp: new Date().toISOString(),
      recordCounts: {
        entities: fresh.entities.length,
        assets: fresh.assets.length,
        alerts: fresh.alerts.length,
        cases: fresh.cases.length,
        escalations: fresh.escalations.length
      }
    });

    const auditEntry: ExaminerAuditEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : `examiner_${userRole.toLowerCase()}`,
      role: userRole,
      action: 'DATASET_RESET_BASELINE',
      target_id: newRunId,
      details: 'Reverted active dataset to 6-entity ground truth baseline enclave.'
    };
    setAuditTrail(prev => [auditEntry, ...prev]);
  };

  // Switch to evidence graph with a specific alert
  const handleViewEvidenceGraph = (alertId?: string) => {
    if (alertId) setTargetAlertForGraph(alertId);
    setCurrentTab('evidence-graph');
  };

  const currentRunRecord: AnalysisRunRecord = {
    run_id: runId,
    dataset_hash: datasetHash,
    normalized_dataset_hash: normalizedHash,
    configuration_hash: configHash,
    ruleset_version: 'v1.2.0-STABLE',
    model_version: 'n/a (deterministic decision support)',
    application_version: 'SAT-SA 2026.09-AIRGAP',
    created_at: new Date().toISOString(),
    created_by: currentUser ? `${currentUser.name} [${currentUser.badge_id}]` : 'NCIIPC Sectoral Examiner',
    record_counts: {
      entities: dataset.entities.length,
      assets: dataset.assets.length,
      alerts: dataset.alerts.length,
      cases: dataset.cases.length,
      escalations: dataset.escalations.length,
      findings: analytics.findings.length,
      review_items: reviewQueue.length
    },
    warnings: dataQuality.issues.map(i => i.rule_name)
  };

  const selectedEntityScore = analytics.entity_scores.find(e => e.entity_id === selectedEntityId);

  // If not authenticated, render the dedicated simple login page as the first screen
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] flex flex-col selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Top Main Navigation Header */}
      {currentUser && (
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          runId={runId}
          datasetHash={datasetHash}
          userRole={userRole}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          onReRunAnalysis={handleReRunAnalytics}
          onOpenReport={() => setIsReportOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Active Custom Dataset Notification Pill */}
        {activeDatasetInfo.isCustom && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Active Ingested Dataset:</span>{' '}
                <span className="font-semibold text-amber-950 underline">{activeDatasetInfo.name}</span>
                <span className="text-amber-800 ml-2 font-mono">
                  ({dataset.alerts.length} alerts • {dataset.cases.length} cases • {dataset.entities.length} entities • {dataset.assets.length} assets)
                </span>
                <span className="text-amber-700 ml-2 hidden sm:inline">• All findings &amp; leaderboard reflect this data</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab('ingest')}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <UploadCloud className="w-3 h-3" />
                Upload New Data
              </button>
              <button
                onClick={handleResetToBaseline}
                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <RefreshCw className="w-3 h-3" />
                Revert to Baseline
              </button>
            </div>
          </div>
        )}

        {currentTab === 'overview' && (
          <OverviewTab
            entityScores={analytics.entity_scores}
            findings={analytics.findings}
            reviewQueue={reviewQueue}
            dataQuality={dataQuality}
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            datasetHash={datasetHash}
            runId={runId}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardTab
            entityScores={analytics.entity_scores}
            onSelectEntity={(id) => setSelectedEntityId(id)}
          />
        )}

        {currentTab === 'queue' && (
          <ReviewQueueTab
            queueItems={reviewQueue}
            userRole={userRole}
            currentUser={currentUser || undefined}
            onUpdateStatus={handleUpdateReviewStatus}
            onViewEvidenceGraph={handleViewEvidenceGraph}
          />
        )}

        {currentTab === 'evidence-graph' && (
          <EvidenceGraphTab
            entities={dataset.entities}
            assets={dataset.assets}
            alerts={dataset.alerts}
            cases={dataset.cases}
            escalations={dataset.escalations}
            initialAlertId={targetAlertForGraph}
          />
        )}

        {currentTab === 'findings' && (
          <FindingsTab
            findings={analytics.findings}
            onSelectEntity={(id) => setSelectedEntityId(id)}
          />
        )}

        {currentTab === 'data-quality' && (
          <DataQualityTab report={dataQuality} />
        )}

        {currentTab === 'benchmark' && (
          <SyntheticBenchmarkTab
            dataset={dataset}
            entityScores={analytics.entity_scores}
            findings={analytics.findings}
            reviewQueue={reviewQueue}
            onRegenerateData={handleRegenerateBenchmark}
          />
        )}

        {currentTab === 'ingest' && (
          <IngestTab 
            userRole={userRole}
            currentUser={currentUser || undefined}
            currentDataset={dataset}
            onIngestSuccess={handleIngestDataset}
            onNavigateToOverview={() => setCurrentTab('overview')}
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToFindings={() => setCurrentTab('findings')}
            onNavigateToQueue={() => setCurrentTab('queue')}
            activeDatasetName={activeDatasetInfo.name}
            isCustomDataset={activeDatasetInfo.isCustom}
            onResetBaseline={handleResetToBaseline}
          />
        )}

        {currentTab === 'audit' && (
          <AuditTab
            currentRun={currentRunRecord}
            auditTrail={auditTrail}
            userRole={userRole}
            currentUser={currentUser || undefined}
          />
        )}

      </main>

      {/* Role Authentication & Session Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        isModal={true}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Entity Deep-Dive Detail Modal */}
      {selectedEntityId && selectedEntityScore && (
        <EntityDetailModal
          entityId={selectedEntityId}
          entityScore={selectedEntityScore}
          findings={analytics.findings}
          peerMetrics={analytics.peer_benchmarks[selectedEntityId]}
          assets={dataset.assets}
          reviewQueue={reviewQueue}
          onClose={() => setSelectedEntityId(null)}
          onSelectReviewItem={(item) => {
            setSelectedEntityId(null);
            setCurrentTab('queue');
          }}
        />
      )}

      {/* Official Supervisory Report Generator Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        entityScores={analytics.entity_scores}
        findings={analytics.findings}
        reviewQueue={reviewQueue}
        dataQuality={dataQuality}
        currentRun={currentRunRecord}
        peerBenchmarks={analytics.peer_benchmarks}
      />

      {/* Air-Gapped Footer */}
      <footer className="border-t border-[#D0CFCB] bg-[#EAE9E5] py-3 px-6 text-xs text-[#525252] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#141414]">SAT-SA</span>
          <span>•</span>
          <span className="text-[#333333]">Supervisory Analytics Tool for SOC Assessment</span>
          <span>•</span>
          <span className="text-[#666666]">SIH 26157 (NTRO / NCIIPC)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-[#525252]">
          <span className="bg-[#DDDCD7] px-2 py-0.5 rounded border border-[#C8C7C2] text-[#141414] font-medium">Mode: Air-Gapped Enclave</span>
          <span>•</span>
          <span>Offline Deterministic Engine</span>
        </div>
      </footer>
    </div>
  );
}
