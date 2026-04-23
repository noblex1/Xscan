# Catchers AI Deployment Guide (Separate Services)

This project is ready to deploy as **3 independent services**:

1. Frontend (Vite React)
2. Backend API (Node/Express + MongoDB)
3. ML Service (FastAPI/Python)

---

## 1) Deploy ML Service first

Deploy directory: `ml-service`

- Build command:
  - `pip install -r requirements.txt && python -m app.train_model`
- Start command:
  - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Environment:
- Optional template: `ml-service/.env.production.example`
- Ensure host provides `PORT` (most platforms do).

After deploy, save:
- `ML_SERVICE_URL=https://<your-ml-service-domain>`

Quick check:
- `GET https://<your-ml-service-domain>/health`

---

## 2) Deploy Backend API

Deploy directory: `backend`

- Build command:
  - `npm install && npm run build`
- Start command:
  - `npm start`

Environment:
- Use `backend/.env.production.example`
- Required:
  - `NODE_ENV=production`
  - `PORT=3000` (or host default)
  - `MONGODB_URI=<your mongo connection string>`
  - `CORS_ORIGIN=https://<your-frontend-domain>`
  - `ML_SERVICE_URL=https://<your-ml-service-domain>`
- Optional:
  - threat intel API keys

After deploy, save:
- `API_BASE_URL=https://<your-backend-domain>`

Quick checks:
- `GET https://<your-backend-domain>/health`
- `GET https://<your-backend-domain>/ready`

---

## 3) Deploy Frontend

Deploy directory: `client`

- Build command:
  - `npm install && npm run build`
- Publish directory:
  - `dist`

Environment:
- Use `client/.env.production.example`
- Required:
  - `VITE_API_BASE_URL=https://<your-backend-domain>`

Important:
- Frontend now throws a clear runtime error in production if `VITE_API_BASE_URL` is missing.

---

## Final wiring checklist

- Backend `ML_SERVICE_URL` points to deployed ML service.
- Backend `CORS_ORIGIN` includes deployed frontend URL.
- Frontend `VITE_API_BASE_URL` points to deployed backend URL.
- MongoDB is reachable from backend host.
- All three health checks succeed.

---

## Existing helper files

- `render.yaml` includes backend + ML service examples.
- `client/.env.example` for local/dev.
- `backend/.env.example` for local/dev.
- `verify-deployment-config.sh` and `test-deployed-ml.sh` are available for additional checks.

---

## Current deployed URLs

- Frontend: `https://catchers-ai.vercel.app`
- Backend: `https://catchers-ai.onrender.com`
- ML service: `https://xscan-hx2f.onrender.com`

Use these values in provider environment variables:

- Frontend `VITE_API_BASE_URL=https://catchers-ai.onrender.com`
- Backend `CORS_ORIGIN=https://catchers-ai.vercel.app`
- Backend `ML_SERVICE_URL=https://xscan-hx2f.onrender.com`
