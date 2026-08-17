'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  Bot,
  Sparkles,
  Send,
  Code2,
  ShieldAlert,
  Terminal,
  FileCode,
  Volume2,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  sendAICopilotMessage,
  generateAIRemediation,
  generateAIYaraSigma,
  decompileAndExplainCode,
  getAIVoiceBriefing
} from '../../lib/api';

type TabMode = 'chat' | 'decompile' | 'remediation' | 'yara' | 'voice';

export default function CopilotPage() {
  const [tab, setTab] = useState<TabMode>('chat');
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: `### 🤖 ThreatLens AI SOC Copilot Initialized

I am your autonomous cybersecurity investigation agent, equipped with static telemetry models, MITRE ATT&CK mappings, and automated remediation generators.

How can I assist your investigation today? Select a prompt chip below or type your custom query.`,
      suggested_actions: [
        'Explain Execution Flow',
        'Generate PowerShell Remediation',
        'Map MITRE ATT&CK',
        'Synthesize YARA Rule',
        'Executive CISO Brief'
      ]
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Active sample context state
  const [sampleContext, setSampleContext] = useState<any>({
    filename: 'LockBit_v3_decryptor_payload.exe',
    classification: 'Ransomware.LockBit',
    risk_score: 95,
    entropy: 7.82,
    yara_matches: ['LockBit_Ransomware_Core', 'Suspicious_PE_Header'],
    suspicious_apis: ['VirtualAllocEx', 'WriteProcessMemory', 'CreateRemoteThread', 'CryptEncrypt']
  });

  // Toolkit responses
  const [remediationData, setRemediationData] = useState<any>(null);
  const [yaraSigmaData, setYaraSigmaData] = useState<any>(null);
  const [decompileData, setDecompileData] = useState<any>(null);
  const [voiceData, setVoiceData] = useState<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial toolkit data
  useEffect(() => {
    generateAIRemediation(sampleContext).then(setRemediationData).catch(() => {});
    generateAIYaraSigma(sampleContext).then(setYaraSigmaData).catch(() => {});
    decompileAndExplainCode('', sampleContext).then(setDecompilerCode).catch(() => {});
    getAIVoiceBriefing(sampleContext.classification).then(setVoiceData).catch(() => {});
  }, []);

  const setDecompilerCode = (data: any) => {
    setDecompileData(data);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputMsg;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const aiRes = await sendAICopilotMessage(textToSend, sampleContext);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiRes.reply,
          suggested_actions: aiRes.suggested_actions || []
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error reaching AI Copilot engine: ${err.message}`,
          suggested_actions: ['Retry Analysis']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleVoiceDebriefToggle = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const textToSpeak = voiceData?.spoken_text || (
        `Attention SOC Analyst. ThreatLens AI incident debrief for sample ${sampleContext.filename}. ` +
        `This artifact is classified as ${sampleContext.classification} with a critical risk score of ${sampleContext.risk_score} out of 100. ` +
        `Detected process injection primitives and high entropy packing. Automated containment scripts and YARA rules have been synthesized.`
      );

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-cyber-card via-purple-500/5 to-cyber-accent/10 border border-cyber-border shadow-sm">
            <div>
              <h1 className="text-xl font-black text-slate-900 font-sans tracking-wide flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600 animate-pulse" /> THREATLENS AI SOC COPILOT & AUTONOMOUS REASONING
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
                Interactive cyber reasoning, automated reverse engineering, 1-click remediation scripts & YARA/Sigma synthesis.
              </p>
            </div>

            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-800 text-xs font-mono font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Target: <strong>{sampleContext.filename}</strong> ({sampleContext.classification})</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-cyber-card border border-cyber-border shadow-sm">
            {[
              { id: 'chat', label: 'AI Copilot Chat', icon: Bot },
              { id: 'decompile', label: 'Disassembly & Code Explainer', icon: Code2 },
              { id: 'remediation', label: '1-Click Remediation Playbook', icon: Terminal },
              { id: 'yara', label: 'AI YARA & Sigma Synthesizer', icon: FileCode },
              { id: 'voice', label: 'AI Voice Incident Briefing', icon: Volume2 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as TabMode)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-cyber-dark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: AI Chat Assistant */}
          {tab === 'chat' && (
            <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-4 flex flex-col h-[640px] shadow-sm">
              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-xs font-mono leading-relaxed space-y-2 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-cyber-accent text-white font-bold'
                          : 'bg-cyber-dark border border-cyber-border text-slate-800 font-medium shadow-inner'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Action Chips */}
                      {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                        <div className="pt-3 border-t border-cyber-border/80 flex flex-wrap gap-2">
                          {msg.suggested_actions.map((act: string, aIdx: number) => (
                            <button
                              key={aIdx}
                              onClick={() => handleSendMessage(act)}
                              className="px-2.5 py-1 rounded-lg bg-cyber-accent/15 border border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent hover:text-white text-[10px] font-mono font-bold transition-all shadow-sm"
                            >
                              ⚡ {act}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-2 text-purple-700 text-xs font-mono p-3 rounded-xl bg-cyber-dark border border-cyber-border w-fit font-bold shadow-inner">
                    <span className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span>ThreatLens AI Copilot reasoning & querying neural threat models...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="pt-3 border-t border-cyber-border flex items-center gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMsg)}
                  placeholder="Ask Copilot: 'Explain execution flow', 'Generate PowerShell containment', 'Map MITRE ATT&CK'..."
                  className="flex-1 px-4 py-3 rounded-xl bg-cyber-dark border border-cyber-border text-slate-900 text-xs font-mono font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none shadow-inner"
                />
                <button
                  onClick={() => handleSendMessage(inputMsg)}
                  disabled={loading || !inputMsg.trim()}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold flex items-center space-x-2 transition-all disabled:opacity-40 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Disassembly & Decompiler Explainer */}
          {tab === 'decompile' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyber-accent" /> AI Decompiled C-Pseudocode & Disassembly Explainer
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                    Translates low-level assembly bytecode into annotated high-level execution primitives.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-cyber-red/15 border border-cyber-red/30 text-cyber-red text-xs font-mono font-bold">
                    Process Hollowing (T1055.012)
                  </span>
                </div>
              </div>

              {/* Decompiled Pseudocode */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 font-mono">Decompiled C-Pseudocode:</div>
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-slate-800 font-semibold overflow-x-auto shadow-inner">
                  <pre>{decompileData?.pseudocode || '// Loading pseudocode...'}</pre>
                </div>
              </div>

              {/* Step-by-Step Disassembly Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 font-mono">Disassembly Instruction Explanations:</div>
                <div className="space-y-2">
                  {(decompileData?.disassembly || []).map((step: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs items-center shadow-inner">
                      <div className="text-cyber-amber font-bold">{step.offset}: <code>{step.instruction}</code></div>
                      <div className="md:col-span-2 text-slate-700 font-medium">{step.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Remediation & Containment Playbook */}
          {tab === 'remediation' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyber-green" /> Automated Incident Containment & Quarantine Suite
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                    1-Click executable scripts generated specifically for {sampleContext.classification}.
                  </p>
                </div>
              </div>

              {/* PowerShell Remediation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-accent font-mono">Windows Host Containment (PowerShell):</span>
                  <button
                    onClick={() => handleCopy(remediationData?.powershell || '', 'ps')}
                    className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedKey === 'ps' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ps' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-slate-800 font-semibold overflow-x-auto shadow-inner">
                  <pre>{remediationData?.powershell || '# Loading PowerShell script...'}</pre>
                </div>
              </div>

              {/* Linux Bash Remediation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyber-amber font-mono">Linux / UNIX Quarantine (Bash):</span>
                  <button
                    onClick={() => handleCopy(remediationData?.bash || '', 'bash')}
                    className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-amber text-slate-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm"
                  >
                    {copiedKey === 'bash' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bash' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-slate-800 font-semibold overflow-x-auto shadow-inner">
                  <pre>{remediationData?.bash || '# Loading Bash script...'}</pre>
                </div>
              </div>

              {/* SIEM Hunting Queries */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-purple-700 font-mono">SIEM Threat Hunting Queries:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs space-y-1.5 shadow-inner">
                    <div className="text-slate-500 font-bold">Splunk (SPL):</div>
                    <code className="text-cyber-green font-bold block break-all">{remediationData?.siem?.splunk_spl}</code>
                  </div>
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs space-y-1.5 shadow-inner">
                    <div className="text-slate-500 font-bold">Microsoft Sentinel (KQL):</div>
                    <code className="text-cyber-accent font-bold block break-all">{remediationData?.siem?.microsoft_sentinel_kql}</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: AI YARA & Sigma Synthesizer */}
          {tab === 'yara' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-600" /> AI-Synthesized Detection Rules
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                    Auto-generated YARA signatures & Sigma rules tailored to extracted telemetry.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* YARA Rule Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 font-mono">Compiled YARA Signature (.yar):</span>
                    <button
                      onClick={() => handleCopy(yaraSigmaData?.yara_rule || '', 'yara')}
                      className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-purple-400 text-slate-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm"
                    >
                      {copiedKey === 'yara' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'yara' ? 'Copied' : 'Copy YARA'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-purple-800 font-semibold overflow-x-auto shadow-inner">
                    <pre>{yaraSigmaData?.yara_rule || '// Generating YARA rule...'}</pre>
                  </div>
                </div>

                {/* Sigma Rule Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyber-accent font-mono">Sigma Rule (.yml):</span>
                    <button
                      onClick={() => handleCopy(yaraSigmaData?.sigma_rule || '', 'sigma')}
                      className="px-2.5 py-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-700 font-bold text-xs font-mono flex items-center gap-1.5 shadow-sm"
                    >
                      {copiedKey === 'sigma' ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sigma' ? 'Copied' : 'Copy Sigma'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border font-mono text-xs text-cyber-accent font-semibold overflow-x-auto shadow-inner">
                    <pre>{yaraSigmaData?.sigma_rule || '# Generating Sigma rule...'}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: AI Voice Incident Briefing */}
          {tab === 'voice' && (
            <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-purple-600" /> AI SOC Voice Incident Briefing
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 font-medium">
                    Automated audio debrief synthesized for security leads and incident response directors.
                  </p>
                </div>

                <button
                  onClick={handleVoiceDebriefToggle}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
                >
                  <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  <span>{isPlayingAudio ? 'Stop Speech Synthesis' : 'Play Spoken Incident Briefing'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 font-mono text-xs shadow-inner">
                <div className="text-slate-500 font-bold flex items-center justify-between">
                  <span>Synthesized Briefing Script:</span>
                  <span className="text-purple-700">Duration: ~18s</span>
                </div>
                <div className="p-4 rounded-xl bg-cyber-card border border-cyber-border text-slate-800 font-medium leading-relaxed text-sm shadow-sm">
                  "{voiceData?.spoken_text || 'Attention SOC Analyst. ThreatLens AI incident debrief for sample LockBit_v3_decryptor_payload.exe. This binary has been classified as Ransomware.LockBit with a risk score of 95 out of 100.'}"
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
