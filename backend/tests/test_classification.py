def test_trigger_analysis_and_classification(client, auth_headers):
    # Upload sample file
    file_content = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00WanaCrypt0r Restore-My-Files.txt VirtualAllocEx http://bad-malware-payload.ru"
    files = {"file": ("wanacry_sample.exe", file_content, "application/octet-stream")}

    upload_res = client.post(
        "/api/v1/files/upload",
        files=files,
        headers=auth_headers
    )
    assert upload_res.status_code == 201
    file_id = upload_res.json()["id"]

    # Trigger scan
    scan_res = client.post(f"/api/v1/analysis/scan/{file_id}", headers=auth_headers)
    assert scan_res.status_code == 200
    data = scan_res.json()

    assert data["file"]["status"] == "analyzed"
    assert data["summary"]["yara_matches_count"] >= 1
    assert "classification" in data
    assert data["classification"]["risk_score"] > 50
    assert "virustotal" in data
