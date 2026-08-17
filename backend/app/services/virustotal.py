import requests
from typing import Dict, Any
from app.core.config import settings

def query_virustotal(file_hash: str) -> Dict[str, Any]:
    """Query VirusTotal API v3 for file hash intelligence."""
    api_key = settings.VIRUSTOTAL_API_KEY
    if not api_key:
        # Fallback realistic VirusTotal simulation response for demo
        hash_sum = sum(ord(c) for c in file_hash)
        positives = (hash_sum % 45) + 5 if hash_sum % 2 == 0 else 0
        total_engines = 72
        
        return {
            "status": "success",
            "source": "VirusTotal Simulation Engine (Add VIRUSTOTAL_API_KEY in .env for live API)",
            "hash": file_hash,
            "positives": positives,
            "total": total_engines,
            "detection_rate": f"{positives}/{total_engines}",
            "permalink": f"https://www.virustotal.com/gui/file/{file_hash}",
            "scans": {
                "Kaspersky": "Malware.Win32.Generic" if positives > 0 else "Clean",
                "CrowdStrike": "Win.Trojan.Agent" if positives > 0 else "Clean",
                "Microsoft": "Ransom:Win32/WannaCrypt" if positives > 0 else "Clean",
                "Symantec": "Trojan.Gen.2" if positives > 0 else "Clean"
            }
        }

    headers = {"x-apikey": api_key}
    url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
    try:
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json().get("data", {}).get("attributes", {})
            stats = data.get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            total = sum(stats.values())
            return {
                "status": "success",
                "source": "VirusTotal Live API v3",
                "hash": file_hash,
                "positives": malicious,
                "total": total,
                "detection_rate": f"{malicious}/{total}",
                "reputation": data.get("reputation", 0),
                "tags": data.get("tags", [])
            }
        elif res.status_code == 404:
            return {"status": "not_found", "message": "Hash not found in VirusTotal database."}
        else:
            return {"status": "error", "message": f"VirusTotal API error: HTTP {res.status_code}"}
    except Exception as e:
        return {"status": "error", "message": f"Connection error to VirusTotal: {str(e)}"}
