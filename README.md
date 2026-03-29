# Geospatial Wealth Estimation Platform

This repository contains the full-stack codebase for the AI-driven Wealth Estimation Platform designed for government policy customization.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, React-Leaflet (Map visualization).
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL + PostGIS, JWT Auth.
- **AI Processing**: PyTorch inference running asynchronously via Celery & Redis.
- **Storage**: MinIO / S3 for image uploads and EXIF metadata handling.

## How to Run the Project (Step-by-Step)

### 1. Manual Local Development

If you prefer to run the project locally without Docker, follow these steps:

**Backend (FastAPI)**
Open a terminal and run:
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install the Python dependencies
pip install -r requirements.txt

# Start the FastAPI development server
python -m uvicorn main:app --reload
```
The FastAPI documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

**Frontend (Next.js)**
Open a new terminal window and run:
```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Start the Next.js development server
npm run dev
```
The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

### 2. Local MVP Deployment via Docker

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Start the macro-services via Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. **Access Services:**
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **FastAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **MinIO Dashboard**: [http://localhost:9001](http://localhost:9001)

### AI Model Integration

In `backend/app/ai/wealth_estimator.py`, there is a dummy implementation wrapping a randomly initialized payload generator. To deploy real weights:
1. Save your `PyTorch` / `ONNX` weights locally.
2. Update the `.env` `MODEL_WEIGHTS_PATH` variable.
3. Uncomment the load instructions in the `WealthEstimator` constructor.

## Folder Structure

- `/backend`: Core Python REST API, PyTorch inference pipeline, Database ORM.
- `/frontend`: Next.js 14 App Router dashboard with Mapbox/Leaflet UI.
- `/infrastructure`: Database initialization and spatial extensions.
