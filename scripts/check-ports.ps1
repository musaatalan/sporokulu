Write-Host ""
$a = (Test-NetConnection -ComputerName 127.0.0.1 -Port 8020 -WarningAction SilentlyContinue).TcpTestSucceeded
$w = (Test-NetConnection -ComputerName 127.0.0.1 -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded
Write-Host ("   API  (8020): " + $a)
Write-Host ("   Web  (3000): " + $w)
Write-Host ""
if (-not $w) {
  Write-Host "   HATA: 3000 kapali -> tarayici baglanti reddedildi der." -ForegroundColor Yellow
  Write-Host "   Cozum: sporokulu icinde BASLA.bat veya frontend klasorunde npm run dev"
}
if (-not $a) {
  Write-Host "   HATA: 8020 kapali -> giris Failed to fetch olur." -ForegroundColor Yellow
  Write-Host "   Cozum: backend klasorunde uvicorn (BASLA.bat bunu acar)"
}
Write-Host ""
