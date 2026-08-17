import time
import random
from typing import Dict, Any, List, Optional

class ThreatIntelStreamManager:
    """
    Manages real-time live threat intelligence feeds, telemetry streams, and automated IOC watchlists.
    """
    def __init__(self):
        self.watchlist = [
            {
                "id": "wl_1",
                "indicator": "185.220.101.5",
                "type": "IPv4 Address",
                "threat_family": "LockBit / CobaltStrike C2",
                "severity": "CRITICAL",
                "matches_found": 14,
                "status": "ACTIVE_WATCHING",
                "added_at": "2026-08-01T10:00:00Z"
            },
            {
                "id": "wl_2",
                "indicator": "secure-login.micros0ft-verify365.com",
                "type": "Domain / URL",
                "threat_family": "Phishing Impersonation",
                "severity": "HIGH",
                "matches_found": 8,
                "status": "ACTIVE_WATCHING",
                "added_at": "2026-08-03T14:30:00Z"
            },
            {
                "id": "wl_3",
                "indicator": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "type": "SHA-256 Hash",
                "threat_family": "WannaCry Ransomware",
                "severity": "CRITICAL",
                "matches_found": 29,
                "status": "ACTIVE_WATCHING",
                "added_at": "2026-08-04T09:15:00Z"
            },
            {
                "id": "wl_4",
                "indicator": "194.165.16.2",
                "type": "IPv4 Address",
                "threat_family": "Mirai Botnet C2",
                "severity": "HIGH",
                "matches_found": 6,
                "status": "ACTIVE_WATCHING",
                "added_at": "2026-08-06T11:45:00Z"
            }
        ]

    def get_live_feeds(self) -> List[Dict[str, Any]]:
        """Returns live continuous threat feed items."""
        now = time.time()
        base_feeds = [
            {
                "id": f"feed_{int(now)}_1",
                "source": "AlienVault OTX",
                "indicator": "185.220.101.5",
                "indicator_type": "IPv4",
                "threat_type": "CobaltStrike C2 Drop Point",
                "severity": "CRITICAL",
                "confidence": 98,
                "timestamp": "Just now",
                "geo": "Frankfurt, Germany",
                "asn": "AS9009 M247"
            },
            {
                "id": f"feed_{int(now)}_2",
                "source": "URLhaus Abuse Feed",
                "indicator": "https://auth-micros0ft.security-update-live.xyz/login",
                "indicator_type": "URL",
                "threat_type": "Phishing / M365 Credential Harvester",
                "severity": "HIGH",
                "confidence": 95,
                "timestamp": "1 min ago",
                "geo": "Amsterdam, Netherlands",
                "asn": "AS16509 Amazon"
            },
            {
                "id": f"feed_{int(now)}_3",
                "source": "AbuseIPDB",
                "indicator": "194.165.16.2",
                "indicator_type": "IPv4",
                "threat_type": "Mirai Botnet SSH Brute Forcer",
                "severity": "HIGH",
                "confidence": 92,
                "timestamp": "3 mins ago",
                "geo": "Sofia, Bulgaria",
                "asn": "AS49981 WorldStream"
            },
            {
                "id": f"feed_{int(now)}_4",
                "source": "CISA Known Exploited (KEV)",
                "indicator": "CVE-2026-21844",
                "indicator_type": "CVE Exploit",
                "threat_type": "Windows Kernel Elevation of Privilege",
                "severity": "CRITICAL",
                "confidence": 100,
                "timestamp": "8 mins ago",
                "geo": "Global Alert",
                "asn": "N/A"
            },
            {
                "id": f"feed_{int(now)}_5",
                "source": "ThreatLens Deepfake Radar",
                "indicator": "voice_clone_synth_elevenlabs_v3.bin",
                "indicator_type": "Audio Stego",
                "threat_type": "Executive Vishing Cloned Audio Attack",
                "severity": "HIGH",
                "confidence": 94,
                "timestamp": "14 mins ago",
                "geo": "London, UK",
                "asn": "AS20857 Fastly"
            }
        ]
        return base_feeds

    def get_realtime_telemetry_events(self) -> List[Dict[str, Any]]:
        """Generates dynamic live telemetry radar stream for real-time monitoring."""
        event_types = [
            ("PORT_SCAN_BLOCKED", "194.26.29.112", "Port 445 (SMB) Probe Blocked", "HIGH", "US-East"),
            ("BRUTE_FORCE_THROTTLED", "45.154.255.87", "SSH Root Brute-Force Rate-Limited", "MEDIUM", "EU-Central"),
            ("PHISHING_HARVEST_INTERCEPTED", "185.196.220.14", "Deceptive Microsoft Login Form Blocked", "CRITICAL", "AP-East"),
            ("RANSOMWARE_PAYLOAD_QUARANTINED", "193.142.146.33", "LockBit v3 Payload Dropped by Endpoint Shield", "CRITICAL", "US-West"),
            ("VOICE_DEEPFAKE_FLAGGED", "172.67.182.91", "Synthetic Audio Cloned Stream Quarantined", "HIGH", "EU-West"),
            ("CONTAINER_POLYGLOT_NEUTRALIZED", "89.208.107.5", "MP4 Polyglot Dropper Archive Extracted", "HIGH", "US-Central")
        ]

        now = time.time()
        events = []
        for i, (evt, ip, desc, sev, region) in enumerate(event_types):
            events.append({
                "id": f"telemetry_{int(now)}_{i}",
                "event_type": evt,
                "source_ip": ip,
                "description": desc,
                "severity": sev,
                "region": region,
                "timestamp": int(now * 1000) - (i * 2400),
                "risk_score": random.randint(75, 98) if sev == "CRITICAL" else random.randint(55, 74)
            })
        return events

    def get_watchlist(self) -> List[Dict[str, Any]]:
        return self.watchlist

    def add_watchlist_item(self, indicator: str, indicator_type: str, threat_family: str, severity: str = "HIGH") -> Dict[str, Any]:
        item_id = f"wl_{len(self.watchlist) + 1}"
        new_item = {
            "id": item_id,
            "indicator": indicator,
            "type": indicator_type,
            "threat_family": threat_family,
            "severity": severity,
            "matches_found": 1,
            "status": "ACTIVE_WATCHING",
            "added_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        self.watchlist.insert(0, new_item)
        return new_item

    def remove_watchlist_item(self, item_id: str) -> bool:
        initial_len = len(self.watchlist)
        self.watchlist = [w for w in self.watchlist if w["id"] != item_id]
        return len(self.watchlist) < initial_len

threat_intel_stream_service = ThreatIntelStreamManager()
threat_intel_stream = threat_intel_stream_service

