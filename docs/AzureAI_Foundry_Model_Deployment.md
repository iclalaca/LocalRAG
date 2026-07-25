# Azure AI Foundry ve Foundry Local Model Yayınlama Rehberi

## 1. Yayınlama Öncesi Hazırlık ve Ortam Gereksinimleri
Azure AI Foundry ve yerel cihazlar üzerinde çalışan Foundry Local platformları, yapay zekâ modellerini geliştirme, test etme ve üretim ortamına kesintisiz aktarma için hibrit bir altyapı sunar. Modellerin yerel veya bulut ortamında doğru yapılandırılması, hem çıkarım (inference) performansı hem de veri güvenliği açısından kritik öneme sahiptir. Projenin bu aşamasında, BT ekipleri ve veri bilimciler için model yayınlama süreçlerinin optimizasyonu hedeflenmiştir. 
* **Model Versiyonlama:** Modelinizi Azure ML Workspace veya yerel Foundry Local model kataloğu üzerinde tam sürüm numaralarıyla (Örn: `v1.0.0`, `Phi-3.5-mini-instruct-generic-gpu:2`) versiyonlayarak kaydedin.
* **Kaynak Gereksinimleri:** Çıkarım yapılacak makinenin donanım kapasitesini analiz edin. Model parametre boyutuna göre gerekli CPU/GPU çekirdek sayısını, RAM miktarını ve NPU (Neural Processing Unit) donanım ivmelendirme desteğini önceden tanımlayın.
* **Çevre Tanımları:** Çalışma ortamının bağımlılıklarını izole etmek amacıyla Docker imajları, Conda environment dosyaları veya Node.js/Python sanal ortam yapılandırmalarını (requirements.txt / package.json) eksiksiz hazırlayın.

## 2. Adım Adım Model Yayınlama ve Dağıtım Prosedürü
Modellerin API uç noktası (endpoint) olarak dış dünyaya veya yerel uygulamalara sunulması için aşağıdaki adımlar sırasıyla uygulanmalıdır:
1. Tarayıcı üzerinden Azure AI Foundry portalına kurumsal kimlik bilgilerinizle giriş yapın veya yerel terminalinizde Foundry Local Runtime sunucusunu aktif hale getirin.
2. Yayınlamak istediğiniz optimize edilmiş modeli katalogdan seçerek **Deploy (Dağıt)** sekmesine ilerleyin.
3. Uygulamanızın mimari gereksinimlerine göre bir **Endpoint** türü belirleyin. Gerçek zamanlı ve token akışlı (streaming SSE) yanıtlar için REST API altyapısını, yüksek performanslı mikro servis haberleşmeleri için ise gRPC protokolünü yapılandırın.
4. Kimlik doğrulama katmanında güvenlik amacıyla API erişim anahtarlarını (bearer tokens) oluşturun ve rol tabanlı erişim kontrolü (RBAC) politikalarını aktif edin.
5. Dağıtımı tamamlanan modeli `test.js` veya CLI betikleri üzerinden sahte istekler (mock queries) göndererek test edin, ilk yanıt süresi (Time to First Token) ve saniye başına işlenen token sayısı gibi performans metriklerini doğrulayın.

## 3. Olası Hata Kodları, Sistem İstisnaları ve Çözüm Yolları
Model dağıtımı ve yüklenmesi esnasında hem bulut ortamında hem de yerel SDK katmanında fırlatılabilecek kritik hatalar ve çözüm stratejileri şunlardır:
* **Hata: 403 Unauthorized / Access Denied:** İstemcinin endpoint'e erişim yetkisi olmadığını belirtir. Çözüm için IAM (Identity and Access Management) panelinden RBAC ayarlarını kontrol edin. İstemci kodundaki API anahtarının ve çevre değişkenlerinin (environment variables) doğruluğundan emin olun.
* **Hata: 429 Too Many Requests:** Endpoint üzerine tanımlanan anlık istek limitinin aşıldığını gösterir. Çözüm için gateway üzerinde rate-limiting politikalarını gözden geçirin. Yoğun trafiği dengelemek ve donanım yükünü hafifletmek amacıyla "Autoscaling" (otomatik ölçeklendirme) kurallarını tetikleyin.
* **Hata: 500 Internal Server Error:** Modelin çalışma zamanında (runtime) beklenmeyen bir çökmeyle karşılaştığını ifade eder. Çözüm için sistem loglarını inceleyin. Genellikle Python/Node.js kütüphanelerindeki eksik bağımlılıklardan kaynaklanır; Docker imajını veya yerel sanal ortam dosyalarını güncelleyin.
* **Hata: FoundryLocalException / Model Not Found:** Yerel SDK'nın yüklemeye çalıştığı modelin diskte bulunamadığını belirtir (System.ArgumentException: Model path does not exist). Çözüm için `manager.download_and_register_eps(model_name)` fonksiyonunu kullanarak model dosyalarını yerel diske tamamen indirin ve katalog isim eşleşmesini kontrol edin.

## 4. Güvenlik Gereksinimleri ve Veri İzolasyonu
Kurumsal veri güvenliği standartları ve KVKK regülasyonları gereği, yapay zekâ modellerinin veri alışverişi katı kurallara bağlanmalıdır:
* **Erişim Sınırlandırma:** Model endpoint'lerine erişimi sadece belirli IP bloklarına veya sanal ağlara (VNet) izin verecek şekilde RBAC politikaları ile daraltın.
* **Anahtar Yönetimi:** Hassas API erişim anahtarlarını kaynak kod içinde düz metin (plain text) olarak asla saklamayın. Bulut dağıtımlarında **Azure Key Vault** entegrasyonu, yerel dağıtımlarda ise şifrelenmiş `.env` dosyaları kullanın.
* **Veri Şifreleme:** İstemci ile model sunucusu arasındaki tüm ağ trafiğini korumak amacıyla TLS/HTTPS protokollerini zorunlu hale getirin. İç ağ güvenliği için kritik öneme sahip modellerde **Private Endpoint** yapılandırmasını devreye alın.

## 5. İzleme ve En İyi Uygulamalar (Best Practices)
Modelin üretim ortamındaki sağlığını ve doğruluk oranlarını sürdürülebilir kılmak için şu pratikleri uygulayın:
* Model performansını, gelen istek hacmini ve sistem gecikmelerini anlık izlemek için **Application Insights** ve **Azure Monitor** entegrasyonlarını aktif edin. BT ekipleri bu loglar üzerinden anormallikleri hızlıca yakalayabilir.
* Sistem kesintilerini sıfıra indirmek ve yeni model versiyonlarını kullanıcıları etkilemeden devreye almak için **Blue-Green Deployment** veya **Canary Dağıtım** stratejilerini uygulayarak trafiği kademeli olarak yeni modele aktarın.