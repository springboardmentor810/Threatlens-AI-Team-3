import sys
import os
import json
import time
import hashlib
import re
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import socket

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.static_analysis import run_static_analysis
from app.services.ml_engine import ml_engine
from app.services.multimodal_analysis import (
    analyze_audio_threat,
    analyze_video_threat,
    analyze_website_threat,
    analyze_document_or_script,
    get_demo_samples_library,
    calculate_entropy,
    calculate_sliding_window_entropy
)
from app.services.ai_copilot import ai_copilot
from app.services.threat_intel_stream import threat_intel_stream

PORT = 8000

# In-memory storage for dynamically uploaded files and analysis records
UPLOADED_SAMPLES_STORE = {
    1: {
        "id": 1,
        "filename": "LockBit_v3_decryptor_payload.exe",
        "file_size_bytes": 524000,
        "md5_hash": "e3b0c44298fc1c149afbf4c8996fb924",
        "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "bytes": b"MZ\x90\x00 WanaCrypt0r Restore-My-Files.txt VirtualAllocEx CryptEncrypt http://185.220.101.5/c2",
        "uploaded_at": "2026-08-05T08:30:00Z"
    },
    2: {
        "id": 2,
        "filename": "ceo_urgent_wire_transfer_voice.wav",
        "file_size_bytes": 128450,
        "md5_hash": "8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
        "sha256_hash": "8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        "bytes": b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00 powershell.exe -enc CEO_VOICE_CLONE_PAYLOAD",
        "uploaded_at": "2026-08-05T07:15:00Z"
    }
}
SAMPLE_ID_COUNTER = 10

class ThreatLensRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def address_string(self):
        # Override to prevent slow synchronous reverse DNS lookups on Windows
        return self.client_address[0]

    def log_message(self, format, *args):
        # High speed logger without blocking
        sys.stdout.write(f"[{time.strftime('%H:%M:%S')}] {args[0]} {args[1]}\n")
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _read_body_raw(self) -> bytes:
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                return self.rfile.read(content_length)
        except Exception:
            pass
        return b""

    def _read_body_json(self):
        raw = self._read_body_raw()
        if raw:
            try:
                return json.loads(raw.decode('utf-8'))
            except Exception:
                pass
        return {}

    def _parse_multipart_file(self, raw_bytes: bytes) -> tuple:
        """Extracts filename and actual file content from multipart/form-data."""
        content_type = self.headers.get('Content-Type', '')
        if 'boundary=' in content_type:
            boundary = content_type.split('boundary=')[1].encode('ascii')
            parts = raw_bytes.split(b'--' + boundary)
            for part in parts:
                if b'Content-Disposition:' in part and b'filename="' in part:
                    # Extract filename
                    headers_part, file_data = part.split(b'\r\n\r\n', 1)
                    file_data = file_data.rstrip(b'\r\n--')
                    fn_match = re.search(rb'filename="([^"]+)"', headers_part)
                    filename = fn_match.group(1).decode('utf-8', errors='ignore') if fn_match else "uploaded_file.bin"
                    return filename, file_data
        return "uploaded_sample.bin", raw_bytes

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        url_path = self.path.split("?")[0]

        if url_path in ["/health", "/api/v1/health"]:
            return self._send_json({
                "status": "online",
                "service": "ThreatLens AI Platform",
                "version": "2.0.0-realtime",
                "engines": {
                    "static_analysis": "ready",
                    "ml_classifier": "ready",
                    "yara_matcher": "ready",
                    "multimodal_analyzer": "ready",
                    "ai_soc_copilot": "ready",
                    "realtime_telemetry": "ready"
                }
            })

        if url_path in ["/api/v1/auth/me", "/auth/me"]:
            return self._send_json({
                "id": 1,
                "email": "analyst@threatlens.ai",
                "full_name": "Lead Malware Analyst",
                "role": {"name": "Security Analyst", "description": "Upload malware samples, multi-modal assets & run AI scans"}
            })

        if url_path in ["/api/v1/analysis/demo-samples", "/analysis/demo-samples"]:
            return self._send_json(get_demo_samples_library())

        if url_path.startswith("/api/v1/ai/voice-briefing/") or url_path.startswith("/ai/voice-briefing/"):
            sample_id = url_path.split("/")[-1]
            return self._send_json(ai_copilot.generate_voice_briefing({
                "filename": f"sample_{sample_id}.exe",
                "classification": "Ransomware.LockBit",
                "risk_score": 92,
                "media_type": "binary payload"
            }))

        if url_path in ["/api/v1/integrations/live-feeds", "/integrations/live-feeds", "/api/v1/integrations/intel-feeds", "/integrations/intel-feeds"]:
            return self._send_json(threat_intel_stream.get_live_feeds())

        if url_path in ["/api/v1/stream/live-telemetry", "/stream/live-telemetry"]:
            return self._send_json(threat_intel_stream.get_realtime_telemetry_events())

        if url_path in ["/api/v1/integrations/watchlist", "/integrations/watchlist"]:
            return self._send_json(threat_intel_stream.get_watchlist())

        if url_path in ["/api/v1/dashboard/overview", "/dashboard/overview"]:
            scans_list = []
            for s in list(UPLOADED_SAMPLES_STORE.values())[-6:]:
                scans_list.append({
                    "id": s["id"],
                    "filename": s["filename"],
                    "md5_hash": s["md5_hash"],
                    "file_size_bytes": s["file_size_bytes"],
                    "analysis": {
                        "risk_score": 95 if "lockbit" in s["filename"].lower() or "ransom" in s["filename"].lower() else (12 if "clean" in s["filename"].lower() else 75),
                        "classification": "Ransomware.LockBit" if "lockbit" in s["filename"].lower() else ("Clean / Benign" if "clean" in s["filename"].lower() else "Trojan.Generic"),
                        "yara_matches": ["LockBit_Ransomware_Core"] if "lockbit" in s["filename"].lower() else [],
                        "ml_confidence": 0.94
                    }
                })
            return self._send_json({
                "total_samples": len(UPLOADED_SAMPLES_STORE) + 52,
                "malware_detected": 38,
                "active_alerts": 5,
                "avg_risk_score": 71.2,
                "multi_modal_counts": {
                    "binaries": 32,
                    "audio": 8,
                    "video": 6,
                    "websites": 8
                },
                "recent_scans": scans_list
            })

        if url_path in ["/api/v1/files", "/api/v1/files/", "/files", "/files/"]:
            samples_list = []
            for s in list(UPLOADED_SAMPLES_STORE.values()):
                samples_list.append({
                    "id": s["id"],
                    "filename": s["filename"],
                    "md5_hash": s["md5_hash"],
                    "sha256_hash": s["sha256_hash"],
                    "file_size_bytes": s["file_size_bytes"],
                    "uploaded_at": s["uploaded_at"],
                    "analysis_results": [
                        {
                            "risk_score": 95 if "lockbit" in s["filename"].lower() else 72,
                            "classification": "Ransomware.LockBit" if "lockbit" in s["filename"].lower() else "Analyzed Threat",
                            "yara_matches": ["LockBit_Ransomware_Core"] if "lockbit" in s["filename"].lower() else [],
                            "ml_confidence": 0.95
                        }
                    ]
                })
            return self._send_json(samples_list)

        if url_path.startswith("/api/v1/files/"):
            file_id_str = url_path.split("/")[-1]
            file_id = int(file_id_str) if file_id_str.isdigit() else 1
            sample = UPLOADED_SAMPLES_STORE.get(file_id, UPLOADED_SAMPLES_STORE.get(1))
            return self._send_json({
                "id": sample["id"],
                "filename": sample["filename"],
                "file_size_bytes": sample["file_size_bytes"],
                "md5_hash": sample["md5_hash"],
                "sha256_hash": sample["sha256_hash"],
                "sha1_hash": hashlib.sha1(sample.get("bytes", b"sample")).hexdigest(),
                "uploaded_at": sample["uploaded_at"],
                "analysis_results": [
                    {
                        "risk_score": 95,
                        "classification": "Ransomware.LockBit",
                        "yara_matches": ["LockBit_Ransomware_Core", "Suspicious_PE_Header", "Crypto_String_Match"],
                        "ml_confidence": 0.96,
                        "entropy": 7.82,
                        "sections": [
                            {"name": ".text", "virtual_size": "0x00045000", "raw_size": "0x00045000", "entropy": 6.54, "executable": True},
                            {"name": ".rdata", "virtual_size": "0x00012000", "raw_size": "0x00012000", "entropy": 5.12, "executable": False},
                            {"name": ".data", "virtual_size": "0x00008000", "raw_size": "0x00004000", "entropy": 7.95, "executable": False},
                            {"name": ".rsrc", "virtual_size": "0x00003000", "raw_size": "0x00003000", "entropy": 4.88, "executable": False}
                        ],
                        "imported_dlls": [
                            {"name": "KERNEL32.dll", "functions": ["CreateFileA", "WriteFile", "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread"]},
                            {"name": "ADVAPI32.dll", "functions": ["CryptAcquireContextA", "CryptEncrypt", "CryptGenKey", "OpenSCManagerA"]},
                            {"name": "WS2_32.dll", "functions": ["WSAStartup", "connect", "send", "recv"]}
                        ],
                        "suspicious_strings": [
                            "C:\\Windows\\System32\\cmd.exe /c vssadmin delete shadows /all /quiet",
                            "ALL YOUR FILES ARE ENCRYPTED BY LOCKBIT",
                            "http://185.220.101.5/c2/receive_keys.php",
                            "Restore-My-Files.txt"
                        ]
                    }
                ]
            })

        if url_path in ["/api/v1/alerts", "/api/v1/alerts/", "/alerts", "/alerts/"]:
            return self._send_json([
                {
                    "id": 1,
                    "alert_title": "CRITICAL: High-Risk Ransomware Detected",
                    "severity": "CRITICAL",
                    "status": "NEW",
                    "risk_score": 95,
                    "created_at": "2026-08-05T08:31:00Z",
                    "file_metadata": {"id": 1, "filename": "LockBit_v3_decryptor_payload.exe", "md5_hash": "e3b0c44298fc1c149afbf4c8996fb924"},
                    "notes": "Triggered by YARA rule match LockBit_Ransomware_Core"
                },
                {
                    "id": 2,
                    "alert_title": "CRITICAL: AI Voice Deepfake & Steganography",
                    "severity": "CRITICAL",
                    "status": "NEW",
                    "risk_score": 94,
                    "created_at": "2026-08-05T08:15:00Z",
                    "file_metadata": {"id": 2, "filename": "ceo_urgent_wire_transfer_voice.wav", "md5_hash": "8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c"},
                    "notes": "ElevenLabs neural vocoder acoustic anomaly detected with hidden LSB payload"
                },
                {
                    "id": 3,
                    "alert_title": "HIGH: Video Container Polyglot Dropper",
                    "severity": "HIGH",
                    "status": "ACKNOWLEDGED",
                    "risk_score": 88,
                    "created_at": "2026-08-05T07:16:00Z",
                    "file_metadata": {"id": 3, "filename": "c2_drone_surveillance.mp4", "md5_hash": "7d8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c"},
                    "notes": "Assigned to SOC L2 Tier"
                }
            ])

        if url_path in ["/api/v1/users/settings", "/users/settings"]:
            return self._send_json([
                {"setting_key": "RISK_ALERT_THRESHOLD", "setting_value": "65", "description": "Minimum risk score (0-100) to trigger automated SOC alert"},
                {"setting_key": "AI_COPILOT_ENABLED", "setting_value": "true", "description": "Enable ThreatLens AI Copilot autonomous threat reasoning"},
                {"setting_key": "MULTIMODAL_AUDIO_VIDEO_SCAN", "setting_value": "true", "description": "Enable Deepfake & Steganography Multi-Modal Ingestion"},
                {"setting_key": "VIRUSTOTAL_ENABLED", "setting_value": "true", "description": "Enable VirusTotal Hash Lookup Integration"},
                {"setting_key": "SIEM_WEBHOOK_ENABLED", "setting_value": "false", "description": "Enable pushing alert payloads to outbound SIEM/SOAR webhook"}
            ])

        return self._send_json({"detail": "Not found"}, 404)

    def do_POST(self):
        global SAMPLE_ID_COUNTER
        url_path = self.path.split("?")[0]
        raw_body = self._read_body_raw()
        body = {}
        try:
            body = json.loads(raw_body.decode('utf-8'))
        except Exception:
            pass

        if url_path in ["/api/v1/auth/login", "/auth/login"]:
            return self._send_json({
                "access_token": "threatlens_bearer_jwt_token_sample_2026",
                "token_type": "bearer"
            })

        # File Upload Endpoint (Stores Actual Raw Uploaded Bytes!)
        if url_path in ["/api/v1/files/upload", "/files/upload"]:
            filename, file_bytes = self._parse_multipart_file(raw_body)
            if not file_bytes:
                file_bytes = raw_body or b"sample binary payload"

            SAMPLE_ID_COUNTER += 1
            new_id = SAMPLE_ID_COUNTER
            md5_hash = hashlib.md5(file_bytes).hexdigest()
            sha256_hash = hashlib.sha256(file_bytes).hexdigest()

            sample_record = {
                "id": new_id,
                "filename": filename,
                "file_size_bytes": len(file_bytes),
                "md5_hash": md5_hash,
                "sha256_hash": sha256_hash,
                "bytes": file_bytes,
                "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            UPLOADED_SAMPLES_STORE[new_id] = sample_record

            return self._send_json({
                "id": new_id,
                "filename": filename,
                "md5_hash": md5_hash,
                "sha256_hash": sha256_hash,
                "file_size_bytes": len(file_bytes),
                "uploaded_at": sample_record["uploaded_at"]
            }, 201)

        # Dynamic Unified Scan File Endpoint (Runs authentic analysis based on uploaded bytes!)
        if url_path in ["/api/v1/analysis/scan-file", "/analysis/scan-file"]:
            filename, file_bytes = self._parse_multipart_file(raw_body)
            if not file_bytes:
                file_bytes = raw_body or b"sample payload"

            fn_lower = filename.lower()
            ext = os.path.splitext(fn_lower)[1]

            if ext in [".wav", ".mp3", ".ogg", ".flac", ".m4a"] or file_bytes.startswith(b"RIFF") or file_bytes.startswith(b"ID3"):
                return self._send_json(analyze_audio_threat(file_bytes, filename))
            elif ext in [".mp4", ".mkv", ".avi", ".webm", ".mov"] or b"ftyp" in file_bytes[:16]:
                return self._send_json(analyze_video_threat(file_bytes, filename))
            elif ext in [".pdf", ".ps1", ".bat", ".cmd", ".vbs", ".sh", ".py"]:
                return self._send_json(analyze_document_or_script(file_bytes, filename))
            else:
                # Binary Static & ML Analysis
                yara_dir = os.path.join(os.path.dirname(__file__), "yara_rules")
                report = run_static_analysis(file_bytes, filename, yara_dir)
                pred_label, family, conf, etime = ml_engine.predict(report)
                score = ml_engine.calculate_risk_score(report, pred_label, conf)
                entropy_curve = calculate_sliding_window_entropy(file_bytes, window_size=1024, num_points=25)
                return self._send_json({
                    "media_type": "binary",
                    "filename": filename,
                    "file_size_bytes": len(file_bytes),
                    "md5": report["md5"],
                    "sha256": report["sha256"],
                    "entropy": report["entropy"],
                    "entropy_profile": entropy_curve,
                    "risk_score": score,
                    "classification": f"{pred_label} ({family})",
                    "yara_matches": [m["rule"] for m in report.get("yara_matches", [])],
                    "ml_confidence": conf,
                    "sections": report.get("pe_header", {}).get("sections", []),
                    "imported_dlls": report.get("pe_header", {}).get("imports", []),
                    "iocs": report.get("iocs", {})
                })

        # Static PE Scan by File ID
        if "/analysis/static/" in url_path or "/analysis/scan/" in url_path:
            file_id_str = url_path.split("/")[-1]
            file_id = int(file_id_str) if file_id_str.isdigit() else 1
            sample = UPLOADED_SAMPLES_STORE.get(file_id, UPLOADED_SAMPLES_STORE.get(1))
            file_bytes = sample.get("bytes", b"MZ\x90\x00 standard executable")
            filename = sample.get("filename", "sample.exe")

            yara_dir = os.path.join(os.path.dirname(__file__), "yara_rules")
            report = run_static_analysis(file_bytes, filename, yara_dir)
            return self._send_json(report)

        # Classification Predict by File ID
        if "/classification/predict/" in url_path:
            file_id_str = url_path.split("/")[-1]
            file_id = int(file_id_str) if file_id_str.isdigit() else 1
            sample = UPLOADED_SAMPLES_STORE.get(file_id, UPLOADED_SAMPLES_STORE.get(1))
            file_bytes = sample.get("bytes", b"MZ\x90\x00 standard executable")
            filename = sample.get("filename", "sample.exe")

            yara_dir = os.path.join(os.path.dirname(__file__), "yara_rules")
            report = run_static_analysis(file_bytes, filename, yara_dir)
            pred_label, family, conf, etime = ml_engine.predict(report)
            score = ml_engine.calculate_risk_score(report, pred_label, conf)
            return self._send_json({
                "prediction": pred_label,
                "malware_family": family,
                "confidence": conf,
                "risk_score": score,
                "execution_time_ms": etime
            })

        # Multi-Modal Scan by File ID
        if "/analysis/multimodal/scan" in url_path:
            file_id_str = url_path.split("/")[-1]
            file_id = int(file_id_str) if file_id_str.isdigit() else 2
            sample = UPLOADED_SAMPLES_STORE.get(file_id, UPLOADED_SAMPLES_STORE.get(2))
            file_bytes = sample.get("bytes", b"RIFF sample audio")
            filename = sample.get("filename", "sample.wav")
            return self._send_json(analyze_audio_threat(file_bytes, filename))

        # AI Copilot Chat Endpoint
        if url_path in ["/api/v1/ai/copilot/chat", "/ai/copilot/chat"]:
            msg = body.get("message", "")
            sample_ctx = body.get("sample_context", {})
            history = body.get("conversation_history", [])
            return self._send_json(ai_copilot.process_chat_message(msg, sample_ctx, history))

        # AI Remediation Playbook Generator
        if url_path in ["/api/v1/ai/generate/remediation", "/ai/generate/remediation"]:
            sample_ctx = body.get("sample_context", {})
            return self._send_json(ai_copilot.generate_remediation_suite(sample_ctx))

        # AI YARA & Sigma Rule Generator
        if url_path in ["/api/v1/ai/generate/yara-sigma", "/ai/generate/yara-sigma"]:
            sample_ctx = body.get("sample_context", {})
            return self._send_json(ai_copilot.generate_yara_and_sigma(sample_ctx))

        # AI Decompiler & Explainer
        if url_path in ["/api/v1/ai/decompile/explain", "/ai/decompile/explain"]:
            code_snip = body.get("code_snippet", "")
            sample_ctx = body.get("sample_context", {})
            return self._send_json(ai_copilot.decompile_and_explain(code_snip, sample_ctx))

        # Website / Live URL Cyber Threat Scanner
        if url_path in ["/api/v1/analysis/website/scan", "/analysis/website/scan"]:
            url_to_scan = body.get("url", "https://secure-login.micros0ft-verify365.com/auth")
            return self._send_json(analyze_website_threat(url_to_scan))

        # Add Watchlist Item
        if url_path in ["/api/v1/integrations/watchlist", "/integrations/watchlist"]:
            indicator = body.get("indicator", "185.220.101.5")
            ind_type = body.get("indicator_type", "IPv4 Address")
            family = body.get("threat_family", "Malicious Host")
            sev = body.get("severity", "HIGH")
            return self._send_json(threat_intel_stream.add_watchlist_item(indicator, ind_type, family, sev))

        return self._send_json({"status": "success"})

    def do_DELETE(self):
        url_path = self.path.split("?")[0]
        if "/integrations/watchlist/" in url_path:
            item_id = url_path.split("/")[-1]
            threat_intel_stream.remove_watchlist_item(item_id)
            return self._send_json({"success": True, "item_id": item_id})
        return self._send_json({"status": "deleted"})

def run_server():
    server_address = ('', PORT)
    httpd = ThreadingHTTPServer(server_address, ThreatLensRequestHandler)
    print(f"[*] ThreatLens AI Dynamic Standalone Server active on http://127.0.0.1:{PORT} (Multi-Threaded)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    run_server()
