def test_upload_file(client, auth_headers):
    file_content = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00WanaCrypt0r Restore-My-Files.txt VirtualAllocEx http://bad-malware-payload.ru"
    files = {"file": ("sample_ransomware.exe", file_content, "application/octet-stream")}

    response = client.post(
        "/api/v1/files/upload",
        files=files,
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["original_name"] == "sample_ransomware.exe"
    assert "md5_hash" in data
    assert "sha256_hash" in data
    assert data["status"] == "uploaded"

def test_list_files(client, auth_headers):
    response = client.get("/api/v1/files/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
