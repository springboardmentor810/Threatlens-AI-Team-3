import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.static_analysis import run_static_analysis
from app.services.ml_engine import ml_engine
from app.services.multimodal_analysis import (
    analyze_audio_threat,
    analyze_video_threat,
    analyze_website_threat,
    analyze_document_or_script,
    get_demo_samples_library
)
from app.services.ai_copilot import ai_copilot
from app.services.threat_intel_stream import threat_intel_stream

def main():
    print("=========================================================================")
    print("  THREATLENS AI - MULTI-MODAL DEFENSIVE & FULL AI ENGINE TEST SUITE")
    print("=========================================================================")

    # 1. Test Static PE & ML Classifier
    print("\n[+] 1. Running PE Static Analysis & Random Forest Classifier...")
    wanacry_payload = (
        b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
        b"WanaCrypt0r Restore-My-Files.txt c.wnry t.wnry WanaDecryptor@.exe "
        b"VirtualAllocEx WriteProcessMemory CreateRemoteThread "
        b"http://c2-malware-server.ru/keys/public.pem 185.220.101.5"
        + b"\x00" * 65000
    )
    yara_dir = os.path.join(os.path.dirname(__file__), "yara_rules")
    pe_report = run_static_analysis(wanacry_payload, "wanacry_sample.exe", yara_dir)
    pred_label, malware_family, confidence, exec_time = ml_engine.predict(pe_report)
    risk_score = ml_engine.calculate_risk_score(pe_report, pred_label, confidence)
    print(f" -> Classification: {pred_label} ({malware_family}), Risk: {risk_score}/100, Conf: {confidence*100:.1f}%")
    assert risk_score >= 65, "Expected high risk score for malware binary"

    # 2. Test Audio Threat & Voice Deepfake
    print("\n[+] 2. Testing Audio Threat & AI Voice Deepfake / Steganography Engine...")
    audio_sample = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00 powershell.exe -enc CEO_VOICE_CLONE_PAYLOAD"
    audio_res = analyze_audio_threat(audio_sample, "ceo_urgent_wire_transfer_voice.wav")
    print(f" -> Audio Classification: {audio_res['classification']}, Risk: {audio_res['risk_score']}/100")
    print(f" -> Deepfake Confidence : {audio_res['deepfake_analysis']['confidence_score']*100:.0f}%")
    print(f" -> Stego Status        : {audio_res['steganography']['status']}")
    assert audio_res['deepfake_analysis']['is_synthetic_voice'] is True
    assert audio_res['risk_score'] >= 80

    # 3. Test Video Container Polyglot
    print("\n[+] 3. Testing Video Polyglot & Deepfake Scanner...")
    video_sample = b"\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00isommp42" + b"\x00"*1024 + b"PK\x03\x04embedded_backdoor.dll"
    video_res = analyze_video_threat(video_sample, "c2_drone_surveillance.mp4")
    print(f" -> Video Classification: {video_res['classification']}, Risk: {video_res['risk_score']}/100")
    print(f" -> Polyglot Detected   : {video_res['container_analysis']['is_polyglot']}")
    assert video_res['container_analysis']['is_polyglot'] is True

    # 4. Test Live Website DOM Phishing Scanner
    print("\n[+] 4. Testing Website & Live URL Phishing Scanner...")
    web_res = analyze_website_threat("https://secure-login.micros0ft-verify365.com/auth")
    print(f" -> Phishing Brand Spoof: {web_res['target_brand_spoof']}")
    print(f" -> Reputation          : {web_res['reputation']}, Risk: {web_res['risk_score']}/100")
    assert web_res['phishing_analysis']['is_phishing_confirmed'] is True

    # 5. Test AI SOC Copilot Suite
    print("\n[+] 5. Testing ThreatLens AI SOC Copilot & Reasoning Engine...")
    chat_res = ai_copilot.process_chat_message("Explain execution flow and remediation", sample_context={"filename": "wanacry_sample.exe", "classification": "Ransomware.WannaCry", "risk_score": 95})
    assert len(chat_res['reply']) > 50
    assert len(chat_res['suggested_actions']) > 0
    print(" -> AI Copilot Chat Reasoning: OK")

    rem_res = ai_copilot.generate_remediation_suite({"filename": "wanacry_sample.exe", "classification": "Ransomware.WannaCry", "risk_score": 95})
    assert "Stop-Process" in rem_res['powershell']
    assert "iptables" in rem_res['bash']
    print(" -> AI Remediation Playbook (PowerShell & Bash): OK")

    yara_res = ai_copilot.generate_yara_and_sigma({"filename": "wanacry_sample.exe", "classification": "Ransomware.WannaCry", "risk_score": 95})
    assert "rule ThreatLens_Auto_" in yara_res['yara_rule']
    assert "logsource:" in yara_res['sigma_rule']
    print(" -> AI YARA & Sigma Synthesizer: OK")

    decompile_res = ai_copilot.decompile_and_explain(sample_context={"filename": "wanacry_sample.exe"})
    assert len(decompile_res['disassembly']) > 0
    print(" -> AI Decompiler & Disassembly Explainer: OK")

    # 6. Test Threat Intel Stream & Watchlist
    print("\n[+] 6. Testing Continuous Threat Stream & Automated Watchlist...")
    feeds = threat_intel_stream.get_live_feeds()
    assert len(feeds) >= 5
    watchlist = threat_intel_stream.get_watchlist()
    assert len(watchlist) >= 4
    print(f" -> Ingested {len(feeds)} Live Global Threat Signals, {len(watchlist)} Active Watchers: OK")

    print("\n=========================================================================")
    print(" [SUCCESS] ALL 6 ADVANCED DEFENSIVE MULTI-MODAL & AI MODULES VERIFIED! ")
    print("=========================================================================")

if __name__ == "__main__":
    main()
