@echo off
chcp 65001 >nul
title MAY CHU NODE.JS - PHAN MEM QUAN LY THU VIEN (http://localhost:3000)
echo ====================================================================
echo   KHOI DONG MAY CHU WEB NODE.JS TAI: http://localhost:3000
echo ====================================================================
cd /d "%~dp0"
node server.js
pause
