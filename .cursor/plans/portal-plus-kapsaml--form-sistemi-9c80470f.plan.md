<!-- 9c80470f-da82-4014-961d-32c712710e6b b939eb81-9b33-429e-ae17-e5a55e3ab424 -->
# Portal Plus Tam Sistem - Sıralı Implementasyon

## Mevcut Durum

- ✅ Parametre sistemi aktif (107 parametre, 26 kategori)
- ✅ Gelişmiş Beneficiary formu hazır (40+ alan, 8 sekme)
- ✅ Parametre yönetim sayfası çalışıyor
- ✅ Appwrite backend entegrasyonu tamamlandı

## Sıralı Modül Geliştirme Planı

### MODÜL 1: Yardım Başvuru Sistemi

Portal Plus'taki 182 kayıtlı başvuru sistemi

**1.1 Aid Applications Collection**

- `src/lib/appwrite/config.ts` - AID_APPLICATIONS collection ekle
- Alanlar: başvuru tarihi, kişi/kurum, başvuru tipi, aşama, durum
- Yardım türleri: Tek Seferlik, Düzenli Nakdi, Düzenli Gıda, Ayni Yardım, Hizmet Sevk

**1.2 Başvuru Formu ve Sayfaları**

- `src/components/forms/AidApplicationForm.tsx` - Başvuru formu
- `src/app/(dashboard)/yardim/basvurular/page.tsx` - Başvuru listesi
- `src/app/(dashboard)/yardim/basvurular/[id]/page.tsx` - Başvuru detayı

**1.3 Başvuru Aşama Sistemi**

- Aşamalar: Taslak, İnceleme, Onay, Devam Ediyor, Tamamlandı
- Aşama geçişleri ve workflow yönetimi

**1.4 Yardım İşlem Sayfaları**

- Nakdi Yardım Veznesi
- Banka Ödeme Emirleri
- Nakdi/Ayni Yardım İşlemleri
- Hizmet Takip/Hastane Sevk

---

### MODÜL 2: Burs/Yetim Yönetimi

Portal Plus'taki Burs Yönetimi modülü

**2.1 Orphans/Students Collection**

- Yetim/Öğrenci kayıtları
- Vasi bilgileri (yakınlık derecesi parametresi kullanılacak)
- Eğitim bilgileri (okul, sınıf, başarı durumu)
- Kategori: İHH Yetim, Yetim, Aile, Eğitim Bursu

**2.2 Yetim Formu**

- `src/components/forms/OrphanForm.tsx` - Kapsamlı yetim kayıt formu
- Vefat bilgileri (vefat nedeni parametresi)
- Sağlık durumu (hastalık, tedavi parametreleri)
- Özel durumlar (Yetim, Öksüz, Mülteci parametreleri)

**2.3 Burs Sayfaları**

- `src/app/(dashboard)/burs/yetim-ogrenciler/page.tsx` - Yetim/Öğrenci listesi
- `src/app/(dashboard)/burs/yetim-bilgi-formu/page.tsx` - Bilgi formu
- `src/app/(dashboard)/burs/kampanyalar/page.tsx` - Kampanya yönetimi
- `src/app/(dashboard)/burs/okullar/page.tsx` - Okul bilgileri

**2.4 Görsel ve Mektup Yönetimi**

- Yetim fotoğrafları
- Yetim mektupları sistemi
- Adres etiket baskı

---

### MODÜL 3: Gelişmiş Dashboard

Portal Plus Ana Sayfa özellikleri

**3.1 Dashboard Widgets**

- İşlem Bekleyen İş Kayıtları (188 kayıt göstergesi)
- Takip edilen işler
- Takvim/Toplantılar widget'ı
- Kurul ve Komisyonlar
- Seyahatler

**3.2 İş Akış Şeması**

- Akış şeması komponenti
- Son iş kayıtları listesi
- Okunmamış iş bildirimleri

**3.3 Finansal Widgets**

- Döviz kurları (USD, EUR, GBP, Altın)
- Gerçek zamanlı kur API entegrasyonu
- SMS & E-posta istatistikleri

**3.4 Toplantı Yönetimi**

- Davet edilen toplantılar
- Katılım durumu
- Bilgi verilenler
- Açık durumdaki toplantılar

---

### MODÜL 4: Mesaj Yönetimi

SMS ve E-posta sistemi

**4.1 Messaging Collection**

- SMS kayıtları
- E-posta kayıtları
- Toplu mesaj şablonları

**4.2 Mesaj Sayfaları**

- `src/app/(dashboard)/mesaj/kurum-ici/page.tsx` - Kurum içi mesajlar
- `src/app/(dashboard)/mesaj/toplu/page.tsx` - Toplu mesaj gönderimi
- SMS & E-posta istatistikleri

**4.3 Mesaj Gönderim Sistemi**

- Tekil mesaj
- Toplu mesaj (gruplara)
- Şablon yönetimi
- Gönderim takibi

---

### MODÜL 5: İş Yönetimi

Görev ve Toplantı sistemi

**5.1 Tasks & Meetings Collections**

- Görevler (task management)
- Toplantılar (meeting management)
- Görev atama ve takip

**5.2 İş Yönetimi Sayfaları**

- `src/app/(dashboard)/is/gorevler/page.tsx` - Görev listesi
- `src/app/(dashboard)/is/toplantilar/page.tsx` - Toplantı yönetimi
- Görev detay ve düzenleme

**5.3 İş Akışı**

- Görev oluşturma ve atama
- Öncelik yönetimi
- Durum takibi (Beklemede, Devam Ediyor, Tamamlandı)
- Toplantı davet sistemi

---

### MODÜL 6: Sponsorluk Yönetimi

Sponsor ve sponsorluk sistemi

**6.1 Sponsorship Collection**

- Sponsor bilgileri
- Sponsorluk ilişkileri (sponsor-yetim eşleştirme)
- Sponsorluk durumu (devam eden, bitmiş)
- Bitirme nedenleri (parametre sistemi)

**6.2 Sponsorluk Sayfaları**

- `src/app/(dashboard)/sponsorluk/liste/page.tsx` - Sponsorlar
- `src/app/(dashboard)/sponsorluk/eslesmeler/page.tsx` - Eşleşmeler
- Sponsorluk raporu

---

### MODÜL 7: Finans Modülü

Gelişmiş finans yönetimi

**7.1 Finance Collections**

- Gelir kayıtları
- Gider kayıtları
- Bütçe planlaması
- Fon hareketleri

**7.2 Finans Sayfaları**

- `src/app/(dashboard)/fon/gelir-gider/page.tsx` - Gelir-Gider
- `src/app/(dashboard)/fon/raporlar/page.tsx` - Finans raporları
- Bütçe dashboard

**7.3 Finans Raporları**

- Aylık gelir-gider raporu
- Kategori bazlı harcamalar
- Grafikler ve charts (recharts)

---

### MODÜL 8: Satın Alma Yönetimi

Tedarik ve satın alma

**8.1 Purchasing Collection**

- Satın alma talepleri
- Tedarikçi bilgileri
- Stok yönetimi

**8.2 Satın Alma Sayfaları**

- Talep oluşturma
- Onay süreci
- Tedarikçi yönetimi

---

### MODÜL 9: Gönüllü Yönetimi

Gönüllü koordinasyonu

**9.1 Volunteers Collection**

- Gönüllü bilgileri
- Görev atamaları
- Çalışma saatleri

**9.2 Gönüllü Sayfaları**

- Gönüllü kayıt
- Görev atama
- Performans takibi

---

### MODÜL 10: Partner Yönetimi

Kurumsal iş birlikleri

**10.1 Partners Collection**

- Partner/kurum bilgileri
- İş birliği türü
- Anlaşmalar

**10.2 Partner Sayfaları**

- `src/app/(dashboard)/partner/liste/page.tsx` - Partner listesi
- Partner detay ve anlaşmalar

---

### MODÜL 11: Kullanıcı ve Yetki Sistemi

Gelişmiş rol ve yetki yönetimi

**11.1 Kullanıcı Sayfası Güncelleme**

- `src/app/(dashboard)/kullanici/page.tsx` - Gelişmiş kullanıcı yönetimi
- Rol bazlı yetkiler
- Kullanıcı aktivite logları

**11.2 Simülasyon Modu**

- Portal Plus'taki "Simülasyon" özelliği
- Farklı kullanıcı rollerini simüle etme

---

### MODÜL 12: Sistem ve Tanımlamalar

Sistem yönetimi

**12.1 Sistem Bildirimleri**

- Duyuru sistemi
- Sistem bildirimleri (KPS entegrasyonu, vb.)
- Bildirim yönetimi

**12.2 Tanımlamalar**

- Form tanımları
- Fiyat tanımları
- Veri kontrolü sayfaları

**12.3 Organizasyon**

- Organizasyon şeması
- İletişim rehberi
- Dokümantasyon

---

### MODÜL 13: Online Bağış Sistemi

Web tabanlı bağış toplama

**13.1 Online Bağış Sayfası**

- Public bağış formu
- Ödeme entegrasyonu (iyzico/stripe)
- Bağış kampanyaları

**13.2 Kumbara Sistemi**

- Portal Plus'taki kumbara geliştirmesi
- Sanal kumbara yönetimi

---

### MODÜL 14: Çoklu Dil Sistemi

5 dil desteği

**14.1 next-intl Kurulumu**

```bash
npm install next-intl
```

**14.2 Dil Yapısı**

- `src/i18n/locales/` - TR, EN, AR, RU, FR
- Dil değiştirme menüsü
- Parametre çevirileri

**14.3 Login Sayfası Dil Değiştirme**

- Portal Plus'taki gibi 5 bayrak ikonu
- Tüm formların çevirisi

---

## Implementasyon Sırası

### Faz 1 (Temel Modüller - 1-2 gün)

1. Yardım Başvuru Sistemi
2. Gelişmiş Dashboard
3. İş Yönetimi (Görev/Toplantı)

### Faz 2 (Burs ve Finans - 1-2 gün)

4. Burs/Yetim Yönetimi
5. Sponsorluk Sistemi
6. Finans Modülü

### Faz 3 (İletişim ve Yönetim - 1 gün)

7. Mesaj Yönetimi
8. Kullanıcı/Yetki Sistemi
9. Partner Yönetimi

### Faz 4 (Destek Sistemler - 1 gün)

10. Satın Alma/Gönüllü Modülleri
11. Sistem Bildirimleri
12. Tanımlamalar

### Faz 5 (Özel Özellikler - 1 gün)

13. Online Bağış Sistemi
14. Çoklu Dil Desteği

---

## Şimdi Nereden Başlayalım?

**Seçenekler:**

**A) MODÜL 1: Yardım Başvuru Sistemi** (Portal Plus'taki 182 kayıtlı sistem)

- Aid Applications collection oluştur
- Başvuru formu (yardım türleri: Tek Seferlik, Düzenli Nakdi, Düzenli Gıda, Ayni, Hizmet Sevk)
- Başvuru listesi ve detay sayfaları
- Aşama yönetimi (Taslak → Devam Ediyor → Tamamlandı)
- Nakdi Yardım Veznesi, Banka Ödeme Emirleri

**B) MODÜL 2: Gelişmiş Dashboard** (İş akışı ve widget'lar)

- İş akış şeması
- 188 bekleyen iş göstergesi
- Toplantı yönetimi widget'ları
- Döviz kurları ve finansal göstergeler
- SMS/E-posta istatistikleri

**C) MODÜL 4: Burs/Yetim Yönetimi** (950 kayıtlı sistem)

- Orphans/Students collection
- Yetim bilgi formu (Portal Plus'taki detaylı form)
- Kampanya yönetimi
- Sponsorluk eşleştirme
- Okul ve eğitim takibi

**D) Tüm Modülleri Sırayla** (Faz 1'den başlayarak hepsini)

- MODÜL 1 → MODÜL 2 → MODÜL 3 → ... → MODÜL 14
- Her modül tamamlandıkça sıradakine geçilecek
- Toplam süre: ~5-7 gün

**Hangisiyle başlayalım?**

### To-dos

- [ ] Parameters collection ve types oluştur (config, types, API)
- [ ] Beneficiary schema'yı 40+ alan ile genişlet
- [ ] Çoklu dil desteği ekle (next-intl, locales, context)
- [ ] ParameterSelect dinamik bileşeni oluştur
- [ ] AdvancedBeneficiaryForm multi-step form oluştur
- [ ] Database setup ve migration scriptleri yaz
- [ ] Parametre yönetim sayfası oluştur
- [ ] İhtiyaç sahipleri list ve detail sayfalarını güncelle
- [ ] 25+ kategori için default parametreleri ekle
- [ ] Sistemi test et ve doğrula