@echo off
chcp 65001 >nul
title PHAN MEM QUAN LY THU VIEN - DE TAI 1.1 CNPM (DESKTOP APP MODE)
echo ====================================================================
echo   DANG KHOI DONG PHAN MEM QUAN LY THU VIEN (CHE DO UNG DUNG DESKTOP)
echo ====================================================================

set "APP_PATH=%~dp0index.html"

:: Mo bang Microsoft Edge hoac Google Chrome o che do App Window (Giong phan mem .exe doc lap)
where msedge >nul 2>nul
if %errorlevel%==0 (
    start "" msedge --app="file:///%APP_PATH:\=/%" --start-maximized
    exit
)

where chrome >nul 2>nul
if %errorlevel%==0 (
    start "" chrome --app="file:///%APP_PATH:\=/%" --start-maximized
    exit
)

start "" "%APP_PATH%"
