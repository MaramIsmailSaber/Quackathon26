"""
main.py — FastAPI application entry point.

Wires together routers, Prometheus instrumentation, and JSON logging.
"""

import logging
import sys

from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from pythonjsonlogger.json import JsonFormatter

from app.routers import router

# ── JSON Logging ────────────────────────────────────────────────────
log_handler = logging.StreamHandler(sys.stdout)
log_handler.setFormatter(
    JsonFormatter(
        fmt="%(asctime)s %(name)s %(levelname)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level"},
    )
)

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(log_handler)

logger = logging.getLogger("bank_app")

# ── FastAPI App ─────────────────────────────────────────────────────
app = FastAPI(
    title="Financial Triage API",
    description="Read-only gateway for mock student transaction data (PoC)",
    version="0.1.0",
)

# ── Prometheus Metrics ──────────────────────────────────────────────
Instrumentator().instrument(app).expose(app)

# ── Register Routers ───────────────────────────────────────────────
app.include_router(router)


@app.get("/health", tags=["Infrastructure"])
def health_check():
    return {"status": "ok"}


logger.info("Financial Triage API initialised")
