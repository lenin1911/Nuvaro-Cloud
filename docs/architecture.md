# System Architecture & Diagrams

This document contains visual diagrams describing the database structure, components, and communication flows of the Cloud File Storage web application.

---

## Entity-Relationship (ER) Diagram

The following ER diagram maps the database structure containing two tables: `users` and `files`. It shows a one-to-many relationship where each user can own multiple files, but each file belongs to exactly one user.

```mermaid
erDiagram
    USERS {
        int id PK
        string username "UNIQUE"
        string email "UNIQUE"
        string password_hash
        datetime created_at
    }
    
    FILES {
        int id PK
        int owner_id FK
        string filename
        string original_name
        bigint size
        string mime_type
        string s3_key
        boolean is_public
        datetime upload_time
    }

    USERS ||--o{ FILES : "owns"
```

---

## System Architecture Diagram

The frontend is served via an Nginx container which also reverse-proxies API calls `/api` to the backend. Files are uploaded directly to the backend, which uploads them to S3 and registers the file details inside PostgreSQL.

```mermaid
graph TD
    Client[Browser Client]
    
    subgraph Docker Containers
        Nginx[Nginx Web Server]
        React[React Client SPA]
        FastAPI[FastAPI Backend Server]
        Postgres[(Postgres Database)]
    end
    
    subgraph Cloud Storage
        S3[AWS S3 Bucket / LocalStack S3]
    end

    Client -->|Loads site| Nginx
    Nginx -->|Serves static files| React
    Client -->|REST API requests| Nginx
    Nginx -->|Reverse Proxies /api| FastAPI
    FastAPI -->|Saves metadata| Postgres
    FastAPI -->|Uploads/Deletes files| S3
```

---

## Sequence Diagrams

### 1. Registration & Authentication Lifecycle
How a guest registers, logs in, obtains a JWT token, and accesses protected endpoints:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant API as FastAPI Backend
    participant DB as Postgres DB

    User->>API: POST /api/register (username, email, password)
    API->>API: Hash password with bcrypt
    API->>DB: Save User details
    DB-->>API: User created
    API-->>User: User profile response (201 Created)

    User->>API: POST /api/login (username_or_email, password)
    API->>DB: Fetch user by username/email
    DB-->>API: Return password hash
    API->>API: Verify password with bcrypt
    API->>API: Generate JWT token containing sub (user.id)
    API-->>User: Token response (access_token, bearer)

    User->>API: GET /api/profile (Authorization: Bearer <token>)
    API->>API: Verify JWT token signature & expiry
    API->>DB: Fetch user profile by ID
    DB-->>API: User details
    API-->>User: Return profile details (200 OK)
```

### 2. File Upload Lifecycle
How files are uploaded, validated for size/type, and secured against path traversals:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant API as FastAPI Backend
    participant S3 as AWS S3 Storage
    participant DB as Postgres DB

    Client->>API: POST /api/files/upload (Multipart Form, file, is_public, JWT Token)
    API->>API: Decode JWT & fetch user identity
    API->>API: Validate file size (< 100MB)
    API->>API: Validate MIME type (PDF, Images, etc.)
    API->>API: Sanitize name & generate unique key: uploads/<id>/<uuid>_name
    API->>S3: Upload file payload to S3 (boto3 client)
    S3-->>API: Upload success confirmation
    API->>DB: Save metadata (filename, size, mime, s3_key, owner_id)
    DB-->>API: Metadata saved
    API-->>Client: File metadata response (201 Created)
```

### 3. File Download Lifecycle
How downloads are authorized and securely routed, supporting public/private flag states:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant API as FastAPI Backend
    participant DB as Postgres DB
    participant S3 as AWS S3 Storage

    Client->>API: GET /api/files/download/{id} (JWT Token)
    API->>DB: Fetch file metadata by ID
    DB-->>API: Return file details (owner_id, s3_key, is_public)
    
    alt If file is Private
        API->>API: Verify caller is owner of file
    else If file is Public
        API->>API: Allow anonymous access
    end
    
    API->>S3: Generate S3 Presigned URL (1h expiry)
    S3-->>API: Presigned URL string
    API-->>Client: Return download URL JSON (200 OK)
    Client->>S3: Fetch file content directly using URL
    S3-->>Client: Download file payload
```
