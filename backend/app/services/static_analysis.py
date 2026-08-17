import os
import re
import math
import hashlib
from typing import Dict, Any, List

# Try importing pefile and yara with fallbacks
try:
    import pefile
    HAS_PEFILE = True
except ImportError:
    HAS_PEFILE = False

try:
    import yara
    HAS_YARA = True
except ImportError:
    HAS_YARA = False

SUSPICIOUS_APIS = [
    "VirtualAlloc", "VirtualAllocEx", "VirtualProtect", "WriteProcessMemory",
    "ReadProcessMemory", "CreateRemoteThread", "OpenProcess", "NtUnmapViewOfSection",
    "URLDownloadToFileA", "URLDownloadToFileW", "InternetOpenA", "InternetOpenUrlA",
    "WinExec", "ShellExecuteA", "ShellExecuteW", "CreateProcessA", "CreateProcessW",
    "RegSetValueExA", "RegCreateKeyExA", "CryptEncrypt", "CryptDecrypt",
    "IsDebuggerPresent", "CheckRemoteDebuggerPresent", "GetThreadContext", "SetThreadContext"
]

YARA_RULE_PATTERNS = {
    "Ransomware_LockBit_Note": [b"LockBit", b"Restore-My-Files", b"ALL YOUR FILES ARE ENCRYPTED"],
    "Ransomware_WannaCry_Pattern": [b"WanaCrypt0r", b"c.wnry", b"t.wnry", b"wnry"],
    "Trojan_AgentTesla_Keylogger": [b"AgentTesla", b"smtp.gmail.com", b"keylog", b"GetKeyboardState"],
    "Worm_Mirai_C2": [b"/bin/busybox", b"POST /cdn-cgi/", b"dvrHelper", b"MIRAI"],
    "Webshell_PHP_Exec": [b"eval(base64_decode", b"passthru(", b"system($_POST", b"shell_exec("],
    "Suspicious_Process_Injection": [b"CreateRemoteThread", b"WriteProcessMemory", b"VirtualAllocEx"],
}

def compute_hashes(file_bytes: bytes) -> Dict[str, str]:
    md5 = hashlib.md5(file_bytes).hexdigest()
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    return {"md5": md5, "sha256": sha256}

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    occ = {}
    for byte in data:
        occ[byte] = occ.get(byte, 0) + 1
    for count in occ.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)

def detect_file_type(file_bytes: bytes, filename: str) -> str:
    if file_bytes.startswith(b"MZ"):
        return "PE32 Executable (Windows)"
    elif file_bytes.startswith(b"\x7fELF"):
        return "ELF Executable (Linux)"
    elif file_bytes.startswith(b"PK\x03\x04"):
        return "Zip / Archive Document"
    elif file_bytes.startswith(b"%PDF"):
        return "PDF Document"
    elif file_bytes.startswith(b"<\x3fphp") or b"<?php" in file_bytes[:100]:
        return "PHP Script"
    elif file_bytes.startswith(b"#!") or filename.endswith(".sh") or filename.endswith(".py"):
        return "Script Text File"
    
    ext = os.path.splitext(filename)[1].lower()
    if ext in [".exe", ".dll", ".sys"]:
        return "PE Executable Binary"
    return "Binary / Data File"

def extract_strings(file_bytes: bytes, min_length: int = 4) -> List[str]:
    # Extract printable ASCII strings
    ascii_pattern = re.compile(b"[\x20-\x7e]{" + str(min_length).encode() + b",}")
    strings = [s.decode("ascii", errors="ignore") for s in ascii_pattern.findall(file_bytes)]
    return strings[:500]  # Cap at top 500 strings

def extract_iocs(strings: List[str]) -> Dict[str, List[str]]:
    urls = set()
    ips = set()
    
    url_regex = re.compile(r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*")
    ip_regex = re.compile(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b")
    
    for s in strings:
        found_urls = url_regex.findall(s)
        for u in found_urls:
            if len(u) < 150:
                urls.add(u)
        
        found_ips = ip_regex.findall(s)
        for ip in found_ips:
            if not ip.startswith("127.") and not ip.startswith("0."):
                ips.add(ip)

    return {
        "urls": list(urls)[:50],
        "ips": list(ips)[:50]
    }

def parse_pe_header(file_bytes: bytes) -> Dict[str, Any]:
    if not HAS_PEFILE or not file_bytes.startswith(b"MZ"):
        # Simulated/Basic PE parser fallback if pefile not installed or invalid PE
        is_pe = file_bytes.startswith(b"MZ")
        return {
            "is_pe": is_pe,
            "machine": "x86_64" if is_pe else "Unknown",
            "sections": [],
            "imports": [],
            "exports": [],
            "suspicious_imports": []
        }

    try:
        pe = pefile.PE(data=file_bytes)
        sections = []
        for section in pe.sections:
            sec_name = section.Name.decode('utf-8', errors='ignore').strip('\x00')
            sec_entropy = calculate_entropy(section.get_data())
            sections.append({
                "name": sec_name,
                "virtual_size": section.Misc_VirtualSize,
                "raw_size": section.SizeOfRawData,
                "entropy": sec_entropy
            })

        imports = []
        suspicious_imports = []
        if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
            for entry in pe.DIRECTORY_ENTRY_IMPORT:
                dll_name = entry.dll.decode('utf-8', errors='ignore')
                func_list = []
                for imp in entry.imports:
                    if imp.name:
                        func_name = imp.name.decode('utf-8', errors='ignore')
                        func_list.append(func_name)
                        if func_name in SUSPICIOUS_APIS:
                            suspicious_imports.append(f"{dll_name}:{func_name}")
                imports.append({
                    "dll": dll_name,
                    "functions": func_list[:20]
                })

        exports = []
        if hasattr(pe, 'DIRECTORY_ENTRY_EXPORT'):
            for exp in pe.DIRECTORY_ENTRY_EXPORT.symbols:
                if exp.name:
                    exports.append(exp.name.decode('utf-8', errors='ignore'))

        return {
            "is_pe": True,
            "machine": hex(pe.FILE_HEADER.Machine),
            "timestamp": pe.FILE_HEADER.TimeDateStamp,
            "sections": sections,
            "imports": imports[:20],
            "exports": exports[:20],
            "suspicious_imports": suspicious_imports
        }
    except Exception as e:
        return {
            "is_pe": True,
            "error": f"PE Parse Error: {str(e)}",
            "sections": [],
            "imports": [],
            "exports": [],
            "suspicious_imports": []
        }

def match_yara_rules(file_bytes: bytes, yara_dir: str) -> List[Dict[str, Any]]:
    matches = []

    # Attempt native YARA library matching first
    if HAS_YARA and os.path.exists(yara_dir):
        try:
            yar_files = {}
            for fname in os.listdir(yara_dir):
                if fname.endswith(".yar") or fname.endswith(".yara"):
                    yar_files[fname] = os.path.join(yara_dir, fname)
            if yar_files:
                rules = yara.compile(filepaths=yar_files)
                yara_matches = rules.match(data=file_bytes)
                for m in yara_matches:
                    matches.append({
                        "rule": m.rule,
                        "meta": m.meta,
                        "tags": m.tags
                    })
                return matches
        except Exception:
            pass

    # Pattern-matching fallback
    for rule_name, patterns in YARA_RULE_PATTERNS.items():
        hit_count = sum(1 for p in patterns if p.lower() in file_bytes.lower())
        if hit_count > 0:
            matches.append({
                "rule": rule_name,
                "meta": {"severity": "High" if "Ransomware" in rule_name or "Trojan" in rule_name else "Medium"},
                "tags": [rule_name.split("_")[0]]
            })

    return matches

def run_static_analysis(file_bytes: bytes, filename: str, yara_dir: str) -> Dict[str, Any]:
    """Execute complete static analysis pipeline."""
    hashes = compute_hashes(file_bytes)
    overall_entropy = calculate_entropy(file_bytes)
    file_type = detect_file_type(file_bytes, filename)
    strings = extract_strings(file_bytes)
    iocs = extract_iocs(strings)
    pe_info = parse_pe_header(file_bytes)
    yara_hits = match_yara_rules(file_bytes, yara_dir)

    report = {
        "filename": filename,
        "file_size": len(file_bytes),
        "file_type": file_type,
        "md5": hashes["md5"],
        "sha256": hashes["sha256"],
        "entropy": overall_entropy,
        "pe_header": pe_info,
        "strings_sample": strings[:50],
        "total_strings_count": len(strings),
        "iocs": iocs,
        "yara_matches": yara_hits
    }
    return report
