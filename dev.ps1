# dev.ps1 - start every part of the NewsTRNT stack in development
# run this from the repo root with PowerShell (ExecutionPolicy may require "RemoteSigned").
# each service/app opens in its own window so you can see logs independently.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$entries = @(
    @{Path = "apps\user-frontend";      Cmd = "npm run dev"},
    @{Path = "apps\admin-frontend";     Cmd = "npm run dev"},
    @{Path = "services\user-backend";   Cmd = "npm run dev"},
    @{Path = "services\admin-backend";  Cmd = "npm run dev"},
    @{Path = "services\content-engine"; Cmd = "& .\.venv\Scripts\Activate; python main.py"}
)

foreach ($e in $entries) {
    $fullPath = Join-Path $scriptDir $e.Path
    # wrap the entire sequence in a scriptblock (`& { ... }`) and quote the
    # path with single quotes to avoid any splitting on spaces. This is more
    # reliable than trying to escape embedded quotes manually.
    $cmdString = "& { Set-Location -LiteralPath '$fullPath'; $($e.Cmd) }"
    Start-Process powershell -ArgumentList @(
        '-NoExit',
        '-Command',
        $cmdString
    )
}

Write-Host "Launched development windows for all services." -ForegroundColor Green
