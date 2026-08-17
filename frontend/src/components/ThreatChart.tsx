'use client';

import React from 'react';

interface ThreatCategory {
  name: string;
  count: number;
  color: string;
}

interface ThreatChartProps {
  categories?: ThreatCategory[];
}

export default function ThreatChart({ categories }: ThreatChartProps) {
  const defaultCategories: ThreatCategory[] = [
    { name: 'Ransomware', count: 38, color: 'bg-cyber-red' },
    { name: 'Trojan.Downloader', count: 27, color: 'bg-cyber-amber' },
    { name: 'InfoStealer / Spyware', count: 19, color: 'bg-cyber-purple' },
    { name: 'Adware / PUA', count: 12, color: 'bg-cyber-accent' },
    { name: 'Clean / Benign', count: 4, color: 'bg-cyber-green' },
  ];

  const data = categories || defaultCategories;
  const total = data.reduce((acc, cur) => acc + cur.count, 0) || 1;

  return (
    <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold">
          Malware Family Distribution
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-bold">TOTAL: {total} SAMPLES</span>
      </div>

      {/* Stacked Progress Bar */}
      <div className="h-3.5 w-full bg-cyber-dark rounded-full overflow-hidden flex p-0.5 border border-cyber-border">
        {data.map((cat, idx) => {
          const pct = ((cat.count / total) * 100).toFixed(1);
          return (
            <div
              key={idx}
              style={{ width: `${pct}%` }}
              title={`${cat.name}: ${cat.count} (${pct}%)`}
              className={`h-full ${cat.color} first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90 shadow-sm`}
            />
          );
        })}
      </div>

      {/* Breakdown Legend */}
      <div className="space-y-2.5 pt-1">
        {data.map((cat, idx) => {
          const pct = ((cat.count / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shadow-sm`} />
                <span className="text-slate-700 font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-slate-900 font-bold">{cat.count}</span>
                <span className="text-slate-500 text-[11px] w-12 text-right font-semibold">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
