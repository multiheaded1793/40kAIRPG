@echo off
setlocal
cd /d "%~dp0"
node tools\randomizer.js %*
endlocal
