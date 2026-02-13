const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// jQuery'nin indirme adresi
const JQUERY_URL = "https://code.jquery.com/jquery-3.6.0.min.js";
const DOSYA_ADI = "jquery.min.js";

async function dosyaIndir() {
    console.log("-----------------------------------");
    console.log(`📥 ${DOSYA_ADI} indiriliyor...`);

    try {
        // Dosyayı internetten çekiyoruz
        const response = await axios({
            method: 'get',
            url: JQUERY_URL,
            responseType: 'stream'
        });

        // Dosyayı bulunduğumuz klasöre kaydediyoruz
        const dosyaYolu = path.join(__dirname, DOSYA_ADI);
        const yazar = fs.createWriteStream(dosyaYolu);

        response.data.pipe(yazar);

        yazar.on('finish', () => {
            console.log(`✅ İşlem Başarılı!`);
            console.log(`📍 Dosya şuraya kaydedildi: ${dosyaYolu}`);
            console.log("-----------------------------------");
            rl.close();
        });

        yazar.on('error', (err) => {
            console.error("❌ Dosya yazılırken hata oluştu:", err.message);
            rl.close();
        });

    } catch (error) {
        console.error("❌ İndirme hatası:", error.message);
        rl.close();
    }
}

// Confirm (Onay) kısmı
rl.question('jQuery kütüphanesini indirmek istiyor musunuz? (e/h): ', (answer) => {
    if (answer.toLowerCase() === 'e' || answer.toLowerCase() === 'evet') {
        dosyaIndir();
    } else {
        console.log("🚫 İşlem iptal edildi.");
        rl.close();
    }
});