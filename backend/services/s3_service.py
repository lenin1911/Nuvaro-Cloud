import os
import shutil
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from backend.config import settings

class S3Service:
    def __init__(self):
        self.use_local = settings.USE_LOCAL_STORAGE
        self.bucket_name = settings.AWS_S3_BUCKET
        
        if not self.use_local:
            try:
                # AWS S3 setup (or LocalStack if endpoint_url is set)
                session_opts = {}
                if settings.AWS_ACCESS_KEY_ID:
                    session_opts["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
                if settings.AWS_SECRET_ACCESS_KEY:
                    session_opts["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
                if settings.AWS_REGION:
                    session_opts["region_name"] = settings.AWS_REGION

                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=settings.AWS_S3_ENDPOINT_URL,
                    **session_opts
                )
                # Try to create the bucket if using LocalStack or if custom config allows
                # Typically in real S3 the bucket should already exist, but for LocalStack it helps
                if settings.AWS_S3_ENDPOINT_URL:
                    try:
                        self.s3_client.create_bucket(Bucket=self.bucket_name)
                    except Exception:
                        pass
            except Exception as e:
                print(f"Failed to initialize S3 client. Falling back to local storage. Error: {e}")
                self.use_local = True

        if self.use_local:
            os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
            print(f"Using local storage at: {settings.LOCAL_STORAGE_DIR}")

    def upload_file(self, file_obj, s3_key: str) -> str:
        """
        Uploads a file object to S3 or saves it locally.
        Returns the key.
        """
        if self.use_local:
            local_path = os.path.join(settings.LOCAL_STORAGE_DIR, s3_key)
            # Create subdirectories if necessary (e.g. user-specific subdirs)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, "wb") as buffer:
                shutil.copyfileobj(file_obj, buffer)
            return s3_key
        else:
            try:
                self.s3_client.upload_fileobj(file_obj, self.bucket_name, s3_key)
                return s3_key
            except ClientError as e:
                raise HTTPException(status_code=500, detail=f"S3 Upload failed: {e}")

    def delete_file(self, s3_key: str) -> bool:
        """
        Deletes file from S3 or local storage.
        """
        if self.use_local:
            local_path = os.path.join(settings.LOCAL_STORAGE_DIR, s3_key)
            if os.path.exists(local_path):
                os.remove(local_path)
                return True
            return False
        else:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)
                return True
            except ClientError as e:
                raise HTTPException(status_code=500, detail=f"S3 Delete failed: {e}")

    def generate_download_url(self, s3_key: str, filename: str) -> str:
        """
        Generates a URL to download the file.
        In S3 mode, this returns a presigned URL.
        In local mode, this points to a local route that streams the file.
        """
        if self.use_local:
            # Returns a relative backend URL to stream the file
            return f"/api/files/download-local/{s3_key}?filename={filename}"
        else:
            try:
                # Generate presigned GET URL
                response = self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": self.bucket_name,
                        "Key": s3_key,
                        "ResponseContentDisposition": f"attachment; filename=\"{filename}\""
                    },
                    ExpiresIn=3600 # 1 hour expiry
                )
                return response
            except ClientError as e:
                raise HTTPException(status_code=500, detail=f"Generating download URL failed: {e}")

    def get_local_file_path(self, s3_key: str) -> str:
        """
        Returns path to file in local mode.
        """
        if self.use_local:
            return os.path.join(settings.LOCAL_STORAGE_DIR, s3_key)
            
        raise ValueError("Cannot retrieve local path in S3 mode")

s3_service = S3Service()
