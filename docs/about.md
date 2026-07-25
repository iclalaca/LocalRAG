# Local RAG Assistant - Hakkında

Bu proje, Microsoft Foundry Local kullanarak tamamen çevrimdışı çalışan bir
soru-cevap asistanı oluşturmayı amaçlamaktadır.

## Temel Özellikler

- Tüm işlemler kullanıcının kendi bilgisayarında çalışır, internet bağlantısı gerekmez.
- Belgeler küçük parçalara (chunk) bölünür ve TF-IDF yöntemiyle vektörlere çevrilir.
- Kullanıcı sorusu geldiğinde, en alakalı belge parçaları bulunur (retrieval).
- Bulunan parçalar, dil modeline bağlam (context) olarak verilir (augmentation).
- Model bu bağlamı kullanarak cevap üretir (generation).

## Kullanılan Teknolojiler

- Node.js ve Express.js: sunucu tarafı
- SQLite (better-sqlite3): belge parçalarının ve vektörlerin saklanması
- Foundry Local SDK: yerel dil modeli çalıştırma
- TF-IDF: basit, bağımlılıksız metin vektörleme yöntemi

## Mimari Katmanlar

1. Client Layer: Kullanıcı arayüzü (web sayfası)
2. Server Layer: Express.js API endpoint'leri
3. RAG Pipeline: Sorgu orkestrasyonu, chunking, prompt yönetimi
4. Data Layer: SQLite veritabanı ve belge klasörü
5. AI Layer: Foundry Local çalışma zamanı ve dil modeli