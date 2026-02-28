
param(
    [string]$ProxyHost = "127.0.0.1",
    [int]$Port = 9050,
    [switch]$Enable,
    [switch]$Disable
)

$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"


if ($Enable) {
    $proxyServer = "socks=$ProxyHost`:$Port"
    Set-ItemProperty -Path $regPath -Name ProxyServer -Value $proxyServer
    Set-ItemProperty -Path $regPath -Name ProxyEnable -Value 1
    Write-Host "Proxy activé : $proxyServer"
}

if ($Disable) {
    Set-ItemProperty -Path $regPath -Name ProxyEnable -Value 0
    Write-Host "Proxy désactivé"
}