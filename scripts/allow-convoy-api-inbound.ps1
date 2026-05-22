# Opens inbound TCP 8000 so phones on your LAN can reach the FastAPI server.
# Right-click -> Run with PowerShell as Administrator (or: Start-Process powershell -Verb RunAs -Args '-File', $PSCommandPath)

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Write-Error 'Run this script as Administrator.'
  exit 1
}

netsh advfirewall firewall add rule name='ConvoyAPI8000' dir=in action=allow protocol=TCP localport=8000
if ($LASTEXITCODE -eq 0) {
  Write-Host 'Rule ConvoyAPI8000 added. Delete later: netsh advfirewall firewall delete rule name=ConvoyAPI8000'
}
