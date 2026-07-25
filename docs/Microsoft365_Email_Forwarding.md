# Microsoft 365 Kurumsal E-posta Yönlendirme ve Otomatik İletme Kılavuzu

## 1. Giriş ve Kurumsal Veri Güvenliği Politikaları
Microsoft 365 Exchange Online altyapısı üzerinde e-posta yönlendirme (Email Forwarding) özellikleri, personelin geçici görevlendirmelerinde, izin dönemlerinde veya departman içi bilgi paylaşımlarında iş sürekliliğini sağlamak amacıyla kullanılan kritik bir mekanizmadır. Ancak, e-postaların kontrolsüz bir şekilde kurum dışı kontrolsüz adreslere otomatik olarak iletilmesi, hassas verilerin sızdırılması (Data Leakage) riskini barındırır. Şirket siber güvenlik politikaları gereğince, harici kişisel e-posta adreslerine (`gmail.com`, `hotmail.com` vb.) otomatik yönlendirme yapılması sistem yöneticileri tarafından merkezi olarak engellenmiştir. Otomatik yönlendirme kuralları yalnızca onaylı iş ortakları veya kurum içi diğer departman e-posta adresleri için geçerlidir. Tüm otomatik yönlendirme hareketleri BT Güvenlik İzleme (SIEM) panelleri üzerinden anlık olarak loglanmaktadır.

## 2. Adım Adım E-posta Yönlendirme Ayarları Prosedürü
Kullanıcıların kendi gelen kutularına düşen postaları başka bir iş arkadaşına veya departman havuzuna yönlendirmesi için aşağıdaki adımları sırasıyla uygulaması gerekmektedir:
1. Kurumsal bilgisayarınızdan tarayıcıyı açarak `https://outlook.office.com` adresinden Outlook Web App (OWA) portalına giriş yapın.
2. Ekranın sağ üst köşesinde yer alan dişli çark simgesine tıklayarak "Ayarlar" menüsünü açın.
3. Sol paneldeki hiyerarşiyi takip ederek sırasıyla "Posta" ve ardından "Yönlendirme" (Forwarding) sekmesine gidin.
4. Güvenlik doğrulaması için istenirse Microsoft Authenticator uygulamanızdan gelen bildirimi onaylayın.
5. "Yönlendirmeyi etkinleştir" seçeneğinin yanındaki kutucuğu işaretleyin.
6. "E-postalarımı şuraya yönlendir" alanına, hedef kurumsal e-posta adresini (`hedef.isim@kurum.com`) eksiksiz ve hatasız olarak yazın.
7. "Yönlendirilen iletilerin bir kopyasını bende tut" seçeneğini mutlaka işaretleyin. Aksi takdirde gelen e-postalar kendi kutunuzdan silinir ve sadece karşı tarafa iletilir.
8. Ekranın alt kısmında bulunan "Kaydet" butonuna basarak kuralı aktif hale getirin.

## 3. Sık Karşılaşılan Hata Kodları ve BT Sorun Giderme Adımları
Kullanıcılar yönlendirme kuralı oluştururken veya otomatik iletilen e-postalar karşı tarafa ulaşmadığında Exchange sunucuları tarafından şu NDR (Teslim Edilemedi Raporu) hata kodları fırlatılabilir:

* **Hata Kodu: 550 5.7.520 Access Denied (Otomatik İletme Engellendi):** En sık karşılaşılan hatadır. Kullanıcı yönlendirme adresini yazıp kaydetse bile, dış dünyaya e-posta iletilmeye çalışıldığında Exchange Online koruma filtreleri (Anti-Spam Outbound Policy) bu isteği engeller. Çözüm için BT yöneticinizin **Exchange Admin Center (EAC)** paneline girerek kullanıcının hesabı için özel bir "Harici İletme İzni" (External Forwarding Permit) tanımlaması veya kuralı merkezi olarak yazması gerekir.
* **Hata Kodu: 5.4.14 Hop Count Exceeded (Yönlendirme Döngüsü):** İki kullanıcının veya posta kutusunun karşılıklı olarak birbirine otomatik yönlendirme kuralı koyması durumunda (A kullanıcısı B'ye, B kullanıcısı A'ya) e-postalar sonsuz bir döngüye girer. Sistem 30 iletimden sonra maili kalıcı olarak reddeder. Çözüm için her iki hesabın da yönlendirme kuralları silinmeli ve döngüsel mantık hataları temizlenmelidir.
* **Hata Kodu: 5.1.1 User Unknown (Geçersiz Adres):** Yönlendirilen hedef e-posta adresinin yanlış yazıldığını veya o hesabın pasife alındığını gösterir. Yazım hatalarını kontrol edin.

## 4. Gelişmiş Güvenlik ve DLP Kontrolleri
Kurumsal veri güvenliğini en üst düzeyde tutmak amacıyla, sistem üzerinde **DLP (Data Loss Prevention - Veri Kaybı Önleme)** politikaları aktiftir. E-posta içeriğinde kredi kartı numaraları, T.C. Kimlik Numarası, şirket gizli finansal raporları veya kaynak kod blokları tespit edilirse, yönlendirme kuralı aktif olsa dahi e-postanın kurum dışına iletilmesi DLP tarafından otomatik olarak engellenir ve kullanıcının bağlı olduğu birim amirine uyarı maili gönderilir. Kritik projelerde yönlendirme kuralları yerine, birden fazla personelin aynı mailleri takip edebilmesi için **Paylaşılan Posta Kutusu (Shared Mailbox)** mimarisinin kullanılması kesinlikle tavsiye edilmektedir.