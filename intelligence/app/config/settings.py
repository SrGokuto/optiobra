from __future__ import annotations

from pathlib import Path
from functools import lru_cache

import yaml
from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "OptiObra Intelligence Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    LLAMA_CPP_URL: str = "http://localhost:8080"
    MODEL_NAME: str = "Qwen3-8B"
    CACHE_TTL: int = 600
    REQUEST_TIMEOUT: int = 600
    LOG_LEVEL: str = "INFO"
    USE_MOCK: bool = False

    API_V1_PREFIX: str = "/api/v1"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


def load_model_config() -> dict:
    """Load model configuration from YAML file."""
    config_path = BASE_DIR / "config" / "model.yaml"
    if config_path.exists():
        with open(config_path) as f:
            return yaml.safe_load(f)
    return {
        "model": "Qwen3-8B",
        "quantization": "Q4_K_M",
        "temperature": 0.2,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1,
        "max_tokens": 1200,
        "threads": 24,
        "context_size": 4096,
    }
