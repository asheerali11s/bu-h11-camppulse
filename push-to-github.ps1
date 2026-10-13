# =========================================================================
# Bahria University (H-11 Campus) - GitHub Dual Repository Push Script
# Pushes Repo 1 (Server App) and Repo 2 (Database Vault) to GitHub
# =========================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏛️  BU H-11 CAMPUS PLATFORM - GITHUB DEPLOYMENT WIZARD" -ForegroundColor Yellow
Write-Host "Target Account: https://github.com/asheerali11s" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\ashee\OneDrive\Desktop\BAHRIAEVENTS" }
$vaultPath = Join-Path $rootPath "database-vault"

# 1. PUSH REPO 1: SERVER APPLICATION (bu-h11-camppulse)
Write-Host "🚀 [1/2] Pushing REPO 1 (24/7 Cloud Server: bu-h11-camppulse)..." -ForegroundColor Yellow
Set-Location $rootPath
git branch -M main
try {
    git push -u origin main
    Write-Host "✅ Repo 1 (bu-h11-camppulse) pushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Repo 1 push encountered an issue. Ensure repo exists at https://github.com/asheerali11s/bu-h11-camppulse" -ForegroundColor Red
}

Write-Host ""

# 2. PUSH REPO 2: DATABASE VAULT (bu-h11-database-vault)
Write-Host "🛡️  [2/2] Pushing REPO 2 (Secure Database Vault: bu-h11-database-vault)..." -ForegroundColor Yellow
if (Test-Path $vaultPath) {
    Set-Location $vaultPath
    git branch -M main
    try {
        git push -u origin main
        Write-Host "✅ Repo 2 (bu-h11-database-vault) pushed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Repo 2 push encountered an issue. Ensure repo exists at https://github.com/asheerali11s/bu-h11-database-vault" -ForegroundColor Red
    }
}

Set-Location $rootPath
Write-Host ""
Write-Host "🎉 Deployment script executed." -ForegroundColor Cyan
Write-Host "Next Step: Connect bu-h11-camppulse on https://vercel.com for 24/7 cloud hosting without your laptop running." -ForegroundColor White
