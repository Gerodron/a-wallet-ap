# rebuild.ps1
# Powershell script to force rebuild and restart the Wallet Descentralizada environment from scratch

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUYENDO ECOSISTEMA DOCKER DESCENTRALIZADO        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Docker service
Write-Host "[1/5] Verificando estado del motor Docker..." -ForegroundColor Yellow
docker info >$null 2>&1
if ($LastExitCode -ne 0) {
    Write-Error "El motor Docker no se encuentra ejecutandose. Por favor inicie Docker Desktop y vuelva a intentarlo."
    Exit
}
Write-Host "[OK] Docker esta disponible." -ForegroundColor Green

# 2. Shutdown existing containers
Write-Host "[2/5] Deteniendo y limpiando contenedores existentes..." -ForegroundColor Yellow
docker compose down
Write-Host "[OK] Contenedores detenidos correctamente." -ForegroundColor Green

# 3. Pull latest baseline images and force rebuild local images without cache
Write-Host "[3/5] Descargando ultimas versiones de base de datos/colas y compilando codigo limpio (APROVECHANDO CACHE)..." -ForegroundColor Yellow
docker compose pull
docker compose build
docker compose up --force-recreate -d

if ($LastExitCode -ne 0) {
    Write-Error "Fallo al ejecutar la reconstruccion completa de Docker."
    Exit
}
Write-Host "[OK] Contenedores reconstruidos sin cache y levantados en segundo plano." -ForegroundColor Green

# 4. Health Checks loop
Write-Host "[4/5] Validando integridad de los servicios..." -ForegroundColor Yellow
$MaxAttempts = 15
$Attempt = 1
$webRunning = $false
$apiRunning = $false

while ($Attempt -le $MaxAttempts) {
    Write-Host "Intento de comprobacion $Attempt/$MaxAttempts..." -ForegroundColor DarkGray
    
    # Check Web (Next.js)
    if (-not $webRunning) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("127.0.0.1", 3000)
            $tcpClient.Close()
            $webRunning = $true
            Write-Host "[OK] Frontend Next.js disponible en http://localhost:3000" -ForegroundColor Green
        } catch {
            # Silent retry
        }
    }

    # Check API (.NET)
    if (-not $apiRunning) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("127.0.0.1", 8080)
            $tcpClient.Close()
            $apiRunning = $true
            Write-Host "[OK] .NET Web API respondiendo correctamente en http://localhost:8080" -ForegroundColor Green
        } catch {
            # Silent retry
        }
    }

    if ($webRunning -and $apiRunning) {
        break
    }

    Start-Sleep -Seconds 4
    $Attempt++
}

# 5. Final summary
Write-Host ""
if ($webRunning -and $apiRunning) {
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "    RECONSTRUCCION Y VERIFICACION COMPLETADA CON EXITO!  " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "- Frontend accesible en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "- .NET API accesible en: http://localhost:8080" -ForegroundColor Cyan
    Write-Host "- Documentacion Swagger en: http://localhost:8080/swagger/index.html" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "    RECONSTRUCCION FINALIZADA CON COMPROBACIONES PENDIENTES" -ForegroundColor Red
    Write-Host "==========================================================" -ForegroundColor Red
    Write-Host "Algunos contenedores estan tomando mas tiempo del esperado en arrancar."
    Write-Host "Puedes revisar los logs ejecutando: docker compose logs -f"
    Write-Host "==========================================================" -ForegroundColor Red
}
