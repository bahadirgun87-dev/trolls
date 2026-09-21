# Sesli İletişim Platformu

Discord benzeri, kayıpsız ses iletimi, ekran paylaşımı ve chat özellikleri sunan masaüstü sesli iletişim uygulaması.

## Özellikler

1. ✅ **Lokal Kurulum** - Electron ile masaüstü uygulaması
2. ✅ **Kayıpsız Ses İletimi** - Opus codec ile WebRTC
3. ✅ **Ekran Paylaşımı** - Electron desktopCapturer API kullanımı
4. ✅ **Kişi Bazlı Ses Kontrolü** - Web Audio API ile her katılımcının ses seviyesi ayrı ayrı ayarlanabilir
5. ✅ **Ses Eşiği ile Mikrofon Aktivasyonu** - RMS audio level monitoring ile otomatik mikrofon açma/kapama
6. ✅ **Ortak ve Özel Chat** - WebSocket üzerinden gerçek zamanlı mesajlaşma

## Teknolojiler

### Frontend (Client)
- **Electron** - Masaüstü uygulama framework'ü
- **React 18** - UI framework
- **TypeScript** - Type-safe geliştirme
- **Vite** - Build tool ve development server
- **WebRTC** - Peer-to-peer ses/video iletimi
- **Web Audio API** - Ses işleme ve kişi bazlı ses kontrolü

### Backend (Signaling Server)
- **Node.js** - Runtime environment
- **WebSocket (ws)** - Gerçek zamanlı signaling
- **JWT** - Kimlik doğrulama
- **Express** - HTTP server (opsiyonel)

## Kurulum

### 1. Signaling Server Kurulumu

```bash
cd webrtc-prototype/signaling-server
npm install

# .env dosyası oluştur
cp .env.example .env

# Sunucuyu başlat
npm start
```

Server varsayılan olarak `ws://localhost:3001` üzerinde çalışacaktır.

### 2. Electron Client Kurulumu

```bash
cd voice-app

# Ana bağımlılıkları kur
npm install

# Client bağımlılıklarını kur
cd client
npm install
cd ..
```

### 3. Ortam Değişkenleri

Client için `.env` dosyası oluşturun:

```bash
cd client
cp .env.example .env
```

`.env` içeriği:
```
VITE_SIGNALING_SERVER=ws://localhost:3001
```

## Çalıştırma

### Development Mode

```bash
# voice-app dizininde
npm run dev
```

Bu komut:
1. Vite development server'ı başlatır (http://localhost:3000)
2. Electron uygulamasını başlatır

### Production Build

#### Windows için:
```bash
npm run build:win
```

#### macOS için:
```bash
npm run build:mac
```

#### Linux için:
```bash
npm run build:linux
```

Build edilmiş uygulamalar `dist/` klasöründe oluşturulur.

## Kullanım

1. **Giriş Yap** - Kullanıcı adınızı girin
2. **Ses Ayarları** - Sol menüden mikrofon ve hoparlör seçin
3. **Ses Eşiği** - Alt kontrol panelinden ses aktivasyon eşiğini ayarlayın
4. **Mikrofon Kontrolü** - Mikrofon butonuna tıklayarak susturma/açma
5. **Ekran Paylaşımı** - Ekran paylaşım butonuna tıklayın
6. **Kişi Bazlı Ses** - Her katılımcının kartında ses seviyesini ayarlayın
7. **Chat** - Sağ panelden mesaj gönderin

## Proje Yapısı

```
voice-app/
├── main.js                 # Electron ana process
├── preload.js             # Electron preload script
├── package.json           # Ana package.json
└── client/                # React client
    ├── src/
    │   ├── components/    # React bileşenleri
    │   │   ├── Login.tsx
    │   │   ├── VoiceRoom.tsx
    │   │   ├── Chat.tsx
    │   │   ├── ParticipantList.tsx
    │   │   └── VoiceControls.tsx
    │   ├── services/      # İş mantığı
    │   │   └── WebRTCService.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json

webrtc-prototype/
├── signaling-server/      # WebSocket signaling server
│   ├── server.js
│   ├── utils.js
│   └── package.json
└── README.md
```

## WebRTC Mimarisi

### Signaling Flow
1. Client WebSocket ile signaling server'a bağlanır
2. JWT token ile kimlik doğrulaması yapar
3. Diğer kullanıcılarla SDP offer/answer değişimi yapar
4. ICE candidate'leri paylaşır
5. Peer-to-peer bağlantı kurulur

### Ses İşleme
- **Opus Codec** - WebRTC varsayılan codec'i (kayıpsız)
- **Web Audio API** - Her katılımcı için ayrı GainNode
- **AnalyserNode** - RMS audio level monitoring
- **Voice Activation** - Threshold bazlı otomatik mikrofon kontrolü

### Ekran Paylaşımı
- Electron `desktopCapturer` API kullanılır
- Video track peer connection'lara eklenir
- Her katılımcı ekranı ayrı stream olarak alır

## Geliştirme Notları

### Hot Module Replacement (HMR)
Vite HMR ile kod değişiklikleri anında yansır. Electron'u yeniden başlatmaya gerek yoktur.

### Debugging
- Client: Chrome DevTools (Electron içinde açılır)
- Main Process: VSCode debugger veya `--inspect` flag

### Electron Security
- Context isolation enabled
- Node integration disabled
- Preload script ile güvenli API exposure

## Lisans

MIT

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Sorun Giderme

### WebSocket Bağlantı Hatası
- Signaling server'ın çalıştığından emin olun
- `.env` dosyasında doğru URL'yi kontrol edin
- Firewall ayarlarını kontrol edin

### Ses İletimi Çalışmıyor
- Mikrofon izinlerini kontrol edin
- Tarayıcı/Electron mikrofon erişimi verdiğinden emin olun
- Audio device'ların doğru seçildiğini kontrol edin

### Ekran Paylaşımı Çalışmıyor
- Electron desktopCapturer API'si yalnızca Electron'da çalışır
- Sistem ekran kayıt izinlerini kontrol edin (macOS)

### Build Hataları
- Node.js versiyonunu kontrol edin (v16+)
- `node_modules` silip yeniden `npm install` yapın
- Cache'i temizleyin: `npm run clean` (script eklenirse)
