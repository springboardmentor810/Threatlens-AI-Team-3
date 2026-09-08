rule Suspicious_PowerShell
{
    strings:
        $ps1 = "powershell" nocase
        $ps2 = "Invoke-Expression" nocase
        $ps3 = "FromBase64String" nocase

    condition:
        2 of them
}


rule Suspicious_Download
{
    strings:
        $url1 = "URLDownloadToFile" nocase
        $url2 = "InternetOpenUrl" nocase
        $url3 = "WinHttpSendRequest" nocase

    condition:
        1 of them
}


rule Suspicious_Process_Injection
{
    strings:
        $api1 = "VirtualAllocEx" nocase
        $api2 = "WriteProcessMemory" nocase
        $api3 = "CreateRemoteThread" nocase

    condition:
        2 of them
}