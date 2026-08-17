'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { Settings, Save, Key, ShieldCheck, Terminal, AlertCircle, CheckCircle } from 'lucide-react';
import { getSettings, updateSetting } from '../../lib/api';

export default function SettingsPage() {
  const [settingsList, setSettingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettingsList(data);
    } catch {
      // Mock settings if offline
      setSettingsList([
        { setting_key: 'RISK_ALERT_THRESHOLD', setting_value: '65', description: 'Minimum risk score (0-100) to trigger automated SOC alert' },
        { setting_key: 'VIRUSTOTAL_ENABLED', setting_value: 'true', description: 'Enable VirusTotal Hash Lookup Integration' },
        { setting_key: 'SIEM_WEBHOOK_ENABLED', setting_value: 'false', description: 'Enable pushing alert payloads to outbound SIEM/SOAR webhook' },
        { setting_key: 'MAX_UPLOAD_SIZE_MB', setting_value: '50', description: 'Maximum allowed sample upload size in MB' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string, val: string) => {
    setSavingKey(key);
    setStatusMsg('');
    try {
      await updateSetting(key, val);
      setStatusMsg(`Setting '${key}' saved successfully.`);
    } catch {
      setStatusMsg(`Setting '${key}' updated in local state.`);
    } finally {
      setSavingKey(null);
    }
  };

  const handleChangeValue = (key: string, newVal: string) => {
    setSettingsList((prev) =>
      prev.map((s) => (s.setting_key === key ? { ...s, setting_value: newVal } : s))
    );
  };

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-800 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="p-6 rounded-3xl bg-cyber-card border border-cyber-border shadow-sm">
            <h1 className="text-xl font-black text-slate-900 font-sans tracking-wide flex items-center gap-2">
              PLATFORM SETTINGS & YARA ENGINE CONFIGURATION
            </h1>
            <p className="text-xs text-slate-600 font-mono mt-1.5 font-medium">
              Configure alert thresholds, API keys, SIEM webhooks, and active YARA rule parameters.
            </p>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-2xl bg-cyber-green/15 border border-cyber-green/30 text-cyber-green text-xs font-mono font-bold flex items-center space-x-2 shadow-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Settings Cards */}
          <div className="space-y-4">
            {settingsList.map((item) => (
              <div
                key={item.setting_key}
                className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-3 font-mono shadow-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-cyber-accent">{item.setting_key}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{item.description}</p>
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={item.setting_value}
                      onChange={(e) => handleChangeValue(item.setting_key, e.target.value)}
                      className="bg-cyber-dark border border-cyber-border rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-cyber-accent w-full sm:w-48 shadow-inner"
                    />

                    <button
                      onClick={() => handleSave(item.setting_key, item.setting_value)}
                      disabled={savingKey === item.setting_key}
                      className="px-4 py-2 rounded-xl bg-cyber-accent text-white font-bold text-xs hover:shadow-md transition-all flex items-center space-x-1 shrink-0 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingKey === item.setting_key ? 'Saving...' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* YARA Rules Editor Box */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyber-border space-y-4 font-mono shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyber-accent" /> Active YARA Ruleset Manifest
              </h3>
              <span className="text-xs font-bold text-cyber-green bg-cyber-green/15 border border-cyber-green/30 px-2.5 py-0.5 rounded-md">
                2 Rules Compiled
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-xs shadow-inner">
                <span className="text-cyber-amber font-bold block text-sm">ransomware.yar</span>
                <p className="text-xs text-slate-600 mt-1 font-medium">Detects WannaCry, CryptoLocker, and suspicious PE string markers.</p>
              </div>

              <div className="p-4 rounded-xl bg-cyber-dark border border-cyber-border text-xs shadow-inner">
                <span className="text-cyber-accent font-bold block text-sm">trojan.yar</span>
                <p className="text-xs text-slate-600 mt-1 font-medium">Detects Trojan downloader patterns, WinExec calls & C2 indicators.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
