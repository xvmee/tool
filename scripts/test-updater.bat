@echo off
echo ========================================
echo  Tool - Test Auto-Updater
echo ========================================
echo.
echo Ten skrypt uruchomi aplikacje i sprawdzi
echo czy auto-updater dziala poprawnie.
echo.
echo UWAGA: Wymaga polaczenia z internetem!
echo.
pause

echo.
echo [1/3] Uruchamianie aplikacji...
start "" "npx electron ."

echo.
echo [2/3] Czekam 5 sekund na zaladowanie...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Sprawdz aplikacje:
echo.
echo - Po 3 sekundach od uruchomienia powinno
echo   sprawdzic aktualizacje
echo.
echo - Jezeli jest nowsza wersja na GitHub:
echo   Pokaze sie powiadomienie z przyciskiem
echo   "Pobierz Aktualizacje"
echo.
echo - Jezeli brak nowszej wersji:
echo   Nic sie nie pokaze (normalne)
echo.
echo - Sprawdz Console (DevTools) dla logow:
echo   Prawy klik w aplikacji -^> Inspect Element
echo   -^> Console -^> Szukaj "Checking for update"
echo.
echo ========================================
echo Test zakonczony!
echo ========================================
pause
