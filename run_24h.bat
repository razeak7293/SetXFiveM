@echo off
title SET SHOP - 24/7 SERVER
:start
echo [%date% %time%] Starting Set Shop Server...
node server.js
echo [%date% %time%] Server crashed or stopped. Restarting in 5 seconds...
timeout /t 5
goto start
