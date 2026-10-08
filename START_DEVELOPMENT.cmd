@echo off
cd /d "%~dp0"
where pnpm >nul 2>nul
if errorlevel 1 (
  echo Install Node 24 and pnpm 11.25.0, then retry.
  pause
  exit /b 2
)
call pnpm install --frozen-lockfile
if errorlevel 1 exit /b 2
call pnpm dev
