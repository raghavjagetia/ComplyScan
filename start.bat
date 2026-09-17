@echo off
title ComplyScan — Legal Metrology Compliance Engine (SIH 2026)
echo ============================================================
echo   COMPLYSCAN — LEGAL METROLOGY COMPLIANCE ENGINE (SIH26034)
echo   Team: KO_KRAKENS
echo ============================================================
echo.

cd /d "%~dp0"
.\venv\Scripts\python.exe run_app.py

pause
