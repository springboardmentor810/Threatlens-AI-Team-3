def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@threatlens.ai", "password": "AdminPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@threatlens.ai"

def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@threatlens.ai", "password": "WrongPassword!"}
    )
    assert response.status_code == 401

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newanalyst@threatlens.ai",
            "password": "Password123!",
            "full_name": "New Security Analyst",
            "role_name": "Security Analyst"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newanalyst@threatlens.ai"

def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@threatlens.ai"
