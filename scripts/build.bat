@echo off
echo ========================================
echo    TOOL - Building Installer
echo    Version 2.1.0
echo    tooltech.pl
echo ========================================
echo.

echo [1/3] Cleaning old builds...
if exist dist rmdir /s /q dist
mkdir dist
echo      Done!
echo.

echo [2/3] Building with electron-builder...
echo      This may take a few minutes...
echo.
call npm run build:win
echo      Done!
echo.

echo [3/3] Build complete!
echo.
echo ========================================
echo    Installer Location:
echo    %CD%\dist\
echo ========================================
echo.
echo Files created:
dir /b dist\*.exe 2>nul
echo.

pause
