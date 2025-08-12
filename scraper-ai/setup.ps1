# NewsTRNT Scraper-AI Setup Script for Windows PowerShell
# This script installs Python dependencies with fallback options

Write-Host "================================" -ForegroundColor Green
Write-Host "NewsTRNT Scraper-AI Setup" -ForegroundColor Green  
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Setting up Python environment..." -ForegroundColor Yellow

# Function to install package with error handling
function Install-Package {
    param(
        [string]$PackageName,
        [string]$FallbackPackage = "",
        [string]$Description = ""
    )
    
    $displayName = if ($Description) { $Description } else { $PackageName }
    Write-Host "📦 Installing $displayName..." -ForegroundColor Cyan
    
    try {
        & python -m pip install $PackageName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully installed $displayName" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "❌ Failed to install $PackageName" -ForegroundColor Red
    }
    
    if ($FallbackPackage) {
        Write-Host "🔄 Trying fallback: $FallbackPackage..." -ForegroundColor Yellow
        try {
            & python -m pip install $FallbackPackage
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Successfully installed $FallbackPackage" -ForegroundColor Green
                return $true
            }
        }
        catch {
            Write-Host "❌ Fallback also failed for $displayName" -ForegroundColor Red
        }
    }
    
    return $false
}

# Upgrade pip first
Write-Host "📈 Upgrading pip..." -ForegroundColor Cyan
& python -m pip install --upgrade pip

Write-Host ""
Write-Host "📋 Installing core packages..." -ForegroundColor Yellow

# Core packages
$corePackages = @(
    @("requests", "", "HTTP requests library"),
    @("beautifulsoup4", "", "Web scraping library"),
    @("feedparser", "", "RSS/Atom feed parser"),
    @("aiohttp", "", "Async HTTP client"),
    @("python-dotenv", "", "Environment variables"),
    @("pandas", "", "Data manipulation"),
    @("numpy", "", "Numerical computing"),
    @("scikit-learn", "", "Machine learning"),
    @("nltk", "", "Natural language processing"),
    @("textblob", "", "Text processing")
)

foreach ($package in $corePackages) {
    Install-Package -PackageName $package[0] -FallbackPackage $package[1] -Description $package[2]
}

Write-Host ""
Write-Host "🔧 Installing database connectivity..." -ForegroundColor Yellow

# Database packages with fallbacks
$dbSuccess = Install-Package -PackageName "psycopg2-binary==2.9.9" -FallbackPackage "psycopg[binary]" -Description "PostgreSQL adapter"

if (-not $dbSuccess) {
    Write-Host "⚠️  PostgreSQL adapters failed. SQLite support is built into Python." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🤖 Installing AI packages..." -ForegroundColor Yellow

# AI packages
Install-Package -PackageName "openai" -Description "OpenAI API client"

Write-Host ""
Write-Host "📚 Installing optional packages..." -ForegroundColor Yellow

# Optional packages
$optionalPackages = @(
    @("transformers", "", "Hugging Face Transformers"),
    @("fastapi", "", "FastAPI framework"),
    @("uvicorn", "", "ASGI server"),
    @("pydantic", "", "Data validation"),
    @("redis", "", "Redis client"),
    @("newspaper3k", "", "Article extraction")
)

foreach ($package in $optionalPackages) {
    Install-Package -PackageName $package[0] -FallbackPackage $package[1] -Description $package[2]
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure your .env file with API keys" -ForegroundColor White
Write-Host "2. Run: python -c `"import nltk; nltk.download('punkt')`"" -ForegroundColor White
Write-Host "3. Test with: python -c `"import requests, bs4, feedparser; print('✅ All imports successful')`"" -ForegroundColor White

Write-Host ""
Write-Host "🔧 To run the scraper:" -ForegroundColor Yellow
Write-Host "cd scraper-ai" -ForegroundColor White
Write-Host "python pipeline.py" -ForegroundColor White

Read-Host "Press Enter to continue..."
