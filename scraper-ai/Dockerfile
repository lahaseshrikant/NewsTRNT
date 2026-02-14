# ── Scraper AI Service ────────────────────────────────────────────────────────
# Python-based news scraper + AI summarizer for NewsTRNT

FROM python:3.11-slim

LABEL maintainer="NewsTRNT" \
      description="AI-powered news scraping & summarization service"

# System deps for psycopg2, lxml, newspaper3k
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (leverage Docker layer cache)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data needed by the summarizer
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Copy application code
COPY . .

# Environment (override via docker-compose or env file)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Health check — make sure Python is alive and DB reachable
HEALTHCHECK --interval=60s --timeout=10s --retries=3 \
  CMD python -c "import psycopg2, os; psycopg2.connect(os.environ['DATABASE_URL']).close()" || exit 1

# Default: run the full scraping pipeline once, then exit
# For scheduled runs, use docker-compose restart policies or cron
CMD ["python", "pipeline.py"]
