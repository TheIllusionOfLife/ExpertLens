"""FastAPI application: health endpoint, CORS middleware, WebSocket session endpoint."""
import logging

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.api.config import settings
from app.api.ws.handler import websocket_session_endpoint

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ExpertLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": settings.gemini_live_model}


@app.websocket("/ws/session/{coach_id}")
async def ws_session(websocket: WebSocket, coach_id: str) -> None:
    await websocket_session_endpoint(websocket=websocket, coach_id=coach_id)
