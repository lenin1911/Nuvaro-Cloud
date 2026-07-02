# Nuvaro Cloud: Cloud File Storage Web Application

Nuvaro Cloud is a production-quality, secure, and responsive Cloud File Storage web application (similar to a simplified Google Drive). It allows users to register, log in, drag-and-drop upload files to AWS S3, organize metadata, preview images/videos/PDFs, search, and securely manage files.

---

## Key Features

- **Authentication**: JWT token-based session auth with password hashing (bcrypt), complete route guards, and profile management.
- **S3 Storage Engine**: Uploads, deletes, and downloads are handled directly via AWS S3 (or LocalStack S3 Emulator for offline development), using temporary secure presigned download URLs.
- **Metadata Management**: File metrics (size, MIME type, public/private flags, UUID mapping) are indexed in PostgreSQL.
- **Premium User Dashboard**: Responsive dashboard displaying storage space indicators, total files count, search engines, and recent upload tables.
- **File Explorer**: Features grid/list view toggles, sort options (size, upload date, name), category filters, and renaming utilities.
- **Direct Inline Previews**: Built-in player and viewers for Images, Videos, and PDF files.
- **Docker Orchestrated**: Multi-container docker compose setup deploying Postgres, LocalStack, FastAPI, and Nginx.

---

## Directory Structure

```
CLOUD/
├── backend/
│   ├── auth/             # JWT auth validation & password hashing
│   ├── database/         # SQLAlchemy engines & sessions
│   ├── models/           # User & File metadata database models
│   ├── schemas/          # Pydantic data serialization schemas
│   ├── services/         # AWS S3 upload/download client actions
│   ├── routers/          # FastAPI API endpoint routers
│   ├── utils/            # Path traversal and rate limit utilities
│   ├── main.py           # FastAPI entrypoint
│   └── tests/            # Pytest test cases
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout elements & Preview Modals
│   │   ├── context/      # AuthContext session provider
│   │   ├── pages/        # React views (Dashboard, My Files, Login)
│   │   └── services/     # Axios api configurations
│   ├── tailwind.config.js# Custom brand themes
│   └── nginx.conf        # Production SPA configuration
├── docs/
│   ├── architecture.md   # Systems diagrams (ER, Architecture, Sequence)
│   └── setup_guide.md    # Deployment and S3 configuring manual
└── docker-compose.yml    # Main stack orchestrator
```

---

## API Endpoints

### 1. Authentication Router
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Register a new user | No |
| `POST` | `/api/login` | Login and obtain JWT access token | No |
| `GET` | `/api/profile` | Retrieve authenticated user profile | **Yes** (Bearer) |

### 2. Files Router
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/files/upload` | Upload file to S3 (Multipart Form) | **Yes** (Bearer) |
| `GET` | `/api/files` | Query files list (supports search, sort, filter) | **Yes** (Bearer) |
| `GET` | `/api/files/stats` | Retrieve dashboard totals and recent uploads | **Yes** (Bearer) |
| `GET` | `/api/files/{id}` | Retrieve specific file details | **Yes** (Bearer) |
| `PUT` | `/api/files/{id}` | Rename file metadata or visibility flag | **Yes** (Bearer) |
| `DELETE`| `/api/files/{id}` | Permanently delete file from S3 and DB | **Yes** (Bearer) |
| `GET` | `/api/files/download/{id}` | Generate temporary presigned download url | **Yes/No** (Public allow) |

---

## Quickstart

### 1. Build and Run via Docker Compose
Ensure you have Docker Desktop running. Run the following command in the root folder:
```bash
docker compose up --build
```
Access the application at:
- **Frontend**: [http://localhost](http://localhost) (Port 80)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

### 2. Running Standalone Local Development
If you do not want to use Docker, you can run services directly using Python and Node. Standard SQLite fallback will trigger automatically.
Please check the detailed **[Setup and Deployment Guide](file:///c:/Users/Lenin/OneDrive/Desktop/CLOUD/docs/setup_guide.md)** for running locally and deploying to AWS.

### 3. Architecture Diagrams
For database structures, component linkages, and access workflow diagrams, check the **[System Architecture Guide](file:///c:/Users/Lenin/OneDrive/Desktop/CLOUD/docs/architecture.md)**.
