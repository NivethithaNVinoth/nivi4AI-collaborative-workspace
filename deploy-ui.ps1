# deploy-ui.ps1 — Copy rebuilt UI files to Desktop repo and push to GitHub
$src = "C:\Users\ADMIN\AppData\Roaming\Claude\local-agent-mode-sessions\9ea6e1a3-ffda-4eb4-9e1c-90430e1b2acc\0e576301-cd8b-48d3-a5ca-e847e45641fd\local_d4c96c06-554f-4901-821b-5cc37ed7a3c4\outputs\nivi4ai\collaborative-workspace"
$dest = "C:\Users\ADMIN\Desktop\nivi4ai-collab"

Write-Host "=== nivi4AI UI Deploy ===" -ForegroundColor Cyan

# Copy public files
Write-Host "Copying UI files..." -ForegroundColor Yellow
Copy-Item "$src\public\styles.css" "$dest\public\styles.css" -Force
Copy-Item "$src\public\app.js"    "$dest\public\app.js"    -Force
Copy-Item "$src\public\index.html" "$dest\public\index.html" -Force

# Copy src files (server + superAgent already written)
Copy-Item "$src\src\server.mjs"     "$dest\src\server.mjs"     -Force
Copy-Item "$src\src\superAgent.mjs" "$dest\src\superAgent.mjs" -Force

Write-Host "Files copied." -ForegroundColor Green

# Git
Set-Location $dest
git add public/styles.css public/app.js public/index.html src/server.mjs src/superAgent.mjs
git commit -m "feat: streaming super-agent UI — dark theme, SSE, real-time task plan"
git push

Write-Host "`n=== Done! ===" -ForegroundColor Green
Write-Host "Restart the server:  cd $dest && npm start" -ForegroundColor Cyan
Write-Host "Then open:           http://localhost:4000" -ForegroundColor Cyan
