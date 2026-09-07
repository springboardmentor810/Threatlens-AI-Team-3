'use client';

import React, { useState } from 'react';
import { Download, Check, X, FileCode, Terminal, ShieldAlert } from 'lucide-react';

interface PlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleName: string;
  remediationData: any;
  yaraSigmaData: any;
}

export default function PlaybookExporterModal({
  isOpen,
  onClose,
  sampleName,
  remediationData,
  yaraSigmaData
}: PlaybookModalProps) {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerDownload = (filename: string, content: string, formatName: string) => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFormat(formatName);
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const safeFn = sampleName.replace(/[^a-zA-Z0-9]/g, '_');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn font-mono">
      <div className="w-full max-w-2xl p-6 rounded-3xl bg-cyber-card border border-cyber-border shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-border">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-cyber-accent" /> 1-Click Multi-Format Containment Playbook Export Center
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Export verified mitigation scripts & detection signatures for {sampleName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-cyber-dark text-slate-500 hover:text-slate-900 border border-cyber-border font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Download Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono">
          {/* PowerShell Script */}
          <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-accent">Windows PowerShell</span>
                <span className="text-[10px] text-slate-500 font-bold">.ps1</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">Host process termination, registry purge & firewall block.</p>
            </div>
            <button
              onClick={() => triggerDownload(`Containment_${safeFn}.ps1`, remediationData?.powershell || '# Remediation', 'PowerShell')}
              className="w-full py-2 rounded-xl bg-cyber-accent text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              {downloadedFormat === 'PowerShell' ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedFormat === 'PowerShell' ? 'Downloaded .ps1' : 'Download PowerShell Script'}</span>
            </button>
          </div>

          {/* Linux Bash */}
          <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-green">Linux Isolation Bash</span>
                <span className="text-[10px] text-slate-500 font-bold">.sh</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">Process pkill & iptables egress C2 blocking script.</p>
            </div>
            <button
              onClick={() => triggerDownload(`Containment_${safeFn}.sh`, remediationData?.bash || '# Linux Bash', 'Bash')}
              className="w-full py-2 rounded-xl bg-cyber-green text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              {downloadedFormat === 'Bash' ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedFormat === 'Bash' ? 'Downloaded .sh' : 'Download Linux Bash'}</span>
            </button>
          </div>

          {/* YARA Rule */}
          <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-700">Synthesized YARA Signature</span>
                <span className="text-[10px] text-slate-500 font-bold">.yar</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">Binary hex byte pattern & string detection rule.</p>
            </div>
            <button
              onClick={() => triggerDownload(`ThreatLens_Auto_${safeFn}.yar`, yaraSigmaData?.yara_rule || '// YARA', 'YARA')}
              className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              {downloadedFormat === 'YARA' ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedFormat === 'YARA' ? 'Downloaded .yar' : 'Download YARA Signature'}</span>
            </button>
          </div>

          {/* Sigma Detection Rule */}
          <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyber-amber">Generic Sigma Rule</span>
                <span className="text-[10px] text-slate-500 font-bold">.yml</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">Vendor-agnostic process creation SIEM hunting rule.</p>
            </div>
            <button
              onClick={() => triggerDownload(`Sigma_${safeFn}.yml`, yaraSigmaData?.sigma_rule || '# Sigma', 'Sigma')}
              className="w-full py-2 rounded-xl bg-cyber-amber text-white font-bold flex items-center justify-center space-x-1.5 shadow-sm hover:opacity-90 transition-all"
            >
              {downloadedFormat === 'Sigma' ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadedFormat === 'Sigma' ? 'Downloaded .yml' : 'Download Sigma Rule'}</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 rounded-xl bg-cyber-dark text-[11px] text-slate-500 font-bold text-center border border-cyber-border">
          All Playbooks generated autonomously by ThreatLens AI Core with SHA-256 integrity metadata.
        </div>
      </div>
    </div>
  );
}
