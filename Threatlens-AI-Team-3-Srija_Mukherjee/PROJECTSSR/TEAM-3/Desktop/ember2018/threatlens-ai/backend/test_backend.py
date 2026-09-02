"""Small backend integration test that never touches the configured PostgreSQL DB."""

import os
import sys
import uuid
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-only-for-local-integration-tests"

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir.parent))

from fastapi.testclient import TestClient

from app.database import init_db
from app.main import app

init_db()
client = TestClient(app)
TEST_USER = f"analyst_{uuid.uuid4().hex[:8]}"


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register_and_login():
    response = client.post(
        "/api/auth/register",
        json={
            "username": TEST_USER,
            "email": f"{TEST_USER}@threatlens.ai",
            "password": "SecurePassword123!",
            "role": "Security Analyst",
        },
    )
    assert response.status_code == 200
    assert response.json()["user"]["username"] == TEST_USER

    response = client.post(
        "/api/auth/login",
        json={"username": TEST_USER, "password": "SecurePassword123!"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == TEST_USER
    return token


def test_scan_persists_and_deduplicates_per_user():
    payload = b"harmless integration-test content"
    token = client.post(
        "/api/auth/login",
        json={"username": TEST_USER, "password": "SecurePassword123!"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/upload/scan",
        files={"file": ("sample.txt", payload, "text/plain")},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["duplicate"] is False
    assert body["database"]["saved_to_postgresql"] is True
    assert body["database"]["analysis_id"]
    file_id = body["file"]["file_id"]

    response = client.post(
        "/api/upload/scan",
        files={"file": ("renamed.txt", payload, "text/plain")},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["duplicate"] is True

    response = client.get("/api/upload/scans", headers=headers)
    assert response.status_code == 200
    assert response.json()["total_scans"] == 1

    response = client.delete(f"/api/upload/scans/{file_id}", headers=headers)
    assert response.status_code == 200
    response = client.get("/api/upload/scans", headers=headers)
    assert response.json()["total_scans"] == 0


if __name__ == "__main__":
    test_health()
    test_register_and_login()
    test_scan_persists_and_deduplicates_per_user()
    print("All backend integration tests passed.")
