import pytest
import os
import shutil
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings

# Override settings for testing
TEST_DB_URL = "sqlite:///./test_cloudstorage.db"
settings.DATABASE_URL = TEST_DB_URL
settings.USE_LOCAL_STORAGE = True
settings.LOCAL_STORAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_uploads")

from backend.database.connection import Base, get_db
from backend.main import app

# Create test engine and sessions
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Make sure test upload directory is empty and exists
    if os.path.exists(settings.LOCAL_STORAGE_DIR):
        shutil.rmtree(settings.LOCAL_STORAGE_DIR)
    os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
    
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup DB and uploads after all tests finish
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_DB_URL.replace("sqlite:///", "")):
        os.remove(TEST_DB_URL.replace("sqlite:///", ""))
    if os.path.exists(settings.LOCAL_STORAGE_DIR):
        shutil.rmtree(settings.LOCAL_STORAGE_DIR)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    # Override get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
