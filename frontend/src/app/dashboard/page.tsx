'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import RiskGauge from '../../components/RiskGauge';
import ThreatChart from '../../components/ThreatChart';
import YaraBadges from '../../components/YaraBadges';
import RealtimeThreatRadar from '../../components/RealtimeThreatRadar';
import Link from 'next/link';
import {
  ShieldAlert,
  FileCode,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Upload,
  ArrowUpRight,
  Bot,
  Sparkles,
  Mic,
  Video,
  Globe,
  Binary,
  Zap,
  Radio
} from 'lucide-react';
import { getDashboardOverview } from '../../lib/api';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await getDashboardOverview();
      setOverview(data);
    } catch {
      setOverview({
        total_samples: 54,
        malware_detected: 38,
        active_alerts: 5,
        avg_risk_score: 71.2,
        multi_modal_counts: {
          binaries: 32,
          audio: 8,
          video: 6,
          websites: 8
        },
        recent_scans: [
          {
            id: 1,
            filename: 'LockBit_v3_decryptor_payload.exe',
            md5_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
            file_size_bytes: 524000,
            analysis: {
              risk_score: 95,
              classification: 'Ransomware.LockBit',
              yara_matches: ['LockBit_Ransomware_Core', 'Suspicious_PE_Header'],
              ml_confidence: 0.96
            }
          },
          {
            id: 2,
            filename: 'ceo_urgent_wire_transfer_voice.wav',
            md5_hash: '8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
            file_size_bytes: 128450,
            analysis: {
              risk_score: 94,
              classification: 'Audio.StegoPayload.MaliciousVoiceCloning',
              yara_matches: ['Stego_BitPlane_Anomaly'],
              ml_confidence: 0.94
            }
          },
          {
            id: 3,
            filename: 'c2_drone_surveillance.mp4',
            md5_hash: '7d8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c',
            file_size_bytes: 842000,
            analysis: {
              risk_score: 88,
              classification: 'Video.Polyglot.EmbeddedC2Payload',
              yara_matches: ['Polyglot_Archive_Trigger'],
              ml_confidence: 0.91
            }
          },
          {
            id: 4,
            filename: 'https://secure-login.micros0ft-verify365.com/auth',
            md5_hash: '3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
            file_size_bytes: 0,
            analysis: {
              risk_score: 96,
              classification: 'Phishing.BrandImpersonation.Microsoft',
              yara_matches: ['Phishing_DOM_Harvester'],
              ml_confidence: 0.98
            }
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyber-card via-purple-500/5 to-cyber-accent/10 border border-cyber-border shadow-sm">
            <div>
              <h1 className="text-xl font-black text-slate-900 font-sans tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" /> ENTERPRISE THREAT INTELLIGENCE & AI DASHBOARD
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
                Unified telemetry across PE Binaries, Voice Deepfakes, Video Polyglots, Live Phishing Sites & AI SOC Copilot.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadMetrics}
                className="px-3.5 py-2 rounded-xl bg-cyber-card border border-cyber-border text-slate-700 hover:text-cyber-accent hover:border-cyber-accent text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>

              <Link
                href="/copilot"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>AI SOC Copilot</span>
              </Link>

              <Link
                href="/upload"
                className="px-4 py-2 rounded-xl bg-cyber-accent text-white font-mono font-bold text-xs uppercase tracking-wider hover:shadow-md flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Multi-Modal Scan</span>
              </Link>
            </div>
          </div>

          {/* Stats Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Ingested Samples"
              value={overview?.total_samples || 54}
              subtitle="Multi-modal repository files"
              icon={FileCode}
              color="cyan"
            />
            <StatsCard
              title="Malware / Threat Vectors"
              value={overview?.malware_detected || 38}
              subtitle="High & critical risk ratings"
              icon={AlertTriangle}
              color="red"
              trend="+18% this cycle"
            />
            <StatsCard
              title="Active SOC Alert Incidents"
              value={overview?.active_alerts || 5}
              subtitle="Threshold score >= 65"
              icon={ShieldAlert}
              color="amber"
            />
            <StatsCard
              title="Autonomous Fleet Risk"
              value={`${Math.round(overview?.avg_risk_score || 71.2)}/100`}
              subtitle="Composite AI & YARA rating"
              icon={CheckCircle}
              color="purple"
            />
          </div>

          {/* Multi-Modal Ingestion Breakdown Banner */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono shadow-sm">
            <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
              <div className="text-slate-600 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Binary className="w-3.5 h-3.5 text-cyber-accent" /> PE Executables
              </div>
              <div className="text-lg font-black text-slate-900">32 Samples</div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
              <div className="text-slate-600 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Mic className="w-3.5 h-3.5 text-purple-600" /> Voice Deepfakes
              </div>
              <div className="text-lg font-black text-purple-700">8 Audio Tracks</div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
              <div className="text-slate-600 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Video className="w-3.5 h-3.5 text-cyber-amber" /> Video Polyglots
              </div>
              <div className="text-lg font-black text-cyber-amber">6 Containers</div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
              <div className="text-slate-600 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Globe className="w-3.5 h-3.5 text-cyber-red" /> Phishing Web Portals
              </div>
              <div className="text-lg font-black text-cyber-red">8 Live Domains</div>
            </div>
          </div>

          {/* Core Analytics Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge Panel */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col items-center justify-between shadow-sm">
              <div className="w-full flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
                  Fleet Threat Risk Meter
                </h3>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30">
                  AI VECTORIZED
                </span>
              </div>

              <RiskGauge score={Math.round(overview?.avg_risk_score || 71)} classification="HIGH FLEET RISK" size={180} />

              <div className="w-full text-center pt-3 border-t border-cyber-border text-xs text-slate-500 font-mono font-medium">
                SIEM Dispatch Trigger: <span className="text-cyber-amber font-bold">65+ Score</span> automatically emits alerts.
              </div>
            </div>

            {/* Threat Distribution Chart */}
            <div className="lg:col-span-2">
              <ThreatChart />
            </div>
          </div>

          {/* Real-Time Global Threat Radar Stream */}
          <RealtimeThreatRadar />

          {/* Recent Multi-Modal Sample Scans Table */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-slate-800 font-bold">
                  Recent Threat Detections & Scans
                </h3>
                <p className="text-[11px] text-slate-500 font-mono font-medium">Multi-modal static analysis & AI classification telemetry</p>
              </div>

              <Link href="/samples" className="text-xs font-mono font-bold text-cyber-accent hover:underline flex items-center space-x-1">
                <span>View Full Sample Repository</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-cyber-border text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                    <th className="pb-3">Sample / Target Vector</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Risk Rating</th>
                    <th className="pb-3">Classification</th>
                    <th className="pb-3">Signatures</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {(overview?.recent_scans || []).map((sample: any) => (
                    <tr key={sample.id} className="hover:bg-cyber-dark/60 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 truncate max-w-xs">{sample.filename}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{sample.md5_hash}</div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {sample.file_size_bytes ? `${(sample.file_size_bytes / 1024).toFixed(1)} KB` : 'URL / Live'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          sample.analysis.risk_score >= 80
                            ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/30'
                            : 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/30'
                        }`}>
                          {sample.analysis.risk_score}/100
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-800 font-bold">{sample.analysis.classification}</td>
                      <td className="py-3.5">
                        <YaraBadges rules={sample.analysis.yara_matches || []} />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/samples/${sample.id}`}
                          className="px-3 py-1 rounded-lg bg-cyber-dark border border-cyber-border text-cyber-accent hover:border-cyber-accent font-bold transition-all text-[11px] shadow-sm"
                        >
                          Deep Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
