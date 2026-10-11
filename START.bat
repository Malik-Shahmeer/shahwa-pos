@echo off
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  🍗 SHAHWA POS SOLUTION - STARTING...           ║
echo ╠══════════════════════════════════════════════════╣
echo ║  Installing dependencies...                     ║
echo ╚══════════════════════════════════════════════════╝
echo.
call npm install
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  ✅ STARTING POS SYSTEM...                      ║
echo ║                                                  ║
echo ║  Browser kholega automatically!                  ║
echo ║  Ya manually kholega: http://localhost:3000      ║
echo ║                                                  ║
echo ║  Band karne ke liye: CTRL+C dabao               ║
echo ╚══════════════════════════════════════════════════╝
echo.
start http://localhost:3000
call node server.js
pause