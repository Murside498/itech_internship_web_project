# PCAT – Gümrük Sorgulama Sistemi

> **iTech Yaz Stajı Projesi** · Node.js + Express.js + PostgreSQL · 30 İş Günü

Gümrük operasyonlarını dijitalleştirmek amacıyla geliştirilen, kullanıcı kimlik doğrulama ve gümrük beyanname sorgulama işlemlerini tek bir arayüzde birleştiren web uygulamasıdır.

---

## 🚀 Özellikler

- **Kullanıcı Yönetimi** — Kayıt, giriş ve oturum yönetimi (express-session)
- **Güvenli Kimlik Doğrulama** — bcrypt ile şifre hashleme
- **Gümrük Sorgulama Formu** — Müdürlük, tescil no, araç bilgisi, yük durumu gibi 12 farklı kriter
- **Duplicate Kontrolü** — Aynı kayıt tekrar eklenmiyor, veritabanı tutarlılığı koruluyor
- **REST API** — Gümrük müdürlükleri, sahalar, işlem yönleri ve yük durumları için JSON endpoint'leri
- **Oturum Koruması** — Yetkisiz erişim otomatik olarak giriş sayfasına yönlendiriliyor

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js, Express.js |
| Frontend | HTML5, CSS3 |
| Veritabanı | PostgreSQL |
| Güvenlik | bcrypt, express-session |
| Araçlar | Git, Azure DevOps |

---

## 📁 Proje Yapısı

```
├── sunucu.js          # Express sunucu, route tanımları, session yönetimi
├── database.js        # PostgreSQL bağlantısı, CRUD işlemleri
├── public/
│   ├── anasayfa.html  # Sorgulama formu (oturum gerektirir)
│   ├── giris.html     # Kullanıcı girişi
│   ├── kayit.html     # Yeni kullanıcı kaydı
│   ├── tumsite.css    # Ana uygulama stilleri
│   └── giris_kayit.css
└── package.json
```

---

## ⚙️ Kurulum & Çalıştırma

### Gereksinimler
- Node.js v18+
- PostgreSQL v14+

### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/Murside498/itech_internship_web_project.git
cd itech_internship_web_project

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# .env içindeki DB_PASSWORD değerini kendi PostgreSQL şifrenle güncelle

# Sunucuyu başlat
npm start
```

Tarayıcıda aç: [http://localhost:3000/giris.html](http://localhost:3000/giris.html)

---

## 🔌 API Endpoint'leri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/gumruk-mudurlukleri` | Gümrük müdürlükleri listesi |
| GET | `/api/gumruk-sahalari` | Gümrük sahaları listesi |
| GET | `/api/islem-yonleri` | İşlem yönleri (Giriş/Çıkış) |
| GET | `/api/yuk-durumlari` | Yük durumları (Yüklü/Boş) |
| POST | `/kayit` | Yeni kullanıcı kaydı |
| POST | `/giris` | Kullanıcı girişi |
| POST | `/sorgula` | Gümrük sorgulama kaydı |
| GET | `/cikis` | Oturum sonlandırma |

---

## 🔒 Güvenlik

- Şifreler veritabanında bcrypt ile hashlenerek saklanır
- Oturum doğrulaması olmadan `/anasayfa.html` ve `/sorgula` endpoint'lerine erişilemez
- Duplicate kayıt kontrolü SQL sorgusu seviyesinde yapılır

---

## 📚 Öğrendiklerim

Bu staj sürecinde:
- Express.js ile MVC benzeri bir backend mimarisi kurdum
- Session tabanlı kimlik doğrulama akışı (login → session → logout) geliştirdim  
- bcrypt ile güvenli şifre yönetimi uyguladım
- PostgreSQL'de parameterized query kullanarak SQL injection'a karşı önlem aldım
- Git ve Azure DevOps üzerinde versiyon kontrolü yaptım

---

*Geliştirici: [Mürşide Gölbaşı](https://github.com/Murside498) · iTech Yaz Stajı 2025*
