param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\backups")
)

$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Missing backend/.env; cannot read DATABASE_URL."
}

$databaseLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1
if (-not $databaseLine) {
    throw "DATABASE_URL is missing from backend/.env."
}

$databaseUrl = $databaseLine.Substring('DATABASE_URL='.Length)
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
    throw "pg_dump is not on PATH. Install PostgreSQL client tools first."
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = Join-Path $OutputDirectory "threatlens-$timestamp.dump"
& $pgDump.Source --format=custom --file=$backupFile $databaseUrl
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL backup failed." }
Write-Output "Backup created: $backupFile"
