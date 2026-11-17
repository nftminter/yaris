// At Yarışı — ayarlar. Not Defteri ile düzenleyebilirsin.
// Chat'e "!at" yazan yarışa kendi atıyla katılır; yarışta chat'e yazdıkça kendi atı hızlanır.

window.OYUN_AYAR = {
  kanal: "irlandas",
  chatroomId: "6439653",

  // Katılma komutu (chat'e bunu yazan yarışa girer). "!katıl" de çalışır.
  katilmaKomutu: "!at",

  // Katılma süresi, saniye
  katilmaSuresi: 30,

  // Bir yarışta en fazla kaç at (ilk yazanlar girer)
  enFazlaAt: 10,

  // Yarış bitince yeni yarışa kaç saniye sonra geçilsin
  sonrakiYaris: 12,

  // 1., 2. ve 3. olanların puanı
  puanlar: [10, 5, 3],

  // Chat'e yazmanın atı hızlandırma gücü. 0 = etkisiz, 1 = normal, 2 = çok etkili
  tezahuratEtkisi: 1,

  // Chat'e "!sifirla" yazınca skorları kim sıfırlayabilir: kanal sahibi her zaman, modlar da (false yaparsan modlar yapamaz)
  modlarSifirlayabilir: true,
  // Mod olmayan ama sıfırlayabilsin istediğin kişiler (Kick adları). Örnek: ["arkadasim_ali"]
  yetkililer: [],
};
