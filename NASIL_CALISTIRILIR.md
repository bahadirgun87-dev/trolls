# Sesli İletişim Uygulaması - Çalıştırma Kılavuzu

## Uygulamayı Başlatma

### En Basit Yöntem
1. `start-app.bat` dosyasına çift tıklayın
2. Uygulama otomatik olarak başlayacaktır

### start-app.bat Ne Yapar?
- Gerekli tüm bağımlılıkları kontrol eder ve eksik olanları yükler
- Signaling server'ı arka planda başlatır
- Vite dev server'ı başlatır
- Electron uygulamasını açar

## Özellikler

✅ **1. Yerel Ses Girişi/Çıkışı**
- Mikrofon ve hoparlör cihazlarını seçebilirsiniz
- Ses seviyelerini görüntüleyebilirsiniz

✅ **2. P2P Ses İletişimi**
- WebRTC kullanarak direkt bağlantı
- Opus codec ile yüksek kaliteli ses

✅ **3. Kullanıcı Durumları**
- Online/Offline durumları
- Aktif konuşma göstergeleri

✅ **4. Tray Icon**
- Sistem tepsisinde çalışır
- Hızlı erişim menüsü

✅ **5. Push-to-Talk**
- Tuşa basılı tutarak konuşma
- Varsayılan: Space tuşu

✅ **6. Güncelleme Sistemi**
- Otomatik güncelleme kontrolü
- Bildirimler ile güncelleme

## Manuel Çalıştırma (Geliştiriciler İçin)

Eğer manuel olarak çalıştırmak isterseniz:

```bash
# 1. Signaling server'ı başlat
cd signaling-server
npm install
node server.js

# 2. Yeni bir terminal aç ve uygulamayı başlat
cd ..
npm install
npm run dev
```

## Sorun Giderme

### Beyaz Ekran Görüyorsanız
- `start-app.bat` dosyasını kullandığınızdan emin olun
- Terminal çıktısında hata mesajlarını kontrol edin

### Ses Gelmiyor
- Tarayıcı/uygulama mikrofon izinlerini kontrol edin
- Doğru ses cihazlarının seçildiğinden emin olun

### Bağlantı Kurulamıyor
- Signaling server'ın çalıştığından emin olun (http://localhost:3001)
- Güvenlik duvarı ayarlarını kontrol edin

## Teknik Detaylar

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Electron + Node.js
- **Signaling**: WebSocket server
- **Ses**: WebRTC + Opus codec
- **Port**: Client (3000), Signaling Server (3001)
