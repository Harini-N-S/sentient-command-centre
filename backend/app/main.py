"""
Rawbank Sentient Command Centre
Operational Fraud Intelligence & Surveillance Platform
-----------------------------------------------------------------------------
FastAPI application orchestrating operational surveillance, deterministic intelligence,
3-tier forensic evidence packets, and graph relationship exploration.
Zero LLM dependencies. Zero raw database rows leaked.
"""

import logging
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.config import settings
from backend.app.routers import (
    health_router,
    overview_router,
    alerts_router,
    transactions_router,
    customers_router,
    devices_router,
    beneficiaries_router,
    entities_router,
    signals_router,
    evaluate_router,
    evidence_router,
    search_router
)

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rawbank_command_centre")

# Initialize FastAPI application
app = FastAPI(
    title="Rawbank Sentient Command Centre API",
    version=settings.app_version,
    description="""
# Rawbank Sentient Command Centre ?" Operational Fraud Surveillance API

Backend API layer powering the **Sentient Command Centre**.
Built on the **Synthetic Banking Database (2,500 records)** and **Deterministic Fraud Intelligence Engine**.

---

### Key Capabilities:
* **Operational Monitoring**: Real-time KPI aggregation, alert triage, transaction ledger, and customer surveillance.
* **Deterministic Rules Engine**: 11 registered forensic rules with mathematical correlation, composite scoring [0-100], and scenario classification.
* **3-Tier Grounded Evidence Dossiers**:
  * **Tier 1: EXACT DATA** (Immutable database records)
  * **Tier 2: CALCULATED** (Deterministic mathematical indicators & scores)
  * **Tier 3: RETRIEVED EVIDENCE** (Graph links, baseline comparisons, auth logs)
* **Zero PII Leakage / Local Demonstration**: Operates 100% locally with synthetic data in compliance with enterprise BFSI guidelines.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"]
)


# -----------------------------------------------------------------------------
# Global Exception Handlers
# -----------------------------------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg") if errors else "Invalid request parameters"
    loc = " -> ".join(str(l) for l in errors[0].get("loc", [])) if errors else "request"

    return JSONResponse(
        status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
        content={
            "detail": f"Validation error at '{loc}': {first_msg}",
            "error_code": "VALIDATION_ERROR",
            "errors": exc.errors(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected internal server error occurred while processing the request.",
            "error_code": "INTERNAL_SERVER_ERROR",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


# -----------------------------------------------------------------------------
# Root Information Endpoint
# -----------------------------------------------------------------------------
@app.get("/", tags=["Root"], summary="API Root Metadata")
def root_info():
    return {
        "service": "Rawbank Sentient Command Centre API",
        "environment": settings.app_env,
        "version": settings.app_version,
        "docs_url": "/docs",
        "health_check": "/api/health",
        "overview": "/api/overview",
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# -----------------------------------------------------------------------------
# Mount Sub-Routers
# -----------------------------------------------------------------------------
app.include_router(health_router)
app.include_router(overview_router)
app.include_router(alerts_router)
app.include_router(transactions_router)
app.include_router(customers_router)
app.include_router(devices_router)
app.include_router(beneficiaries_router)
app.include_router(entities_router)
app.include_router(signals_router)
app.include_router(evaluate_router)
app.include_router(evidence_router)
app.include_router(search_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
