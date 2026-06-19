# Doc DNA

Blockchain-backed document verification and tamper detection platform.

## Services
- `backend/`: Express + TypeScript + Prisma API for wallet auth, uploads, verification, audit trails, dashboard data, and Swagger docs.
- `ai-service/`: FastAPI microservice for text extraction, OCR, and tamper comparison.
- `docker-compose.yml`: Boots backend, AI service, and an optional local PostgreSQL container.

## Backend Features
- MetaMask wallet nonce flow with JWT sessions.
- SHA256-based document fingerprinting and SVG-based Document DNA generation.
- Pinata IPFS upload and retrieval integration.
- Polygon Amoy registration and verification through `ethers`.
- Tamper detection for same-filename re-uploads with AI-generated change reports.
- Supabase Realtime broadcasting hooks for upload progress, verification results, tamper detection, dashboard refreshes, and audit events.
- Dashboard, history, settings, and auth APIs.
- Swagger UI at `/api/docs`.

## Quick Start
1. Copy `backend/.env.example` to `backend/.env` and fill in your Supabase, Alchemy, Pinata, JWT, and contract values.
2. Install backend dependencies with `npm install` inside `backend/`.
3. Install AI dependencies with `pip install -r ai-service/requirements.txt`.
4. Run Prisma generate and migrations from `backend/`.
5. Start the backend with `npm run dev` and the AI service with `uvicorn app.main:app --reload --port 8001` from `ai-service/`.

## Docker
```bash
docker compose up --build
```

Use the optional database profile when you want a local PostgreSQL instance:

```bash
docker compose --profile localdb up --build
```

## Important API Paths
- `POST /api/auth/nonce`
- `POST /api/auth/wallet`
- `POST /api/documents/upload`
- `POST /api/documents/verify`
- `GET /api/dashboard/stats`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/recent`
- `GET /api/history`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `POST /api/auth/logout`

## Smart Contract
The Solidity contract lives at `backend/src/contracts/DocumentDNA.sol` and exposes:
- `registerDocument`
- `verifyDocument`
- `getDocument`
