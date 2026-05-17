const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
// PostgreSQL bağlantı konfigürasyonu
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Bağlantıyı test et
async function createTables() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL bağlantısı başarılı!');
    client.release();
    return true;
  } catch (err) {
    console.error('PostgreSQL bağlantı hatası:', err.message);
    return false;
  }
}

// Kullanıcı kaydetme
async function kullaniciKaydet(kullaniciAdi, eposta, sifre) {
  try {
    const hashedPassword = await bcrypt.hash(sifre, 10);
    const query = 'INSERT INTO kullanicilar (kullanici_adi, eposta, sifre) VALUES ($1, $2, $3) RETURNING id';
    const result = await pool.query(query, [kullaniciAdi, eposta, hashedPassword]);
    return { success: true, id: result.rows[0].id };
  } catch (err) {
    console.error('Kullanıcı kaydetme hatası:', err.message);
    return { success: false, error: err.message };
  }
}

// Kullanıcı girişi
async function kullaniciGiris(kullaniciAdi, sifre) {
  try {
    const query = 'SELECT * FROM kullanicilar WHERE kullanici_adi = $1';
    const result = await pool.query(query, [kullaniciAdi]);
    
    if (result.rows.length === 0) {
      return { success: false, error: 'Kullanıcı bulunamadı' };
    }
    
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(sifre, user.sifre);
    
    if (passwordMatch) {
      return { success: true, user: { id: user.id, kullanici_adi: user.kullanici_adi, eposta: user.eposta } };
    } else {
      return { success: false, error: 'Şifre yanlış' };
    }
  } catch (err) {
    console.error('Giriş hatası:', err.message);
    return { success: false, error: err.message };
  }
}

// Sorgulama kaydetme (önce mevcut kayıt var mı kontrol et)
async function sorgulamaKaydet(kullaniciId, sorguData) {
  try {
    // Önce mevcut kayıt kontrolü
    const kontrolQuery = `
      SELECT * FROM sorgulamalar
      WHERE gumruk_mudur = $1
        AND bildirim_no = $2
        AND tescil_no = $3
      LIMIT 1
    `;
    const kontrolValues = [
      sorguData.gumrukMudur || '',
      sorguData.bildirimNo || '',
      sorguData.tescilNo || ''
    ];
    const kontrolSonuc = await pool.query(kontrolQuery, kontrolValues);

    if (kontrolSonuc.rows.length > 0) {
      return { success: true, kayit: kontrolSonuc.rows[0], mevcut: true };
    }

    // Kayıt yoksa ekleme yap
    const insertQuery = `
      INSERT INTO sorgulamalar (kullanici_id, gumruk_mudur, bildirim_no, bildirim_tarihi, 
                                arac_bilgi, belge_no, gumruk_saha_id, tescil_no, tescil_tarihi, 
                                islem_yonu_id, yuk_durumu_id, belge_vergi_no, kullanici_kodu)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const values = [
      kullaniciId,
      sorguData.gumrukMudur || '',
      sorguData.bildirimNo || '',
      sorguData.bildirimTarihi || '',
      sorguData.aracBilgi || '',
      sorguData.belgeNo || '',
      sorguData.gumrukSahası || '',
      sorguData.tescilNo || '',
      sorguData.tescilTarihi || '',
      sorguData.islemYonu || '',
      sorguData.yukDurumu || '',
      sorguData.belgeVergiNo || '',
      sorguData.kullaniciKodu || ''
    ];
    
    const insertSonuc = await pool.query(insertQuery, values);
    return { success: true, kayit: insertSonuc.rows[0], mevcut: false };
  } catch (err) {
    console.error('Sorgulama kaydetme hatası:', err.message);
    return { success: false, error: err.message };
  }
}

// Gümrük müdürlükleri
async function getGumrukMudurlukleri() {
  try {
    const query = 'SELECT * FROM gumruk_mudurlukleri ORDER BY ad';
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Gümrük müdürlükleri getirme hatası:', err.message);
    return [
      { id: 1, ad: 'Gümrük Müdürlüğü1' },
      { id: 2, ad: 'Gümrük Müdürlüğü2' },
      { id: 3, ad: 'Gümrük Müdürlüğü3' }
    ];
  }
}

// Gümrük sahaları
async function getGumrukSahalari() {
  try {
    const query = 'SELECT * FROM gumruk_sahalari ORDER BY ad';
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Gümrük sahaları getirme hatası:', err.message);
    return [
      { id: 1, ad: 'Gümrük Saha1' },
      { id: 2, ad: 'Gümrük Saha2' }
    ];
  }
}

// İşlem yönleri
async function getIslemYonleri() {
  try {
    const query = 'SELECT * FROM islem_yonleri ORDER BY ad';
    const result = await pool.query(query);
    return result.rows;
  } catch (err) { 
    console.error('İşlem yönleri getirme hatası:', err.message);
    return [
      { id: 1, ad: 'Giriş' },
      { id: 2, ad: 'Çıkış' }
    ];
  }
}

// Yük durumları
async function getYukDurumlari() {
  try {
    const query = 'SELECT * FROM yuk_durumlari ORDER BY ad';
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Yük durumları getirme hatası:', err.message);
    return [
      { id: 1, ad: 'Yüklü' },
      { id: 2, ad: 'Boş' }
    ];
  }
}

module.exports = {
  pool,
  createTables,
  kullaniciKaydet,
  kullaniciGiris,
  sorgulamaKaydet,
  getGumrukMudurlukleri,
  getGumrukSahalari,
  getIslemYonleri,
  getYukDurumlari
};