def test_register_user(client):
    response = client.post(
        "/api/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password_hash" not in data

def test_register_user_duplicate_username(client):
    # Register first user
    client.post(
        "/api/register",
        json={"username": "dupuser", "email": "dup1@example.com", "password": "password123"}
    )
    # Register second user with same username
    response = client.post(
        "/api/register",
        json={"username": "dupuser", "email": "dup2@example.com", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"

def test_register_user_duplicate_email(client):
    # Register first user
    client.post(
        "/api/register",
        json={"username": "user1", "email": "dupemail@example.com", "password": "password123"}
    )
    # Register second user with same email
    response = client.post(
        "/api/register",
        json={"username": "user2", "email": "dupemail@example.com", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client):
    # Register
    client.post(
        "/api/register",
        json={"username": "loginuser", "email": "loginuser@example.com", "password": "password123"}
    )
    # Login
    response = client.post(
        "/api/login",
        json={"username_or_email": "loginuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_fail(client):
    response = client.post(
        "/api/login",
        json={"username_or_email": "nonexistent", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_profile(client):
    # Register & Login
    client.post(
        "/api/register",
        json={"username": "profileuser", "email": "profile@example.com", "password": "password123"}
    )
    login_response = client.post(
        "/api/login",
        json={"username_or_email": "profileuser", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    # Get profile
    response = client.get(
        "/api/profile",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "profileuser"
    assert data["email"] == "profile@example.com"
