Spor Okulu - Android WebView kabugu
==================================

Next.js web uygulamasi tek basina APK degildir; bu proje tam ekran WebView ile
sitenizi acar.

APK indir (Android Studio sart degil)
-------------------------------------
GitHub repo: Actions sekmesi -> "Android debug APK" is akisi -> son calismada
"sporokulu-debug-apk" artifact -> app-debug.apk indir.

Yerelde derlemek icin
---------------------
1) Android Studio (Hedgehog+) kurun.
2) File -> Open -> bu "android" klasorunu secin.
3) Gradle sync bittikten sonra: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
4) app_url: app/src/main/res/values/strings.xml icinde degistirin.
   - Emulator + PC'de Next.js: http://10.0.2.2:3000/giris
   - Gercek telefon + ayni WiFi: http://BILGISAYAR_IP:3000/giris
   - Canli yayin: https://sizin-frontend-adresiniz/giris (HTTPS onerilir)

API adresi frontend .env ile ayarlanir; telefonda backend'e erisim icin
NEXT_PUBLIC_API_URL olarak PC IP:8020 veya sunucu URL kullanin.
