# ─────────────────────────────────────────────
# Content Engine  •  NewsTRNT Platform
# ─────────────────────────────────────────────
FROM python:3.11-slim AS base

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gcc && \
    rm -rf /var/lib/apt/lists/*

# Python deps (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Data directory for dedup cache
RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1
ENV ENGINE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000

# API key used by admin-backend and other callers. Must be set at runtime
ENV ENGINE_API_KEY=""

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
