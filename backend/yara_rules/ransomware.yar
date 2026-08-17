rule Ransomware_WannaCry_Generic {
    meta:
        description = "Detects WannaCry ransomware artifacts and file extensions"
        author = "ThreatLens AI Ruleset"
        severity = "Critical"
    strings:
        $s1 = "WanaCrypt0r" ascii wide
        $s2 = "c.wnry" ascii wide
        $s3 = "t.wnry" ascii wide
        $s4 = "Ooops, your files have been encrypted!" ascii wide
    condition:
        any of ($s*)
}

rule Ransomware_LockBit_Note {
    meta:
        description = "Detects LockBit ransom note pattern"
        author = "ThreatLens AI Ruleset"
        severity = "Critical"
    strings:
        $s1 = "LockBit" ascii wide
        $s2 = "Restore-My-Files.txt" ascii wide
        $s3 = "All your files have been encrypted" ascii wide
    condition:
        2 of ($s*)
}
