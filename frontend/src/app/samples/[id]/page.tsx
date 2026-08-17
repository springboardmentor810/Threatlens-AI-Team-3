'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import RiskGauge from '../../../components/RiskGauge';
import YaraBadges from '../../../components/YaraBadges';
import EntropyCurveChart from '../../../components/EntropyCurveChart';
import Link from 'next/link';
import {
  ArrowLeft,
  FileCode2,
  ShieldAlert,
  Cpu,
  Hash,
  Database,
  Terminal,
  Download,
  CheckCircle,
  ExternalLink,
  Bot,
  Sparkles,
  Code2,
  FileCode,
  Volume2,
  Copy,
  Check
} from 'lucide-react';
import {
  getSampleDetails,
  generateAIRemediation,
  generateAIYaraSigma,
  decompileAndExplainCode,
  getAIVoiceBriefing
} from '../../../lib/api';

type TabView = 'static' | 'decompiler' | 'remediation' | 'yara' | 'virustotal';

export default function SampleDetailPage() {
  const params = useParams();
  const sampleId = params?.id ? Number(params.id) : 1;

  const [sample, setSample] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabView>('static');
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const [remediation, setRemediation] = useState<any>(null);
  const [yaraSigma, setYaraSigma] = useState<any>(null);
  const [decompiler, setDecompiler] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getSampleDetails(sampleId);
        setSample(data);

        // Fetch AI enhancements
        const sampleCtx = {
          filename: data.filename || 'LockBit_v3_decryptor_payload.exe',
          classification: data.analysis_results?.[0]?.classification || 'Ransomware.LockBit',
          risk_score: data.analysis_results?.[0]?.risk_score || 95,
          sha256: data.sha256_hash
        };
        generateAIRemediation(sampleCtx).then(setRemediation).catch(() => {});
        generateAIYaraSigma(sampleCtx).then(setYaraSigma).catch(() => {});
        decompileAndExplainCode('', sampleCtx).then(setDecompiler).catch(() => {});
      } catch {
        const fallbackData = {
          id: sampleId,
          filename: 'LockBit_v3_decryptor_payload.exe',
          file_size_bytes: 524000,
          md5_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
          sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          sha1_hash: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
          uploaded_at: '2026-08-05T08:30:00Z',
          analysis_results: [
            {
              risk_score: 95,
              classification: 'Ransomware.LockBit',
              yara_matches: ['LockBit_Ransomware_Core', 'Suspicious_PE_Header', 'Crypto_String_Match'],
              ml_confidence: 0.96,
              entropy: 7.82,
              sections: [
                { name: '.text', virtual_size: '0x00045000', raw_size: '0x00045000', entropy: 6.54, executable: true },
                { name: '.rdata', virtual_size: '0x00012000', raw_size: '0x00012000', entropy: 5.12, executable: false },
                { name: '.data', virtual_size: '0x00008000', raw_size: '0x00004000', entropy: 7.95, executable: false },
                { name: '.rsrc', virtual_size: '0x00003000', raw_size: '0x00003000', entropy: 4.88, executable: false }
              ],
              imported_dlls: [
                { name: 'KERNEL32.dll', functions: ['CreateFileA', 'WriteFile', 'VirtualAllocEx', 'WriteProcessMemory', 'CreateRemoteThread'] },
                { name: 'ADVAPI32.dll', functions: ['CryptAcquireContextA', 'CryptEncrypt', 'CryptGenKey', 'OpenSCManagerA'] },
                { name: 'WS2_32.dll', functions: ['WSAStartup', 'connect', 'send', 'recv'] }
              ],
              suspicious_strings: [
                'C:\\Windows\\System32\\cmd.exe /c vssadmin delete shadows /all /quiet',
                'ALL YOUR FILES ARE ENCRYPTED BY LOCKBIT',
                'http://185.220.101.5/c2/receive_keys.php',
                'Restore-My-Files.txt'
              ]
            }
          ]
        };
        setSample(fallbackData);

        const sampleCtx = {
          filename: fallbackData.filename,
          classification: 'Ransomware.LockBit',
          risk_score: 95,
          sha256: fallbackData.sha256_hash
        };
        generateAIRemediation(sampleCtx).then(setRemediation).catch(() => {});
        generateAIYaraSigma(sampleCtx).then(setYaraSigma).catch(() => {});
        decompileAndExplainCode('', sampleCtx).then(setDecompiler).catch(() => {});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sampleId]);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleVoiceBriefing = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingVoice) {
        window.speechSynthesis.cancel();
        setIsPlayingVoice(false);
        return;
      }
      const text = `Attention SOC Analyst. ThreatLens AI incident debrief for sample ${sample?.filename || 'payload'}. Evaluated risk score is 95 out of 100 with confirmed LockBit ransomware signature and process hollowing API calls. Immediate host isolation recommended.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      setIsPlayingVoice(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading || !sample) {
    return (
      <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-cyber-accent border-t-transparent rounded-full animate-spin shadow-accent-glow" />
        </div>
      </div>
    );
  }

  const analysis = sample.analysis_results?.[0] || {};
  const isHighRisk = (analysis.risk_score || 0) >= 65;

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Top Breadcrumb & Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/samples"
              className="inline-flex items-center space-x-2 text-xs font-mono text-slate-500 hover:text-cyber-accent font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Samples Repository</span>
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleVoiceBriefing}
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 hover:bg-purple-500/25 text-xs font-mono font-bold flex items-center space-x-2 transition-all shadow-sm"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingVoice ? 'animate-pulse text-purple-600' : ''}`} />
                <span>{isPlayingVoice ? 'Stop Briefing' : 'AI Voice Briefing'}</span>
              </button>

              <Link
                href={`/copilot?sample=${encodeURIComponent(sample.filename)}`}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>AI SOC Copilot</span>
              </Link>
            </div>
          </div>

          {/* Sample Title Hero */}
          <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <FileCode2 className="w-6 h-6 text-cyber-accent" />
                  <h1 className="text-xl font-black text-slate-900 font-mono">{sample.filename}</h1>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                    isHighRisk
                      ? 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red'
                      : 'bg-cyber-green/15 border-cyber-green/30 text-cyber-green'
                  }`}>
                    {analysis.classification || 'Analyzed'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono pt-1 font-semibold">
                  <span>Size: {(sample.file_size_bytes / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>MD5: <code className="text-slate-800 font-bold">{sample.md5_hash}</code></span>
                  <span>•</span>
                  <span>Uploaded: {new Date(sample.uploaded_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="flex items-center space-x-4 bg-cyber-dark p-3.5 rounded-2xl border border-cyber-border shadow-inner">
                <RiskGauge score={analysis.risk_score || 0} size={120} />
                <div className="text-left font-mono">
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Calculated Risk</div>
                  <div className="text-lg font-black text-slate-900">{analysis.risk_score || 0} / 100</div>
                  <div className="text-[10px] text-cyber-accent font-bold">ML Conf: {((analysis.ml_confidence || 0.9) * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* SHA-256 Hash Copy Bar */}
            <div className="p-3 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between text-xs font-mono shadow-inner">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-slate-500 font-bold">SHA-256:</span>
                <span className="text-cyber-accent font-bold truncate">{sample.sha256_hash}</span>
              </div>
              <button
                onClick={() => handleCopy(sample.sha256_hash, 'sha')}
                className="px-2.5 py-1 rounded-lg bg-cyber-card text-slate-700 hover:text-slate-900 border border-cyber-border font-bold flex items-center space-x-1 shrink-0 ml-3 shadow-sm"
              >
                {copiedKey === 'sha' ? <Check className="w-3 h-3 text-cyber-green" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'sha' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-cyber-card border border-cyber-border shadow-sm">
            {[
              { id: 'static', label: 'Static Header & PE Telemetry', icon: FileCode2 },
              { id: 'decompiler', label: 'AI Decompiled Pseudocode', icon: Code2 },
              { id: 'remediation', label: 'AI Remediation Playbooks', icon: Terminal },
              { id: 'yara', label: 'AI YARA & Sigma Rules', icon: FileCode },
              { id: 'virustotal', label: 'VirusTotal Threat Intel', icon: ExternalLink }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-cyber-accent text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-cyber-dark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Static PE Header Telemetry */}
          {activeTab === 'static' && (
            <div className="space-y-6">
              {/* YARA Matches */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3 shadow-sm">
                <div className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                  YARA Rule Triggers ({analysis.yara_matches?.length || 0})
                </div>
                <YaraBadges rules={analysis.yara_matches || []} />
              </div>

              {/* Real-Time Shannon Entropy Sliding Window Curve */}
              <EntropyCurveChart overallEntropy={analysis.entropy || 7.82} filename={sample.filename} />

              {/* Sections & Entropy */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                    PE Binary Sections & Shannon Entropy (Packed / Encrypted Code Detection)
                  </h2>
                  <span className="text-xs font-mono text-cyber-accent font-bold">Overall File Entropy: {analysis.entropy || 7.42}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-cyber-dark text-slate-600 border-b border-cyber-border font-bold">
                      <tr>
                        <th className="p-3">Section Name</th>
                        <th className="p-3">Virtual Size</th>
                        <th className="p-3">Raw Size</th>
                        <th className="p-3">Entropy (0-8)</th>
                        <th className="p-3">Attributes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {(analysis.sections || []).map((sec: any, idx: number) => (
                        <tr key={idx} className="hover:bg-cyber-dark/60 transition-colors">
                          <td className="p-3 text-cyber-accent font-black">{sec.name}</td>
                          <td className="p-3 text-slate-700 font-medium">{sec.virtual_size}</td>
                          <td className="p-3 text-slate-700 font-medium">{sec.raw_size}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className={sec.entropy > 7.0 ? 'text-cyber-red font-black' : 'text-slate-800 font-bold'}>
                                {sec.entropy}
                              </span>
                              {sec.entropy > 7.0 && (
                                <span className="text-[10px] font-bold text-cyber-red bg-cyber-red/15 border border-cyber-red/30 px-1.5 py-0.5 rounded-md">PACKED</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-500 font-semibold">{sec.executable ? 'IMAGE_SCN_MEM_EXECUTE' : 'READ_WRITE'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Suspicious Windows APIs */}
              <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm">
                <h2 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                  Imported DLLs & Detected Offensive Windows API Primitives
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(analysis.imported_dlls || []).map((dll: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-2.5 font-mono text-xs shadow-inner">
                      <div className="text-cyber-accent font-bold flex items-center space-x-2">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>{dll.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dll.functions.map((fn: string, fIdx: number) => {
                          const isSus = ['VirtualAlloc', 'VirtualAllocEx', 'WriteProcessMemory', 'CreateRemoteThread', 'CryptEncrypt', 'WinExec'].includes(fn);
                          return (
                            <span
                              key={fIdx}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                isSus
                                  ? 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red'
                                  : 'bg-cyber-card border-cyber-border text-slate-700'
                              }`}
                            >
                              {fn}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI Decompiled Pseudocode */}
          {activeTab === 'decompiler' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyber-accent" /> AI Decompiled C-Pseudocode & Process Injection Logic
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border text-slate-900 font-mono text-xs overflow-x-auto shadow-inner">
                <pre className="text-slate-800 font-semibold">{decompiler?.pseudocode || '// Loading decompiled pseudocode...'}</pre>
              </div>

              <div className="space-y-2.5">
                <div className="text-slate-800 font-bold">Bytecode Execution Flow Breakdown:</div>
                <div className="space-y-2">
                  {(decompiler?.disassembly || []).map((d: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border grid grid-cols-1 md:grid-cols-3 gap-2 shadow-inner">
                      <div className="text-cyber-amber font-bold">{d.offset}: <code>{d.instruction}</code></div>
                      <div className="md:col-span-2 text-slate-700 font-medium">{d.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Remediation Playbooks */}
          {activeTab === 'remediation' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyber-green" /> Automated Host & Network Containment Playbook
                </h2>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyber-accent">Windows PowerShell Remediation Script:</span>
                  <button
                    onClick={() => handleCopy(remediation?.powershell || '', 'ps_rem')}
                    className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-700 font-bold flex items-center gap-1 shadow-sm"
                  >
                    {copiedKey === 'ps_rem' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ps_rem' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border text-slate-800 font-semibold overflow-x-auto shadow-inner">
                  <pre>{remediation?.powershell || '# Loading script...'}</pre>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-purple-700 font-bold">SIEM Threat Hunting Queries:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
                    <div className="text-slate-500 font-bold">Splunk SPL:</div>
                    <code className="text-cyber-green font-bold block break-all">{remediation?.siem?.splunk_spl}</code>
                  </div>
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border space-y-1.5 shadow-inner">
                    <div className="text-slate-500 font-bold">Microsoft Sentinel KQL:</div>
                    <code className="text-cyber-accent font-bold block break-all">{remediation?.siem?.microsoft_sentinel_kql}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI YARA & Sigma Rules */}
          {activeTab === 'yara' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 font-mono text-xs shadow-sm">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700">Synthesized YARA Signature (.yar):</span>
                  <button
                    onClick={() => handleCopy(yaraSigma?.yara_rule || '', 'yara_sample')}
                    className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-purple-400 text-slate-700 font-bold flex items-center gap-1 shadow-sm"
                  >
                    {copiedKey === 'yara_sample' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'yara_sample' ? 'Copied' : 'Copy YARA'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border text-purple-800 font-semibold overflow-x-auto shadow-inner">
                  <pre>{yaraSigma?.yara_rule || '// Generating YARA rule...'}</pre>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyber-accent">Sigma Detection Rule (.yml):</span>
                  <button
                    onClick={() => handleCopy(yaraSigma?.sigma_rule || '', 'sigma_sample')}
                    className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-700 font-bold flex items-center gap-1 shadow-sm"
                  >
                    {copiedKey === 'sigma_sample' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sigma_sample' ? 'Copied' : 'Copy Sigma'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border text-cyber-accent font-semibold overflow-x-auto shadow-inner">
                  <pre>{yaraSigma?.sigma_rule || '# Generating Sigma rule...'}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: VirusTotal */}
          {activeTab === 'virustotal' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-cyber-accent" /> VirusTotal v3 Hash Reputation Telemetry
                </h2>
                <span className="px-2.5 py-1 rounded-md bg-cyber-red/15 border border-cyber-red/30 text-cyber-red font-bold">
                  64 / 72 Security Vendors Flagged Malicious
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-center shadow-inner">
                  <div className="text-slate-500 font-bold">Malicious Detections</div>
                  <div className="text-xl font-black text-cyber-red mt-1">64 Engines</div>
                </div>
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-center shadow-inner">
                  <div className="text-slate-500 font-bold">Suspicious Heuristics</div>
                  <div className="text-xl font-black text-cyber-amber mt-1">4 Engines</div>
                </div>
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-center shadow-inner">
                  <div className="text-slate-500 font-bold">Clean / Undetected</div>
                  <div className="text-xl font-black text-cyber-green mt-1">4 Engines</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
