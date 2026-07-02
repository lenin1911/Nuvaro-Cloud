# Setup and Deployment Guide

This guide details how to configure AWS infrastructure, manage environment variables, run the application locally (with or without Docker), and deploy it to production.

---

## AWS Cloud Infrastructure Configuration

### 1. Creating the AWS S3 Bucket
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **S3 (Simple Storage Service)** and click **Create bucket**.
3. Set the **Bucket name** (e.g., `my-cloud-storage-bucket`) and select your target AWS **Region** (e.g., `us-east-1`).
4. Keep **Block all public access** enabled. Our backend handles file download URLs securely by generating temporary, secure **Presigned S3 URLs**, keeping your raw bucket storage private.
5. Leave other settings as default and click **Create bucket**.

### 2. Configuring IAM Credentials
To allow the FastAPI backend to read and write files to your S3 bucket, configure an IAM user:
1. Navigate to the **IAM (Identity and Access Management)** console.
2. Click **Users** -> **Add users**.
3. Name your user (e.g., `cloud-storage-api-user`) and click **Next**.
4. Choose **Attach policies directly** and click **Create policy**.
5. Switch to the **JSON** tab and paste the following policy (replace `my-cloud-storage-bucket` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3BucketAccess",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::my-cloud-storage-bucket",
                "arn:aws:s3:::my-cloud-storage-bucket/*"
            ]
        }
    ]
}
```
6. Name the policy (e.g., `CloudStorageS3Policy`) and click **Create policy**.
7. Return to the user creation tab, search for your new policy, attach it, and click **Next** -> **Create user**.
8. Select the created user, navigate to **Security credentials**, and click **Create access key** (choose *Application running outside AWS*).
9. Save the generated **Access Key ID** and **Secret Access Key** safely.

---

## Environment Variables Reference

Create a `.env` file inside your `backend/` directory to configure the service.

| Variable Name | Description | Default Value / Example |
| :--- | :--- | :--- |
| `SECRET_KEY` | JWT secret signing key | `supersecretkeychangeinproduction` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| JWT session duration in minutes | `1440` (24 hours) |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `sqlite:///./cloudstorage.db` |
| `AWS_ACCESS_KEY_ID` | AWS API IAM access key | *Leave empty to use local filesystem* |
| `AWS_SECRET_ACCESS_KEY` | AWS API IAM secret key | *Leave empty to use local filesystem* |
| `AWS_REGION` | AWS S3 datacenter region | `us-east-1` |
| `AWS_S3_BUCKET` | Name of AWS S3 Bucket | `cloud-storage-bucket` |
| `AWS_S3_ENDPOINT_URL` | S3 endpoint URL (for LocalStack testing) | *Leave empty in production* |

---

## Running Locally

### Option A: Running with Docker Compose (Recommended)
This runs the entire app stack, including a mock S3 bucket (LocalStack) and PostgreSQL database.

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and ensure it is running.
2. Open terminal in the project root folder.
3. Run the following command:
   ```bash
   docker compose up --build
   ```
4. Access the web app at:
   - Frontend: [http://localhost](http://localhost) (Port 80)
   - Backend API Docs: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
   - LocalStack S3 Endpoint: [http://localhost:4566](http://localhost:4566)

### Option B: Local Standalone Development (No Docker)
You can run the backend and frontend separately directly on your system.

**1. Run Backend (SQLite Fallback):**
```bash
cd backend
python -m venv venv
# Windows activate:
venv\Scripts\activate
# macOS/Linux activate:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

**2. Run Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Deployment to AWS

### Deploying the Backend (ECS / Fargate / EC2)
1. **Dockerize**: Build your backend docker image and push it to AWS ECR (Elastic Container Registry):
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t cloud-backend ./backend
   docker tag cloud-backend:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-backend:latest
   docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloud-backend:latest
   ```
2. **Database**: Spin up an **AWS RDS PostgreSQL** instance in a private VPC subnet.
3. **Compute**: Create an **AWS ECS Fargate Task Definition** using the pushed image, setting env variables (connecting to RDS and S3, without custom endpoint URLs).
4. **Access**: Place the ECS service behind an **Application Load Balancer (ALB)** with an SSL certificate to expose the backend over `https://api.yourdomain.com`.

### Deploying the Frontend (S3 + CloudFront CDN)
1. Build the production React bundle:
   ```bash
   cd frontend
   # Set VITE_API_URL pointing to backend ALB HTTPS domain
   echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production
   npm run build
   ```
2. Upload contents of the `dist/` directory to an AWS S3 bucket configured for static web hosting.
3. Set up an **AWS CloudFront Distribution** pointing to your frontend S3 bucket as origin.
4. Configure CloudFront custom error responses to redirect `404` errors back to `/index.html` with a `200 OK` code (crucial for supporting React Router client-side routing).
5. Expose the distribution via your custom domain `https://yourdomain.com`.
