'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, HelpCircle, ChevronRight, Layers, Target, Activity } from 'lucide-react';

interface MitreTechnique {
  id: string;
  name: string;
  status: string;
  confidence: number;
  evidence: string;
}

interface MitreTactic {
  id: string;
  tactic: string;
  techniques: MitreTechnique[];
}

interface MitreProps {
  matrixData: {
    filename: string;
    classification: string;
    risk_score: number;
    total_tactics: number;
    total_techniques_evaluated: number;
    confirmed_techniques_count: number;
    coverage_percentage: number;
    tactics: MitreTactic[];
  };
}

export default function MitreAttackMatrix({ matrixData }: MitreProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechnique | null>(null);

  if (!matrixData || !matrixData.tactics) return null;

  return (
    <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border font-mono">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyber-accent" /> MITRE ATT&CK Matrix Enterprise Navigator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            11 Attack Tactics & Technique Evidence Heatmap for {matrixData.filename}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border text-slate-700 font-bold">
            Evaluated: <span className="text-cyber-accent">{matrixData.total_techniques_evaluated} Techniques</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyber-red/15 border border-cyber-red/30 text-cyber-red font-bold">
            Confirmed: {matrixData.confirmed_techniques_count} Matches ({matrixData.coverage_percentage}%)
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col auto-cols-[180px] gap-3 font-mono text-xs">
          {matrixData.tactics.map((tactic) => (
            <div key={tactic.id} className="space-y-2">
              <div className="p-2.5 rounded-xl bg-cyber-dark border border-cyber-border text-center">
                <div className="text-[10px] text-slate-500 font-bold">{tactic.id}</div>
                <div className="font-bold text-slate-900 text-xs truncate mt-0.5">{tactic.tactic}</div>
              </div>

              <div className="space-y-2">
                {tactic.techniques.map((tech) => {
                  const isConfirmed = tech.status === 'CONFIRMED';
                  const isDetected = tech.status === 'DETECTED';
                  const isSuspicious = tech.status === 'SUSPICIOUS';

                  return (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isConfirmed
                          ? 'bg-cyber-red/15 border-cyber-red/40 text-cyber-red hover:bg-cyber-red/25 shadow-sm'
                          : isDetected
                          ? 'bg-cyber-amber/15 border-cyber-amber/40 text-cyber-amber hover:bg-cyber-amber/25'
                          : isSuspicious
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-700 hover:bg-purple-500/25'
                          : 'bg-cyber-dark/50 border-cyber-border text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-80">{tech.id}</div>
                      <div className="font-bold text-[11px] leading-snug line-clamp-2 mt-0.5">{tech.name}</div>
                      <div className="mt-2 flex items-center justify-between text-[9px] font-bold">
                        <span>{(tech.confidence * 100).toFixed(0)}% Conf</span>
                        <span className="uppercase">{tech.status}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Technique Detail Drawer Modal */}
      {selectedTechnique && (
        <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border font-mono text-xs space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyber-red" />
              <span className="font-bold text-slate-900">{selectedTechnique.id}: {selectedTechnique.name}</span>
            </div>
            <button
              onClick={() => setSelectedTechnique(null)}
              className="text-slate-500 hover:text-slate-800 font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 font-bold">Technique Status:</span>{' '}
              <span className="text-cyber-red font-bold uppercase">{selectedTechnique.status}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">AI Confidence Rating:</span>{' '}
              <span className="text-cyber-accent font-bold">{(selectedTechnique.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border space-y-1">
            <div className="text-slate-500 font-bold">Observed Telemetry Evidence:</div>
            <div className="text-slate-800 font-medium">{selectedTechnique.evidence}</div>
          </div>
        </div>
      )}
    </div>
  );
}
