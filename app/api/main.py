"""FastAPI application: health endpoint, CORS middleware, WebSocket session endpoint."""

import logging
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.api.config import settings
from app.api.routers.coaches import router as coaches_router
from app.api.routers.preferences import router as preferences_router
from app.api.routers.sessions import router as sessions_router
from app.api.ws.handler import websocket_session_endpoint

# Use JSON structured logging on Cloud Run (K_SERVICE is set by the Cloud Run runtime).
if os.getenv("K_SERVICE"):
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter(
            fmt='{"severity":"%(levelname)s","message":"%(message)s","logger":"%(name)s"}'
        )
    )
    logging.root.handlers = [_handler]
    logging.root.setLevel(logging.INFO)
else:
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    yield
    # Close the Firestore client on shutdown to release gRPC channels.
    try:
        from app.api.db.firestore import get_client

        await get_client().close()
    except Exception:
        pass


app = FastAPI(title="ExpertLens API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(coaches_router)
app.include_router(preferences_router)
app.include_router(sessions_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "model": settings.gemini_live_model}


@app.websocket("/ws/session/{coach_id}")
async def ws_session(websocket: WebSocket, coach_id: str) -> None:
    await websocket_session_endpoint(websocket=websocket, coach_id=coach_id)
