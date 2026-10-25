@echo off
title Servidor Local - Pacote Landing Page (RMTI)
echo ================================================================
echo   Iniciando Servidor do Pacote All-in-One de Landing Page...
echo ================================================================
echo.
echo Abrindo navegador em: http://localhost:3001
start http://localhost:3001
echo.
node server.js
pause

