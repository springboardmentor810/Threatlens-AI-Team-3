'use client';

import React, { useEffect, useState } from 'react';
import { Radio, ShieldAlert, Pause, Play, Sparkles } from 'lucide-react';
import { subscribeLiveTelemetrySSE } from '../lib/api';

export default function LiveTelemetryTicker() {
  const [telemetryEvents, setTelemetryEvents] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const unsubscribe = subscribeLiveTelemetrySSE((newEvent) => {
      setTelemetryEvents((prev) => [newEvent, ...prev.slice(0, 10)]);
    });

    return () => unsubscribe();
  }, [isLive]);

  if (telemetryEvents.length === 0) {
    return (
      <div className="w-full bg-cyber-card border-y border-cyber-border py-2 px-4 flex items-center justify-between text-xs font-mono shadow-sm">
        <div className="flex items-center space-x-2 text-purple-700 font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-purple-600" />
          <span>Realtime Telemetry SSE Stream Connecting...</span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold bg-cyber-dark px-2 py-0.5 rounded border border-cyber-border">
          0ms Latency
        </span>
      </div>
    );
  }

  const latest = telemetryEvents[0];

  return (
    <div className="w-full bg-cyber-card/90 backdrop-blur-md border-y border-cyber-border py-2 px-4 flex items-center justify-between text-xs font-mono shadow-sm transition-all">
      <div className="flex items-center space-x-3 truncate">
        <div className="flex items-center space-x-1.5 shrink-0 font-bold text-purple-700">
          <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-purple-600' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">LIVE SSE TELEMETRY:</span>
        </div>

        <div className="flex items-center space-x-2 truncate">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            latest.severity === 'CRITICAL' ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/30' : 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/30'
          }`}>
            {latest.event_type}
          </span>
          <span className="font-bold text-slate-900 truncate">{latest.description}</span>
          <span className="text-slate-500 text-[10px] font-medium hidden md:inline">({latest.source_ip} • {latest.region})</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0 ml-2">
        <span className="text-[10px] font-bold text-cyber-green bg-cyber-green/15 border border-cyber-green/30 px-2 py-0.5 rounded-md hidden lg:inline">
          Score {latest.risk_score}/100
        </span>

        <button
          onClick={() => setIsLive(!isLive)}
          className="p-1 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-600 hover:text-slate-900 font-bold text-[10px] flex items-center space-x-1"
        >
          {isLive ? <Pause className="w-3 h-3 text-cyber-amber" /> : <Play className="w-3 h-3 text-cyber-green" />}
          <span>{isLive ? 'Pause' : 'Live'}</span>
        </button>
      </div>
    </div>
  );
}
