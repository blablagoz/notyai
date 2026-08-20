# NotyAI — Ses Odaklı Akıllı Ajanda & Takvim Asistanı

NotyAI; basmakalıp arayüzleri ve karmaşık menüleri yıkan, konuşarak veya tek satır doğal dil ile telefonun yerel takvimini (Samsung, Xiaomi, Honor, Apple, Google Takvim) yöneten minimalist bir yapay zeka ajandasıdır.

## 🌟 Öne Çıkan Özellikler
1. **Zero-UI Etkileşimi:** Klasik devasa butonlar yerine, ekrana basılı tutarak konuşma veya tek dokunuşla doğal dil yazma.
2. **Çoklu Varlık & Doğal Dil Ayrıştırma (Gemini AI):** *"Yarın 15:00 Noter randevusu ekle, 30 dk önce hatırlat"* gibi bileşik komutları anında takvim verisine dönüştürür.
3. **Cihaz Yerel Takvim Katmanı:** Kendi kapalı veritabanına hapsetmez; cihazın resmi takvim motoruna doğrudan yazar.
4. **Akıllı 3 Kademeli Bildirim Mimarisi:**
   - Gece 00:00 Günün Özeti
   - Sabah 07:00 Güne Başlama Brifingi
   - T-60 Dakika Yaklaşan İşe 1 Saat Öncesi Uyarısı (Yol/Hazırlık Payı)
5. **Dinamik Çift Tema:**
   - *Varsayılan:* Obsidyen Titanyum & Siber Turkuaz (`#0D1014` & `#00F2DE`)
   - *Alternatif:* Gece Petrolü & Neon Nane Turkuazı (`#091212` & `#10F0D2`)

## 🚀 GitHub'a Yükleme ve Çalıştırma Adımları

1. **Reponuzu Oluşturun ve Yükleyin:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NotyAI Flutter Project"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/notyai.git
   git push -u origin main
   ```

2. **Paketleri İndirin ve Çalıştırın:**
   ```bash
   flutter pub get
   flutter run
   ```

3. **Gemini API Anahtarı:**
   `lib/core/services/gemini_ai_service.dart` dosyası içindeki `_apiKey` alanına Google AI Studio'dan aldığınız ücretsiz API anahtarını tanımlayın.
