#!/usr/bin/env python3
"""
Setup script for NewsNerve Scraper-AI module
Handles dependency installation with fallbacks for problematic packages
"""

import subprocess
import sys
import os

def run_command(command, description=""):
    """Run a command and handle errors gracefully"""
    print(f"Running: {description or command}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {description}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {description}")
        print(f"Error: {e.stderr}")
        return False

def install_package_with_fallback(primary_package, fallback_package=None, description=""):
    """Try to install a package, with fallback option"""
    print(f"\n📦 Installing {description or primary_package}...")
    
    if run_command(f"pip install {primary_package}", f"Installing {primary_package}"):
        return True
    
    if fallback_package:
        print(f"🔄 Trying fallback: {fallback_package}")
        return run_command(f"pip install {fallback_package}", f"Installing {fallback_package}")
    
    return False

def main():
    """Main setup function"""
    print("🚀 Setting up NewsNerve Scraper-AI Environment")
    print("=" * 50)
    
    # Upgrade pip first
    run_command("python -m pip install --upgrade pip", "Upgrading pip")
    
    # Core packages that should install without issues
    core_packages = [
        "requests",
        "beautifulsoup4", 
        "feedparser",
        "aiohttp",
        "python-dotenv",
        "pandas",
        "numpy",
        "scikit-learn",
        "nltk",
        "textblob"
    ]
    
    print("\n📋 Installing core packages...")
    for package in core_packages:
        install_package_with_fallback(package)
    
    # Handle problematic packages with fallbacks
    print("\n🔧 Installing database connectivity...")
    if not install_package_with_fallback(
        "psycopg2-binary==2.9.9", 
        "psycopg[binary]", 
        "PostgreSQL adapter"
    ):
        print("⚠️  PostgreSQL adapter installation failed. Using SQLite as fallback.")
        run_command("pip install sqlite3", "Installing SQLite")
    
    # OpenAI with version fallback
    print("\n🤖 Installing AI packages...")
    install_package_with_fallback(
        "openai==1.12.0",
        "openai",
        "OpenAI API client"
    )
    
    # Optional ML packages
    optional_packages = [
        ("transformers", "Hugging Face Transformers"),
        ("torch", "PyTorch"),
        ("spacy", "spaCy NLP"),
        ("newspaper3k", "Newspaper extraction"),
        ("fastapi", "FastAPI framework"),
        ("uvicorn", "ASGI server"),
        ("redis", "Redis client"),
        ("pydantic", "Data validation")
    ]
    
    print("\n📚 Installing optional packages...")
    for package, description in optional_packages:
        install_package_with_fallback(package, description=description)
    
    print("\n✅ Setup complete!")
    print("\n📝 Next steps:")
    print("1. Configure your .env file with API keys")
    print("2. Run: python -c 'import nltk; nltk.download(\"punkt\")'")
    print("3. Test the installation with: python -c 'import requests, bs4, feedparser'")

if __name__ == "__main__":
    main()
