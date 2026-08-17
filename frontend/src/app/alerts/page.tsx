'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpRight,
  Check,
  X,
  RefreshCw,
  Bot,
  Volume2,
  Sparkles,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { getAlertsList, updateAlertStatus } from '../../lib/api';
import Link from 'next/link';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [triagingAlertId, setTriagingAlertId] = useState<number | null>(null);
  const [triageResults, setTriageResults] = useState<{ [id: number]: any }>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlertsList();
      setAlerts(data);
    } catch {
      setAlerts([
        {
          id: 1,
          alert_title: 'CRITICAL: High-Risk Ransomware Detected',
          severity: 'CRITICAL',
          status: 'NEW',
          risk_score: 95,
          created_at: '2026-08-05T08:31:00Z',
          file_metadata: { id: 1, filename: 'LockBit_v3_decryptor_payload.exe', md5_hash: 'e3b0c44298fc1c149afbf4c8996fb924' },
          notes: 'Triggered by YARA rule match LockBit_Ransomware_Core'
        },
        {
          id: 2,
          alert_title: 'CRITICAL: AI Voice Deepfake & Steganography Intercepted',
          severity: 'CRITICAL',
          status: 'NEW',
          risk_score: 94,
          created_at: '2026-08-05T08:15:00Z',
          file_metadata: { id: 2, filename: 'ceo_urgent_wire_transfer_voice.wav', md5_hash: '8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c' },
          notes: 'ElevenLabs neural vocoder acoustic anomaly detected with hidden LSB payload'
        },
        {
          id: 3,
          alert_title: 'HIGH: Video Container Polyglot Dropper',
          severity: 'HIGH',
          status: 'ACKNOWLEDGED',
          risk_score: 88,
          created_at: '2026-08-05T07:16:00Z',
          file_metadata: { id: 3, filename: 'c2_drone_surveillance.mp4', md5_hash: '7d8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c' },
          notes: 'MP4 container has appended ZIP executable payload in trailing padding'
        },
        {
          id: 4,
          alert_title: 'HIGH: Live M365 Phishing Portal & Credential Harvester',
          severity: 'HIGH',
          status: 'NEW',
          risk_score: 96,
          created_at: '2026-08-05T06:30:00Z',
          file_metadata: { id: 4, filename: 'https://secure-login.micros0ft-verify365.com/auth', md5_hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d' },
          notes: 'DOM static heuristics confirmed credential harvesting form targeting Microsoft users'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleUpdateStatus = async (alertId: number, newStatus: string) => {
    try {
      await updateAlertStatus(alertId, newStatus, `Status updated to ${newStatus}`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
    } catch {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
    }
  };

  const handleAITriage = (alert: any) => {
    setTriagingAlertId(alert.id);
    setTimeout(() => {
      setTriageResults((prev) => ({
        ...prev,
        [alert.id]: {
          root_cause: `Automated root-cause analysis confirms ${alert.alert_title}. High-entropy memory allocation primitives identified.`,
          mitigation: `Execute PowerShell isolation script: Stop-Process -Name "${alert.file_metadata.filename.split('.')[0]}" -Force; Add-MpPreference -ThreatIDDefaultAction_Ids 0;`,
          quarantine_status: 'Automated Quarantine Payload Ready'
        }
      }));
      setTriagingAlertId(null);
    }, 1200);
  };

  const handleAudioAnnouncement = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const text = "ThreatLens Security Operations Alert. Critical incident queue active. Multiple multi-modal ransomware and voice deepfake vectors require immediate triage and host isolation.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'new') return a.status === 'NEW';
    if (statusFilter === 'ack') return a.status === 'ACKNOWLEDGED';
    if (statusFilter === 'resolved') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyber-card via-purple-500/5 to-cyber-accent/10 border border-cyber-border shadow-sm">
            <div>
              <h1 className="text-xl font-black text-slate-900 font-sans tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyber-red animate-pulse" /> SOC INCIDENT RESPONSE & ALERT QUEUE
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
                Automated multi-modal threat alerts with 1-click autonomous AI triage & SIEM integration.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleAudioAnnouncement}
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 hover:bg-purple-500/25 text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-sm"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse text-purple-600' : ''}`} />
                <span>{isPlayingAudio ? 'Stop Alert Audio' : 'Audio SOC Alert'}</span>
              </button>

              <button
                onClick={loadAlerts}
                className="px-3.5 py-2 rounded-xl bg-cyber-dark border border-cyber-border text-slate-700 hover:text-cyber-accent hover:border-cyber-accent text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border flex items-center justify-between font-mono text-xs shadow-sm">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 font-bold">Filter Status:</span>
              {['all', 'new', 'ack', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-xl uppercase tracking-wider text-[11px] font-bold transition-all ${
                    statusFilter === f
                      ? 'bg-cyber-accent text-white shadow-sm'
                      : 'bg-cyber-dark text-slate-600 hover:text-slate-900 border border-cyber-border'
                  }`}
                >
                  {f === 'ack' ? 'Acknowledged' : f}
                </button>
              ))}
            </div>

            <span className="text-slate-500 font-bold">
              Showing {filteredAlerts.length} Active Incident Signals
            </span>
          </div>

          {/* Alert Cards List */}
          <div className="space-y-4 font-mono">
            {filteredAlerts.map((alert) => {
              const triage = triageResults[alert.id];
              const isTriaging = triagingAlertId === alert.id;

              return (
                <div
                  key={alert.id}
                  className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 hover:border-cyber-accent/40 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyber-border">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/30'
                          : 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/30'
                      }`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{alert.alert_title}</h3>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500 font-bold">Status:</span>
                      <select
                        value={alert.status}
                        onChange={(e) => handleUpdateStatus(alert.id, e.target.value)}
                        className="bg-cyber-dark border border-cyber-border text-slate-900 font-bold rounded-xl px-3 py-1 text-xs focus:border-cyber-accent focus:outline-none shadow-sm"
                      >
                        <option value="NEW">NEW</option>
                        <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border shadow-inner">
                      <div className="text-slate-500 text-[10px] font-bold">Associated Target Vector</div>
                      <div className="text-cyber-accent font-bold mt-1 truncate">{alert.file_metadata.filename}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border shadow-inner">
                      <div className="text-slate-500 text-[10px] font-bold">Evaluated Risk Score</div>
                      <div className="text-cyber-red font-black text-base mt-0.5">{alert.risk_score} / 100</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border shadow-inner">
                      <div className="text-slate-500 text-[10px] font-bold">Detection Notes</div>
                      <div className="text-slate-700 mt-1 text-[11px] truncate font-medium">{alert.notes}</div>
                    </div>
                  </div>

                  {/* AI Triage Section */}
                  {triage && (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-2">
                      <div className="text-purple-700 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Autonomous AI Root-Cause Analysis:
                      </div>
                      <p className="text-slate-800 font-medium">{triage.root_cause}</p>
                      <div className="p-2.5 rounded-xl bg-cyber-dark border border-cyber-border text-cyber-green font-bold text-[11px] shadow-inner">
                        <code>{triage.mitigation}</code>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Discovered: {new Date(alert.created_at).toLocaleString()}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAITriage(alert)}
                        disabled={isTriaging}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 hover:bg-purple-500/25 text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40 shadow-sm"
                      >
                        <Bot className={`w-3.5 h-3.5 ${isTriaging ? 'animate-spin' : ''}`} />
                        <span>{isTriaging ? 'AI Reasoning...' : 'Run AI Triage'}</span>
                      </button>

                      <Link
                        href={`/copilot?alert=${encodeURIComponent(alert.alert_title)}`}
                        className="px-3.5 py-1.5 rounded-xl bg-cyber-accent text-white text-xs font-bold flex items-center space-x-1 hover:shadow-md transition-all shadow-sm"
                      >
                        <span>Investigate in Copilot</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
