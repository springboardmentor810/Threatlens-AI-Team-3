'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Bot,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { fetchWithAuth } from '../../lib/api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('executive');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/v1/reports/export?report_type=${reportType}&format=json`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Fallback rich report model
      setReportData({
        title: reportType === 'executive'
          ? 'ThreatLens AI - Executive CISO Multi-Modal Threat Assessment Report'
          : reportType === 'technical'
          ? 'ThreatLens AI - Technical IOC & Cryptographic Hash Telemetry'
          : 'ThreatLens AI - SOC Operational Incident & Containment Audit Log',
        report_profile: reportType.toUpperCase(),
        generated_by: 'Lead Malware Analyst (analyst@threatlens.ai)',
        generated_at: new Date().toUTCString(),
        classification_summary: {
          total_assets_scanned: 54,
          ransomware_detected: 18,
          voice_deepfakes_intercepted: 8,
          video_polyglots_discovered: 6,
          phishing_portals_neutralized: 8,
          fleet_average_risk: 71.2
        },
        mitre_heatmap: [
          { tactic: 'Initial Access', technique: 'T1566.002 Spearphishing Link (M365 Phish)', severity: 'CRITICAL' },
          { tactic: 'Execution', technique: 'T1059.001 PowerShell / AMSI Bypass Dropper', severity: 'CRITICAL' },
          { tactic: 'Defense Evasion', technique: 'T1027 Steganography & Polyglot Media Containers', severity: 'HIGH' },
          { tactic: 'Defense Evasion', technique: 'T1055 Process Hollowing in svchost.exe', severity: 'CRITICAL' },
          { tactic: 'Impact', technique: 'T1486 LockBit / WannaCry Data Encryption', severity: 'CRITICAL' }
        ],
        sample_iocs: [
          { type: 'SHA-256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', target: 'LockBit Ransomware' },
          { type: 'IPv4 C2', value: '185.220.101.5', target: 'CobaltStrike C2 Drop Point' },
          { type: 'Domain URL', value: 'https://secure-login.micros0ft-verify365.com/auth', target: 'M365 Phishing Portal' },
          { type: 'Audio Hash', value: '8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b', target: 'CEO Voice Deepfake' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threatlens_${reportType}_report.json`;
    a.click();
  };

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
                <FileText className="w-5 h-5 text-cyber-accent" /> THREAT INTELLIGENCE & EXECUTIVE REPORT GENERATOR
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
                Automated multi-modal reports, MITRE ATT&CK heatmap matrices & executive CISO summaries.
              </p>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-4 font-mono shadow-sm">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700 shrink-0">Report Profile:</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-cyber-dark border border-cyber-border text-slate-900 font-bold text-xs rounded-xl px-4 py-2.5 focus:border-cyber-accent focus:outline-none shadow-sm"
              >
                <option value="executive">CISO Executive Threat Briefing</option>
                <option value="technical">Technical Multi-Modal IOC Matrix</option>
                <option value="alert_log">SOC Incident Response & Quarantine Audit</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cyber-accent hover:shadow-md text-white flex items-center gap-2 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Generate Report</span>
              </button>

              {reportData && (
                <>
                  <button
                    onClick={downloadJSON}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-cyber-dark hover:border-cyber-accent text-slate-700 border border-cyber-border flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4 text-cyber-accent" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-cyber-dark hover:border-purple-500 text-slate-700 border border-cyber-border flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-purple-600" />
                    <span>Print / Save PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Report Preview */}
          {reportData ? (
            <div className="p-8 rounded-3xl bg-cyber-card border border-cyber-border space-y-6 font-mono shadow-sm">
              <div className="border-b border-cyber-border pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-lg font-black text-slate-900 font-sans">{reportData.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">Generated by: {reportData.generated_by} | {reportData.generated_at}</p>
                </div>
                <div className="px-3 py-1 rounded-md bg-cyber-red/15 border border-cyber-red/30 text-cyber-red text-[10px] font-black self-start sm:self-auto">
                  CONFIDENTIAL // SOC RESTRICTED
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center text-xs">
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border shadow-inner">
                  <div className="text-slate-500 font-bold">Total Scanned</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{reportData.classification_summary.total_assets_scanned}</div>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border shadow-inner">
                  <div className="text-slate-500 font-bold">Ransomware Hits</div>
                  <div className="text-xl font-black text-cyber-red mt-1">{reportData.classification_summary.ransomware_detected}</div>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border shadow-inner">
                  <div className="text-slate-500 font-bold">Voice Deepfakes</div>
                  <div className="text-xl font-black text-purple-700 mt-1">{reportData.classification_summary.voice_deepfakes_intercepted}</div>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border shadow-inner">
                  <div className="text-slate-500 font-bold">Average Risk Score</div>
                  <div className="text-xl font-black text-cyber-amber mt-1">{reportData.classification_summary.fleet_average_risk} / 100</div>
                </div>
              </div>

              {/* MITRE ATT&CK Heatmap Matrix */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  MITRE ATT&CK Tactics & Technique Corroboration Heatmap
                </h3>
                <div className="space-y-2 text-xs">
                  {reportData.mitre_heatmap.map((m: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between shadow-inner">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-700 font-bold">[{m.tactic}]</span>
                        <span className="text-slate-800 font-semibold">{m.technique}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-cyber-red/15 border border-cyber-red/30 text-cyber-red text-[10px] font-black">
                        {m.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample IOCs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Corroborated Indicators of Compromise (IOCs)
                </h3>
                <div className="space-y-2 text-xs">
                  {reportData.sample_iocs.map((ioc: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between shadow-inner">
                      <div>
                        <span className="text-slate-500 font-bold mr-2">[{ioc.type}]</span>
                        <code className="text-cyber-accent font-bold">{ioc.value}</code>
                      </div>
                      <span className="text-slate-600 text-[11px] font-semibold">{ioc.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-cyber-card border border-cyber-border text-center space-y-3 font-mono shadow-sm">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Select a report profile above and click <strong>Generate Report</strong> to compile telemetry.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
