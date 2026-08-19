# Installation Guide

## Introduction

This document explains the steps required to install and set up the ThreatLens AI system in a local development environment.

---

# System Requirements

## Hardware Requirements

- Processor: Intel Core i5 or higher
- RAM: 8 GB (16 GB Recommended)
- Storage: 20 GB Free Disk Space

---

## Software Requirements

- Windows 10/11 or Linux
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Git
- Visual Studio Code
- Docker (Optional)

---

# Installation Steps

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/threatlens-ai.git
cd threatlens-ai
```

---

## Step 2: Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

---

## Step 3: Frontend Setup

```bash
cd frontend
npm install
```

---

## Step 4: Configure Database

- Install PostgreSQL.
- Create a new database named **threatlens_ai**.
- Update the database connection details in the `.env` file.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=threatlens_ai
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Step 5: Configure Environment Variables

Create a `.env` file and configure:

```env
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
MODEL_PATH=models/lightgbm_model.pkl
DATABASE_URL=postgresql://postgres:password@localhost:5432/threatlens_ai
```

---

## Step 6: Run the Backend

```bash
uvicorn app.main:app --reload
```

or

```bash
python app.py
```

---

## Step 7: Run the Frontend

```bash
npm run dev
```

---

## Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

Backend API:

```
http://localhost:8000
```

---

# Verification

After successful installation:

- Login page loads successfully.
- Backend API is accessible.
- Database connection is established.
- File upload module is operational.
- Dashboard is displayed after login.

---

# Troubleshooting

| Issue | Solution |
|--------|----------|
| Database connection failed | Verify PostgreSQL is running and check `.env` configuration. |
| Backend not starting | Install required Python packages using `pip install -r requirements.txt`. |
| Frontend not loading | Run `npm install` and restart the development server. |
| API connection failed | Verify backend server is running on the configured port. |

---

# Installation Summary

The ThreatLens AI platform is ready for use after completing the installation, configuring the database, setting environment variables, and starting both the frontend and backend services.