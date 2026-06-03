@echo off
setlocal
cd /d "%~dp0"
echo ===== BilaKey Core Stable v1.2.2 GitHub Actions Build =====
echo Current directory: %CD%

if not exist app\src\main\java\com\cvnss\bilakey\BilaKeyImeService.java (
  echo ERROR: Source root is wrong. This folder must contain app\src\main\java\com\cvnss\bilakey\BilaKeyImeService.java
  exit /b 1
)

python tools\verify_source.py
if errorlevel 1 exit /b 1

rmdir /s /q .git 2>nul
git init
git config user.name "Long Ngo"
git config user.email "kimphatngogia@gmail.com"
git add .
git commit -m "BilaKey Core Stable v1.2.2"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/CVNSS/BilaKey-Android-IME.git
git push -u origin main --force

for /f "delims=" %%i in ('git rev-parse HEAD') do set LOCAL_SHA=%%i
echo LOCAL_SHA=%LOCAL_SHA%

gh workflow run bilakey-core-stable.yml --repo CVNSS/BilaKey-Android-IME --ref main
ping 127.0.0.1 -n 16 >nul

for /f "delims=" %%i in ('gh run list --repo CVNSS/BilaKey-Android-IME --workflow bilakey-core-stable.yml --limit 1 --json databaseId --jq ".[0].databaseId"') do set RUN_ID=%%i
echo RUN_ID=%RUN_ID%

gh run view %RUN_ID% --repo CVNSS/BilaKey-Android-IME --json headSha --jq ".headSha"
gh run watch %RUN_ID% --repo CVNSS/BilaKey-Android-IME

rmdir /s /q dist 2>nul
mkdir dist
gh run download %RUN_ID% --repo CVNSS/BilaKey-Android-IME -D dist

echo ===== APK OUTPUT =====
dir dist /s
explorer dist
endlocal
