param(
  [int]$Port = 3000,
  [int]$Seconds = 90
)
$deadline = (Get-Date).AddSeconds($Seconds)
while ((Get-Date) -lt $deadline) {
  try {
    $c = New-Object System.Net.Sockets.TcpClient
    $c.Connect("127.0.0.1", $Port)
    $c.Close()
    exit 0
  }
  catch {
    Start-Sleep -Milliseconds 500
  }
}
exit 1
