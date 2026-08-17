'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import YaraBadges from '../../components/YaraBadges';
import Link from 'next/link';
import { FileCode2, Search, Filter, ArrowUpRight, ShieldAlert, RefreshCw } from 'lucide-react';
import { getSamplesList } from '../../lib/api';

export default function SamplesPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  const loadSamples = async () => {
    setLoading(true);
    try {
      const data = await getSamplesList();
      setSamples(data);
    } catch {
      // Mock repository dataset if database is newly initialized
      setSamples([
        {
          id: 1,
          filename: 'invoice_payload_2026.exe',
          md5_hash: 'e3b0c44298fc1c149afbf4c8996fb924',
          sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          file_size_bytes: 485200,
          uploaded_at: '2026-08-05T08:30:00Z',
          analysis_results: [
            {
              risk_score: 92,
              classification: 'Ransomware.WannaCry',
              yara_matches: ['WannaCry_Ransomware_Core', 'Suspicious_PE_Header'],
              ml_confidence: 0.94
            }
          ]
        },
        {
          id: 2,
          filename: 'update_agent_setup.exe',
          md5_hash: '7d8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c',
          sha256_hash: '8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
          file_size_bytes: 1240000,
          uploaded_at: '2026-08-05T07:15:00Z',
          analysis_results: [
            {
              risk_score: 74,
              classification: 'Trojan.Downloader',
              yara_matches: ['Generic_Trojan_Downloader'],
              ml_confidence: 0.82
            }
          ]
        },
        {
          id: 3,
          filename: 'system_calc_util.exe',
          md5_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          sha256_hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
          file_size_bytes: 98000,
          uploaded_at: '2026-08-05T06:00:00Z',
          analysis_results: [
            {
              risk_score: 12,
              classification: 'Clean / Benign System Executable',
              yara_matches: [],
              ml_confidence: 0.99
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  const filteredSamples = samples.filter((s) => {
    const nameMatch = s.filename.toLowerCase().includes(search.toLowerCase()) || s.md5_hash.toLowerCase().includes(search.toLowerCase());
    const score = s.analysis_results?.[0]?.risk_score || 0;
    if (filterRisk === 'high') return nameMatch && score >= 65;
    if (filterRisk === 'low') return nameMatch && score < 65;
    return nameMatch;
  });

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-cyber-card border border-cyber-border shadow-sm">
            <div>
              <h1 className="text-xl font-black text-slate-900 font-sans tracking-wide flex items-center gap-2">
                MALWARE REPOSITORY & SAMPLES CATALOG
              </h1>
              <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
                Centralized database of analyzed PE files, hashes, YARA rulesets, and risk scores.
              </p>
            </div>

            <button
              onClick={loadSamples}
              className="px-3.5 py-2 rounded-xl bg-cyber-dark border border-cyber-border text-slate-700 hover:text-cyber-accent hover:border-cyber-accent text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Catalog</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by filename or MD5 hash..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all font-semibold"
              />
            </div>

            {/* Risk Category Tabs */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-slate-500 flex items-center gap-1 font-bold">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              <button
                onClick={() => setFilterRisk('all')}
                className={`px-3 py-1 rounded-xl border transition-all font-bold ${
                  filterRisk === 'all'
                    ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent shadow-sm'
                    : 'bg-cyber-dark border-cyber-border text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({samples.length})
              </button>
              <button
                onClick={() => setFilterRisk('high')}
                className={`px-3 py-1 rounded-xl border transition-all font-bold ${
                  filterRisk === 'high'
                    ? 'bg-cyber-red/15 border-cyber-red text-cyber-red shadow-sm'
                    : 'bg-cyber-dark border-cyber-border text-slate-600 hover:text-slate-900'
                }`}
              >
                High / Critical (Score 65+)
              </button>
              <button
                onClick={() => setFilterRisk('low')}
                className={`px-3 py-1 rounded-xl border transition-all font-bold ${
                  filterRisk === 'low'
                    ? 'bg-cyber-green/15 border-cyber-green text-cyber-green shadow-sm'
                    : 'bg-cyber-dark border-cyber-border text-slate-600 hover:text-slate-900'
                }`}
              >
                Clean / Low Risk
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-cyber-border text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">File Metadata</th>
                    <th className="pb-3">Risk Score</th>
                    <th className="pb-3">Predicted Family</th>
                    <th className="pb-3">Matched YARA Signatures</th>
                    <th className="pb-3">Uploaded At</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {filteredSamples.map((s) => {
                    const analysis = s.analysis_results?.[0] || {};
                    const score = analysis.risk_score || 0;
                    const isHigh = score >= 65;

                    return (
                      <tr key={s.id} className="hover:bg-cyber-dark/60 transition-colors">
                        <td className="py-4 text-slate-400 font-bold">#{s.id}</td>
                        <td className="py-4">
                          <div className="font-bold text-slate-900 flex items-center space-x-2">
                            <FileCode2 className="w-4 h-4 text-cyber-accent shrink-0" />
                            <span>{s.filename}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 tracking-tighter truncate max-w-[240px] font-medium">
                            MD5: {s.md5_hash}
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              isHigh
                                ? 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red'
                                : 'bg-cyber-green/15 border-cyber-green/30 text-cyber-green'
                            }`}
                          >
                            {score} / 100
                          </span>
                        </td>
                        <td className="py-4 text-slate-800 font-bold">
                          {analysis.classification || 'Clean / Benign'}
                        </td>
                        <td className="py-4">
                          <YaraBadges rules={analysis.yara_matches || []} />
                        </td>
                        <td className="py-4 text-slate-500 text-[11px] font-medium">
                          {new Date(s.uploaded_at || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/samples/${s.id}`}
                            className="px-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent text-cyber-accent text-xs font-bold transition-all inline-flex items-center space-x-1 shadow-sm"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
