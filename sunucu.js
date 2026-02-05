const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const { 
  createTables, 
  kullaniciKaydet, 
  kullaniciGiris, 
  sorgulamaKaydet,
  getGumrukMudurlukleri,
  getGumrukSahalari,
  getIslemYonleri,
  getYukDurumlari 
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'gumruk_gizli_anahtar_2024',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Veritabanı tablolarını oluştur
createTables();

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anasayfa.html'));
});

// Giriş sayfası
app.get('/giris.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'giris.html'));
});

// Kayıt sayfası
app.get('/kayit.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kayit.html'));
});

// Kullanıcı kayıt işlemi
app.post('/kayit', async (req, res) => {
  const { kullaniciAdi, eposta, sifre } = req.body;
  
  if (!kullaniciAdi || !eposta || !sifre) {
    return res.status(400).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Eksik bilgi!</h2>
        <p>Tüm alanları doldurun!</p>
        <div class="butonn"><a href="/kayit.html"><button>Geri Dön</button></a></div>
      </div>
    `);
  }

  const sonuc = await kullaniciKaydet(kullaniciAdi, eposta, sifre);
  if (sonuc.success) {
    res.send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Kayıt başarılı!</h2>
        <p>Kullanıcı adınız: ${kullaniciAdi}</p>
        <p>Şimdi giriş yapabilirsiniz.</p>
        <div class="butonn"><a href="/giris.html"><button>Giriş Yap</button></a></div>
      </div>
    `);
  } else {
    res.status(400).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Kayıt hatası!</h2>
        <p>${sonuc.error}</p>
        <div class="butonn"><a href="/kayit.html"><button>Geri Dön</button></a></div>
      </div>
    `);
  }
});

// Kullanıcı giriş işlemi
app.post('/giris', async (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  
  if (!kullaniciAdi || !sifre) {
    return res.status(400).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Eksik bilgi!</h2>
        <p>Kullanıcı adı ve şifre gerekli!</p>
        <div class="butonn"><a href="/giris.html"><button>Geri Dön</button></a></div>
      </div>
    `);
  }

  const sonuc = await kullaniciGiris(kullaniciAdi, sifre);
  
  if (sonuc.success) {
    req.session.kullanici = sonuc.user;
    res.redirect('/anasayfa.html');
  } else {
    res.status(401).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Giriş hatası!</h2>
        <p>${sonuc.error}</p>
        <div class="butonn"><a href="/giris.html"><button>Geri Dön</button></a></div>
      </div>
    `);
  }
});

// Ana sayfa (sadece giriş yapanlar görebilir)
app.get('/anasayfa.html', (req, res) => {
  if (!req.session.kullanici) {
    return res.redirect('/giris.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'anasayfa.html'));
});

// Sorgulama işlemi
app.post('/sorgula', async (req, res) => {
  if (!req.session.kullanici) {
    return res.status(401).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Yetki Hatası!</h2>
        <p>Önce giriş yapmalısınız!</p>
        <div class="butonn"><a href="/giris.html"><button>Giriş Yap</button></a></div>
      </div>
    `);
  }

  const sorguData = req.body;
  const kullaniciId = req.session.kullanici.id;
  const kayitSonuc = await sorgulamaKaydet(kullaniciId, sorguData);
  
  if (kayitSonuc.success) {
    if (kayitSonuc.mevcut) {
      res.send(`
        <link rel="stylesheet" href="/tumsite.css">
        <div class="form-group" style="text-align:center;">
          <h2>Bu kayıt veritabanında zaten mevcut.</h2>
          <div class="butonn"><a href="/anasayfa.html"><button>Ana Sayfaya Dön</button></a></div>
        </div>
      `);
    } else {
      res.send(`
        <link rel="stylesheet" href="/tumsite.css">
        <div class="form-group" style="text-align:center;">
          <h2>Sorgulama Kaydedildi!</h2>
          <div class="butonn"><a href="/anasayfa.html"><button>Ana Sayfaya Dön</button></a></div>
        </div>
      `);
    }
  } else {
    res.status(500).send(`
      <link rel="stylesheet" href="/tumsite.css">
      <div class="form-group" style="text-align:center;">
        <h2>Sorgulama Hatası!</h2>
        <p>${kayitSonuc.error}</p>
        <div class="butonn"><a href="/anasayfa.html"><button>Geri Dön</button></a></div>
      </div>
    `);
  }
});

// Çıkış işlemi
app.get('/cikis', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/giris.html');
  });
});

// API endpointler
app.get('/api/gumruk-mudurlukleri', async (req, res) => {
  const sonuc = await getGumrukMudurlukleri();
  res.json(sonuc);
});

app.get('/api/gumruk-sahalari', async (req, res) => {
  const sonuc = await getGumrukSahalari();
  res.json(sonuc);
});

app.get('/api/islem-yonleri', async (req, res) => {
  const sonuc = await getIslemYonleri();
  res.json(sonuc);
});

app.get('/api/yuk-durumlari', async (req, res) => {
  const sonuc = await getYukDurumlari();
  res.json(sonuc);
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}/giris.html`);
});