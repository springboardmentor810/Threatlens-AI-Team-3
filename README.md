# ThreatLens AI - Enterprise Threat Classification & Malware Static Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14.2%2B-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4%2B-38BDF8.svg)](https://tailwindcss.com/)

**ThreatLens AI** is an enterprise-grade, multi-modal AI threat classification and static security analysis platform designed specifically for Security Operations Centers (SOC), security analysts, incident response teams, and threat intelligence researchers.

It performs **strictly static analysis and autonomous AI reasoning** (zero execution of uploaded code) across:
1. **Windows PE Binaries & Executables** (`.exe`, `.dll`, `.sys`, `.bin`)
2. **Audio Threats & AI Voice Deepfakes** (`.wav`, `.mp3`, `.ogg`, `.flac`)
3. **Video Containers & Polyglot Droppers** (`.mp4`, `.mkv`, `.avi`, `.webm`)
4. **Live Websites & URL Phishing Portals** (DOM JavaScript inspection, brand spoof detection, SSL validation)
5. **Weaponized Documents & Scripts** (`.pdf`, `.ps1`, `.sh`, `.py`, `.bat`)

It extracts cryptographic hashes, calculates Shannon entropy, evaluates YARA rules, detects LSB audio steganography, maps attack indicators to the **MITRE ATT&CK Matrix**, and features an interactive **ThreatLens AI SOC Copilot** with 1-click remediation scripts (PowerShell, Bash, Snort, SIEM).

---

## Table of Contents

- [Defensive Security Notice](#defensive-security-notice)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Key Features & Capabilities](#key-features--capabilities)
  - [1. Multi-Modal Threat Analysis & Deepfake Engines](#1-multi-modal-threat-analysis--deepfake-engines)
  - [2. ThreatLens AI Intelligence Suite & SOC Copilot](#2-threatlens-ai-intelligence-suite--soc-copilot)
  - [3. Automated Continuous Threat Stream & IOC Watchlist](#3-automated-continuous-threat-stream--ioc-watchlist)
  - [4. 1-Click Interactive Demo Library](#4-1-click-interactive-demo-library)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Directory & Codebase Map](#directory--codebase-map)
- [Core Engines & Algorithms](#core-engines--algorithms)
- [Getting Started & Running the Platform](#getting-started--running-the-platform)
- [API Endpoints Reference](#api-endpoints-reference)
- [Verification & Automated Testing](#verification--automated-testing)
- [License](#license)

---

## Defensive Security Notice

> [!IMPORTANT]
> **Safety Assurance**: ThreatLens AI operates **strictly statically**. No uploaded samples or binaries are executed at any point. All binary parsing, entropy math, header inspection, YARA signature evaluation, and feature extraction occur safely in isolated memory space.

---

## System Architecture

```
                                  +------------------------------------+
                                  |     Next.js 14 Web Frontend        |
                                  |  (Cyberpunk Dark SOC Interface)   |
                                  +-----------------+------------------+
                                                    |
                                                    v  HTTP / REST API (/api/v1)
                                  +-----------------+------------------+
                                  |     FastAPI Python Backend         |
                                  |  (API Gateway & Security Controller)|
                                  +----+------------+------------+-----+
                                       |            |            |
             +-------------------------+            |            +-------------------------+
             |                                      |                                      |
             v                                      v                                      v
+------------------------+             +------------------------+             +------------------------+
|   PostgreSQL Database  |             | MongoDB Document Store |             |  Redis Cache / Storage |
| Users, RBAC, Metadata, |             | Unstructured Raw Static|             | Session Caching & Job  |
| Alerts, Audit Logs     |             | Reports & Feeds        |             | State                  |
+------------------------+             +------------------------+             +------------------------+
```

---

## Tech Stack

| Domain | Technology / Framework | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14** (React 18, App Router) | Cyberpunk SOC Dashboard with Audio visualizers & AI Chat |
| **Frontend Styling** | **Tailwind CSS**, Lucide Icons | Responsive glassmorphism UI with dark theme |
| **Backend Framework** | **Python 3.10+**, **FastAPI**, Uvicorn | High-performance async REST API server |
| **Multi-Modal Engine** | Custom Parsers, LSB Stego Math, MP4 Atom Tree | Audio deepfake, video polyglots, live website scanner |
| **AI Intelligence Suite**| Neural Copilot, MITRE ATT&CK Mapper, YARA/Sigma Gen | Automated reverse engineering & remediation |
| **Databases** | **PostgreSQL**, **MongoDB**, **Redis** | Multi-model data management architecture |
| **Static Engine** | `pefile`, `yara-python` | PE header parser & YARA rule evaluation |
| **Machine Learning** | `scikit-learn` (Random Forest), Pandas, NumPy | Multi-class threat vectorizer & risk scoring |
| **Containerization** | Docker & Docker Compose | Containerized multi-service orchestration |

---

## Key Features & Capabilities

### 1. Multi-Modal Threat Analysis & Deepfake Engines
- 🎙️ **Audio Threat & AI Voice Deepfake / Steganography Scanner**: Detects LSB audio steganography, embedded shellcode strings in ID3 metadata, and computes synthetic voice formant anomalies (ElevenLabs acoustic signatures).
- 🎬 **Video Container & Polyglot Dropper Scanner**: Inspects MP4 box/atom trees (`ftyp`, `moov`, `mdat`) for appended executable archives and subtitle script injection CVEs.
- 🌐 **Live Website & URL Cyber Threat Scanner**: Live DOM inspection detecting credential harvesting forms, obfuscated JavaScript (`eval(unescape(...))`), and deceptive brand impersonation.
- 📄 **Weaponized Documents & Scripts Parser**: Scans PDFs for `/JS`, `/Launch`, `/OpenAction` exploit streams and PowerShell scripts for AMSI bypass primitives.

### 2. ThreatLens AI Intelligence Suite & SOC Copilot
- 🤖 **Interactive AI SOC Copilot**: Multi-turn conversational AI threat analyst with MITRE ATT&CK mappings and prompt chips.
- 🔍 **AI Automated Reverse Engineering Explainer**: Decompiles bytecode and assembly into annotated C-pseudocode.
- ⚡ **1-Click Remediation Suite**: Generates Windows PowerShell scripts, Linux Bash scripts, Snort/Suricata rules, and SIEM hunting queries (Splunk, Elastic, Sentinel).
- 📝 **AI YARA & Sigma Rule Synthesizer**: Auto-generates compiled detection signatures.
- 🔊 **AI Voice Incident Briefing**: Synthesizes spoken audio debriefs using the Web Speech API.

### 3. Automated Continuous Threat Stream & IOC Watchlist
- 📡 **Live Threat Stream**: Ingests live threat feeds from AlienVault OTX, URLhaus, AbuseIPDB, and CISA KEV.
- 👁️ **Automated Background Watchlist**: Monitors IPs, domains, hashes, and URLs with automatic severity matching.

### 4. 1-Click Interactive Demo Library
- Preloaded presets for immediate testing: *Voice Deepfake & Audio Stego Sample*, *Video Polyglot Backdoor*, *Live Phishing Impersonator*, *Weaponized PDF Exploit*, *LockBit Ransomware Executable*, and *Benign System Binary*.


---

## Role-Based Access Control (RBAC)

ThreatLens AI provides 4 pre-configured demo user accounts for immediate testing:

| Role | Demo Credentials | Privileges & Access |
| :--- | :--- | :--- |
| **Administrator** | `admin@threatlens.ai` / `AdminPass123!` | Full platform administration, system settings, user management, audit logs, SIEM testing. |
| **Security Analyst** | `analyst@threatlens.ai` / `AnalystPass123!` | Sample upload, static analysis execution, detailed inspection of classification reports. |
| **SOC Team Member** | `soc@threatlens.ai` / `SocPass123!` | Monitoring active alerts, updating alert status (`NEW`, `ACKNOWLEDGED`, `RESOLVED`, `FALSE_POSITIVE`). |
| **Researcher** | `researcher@threatlens.ai` / `ResearchPass123!` | Research dataset exploration, threat family breakdown, report export in PDF/JSON formats. |

---

## Directory & Codebase Map

```
Team-3/
├── README.md                           # Main Project Documentation
├── docker-compose.yml                  # Full Stack Docker Compose configuration
├── .env.example                        # Environment variables template
├── backend/
│   ├── app/
│   │   ├── api/v1/routers/             # FastAPI REST Endpoints (auth, files, analysis, alerts, etc.)
│   │   ├── core/                       # App configuration, security, JWT auth
│   │   ├── db/                         # SQLAlchemy & MongoDB connection setup
│   │   ├── models/                     # Database models (User, Role, File, Scan, Alert, Settings)
│   │   ├── services/
│   │   │   ├── static_analysis.py      # Hashing, PE parser, string/IOC extractor, YARA runner
│   │   │   ├── ml_engine.py            # Feature vectorizer, Random Forest classifier & risk score
│   │   │   ├── alerting.py             # Incident responder & SIEM dispatch
│   │   │   └── virustotal.py           # VirusTotal v3 API client & simulation
│   │   └── main.py                     # Main FastAPI server entry point
│   ├── yara_rules/                     # Custom YARA signature files (.yar)
│   ├── seed.py                         # DB initialization, role creation & ML training script
│   ├── standalone_server.py            # Zero-dependency Python server for instant execution
│   └── test_standalone_engine.py       # Standalone engine test suite
└── frontend/
    ├── src/
    │   ├── app/                        # Next.js App Router pages (login, dashboard, upload, samples, alerts)
    │   └── components/                 # Reusable UI components (YaraBadges, RiskScoreGauge, Header, Sidebar)
    └── package.json
```

---

## Core Engines & Algorithms

### 1. Static Analysis Engine
The static engine (`backend/app/services/static_analysis.py`) performs:
1. **Cryptographic Hashing**: Computes MD5 and SHA-256 hashes of raw bytes.
2. **Shannon Entropy Calculation**: Evaluates randomness on a 0.0 to 8.0 scale to identify packing or encryption.
   $$\text{Entropy} = -\sum_{i=0}^{255} p_i \log_2(p_i)$$
3. **PE Header Parsing**: Parses executable sections (`.text`, `.rdata`, `.data`), section entropy, and imported functions (detecting API calls such as `VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`).
4. **IOC & Pattern Extraction**: Uses regular expressions to extract IPv4 addresses, URLs, and suspicious ASCII strings.
5. **YARA Pattern Matching**: Evaluates binary against compiled YARA rules in `backend/yara_rules/`.

### 2. Machine Learning Classification & Risk Engine
The ML engine (`backend/app/services/ml_engine.py`) extracts a feature vector:
$$\mathbf{X} = [\text{FileSize}, \text{Entropy}, \text{SectionCount}, \text{SuspiciousAPICount}, \text{YaraHitCount}, \text{UrlCount}, \text{IpCount}]$$

- Uses a `RandomForestClassifier` trained on malware and benign feature vectors.
- Calculates an overall **Risk Score (0–100)**:
  $$\text{RiskScore} = \min\left(100, (\text{YaraHits} \times 25) + (\text{SuspiciousAPIs} \times 8) + (\text{Entropy} > 7.0 ? 15 : 0) + (\text{MLConfidence} \times 30)\right)$$

### 3. Alerting & Incident Response Engine
When a scanned sample's risk score meets or exceeds `RISK_ALERT_THRESHOLD` (default: `65`), an alert record is created with appropriate severity:
- `CRITICAL`: Risk Score $\ge 85$
- `HIGH`: Risk Score $70 - 84$
- `MEDIUM`: Risk Score $50 - 69$
- `LOW`: Risk Score $< 50$

---

## Getting Started & Running the Platform

### Option A: Standalone Mode (Zero External Databases Required)

If you wish to run the project locally without setting up PostgreSQL, MongoDB, or Redis, use the **Standalone Server**:

1. **Start the Standalone Backend Server** (Port 8000):
   ```bash
   cd backend
   .venv\Scripts\python.exe standalone_server.py
   ```
   *(Server starts on `http://localhost:8000`)*

2. **Start the Frontend Web Dashboard** (Port 3000):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Dashboard opens on `http://localhost:3000`)*

---

### Option B: Local Development Mode (With Full FastAPI Backend)

1. **Backend Environment Setup**:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Initialize Database & Train ML Model**:
   ```bash
   python seed.py
   ```

3. **Start FastAPI Backend**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. **Start Frontend Dashboard**:
   ```bash
   cd frontend
   npm run dev
   ```

---

### Option C: Docker Compose Full Production Stack

To build and run all services (FastAPI, Next.js, PostgreSQL, MongoDB, Redis) inside Docker containers:

```bash
docker-compose up --build
```

- **Frontend SOC Dashboard**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Interactive API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Endpoints Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` or `/api/v1/health` | Returns engine and platform health status |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & get JWT token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch currently logged-in user profile & role |
| **Files** | `POST` | `/api/v1/files/upload` | Upload executable sample for analysis |
| **Files** | `GET` | `/api/v1/files/` | List all uploaded file samples |
| **Analysis** | `POST` | `/api/v1/analysis/scan/{file_id}` | Trigger static analysis scan on sample |
| **Analysis** | `GET` | `/api/v1/analysis/report/{file_id}`| Retrieve raw JSON static analysis report |
| **Classification**| `GET` | `/api/v1/classification/{file_id}` | Get ML family prediction & risk score |
| **Alerts** | `GET` | `/api/v1/alerts/` | List all generated SOC incident alerts |
| **Dashboard** | `GET` | `/api/v1/dashboard/overview` | Overview metrics for SOC dashboard |

---

## Verification & Automated Testing

Run the defensive engine test suite to verify static parsing, hashing, YARA pattern matching, and ML classification:

```bash
cd backend
.venv\Scripts\python.exe test_standalone_engine.py
```

Expected output:
```text
=========================================================================
      THREATLENS AI - DEFENSIVE STATIC ANALYSIS & ML TEST SUITE
=========================================================================

[+] 1. Running PE Static Analysis Pipeline...
 -> MD5 Hash       : 0a3323dfbe2c439f3ef9d05ff43c75ee
 -> SHA-256 Hash   : 3cb9533cf4827f84b21e2a6186f71fd38c0080f8f7443899e16ba7b4e69bc28d
 -> Shannon Entropy: 5.0398
 -> YARA Matches   : ['Ransomware_LockBit_Note', 'Ransomware_WannaCry_Pattern', 'Suspicious_Process_Injection']

[+] 2. Running ML Classifier & Risk Calculator...
 -> Predicted Class: Ransomware
 -> Threat Family  : REvil
 -> Confidence     : 94.0%
 -> Risk Rating    : 72 / 100

[OK] ALL DEFENSIVE ANALYSIS PIPELINE CHECKS PASSED PERFECTLY!
```

---

## License

This project is open source and distributed under the [MIT License](LICENSE).
