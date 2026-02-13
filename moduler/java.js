const { JavaServer, BedrockServer } = require('minecraft-server-util');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- AYARLAR ---
const CONFIG = {
    java: { ip: '127.0.0.1', port: 25565 },
    bedrock: { ip: '127.0.0.1', port: 19132 },
    downloads: [
        { name: 'server.jar', url: 'https://file_flexgame_server.com/bin/javw/stable/1.20.4/server.jar' },
        { name: 'fabric-server.jar', url: 'https://file_flexgame_server.com/bin/javw/stable/1.20.4/fabric-server.jar' },
        { name: 'forge-server.jar', url: 'https://file_flexgame_server.com/bin/javw/stable/1.20.4/forge-server.jar' }
    ]
};

// --- DOSYA İNDİRME MOTORU ---
// Tarayıcıdaki 'fetch' yerine Node.js'de bu yapı kullanılır.
async function dosyaIndir(url, dosyaAdi) {
    try {
        console.log(`\n📥 ${dosyaAdi} hazırlanıyor...`);
        const response = await axios({ url, method: 'GET', responseType: 'stream' });
        const writer = fs.createWriteStream(path.join(__dirname, dosyaAdi));

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`✅ ${dosyaAdi} indirildi ve kaydedildi.`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (err) {
        console.error(`❌ ${dosyaAdi} indirilemedi: URL hatalı veya sunucu kapalı.`);
    }
}

// --- SUNUCU TAKİP SİSTEMİ ---
async function sunuculariKontrolEt() {
    console.log("\n--- Sunucu Durum Raporu ---");

    // Java Kontrolü
    try {
        const data = await JavaServer.status(CONFIG.java.ip, CONFIG.java.port);
        console.log(`☕ Java Server: ONLINE | Oyuncu: ${data.players.online}/${data.players.max}`);
    } catch {
        console.log("☕ Java Server: OFFLINE");
    }

    // Bedrock Kontrolü
    try {
        const data = await BedrockServer.status(CONFIG.bedrock.ip, CONFIG.bedrock.port);
        console.log(`📱 Bedrock Server: ONLINE | Oyuncu: ${data.players.online}/${data.players.max}`);
    } catch {
        console.log("📱 Bedrock Server: OFFLINE");
    }
}

// --- ANA DÖNGÜ ---
async function baslat() {
    console.log("🛠️ IP Management & Server Loader Başlatılıyor...");

    // 1. Sunucu Durumlarını Kontrol Et
    await sunuculariKontrolEt();

    // 2. Dosyaları İndir (Sırayla)
    console.log("\n📦 Gerekli dosyalar kontrol ediliyor...");
    for (const item of CONFIG.downloads) {
        // İstersen indirmeyi aktif etmek için aşağıdaki satırı açabilirsin:
        // await dosyaIndir(item.url, item.name);
    }

    console.log("\n✨ Tüm işlemler tamamlandı. İzleme devam ediyor...");
}

baslat();