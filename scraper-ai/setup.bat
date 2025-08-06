@echo off
echo ================================
echo NewsNerve Scraper-AI Setup
echo ================================

echo.
echo 🚀 Setting up Python environment...

REM Upgrade pip first
python -m pip install --upgrade pip

echo.
echo 📦 Installing core packages...

REM Install packages one by one to handle failures gracefully
python -m pip install requests
python -m pip install beautifulsoup4
python -m pip install feedparser
python -m pip install aiohttp
python -m pip install python-dotenv
python -m pip install pandas
python -m pip install numpy
python -m pip install scikit-learn
python -m pip install nltk
python -m pip install textblob

echo.
echo 🔧 Installing database connectivity...

REM Try psycopg2-binary first, then fallback
python -m pip install psycopg2-binary || (
    echo ⚠️  psycopg2-binary failed, trying alternative...
    python -m pip install psycopg || (
        echo ⚠️  PostgreSQL adapters failed, installing SQLite support...
        echo SQLite is built into Python, continuing...
    )
)

echo.
echo 🤖 Installing AI packages...
python -m pip install openai

echo.
echo 📚 Installing optional packages...
python -m pip install transformers
python -m pip install fastapi
python -m pip install uvicorn
python -m pip install pydantic

echo.
echo ✅ Installation complete!
echo.
echo 📝 Next steps:
echo 1. Configure your .env file with API keys
echo 2. Run: python -c "import nltk; nltk.download('punkt')"
echo 3. Test with: python -c "import requests, bs4, feedparser; print('✅ All imports successful')"

pause
