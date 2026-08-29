rule ThreatLens_Suspicious_PowerShell
{
    meta:
        description = "Detects PowerShell execution indicators in a PE file"
        severity = "medium"
        category = "execution"

    strings:
        $ps1 = "powershell" ascii nocase
        $ps2 = "powershell.exe" ascii nocase
        $ps3 = "pwsh.exe" ascii nocase
        $ps4 = "-enc" ascii nocase
        $ps5 = "-encodedcommand" ascii nocase

    condition:
        2 of them
}


rule ThreatLens_Suspicious_Cmd
{
    meta:
        description = "Detects Windows command shell indicators"
        severity = "medium"
        category = "execution"

    strings:
        $cmd1 = "cmd.exe" ascii nocase
        $cmd2 = "/c" ascii nocase
        $cmd3 = "command.com" ascii nocase

    condition:
        2 of them
}


rule ThreatLens_Suspicious_Download
{
    meta:
        description = "Detects common download/execution indicators"
        severity = "medium"
        category = "network"

    strings:
        $u1 = "URLDownloadToFile" ascii nocase
        $u2 = "WinHttpOpen" ascii nocase
        $u3 = "WinHttpOpenRequest" ascii nocase
        $u4 = "InternetOpenUrl" ascii nocase
        $u5 = "URLMON" ascii nocase

    condition:
        2 of them
}


rule ThreatLens_Suspicious_Process_Injection
{
    meta:
        description = "Detects combinations of APIs commonly associated with process injection"
        severity = "high"
        category = "injection"

    strings:
        $a1 = "VirtualAllocEx" ascii
        $a2 = "WriteProcessMemory" ascii
        $a3 = "CreateRemoteThread" ascii
        $a4 = "NtWriteVirtualMemory" ascii
        $a5 = "NtCreateThreadEx" ascii

    condition:
        2 of them
}


rule ThreatLens_Suspicious_Persistence
{
    meta:
        description = "Detects common Windows persistence indicators"
        severity = "medium"
        category = "persistence"

    strings:
        $r1 = "RegSetValueEx" ascii
        $r2 = "CurrentVersion\\Run" ascii nocase
        $r3 = "CurrentVersion\\RunOnce" ascii nocase
        $r4 = "schtasks" ascii nocase

    condition:
        2 of them
}
