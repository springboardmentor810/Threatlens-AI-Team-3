'use client';

import React, { useState } from 'react';
import { Binary, Search, Copy, Check, Hash, FileCode } from 'lucide-react';

interface HexRow {
  offset: string;
  hex: string;
  ascii: string;
}

interface HexInspectorProps {
  hexData: {
    filename: string;
    file_size_bytes: number;
    md5: string;
    hex_dump: HexRow[];
  };
}

export default function HexDisassemblerInspector({ hexData }: HexInspectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!hexData || !hexData.hex_dump) return null;

  const filteredRows = hexData.hex_dump.filter(
    (row) =>
      row.offset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.ascii.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHex = () => {
    const fullText = hexData.hex_dump.map((r) => `${r.offset}  ${r.hex}  |${r.ascii}|`).join('\n');
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border space-y-4 shadow-sm font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cyber-border">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyber-accent" /> Interactive Hex Dump & Disassembly Inspector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Raw Byte Inspector for {hexData.filename} ({(hexData.file_size_bytes / 1024).toFixed(1)} KB)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Hex / ASCII..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border text-slate-800 focus:outline-none focus:border-cyber-accent text-xs font-mono font-semibold"
            />
          </div>

          <button
            onClick={handleCopyHex}
            className="px-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-slate-700 font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Dump' : 'Copy Raw Hex'}</span>
          </button>
        </div>
      </div>

      {/* Hex Dump Table */}
      <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border overflow-x-auto max-h-96 overflow-y-auto shadow-inner">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-cyber-border pb-2 text-[10px] uppercase font-bold">
              <th className="pb-2 w-28">Offset</th>
              <th className="pb-2">Hexadecimal Bytes (16 Bytes / Row)</th>
              <th className="pb-2 text-right w-36">ASCII Representation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/40 font-bold">
            {filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-cyber-card/80 transition-colors">
                <td className="py-2 text-cyber-accent">{row.offset}</td>
                <td className="py-2 text-slate-800 tracking-wider">
                  {row.hex.split(' ').map((b, bIdx) => (
                    <span
                      key={bIdx}
                      className={b === '4D' || b === '5A' || b === '57' || b === '61' ? 'text-cyber-red font-black' : ''}
                    >
                      {b}{' '}
                    </span>
                  ))}
                </td>
                <td className="py-2 text-right text-purple-700 font-mono">|{row.ascii}|</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
