import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.api.middleware.request_logger import RequestLoggerMiddleware
from app.api.exceptions.handlers import register_exception_handlers

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    """Startup and shutdown events."""
    logger.info("Starting OptiObra Intelligence Engine...")
    logger.info("Model warm-up would happen here (skipped in dev)")
    yield
    logger.info("Shutting down OptiObra Intelligence Engine...")


def create_app() -> FastAPI:
    settings = get_settings()

    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.add_middleware(RequestLoggerMiddleware)

    register_exception_handlers(application)

    from app.api.routes.health import router as health_router
    from app.api.routes.reports import router as reports_router
    from app.api.routes.assistant import router as assistant_router

    application.include_router(health_router, prefix=settings.API_V1_PREFIX)
    application.include_router(reports_router, prefix=settings.API_V1_PREFIX)
    application.include_router(assistant_router, prefix=settings.API_V1_PREFIX)

    return application


app = create_app()
