import io

def get_auth_headers(client, username, email):
    client.post(
        "/api/register",
        json={"username": username, "email": email, "password": "password123"}
    )
    login_resp = client.post(
        "/api/login",
        json={"username_or_email": username, "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_upload_file_success(client):
    headers = get_auth_headers(client, "uploader", "uploader@example.com")
    
    # Upload an image file (supported type)
    file_content = b"fake png data"
    response = client.post(
        "/api/files/upload",
        headers=headers,
        data={"is_public": "true"},
        files={"file": ("test_image.png", io.BytesIO(file_content), "image/png")}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "test_image.png"
    assert data["mime_type"] == "image/png"
    assert data["is_public"] is True
    assert data["size"] == len(file_content)

def test_upload_file_unsupported_type(client):
    headers = get_auth_headers(client, "badfile", "badfile@example.com")
    
    # Upload an unsupported file type
    response = client.post(
        "/api/files/upload",
        headers=headers,
        files={"file": ("test.exe", io.BytesIO(b"binary"), "application/x-msdownload")}
    )
    
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_list_and_search_files(client):
    headers = get_auth_headers(client, "lister", "lister@example.com")
    
    # Upload 2 files
    client.post(
        "/api/files/upload",
        headers=headers,
        files={"file": ("notes.txt", io.BytesIO(b"my text notes"), "text/plain")}
    )
    client.post(
        "/api/files/upload",
        headers=headers,
        files={"file": ("photo.jpg", io.BytesIO(b"my photo bytes"), "image/jpeg")}
    )
    
    # List files
    response = client.get("/api/files", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 2
    
    # Filter by type
    response_img = client.get("/api/files?type=image", headers=headers)
    assert len(response_img.json()) == 1
    assert response_img.json()[0]["filename"] == "photo.jpg"
    
    # Search by query
    response_search = client.get("/api/files?q=notes", headers=headers)
    assert len(response_search.json()) == 1
    assert response_search.json()[0]["filename"] == "notes.txt"

def test_rename_file(client):
    headers = get_auth_headers(client, "renamer", "renamer@example.com")
    
    # Upload
    upload_resp = client.post(
        "/api/files/upload",
        headers=headers,
        files={"file": ("doc.pdf", io.BytesIO(b"pdf data"), "application/pdf")}
    )
    file_id = upload_resp.json()["id"]
    
    # Rename
    rename_resp = client.put(
        f"/api/files/{file_id}",
        headers=headers,
        json={"filename": "new_doc.pdf"}
    )
    assert rename_resp.status_code == 200
    assert rename_resp.json()["filename"] == "new_doc.pdf"

def test_delete_file(client):
    headers = get_auth_headers(client, "deleter", "deleter@example.com")
    
    # Upload
    upload_resp = client.post(
        "/api/files/upload",
        headers=headers,
        files={"file": ("delete_me.pdf", io.BytesIO(b"pdf data"), "application/pdf")}
    )
    file_id = upload_resp.json()["id"]
    
    # Delete
    del_resp = client.delete(f"/api/files/{file_id}", headers=headers)
    assert del_resp.status_code == 200
    
    # Get metadata should fail
    get_resp = client.get(f"/api/files/{file_id}", headers=headers)
    assert get_resp.status_code == 404

def test_get_download_link(client):
    headers = get_auth_headers(client, "downloader", "downloader@example.com")
    
    # Upload a private file
    upload_resp = client.post(
        "/api/files/upload",
        headers=headers,
        data={"is_public": "false"},
        files={"file": ("secret.pdf", io.BytesIO(b"pdf data"), "application/pdf")}
    )
    file_id = upload_resp.json()["id"]
    
    # Access without credentials should fail
    dl_resp_fail = client.get(f"/api/files/download/{file_id}")
    assert dl_resp_fail.status_code == 401
    
    # Access with token query param should succeed
    login_resp = client.post(
        "/api/login",
        json={"username_or_email": "downloader", "password": "password123"}
    )
    token = login_resp.json()["access_token"]
    dl_resp = client.get(f"/api/files/download/{file_id}?token={token}")
    assert dl_resp.status_code == 200
    assert "download_url" in dl_resp.json()
