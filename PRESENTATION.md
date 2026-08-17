# 🛡️ ThreatLens AI: Enterprise Multi-Modal Threat Platform & AI SOC Copilot
## Full Technical & Executive Presentation Deck

---

## 🚀 Slide 1: Executive Overview & Title

### **ThreatLens AI**
#### *Enterprise Multi-Modal Threat Classification & Autonomous AI SOC Platform*

- **Team / Organization**: Team-3 Security Operations Engineering  
- **Version**: 2.0.0 (Real-Time Dynamic Release)  
- **Core Technologies**: Python 3.10+, FastAPI, Next.js 14 (App Router), Random Forest ML, Custom YARA Engine, Web Speech API

---

### 🎯 Mission Statement
Transform modern Security Operations Centers (SOC) by extending static threat analysis beyond legacy executables to **Audio Voice Deepfakes**, **Video Container Polyglots**, **Live Website Phishing Portals**, and **Weaponized Documents**, integrated with an **Autonomous AI SOC Copilot** capable of real-time triaging, code decompilation, and 1-click remediation.

---

## ⚠️ Slide 2: Modern Threat Landscape & The Problem

### Why Legacy Malware Scanners Fail in 2026:

1. **Multi-Modal Attack Vectors**:
   - Threat actors no longer rely solely on `.exe` files. Modern attacks leverage **AI-cloned executive voice notes (Vishing)**, **Polyglot video containers concealing backdoors**, and **obfuscated DOM phishing sites**.
2. **Alert Fatigue & SOC Burnout**:
   - SOC teams are overwhelmed by hundreds of unprioritized alerts daily without actionable containment scripts.
3. **Execution Hazards in Sandboxes**:
   - Dynamic sandbox detonation is slow (minutes per file) and vulnerable to sandbox-evasion / sleep tricks.

| Attack Vector | Legacy Detection Capability | ThreatLens AI Multi-Modal Engine |
| :--- | :--- | :--- |
| **Windows PE Executables** | ✅ Signature & Hash matching | ✅ PE Header parsing, Section Entropy & Random Forest ML |
| **AI Voice Deepfakes (Vishing)** | ❌ Completely Ignored | ✅ Formant stability math, Zero-Crossing Rate & LSB Stego |
| **Video Polyglot Droppers** | ❌ Treated as benign media | ✅ MP4 Atom box tree dissection & appended archive detection |
| **Live Phishing Portals** | ⚠️ Static URL blocklists | ✅ Live DOM crawler, credential capture detection & Levenshtein brand spoofing |
| **Weaponized PDFs / Scripts** | ⚠️ Generic AV alerts | ✅ Action stream parser (`/JS`, `/OpenAction`) & AMSI bypass detection |

---

## 🏗️ Slide 3: Full-Stack System Architecture

```
                                  +------------------------------------+
                                  |     Next.js 14 SOC Web Interface   |
                                  |  (Real-Time Radar & Cyberpunk UI)  |
                                  +-----------------+------------------+
                                                    |
                                                    v  HTTP / REST API (Fast 2s Timeout)
                                  +-----------------+------------------+
                                  |     FastAPI / Standalone Server    |
                                  |  (API Gateway & Security Controller)|
                                  +----+------------+------------+-----+
                                       |            |            |
             +-------------------------+            |            +-------------------------+
             |                                      |                                      |
             v                                      v                                      v
+------------------------+             +------------------------+             +------------------------+
|  Multi-Modal Analyzers |             |   ThreatLens AI Engine |             | Real-Time Stream Engine|
| Audio, Video, Web, Doc |             | Decompiler, Remediation|             | Live Radar Telemetry,  |
| Sliding Window Entropy |             | YARA/Sigma, Voice Debrief|            | Continuous Watchlist   |
+------------------------+             +------------------------+             +------------------------+
```

---

## 🔬 Slide 4: Multi-Modal Threat Ingestion Engines

ThreatLens AI provides tailored static & heuristic engines for 5 distinct asset classes:

### 1. 🎙️ Audio Threat & Voice Deepfake Scanner (`.wav`, `.mp3`, `.ogg`, `.flac`)
- **LSB Bit-Plane Steganography**: Extracts low-order bits across 32KB windows to decode hidden shellcode or commands.
- **AI Cloned Speech Detection**: Measures acoustic phase discontinuities, Zero-Crossing Rate (ZCR) regularity, and formant stability (>98% synthetic regularity matching ElevenLabs profiles).

### 2. 🎬 Video Container & Polyglot Backdoor Scanner (`.mp4`, `.mkv`, `.avi`)
- **MP4 Atom Box Tree Dissection**: Validates byte-offset boundaries of `ftyp`, `moov`, and `mdat` boxes.
- **Polyglot Dropper Detection**: Identifies trailing appended ZIP/RAR archives or embedded PE executables (`MZ` markers) hidden in video padding.
- **Subtitle Script Injection**: Catches WebVTT/SRT embedded command exploits (`powershell.exe`, `/bin/sh`).

### 3. 🌐 Live Network Web & DOM Phishing Crawler
- **Genuine Live Fetching**: Safely retrieves live HTML, evaluates SSL certificate chains, and tracks redirects.
- **DOM Harvester Parser**: Identifies `<form action="...">` password capture targets and obfuscated JavaScript (`eval(unescape(...))`).
- **Levenshtein Brand Typosquatting**: Calculates exact token edit distances against Top 50 global brands (Microsoft, Google, PayPal, Apple, Binance, Chase).

### 4. 📄 Weaponized Documents & Scripts (`.pdf`, `.ps1`, `.bat`)
- Inspects PDF object streams for `/JS`, `/Launch`, `/OpenAction`, and PowerShell scripts for AMSI bypass patterns (`AmsiUtils`, `VirtualAlloc`).

---

## 📈 Slide 5: Shannon Entropy Sliding Window Engine

### Mathematical Foundation:
$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

ThreatLens AI computes both **overall file entropy** and a **real-time sliding window entropy curve** (dividing the payload into 1024-byte local offsets).

```
Entropy Curve Visualization
8.0 |                /-------------\  <- Packed/Encrypted Zone (Danger > 7.2)
7.2 | - - - - - - - / - - - - - - - \ - - - - - - - - - - - - - - - - - - - 
6.0 |      /\      /                 \
4.0 | ____/  \____/                   \_______
0.0 +------------------------------------------
    0% (Header)      50% (Body)       100% (EOF)
```

- **Clean Binary Entropy**: Dispersion between `3.5 – 5.8` (Standard compiled assembly).
- **Malicious / Packed Entropy**: Peaks above **`7.2 – 7.99`** (Cryptographic encryption keys, compressed shellcode, LockBit payloads).
- **Interactive SVG Chart**: Displayed in real time on `/upload` and `/samples/[id]`.

---

## 🤖 Slide 6: ThreatLens AI SOC Copilot Suite

The **ThreatLens AI SOC Copilot** acts as an autonomous tier-2/tier-3 cyber analyst:

```
+-----------------------------------------------------------------------------------+
|                            THREATLENS AI SOC COPILOT                              |
+-----------------------------------------------------------------------------------+
| 💬 Multi-Turn Cyber Chat       | Context-aware reasoning mapped to MITRE ATT&CK   |
| 🔍 AI Decompiler & Explainer   | Translates assembly & bytecode to C-pseudocode   |
| ⚡ 1-Click Remediation Playbook| Auto-generates PowerShell, Bash & Snort rules    |
| 📝 YARA & Sigma Synthesizer    | Auto-compiles detection rules for active threat   |
| 🔊 AI Voice Incident Debrief   | Synthesizes spoken audio debrief for SOC leads   |
| 🎯 SIEM Threat Hunting Queries | Splunk SPL, Elastic KQL & Microsoft Sentinel KQL |
+-----------------------------------------------------------------------------------+
```

### Auto-Generated PowerShell Containment Example:
```powershell
# ThreatLens Automated Emergency Containment Playbook
Stop-Process -Name "LockBit_v3_decryptor_payload" -Force
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "ThreatLens_Drop"
New-NetFirewallRule -DisplayName "ThreatLens-Block-C2" -Direction Outbound -RemoteAddress "185.220.101.5" -Action Block
```

---

## 📡 Slide 7: Real-Time Radar & Automated Threat Stream

### Real-Time Live Radar (`/dashboard`)
- **Animated Radar Sweep**: Rotating 360-degree beam that visualizes incoming simulated network probes, honeypot hits, and perimeter alarms in real time.
- **Dynamic Blips & Live Ticker**: Streams live events (Port Scans, M365 Phishing Attempts, Voice Deepfake Vishing, Ransomware Drops) with source IPs and risk ratings.

### Continuous Threat Intelligence & Watchlist (`/intel`)
- **Live Feed Integrations**: AlienVault OTX, URLhaus, AbuseIPDB, and CISA Known Exploited Vulnerabilities (KEV).
- **Automated Background IOC Watcher**: Allows SOC analysts to register custom IPs, domains, hashes, and URLs with automatic severity matching and alert dispatch.

---

## 🔄 Slide 8: Before vs. After (What Was Updated)

| Dimension | Initial State (Before) | Upgraded State (Now) |
| :--- | :--- | :--- |
| **Asset Coverage** | Executables (`.exe`) only | Multi-Modal: Binaries, Audio, Video, Live URLs, Documents |
| **Analysis Dynamism** | Fixed mock responses for demo | **100% Dynamic byte-level analysis** on real uploaded content |
| **Website Scanning** | Hardcoded simulation | **Live HTTP/HTTPS web crawler** with SSL & DOM parser |
| **Response Latency** | Hanging 30s network timeouts | **Fast 2s AbortController timeout (<20ms response)** |
| **Entropy Visualization** | Single static number | **Interactive sliding-window SVG curve chart** |
| **AI Intelligence** | Static text summary | **Interactive SOC Copilot** (Chat, Decompiler, Remediation, Voice) |
| **SOC Alerting** | Static table | **1-Click AI Root-Cause Triage & Spoken Audio Alerts** |
| **Reporting** | Basic JSON dump | **Executive CISO Multi-Modal PDF/JSON Report Generator** |

---

## 🧪 Slide 9: 1-Click Demo Library & Validation

### 1-Click Interactive Demo Preset Library:
Built into the `/upload` portal for immediate evaluation:
1. 🎙️ **Voice Deepfake & Audio Stego**: `ceo_urgent_wire_transfer_voice.wav` (Risk: 94/100)
2. 🎬 **Video Polyglot Backdoor**: `c2_drone_surveillance.mp4` (Risk: 88/100)
3. 🌐 **Live Phishing Impersonator**: `https://secure-login.micros0ft-verify365.com/auth` (Risk: 100/100)
4. 📄 **Weaponized PDF Exploit**: `q3_financial_executive_report.pdf` (Risk: 82/100)
5. 💀 **LockBit Ransomware Executable**: `LockBit_v3_decryptor_payload.exe` (Risk: 95/100)
6. 🛡️ **Clean System Executable**: `windows_kernel_diagnostics.exe` (Risk: 8/100)

### Automated Test Suite Results:
- ✅ **PE Static Analysis & Random Forest Classifier**: `PASSED` (Risk: 72/100)
- ✅ **Audio Threat & AI Voice Deepfake / Stego**: `PASSED` (Risk: 90/100)
- ✅ **Video Polyglot & Deepfake Scanner**: `PASSED` (Risk: 80/100)
- ✅ **Website & Live URL Phishing Scanner**: `PASSED` (Risk: 100/100)
- ✅ **ThreatLens AI SOC Copilot & Reasoning Engine**: `PASSED` (All 5 Toolkits)
- ✅ **Continuous Threat Stream & Automated Watchlist**: `PASSED` (5 Live Feeds)

---

## 🎯 Slide 10: Conclusion & Operational Readiness

### Key Takeaways:
- **Zero-Execution Safety**: Safe, static inspection of untrusted files with zero execution risk.
- **Enterprise Multi-Modal Defense**: Comprehensive defense against binary malware, cloned executive voices, polyglot video droppers, and credential harvesting portals.
- **Autonomous SOC Acceleration**: Reduces incident response time from hours to seconds with 1-click remediation scripts and AI decompiler explanations.

---

### 🚀 Live Interactive Portal:
- **Web Interface**: `http://localhost:3000`
- **Backend API Gateway**: `http://localhost:8000`
