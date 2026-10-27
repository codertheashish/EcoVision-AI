import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.endpoints import router
from app.core.config import settings
from app.services.classifier import classifier_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s - %(message)s")
logger = logging.getLogger("ecovision.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model exactly once when the server starts.
    classifier_service.load()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Waste image classification API (MobileNetV2) with recycling guidance.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Explicit origins only (no "*"). Set CORS_ORIGINS to your real Vercel URL in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=False,  # no cookies are used, so credentials are not needed
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s", request.url.path, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


app.include_router(router)


@app.get("/", include_in_schema=False)
async def root():
    return {
        "project": "EcoVision AI",
        "documentation": "/docs",
        "health_check": "/health",
        "predict_endpoint": f"{settings.API_V1_STR}/predict",
    }


if __name__ == "__main__":
    import uvicorn

    # Local convenience only. On Render use the start command from render.yaml.
    uvicorn.run("app.main:app", host="127.0.0.1", port=int(os.getenv("PORT", "8000")))
