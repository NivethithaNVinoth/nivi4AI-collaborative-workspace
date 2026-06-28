@echo off
echo =====================================================
echo  nivi4AI Collaborative Workspace -- Deploy to GitHub
echo =====================================================
echo.

cd /d "%~dp0"

echo [0/6] Enabling Git long path support...
git config --global core.longpaths true
echo    Done.

echo.
echo [1/6] Installing npm dependencies...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed. Make sure Node.js ^>=18 is installed.
  pause
  exit /b 1
)
echo    Done.

echo.
echo [2/6] Initialising git repository...
git init
git branch -M main
git config user.name "NivethithaNVinoth"
git config user.email "nivi.n.samy@gmail.com"
git config core.longpaths true
echo    Done.

echo.
echo [3/6] Staging all files...
git add .
if errorlevel 1 (
  echo ERROR: git add failed. This usually means the folder path is too long.
  echo FIX: Copy this folder to a shorter path e.g. C:\Users\ADMIN\Desktop\nivi4ai-collab
  echo      then run deploy.bat from there.
  pause
  exit /b 1
)
echo    Done.

echo.
echo [4/6] Committing...
git commit -m "feat: AI-native collaborative workspace -- meta agent + domain agents + skills"
echo    Done.

echo.
echo [5/6] Pushing to GitHub...
echo    NOTE: You must have created the repo on GitHub first:
echo    https://github.com/new  name: nivi4AI-collaborative-workspace
echo.
git remote remove origin 2>nul
git remote add origin https://github.com/NivethithaNVinoth/nivi4AI-collaborative-workspace.git
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. If you see an authentication error:
  echo 1. Go to https://github.com/settings/tokens/new
  echo 2. Create a token with 'repo' scope
  echo 3. Run:
  echo    git remote set-url origin https://YOUR_TOKEN@github.com/NivethithaNVinoth/nivi4AI-collaborative-workspace.git
  echo    git push -u origin main
  pause
  exit /b 1
)

echo.
echo =====================================================
echo  SUCCESS!
echo  Your repo: https://github.com/NivethithaNVinoth/nivi4AI-collaborative-workspace
echo =====================================================
pause
