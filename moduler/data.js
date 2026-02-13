// module.js
const fs = require('fs');

console.log("-----------------------------------");
console.log("🚀 Sistem Başlatıldı.");

// Bir fonksiyon tanımlayalım
function selamVer(isim) {
    return "Merhaba " + isim + "! Terminalde JavaScript çalışıyor.";
}

// Sonucu ekrana yazdıralım
const mesaj = selamVer("Efe Baba");
console.log(mesaj);

// Küçük bir test dosyası oluşturalım
fs.writeFileSync("test.txt", "Bu dosya Node.js tarafından oluşturuldu.");
console.log("📂 Klasörüne 'test.txt' adında bir dosya eklendi, kontrol et!");
console.log("-----------------------------------");