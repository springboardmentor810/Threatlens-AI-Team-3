'use client';

import React from 'react';
import { ShieldCheck, Flame, Tag } from 'lucide-react';

interface YaraBadgesProps {
  rules: string[];
}

export default function YaraBadges({ rules }: YaraBadgesProps) {
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono py-1 font-semibold">
        <ShieldCheck className="w-4 h-4 text-cyber-green" />
        <span>No YARA Signature Matches</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {rules.map((rule, idx) => {
        const ruleStr = typeof rule === 'string' 
          ? rule 
          : (rule && typeof rule === 'object' && 'rule' in rule ? String((rule as any).rule) 
          : (rule && typeof rule === 'object' && 'name' in rule ? String((rule as any).name) 
          : String(rule ?? '')));
        const lowerRule = ruleStr.toLowerCase();
        const isRansomware = lowerRule.includes('ransom') || lowerRule.includes('wannacry') || lowerRule.includes('lockbit');
        const isTrojan = lowerRule.includes('trojan') || lowerRule.includes('downloader');
        
        let colorStyle = 'bg-cyber-accent/15 border-cyber-accent/30 text-cyber-accent';
        if (isRansomware) colorStyle = 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red';
        else if (isTrojan) colorStyle = 'bg-cyber-amber/15 border-cyber-amber/30 text-cyber-amber';

        return (
          <span
            key={idx}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${colorStyle} shadow-sm`}
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>{ruleStr}</span>
          </span>
        );
      })}
    </div>
  );
}
