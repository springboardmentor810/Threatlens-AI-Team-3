rule Trojan_AgentTesla_Keylogger {
    meta:
        description = "Detects AgentTesla keylogger communication and strings"
        author = "ThreatLens AI Ruleset"
        severity = "High"
    strings:
        $s1 = "AgentTesla" ascii wide
        $s2 = "smtp.gmail.com" ascii wide
        $s3 = "GetKeyboardState" ascii wide
        $s4 = "ftp://upload" ascii wide
    condition:
        2 of ($s*)
}

rule Trojan_Emotet_Downloader {
    meta:
        description = "Detects Emotet payload downloader patterns"
        author = "ThreatLens AI Ruleset"
        severity = "High"
    strings:
        $s1 = "cmd.exe /c powershell" ascii wide
        $s2 = "DownloadString" ascii wide
        $s3 = "VirtualAllocEx" ascii wide
    condition:
        2 of ($s*)
}
