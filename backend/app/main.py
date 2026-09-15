from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app import models
from app.api.database_test import router as database_router
from app.api.v1.auth import router as auth_router
from app.api.v1 import chat
from app.api.v1 import auth
from app.api.v1 import insights
from app.api.v1 import datasets
from app.api.v1 import ai
from app.api.v1 import profiling
from app.core.config import settings



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)


# ============================================================
# CORS
# ============================================================

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    database_router,
)


app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    chat.router,
    prefix="/api/v1",
)

app.include_router(
    datasets.router,
    prefix="/api/v1",
)

app.include_router(
    profiling.router,
    prefix="/api/v1",
)

app.include_router(insights.router, prefix="/api/v1")

app.include_router(ai.router, prefix="/api/v1")

# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
    }