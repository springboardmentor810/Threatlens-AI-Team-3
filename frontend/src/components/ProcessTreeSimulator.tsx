'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  FileCode,
  HardDrive,
  Globe,
  Database,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Terminal,
  ShieldAlert
} from 'lucide-react';

interface ProcessNode {
  pid: number;
  process_name: string;
  cmdline: string;
  user?: string;
  children?: ProcessNode[];
}

interface ProcessTreeProps {
  behaviorData: any;
}

export default function ProcessTreeSimulator({ behaviorData }: ProcessTreeProps) {
  const [activeTab, setActiveTab] = useState<'tree' | 'files' | 'registry' | 'network'>('tree');
  const [simulationStep, setSimulationStep] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlaySimulation = () => {
    setIsPlaying(true);
    setSimulationStep(0);
    const interval = setInterval(() => {
      setSimulationStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsPlaying(false);
          return 3;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const renderProcessNode = (node: ProcessNode, level: number = 0) => {
    if (!node) return null;
    const isHollowed = node.cmdline?.includes('(HOLLOWED)') || node.process_name?.includes('svchost');
    const isMalicious = node.cmdline?.includes('vssadmin') || node.cmdline?.includes('LockBit') || node.cmdline?.includes('-enc');

    return (
      <div key={node.pid} className="space-y-2 font-mono" style={{ marginLeft: `${level * 20}px` }}>
        <div className={`p-3 rounded-xl border transition-all ${
          isMalicious
            ? 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red shadow-sm'
            : (isHollowed ? 'bg-purple-500/10 border-purple-500/30 text-purple-700' : 'bg-cyber-dark border-cyber-border text-slate-800')
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              <Cpu className={`w-4 h-4 ${isMalicious ? 'text-cyber-red' : 'text-cyber-accent'}`} />
              <span className="font-bold text-xs">{node.process_name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-card border border-cyber-border text-slate-600">
                PID: {node.pid}
              </span>
              {node.user && (
                <span className="text-[10px] text-slate-500 hidden sm:inline">({node.user})</span>
              )}
            </div>

            {isMalicious && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyber-red/20 text-cyber-red border border-cyber-red/40 animate-pulse">
                OFFENSIVE BEHAVIOR
              </span>
            )}
            {isHollowed && !isMalicious && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-700 border border-purple-500/40">
                PROCESS HOLLOWED
              </span>
            )}
          </div>

          <div className="mt-1.5 pl-6 text-[11px] text-slate-600 break-all font-semibold">
            <code>{node.cmdline}</code>
          </div>
        </div>

        {node.children && node.children.map((child) => renderProcessNode(child, level + 1))}
      </div>
    );
  };

  if (!behaviorData) return null;

  return (
    <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-6 shadow-sm">
      {/* Simulator Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cyber-border">
        <div>
          <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-600" /> Dynamic Behavior Sandbox Emulation Engine
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Process tree hierarchy, file mutation artifacts, registry hooks & socket callbacks
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePlaySimulation}
            disabled={isPlaying}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'Replaying Simulation...' : 'Replay Step Playback'}</span>
          </button>
        </div>
      </div>

      {/* Summary Alert Pill */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start space-x-3 text-xs font-mono">
        <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-purple-800">Sandbox Trace Summary</div>
          <div className="text-slate-700 mt-0.5 font-medium">{behaviorData.sandbox_summary}</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-cyber-dark border border-cyber-border shadow-inner">
        {[
          { id: 'tree', label: 'Process Execution Hierarchy', icon: Cpu, count: 4 },
          { id: 'files', label: 'File System Drops & Mutations', icon: HardDrive, count: behaviorData.file_system_activity?.length || 0 },
          { id: 'registry', label: 'Registry Key Persistence', icon: Database, count: behaviorData.registry_mutations?.length || 0 },
          { id: 'network', label: 'Active Socket Callbacks', icon: Globe, count: behaviorData.network_connections?.length || 0 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                isActive
                  ? 'bg-cyber-card text-cyber-accent border border-cyber-border shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded bg-cyber-dark border border-cyber-border text-[10px]">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Process Tree */}
      {activeTab === 'tree' && (
        <div className="space-y-3">
          {behaviorData.process_tree ? (
            renderProcessNode(behaviorData.process_tree)
          ) : (
            <div className="text-xs font-mono text-slate-500 p-4">No process tree available for this vector.</div>
          )}
        </div>
      )}

      {/* Tab 2: File System Activity */}
      {activeTab === 'files' && (
        <div className="space-y-2 font-mono text-xs">
          {(behaviorData.file_system_activity || []).map((item: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  item.action.includes('DELETE') ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/30' : 'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/30'
                }`}>
                  {item.action}
                </span>
                <span className="font-bold text-slate-800">{item.path}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Hash: {item.hash}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Registry Mutations */}
      {activeTab === 'registry' && (
        <div className="space-y-2 font-mono text-xs">
          {(behaviorData.registry_mutations || []).map((reg: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border space-y-1 shadow-inner">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-amber/15 text-cyber-amber border border-cyber-amber/30">
                  {reg.action}
                </span>
                <span className="font-bold text-purple-700">{reg.key}</span>
              </div>
              <div className="pl-6 text-slate-700 font-medium text-[11px]"><code>{reg.value}</code></div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Network Socket Callbacks */}
      {activeTab === 'network' && (
        <div className="space-y-2 font-mono text-xs">
          {(behaviorData.network_connections || []).map((net: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-cyber-dark border border-cyber-border flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-cyber-accent shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{net.remote_ip}:{net.port} ({net.domain})</div>
                  <div className="text-[10px] text-slate-500">{net.protocol} Protocol • Sent {net.data_sent_bytes} Bytes</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyber-green/15 text-cyber-green border border-cyber-green/30">
                {net.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
