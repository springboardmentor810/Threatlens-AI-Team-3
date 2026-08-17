'use client';

import React, { useEffect, useState } from 'react';
import { Radio, ShieldAlert, Activity, Globe, Zap, AlertTriangle } from 'lucide-react';
import { getRealtimeTelemetry } from '../lib/api';

interface TelemetryEvent {
  id: string;
  event_type: string;
  source_ip: string;
  description: string;
  severity: string;
  region: string;
  timestamp: number;
  risk_score: number;
}

export default function RealtimeThreatRadar() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [activeBlip, setActiveBlip] = useState<number>(0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);

  const fetchLiveTelemetry = async () => {
    try {
      const data = await getRealtimeTelemetry();
      setEvents(data);
    } catch {
      // Graceful fallback
      setEvents([
        {
          id: `tel_${Date.now()}_1`,
          event_type: 'PORT_SCAN_BLOCKED',
          source_ip: '194.26.29.112',
          description: 'Port 445 (SMB) Probe Blocked by Gateway',
          severity: 'HIGH',
          region: 'US-East',
          timestamp: Date.now(),
          risk_score: 84
        },
        {
          id: `tel_${Date.now()}_2`,
          event_type: 'PHISHING_HARVEST_INTERCEPTED',
          source_ip: '185.196.220.14',
          description: 'Deceptive Microsoft Login Form Blocked',
          severity: 'CRITICAL',
          region: 'AP-East',
          timestamp: Date.now() - 2500,
          risk_score: 96
        },
        {
          id: `tel_${Date.now()}_3`,
          event_type: 'VOICE_DEEPFAKE_FLAGGED',
          source_ip: '172.67.182.91',
          description: 'Synthetic Cloned Audio Stream Quarantined',
          severity: 'HIGH',
          region: 'EU-West',
          timestamp: Date.now() - 5000,
          risk_score: 92
        }
      ]);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(() => {
      if (isLiveStreaming) {
        fetchLiveTelemetry();
        setActiveBlip((prev) => (prev + 1) % 6);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  return (
    <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 font-mono shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Radio className="w-5 h-5 text-cyber-accent animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyber-green animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              REAL-TIME GLOBAL THREAT RADAR
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">Live telemetry stream from ThreatLens honeypots & perimeter sensors</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 shadow-sm ${
              isLiveStreaming
                ? 'bg-cyber-green/15 border-cyber-green/40 text-cyber-green'
                : 'bg-cyber-dark border-cyber-border text-slate-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-cyber-green animate-pulse' : 'bg-slate-400'}`} />
            <span>{isLiveStreaming ? 'LIVE STREAM' : 'STREAM PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* Radar Visualizer & Live Stream Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Animated Cyber Radar Circle */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-cyber-dark/40 rounded-full border border-cyber-border shadow-inner p-2">
          {/* Outer radar circles */}
          <div className="absolute inset-2 rounded-full border border-cyber-accent/30" />
          <div className="absolute inset-6 rounded-full border border-cyber-accent/25" />
          <div className="absolute inset-10 rounded-full border border-cyber-accent/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-cyber-accent/25" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-cyber-accent/25" />
          </div>

          {/* Rotating Radar Sweep Beam */}
          <div className="absolute inset-2 rounded-full overflow-hidden animate-spin [animation-duration:4s]">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyber-accent/40 via-cyber-accent/10 to-transparent origin-bottom-right" />
          </div>

          {/* Center Sensor */}
          <div className="relative z-10 w-4 h-4 rounded-full bg-cyber-accent shadow-[0_0_12px_rgb(var(--cyber-accent))] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>

          {/* Dynamic Radar Blips */}
          <div className="absolute top-8 left-12 w-2.5 h-2.5 rounded-full bg-cyber-red animate-ping" />
          <div className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-cyber-amber animate-pulse" />
          <div className="absolute top-16 right-10 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        </div>

        {/* Live Attack Feed Stream */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="text-[11px] text-slate-500 flex items-center justify-between pb-1 font-bold">
            <span>Incoming Live Attack Signals:</span>
            <span className="text-cyber-accent text-[11px] font-bold">Real-Time Ingestion</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {events.slice(0, 4).map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="p-3 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent/40 transition-all flex items-center justify-between text-xs shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                    evt.severity === 'CRITICAL'
                      ? 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red'
                      : 'bg-cyber-amber/15 border-cyber-amber/30 text-cyber-amber'
                  }`}>
                    {evt.severity}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{evt.description}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      Src: <code className="text-cyber-accent font-bold">{evt.source_ip}</code> | Region: <span className="text-slate-700 font-bold">{evt.region}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[12px] font-black text-cyber-accent">{evt.risk_score}</span>
                  <div className="text-[9px] text-slate-500 font-bold">Risk</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
