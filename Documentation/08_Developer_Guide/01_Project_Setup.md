# Project Setup Guide

## Introduction

This guide explains how developers can set up the ThreatLens AI project for local development and testing.

---

# Prerequisites

Install the following software before setting up the project:

- Git
- Python 3.10 or later
- Node.js 18 or later
- PostgreSQL
- Visual Studio Code
- Docker (Optional)

---

# Clone the Repository

```bash
git clone https://github.com/your-username/threatlens-ai.git
cd threatlens-ai
```

---

# Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

or

```bash
python app.py
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Database Setup

Create a PostgreSQL database named:

```
threatlens_ai
```

Update the `.env` file with the correct database credentials.

---

# Environment Variables

Create a `.env` file with the following values:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/threatlens_ai
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret
MODEL_PATH=models/lightgbm_model.pkl
```

---

# Verify Installation

Ensure the following services are running:

- Frontend
- Backend
- PostgreSQL Database

Open:

```
Frontend : http://localhost:5173

Backend : http://localhost:8000
```

---

# Project Dependencies

## Frontend

- React.js
- Tailwind CSS
- Axios

## Backend

- FastAPI / Flask
- SQLAlchemy
- JWT
- Uvicorn

## Machine Learning

- LightGBM
- Scikit-learn
- Pandas
- NumPy

## Security

- YARA
- pefile

---

# Project Setup Workflow

1. Clone Repository
2. Install Backend Dependencies
3. Install Frontend Dependencies
4. Configure Database
5. Configure Environment Variables
6. Start Backend Server
7. Start Frontend Server
8. Verify Application

---

# Summary

Following the above steps will prepare the ThreatLens AI project for development, testing, and future enhancements.