const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');

/**
 * AYARLAR
 * Sunucu dosyalarının indirileceği adresleri ve başlatma seçeneklerini buradan yönetebilirsin.
 */
const CONFIG = {
    java: {
        url: 'https://file_flexgame_server.com/bin/javw/stable/1.20.4/server.jar',
        fileName: 'server.jar',
        ram: '2G', // Maksimum RAM kullanımı
        dir: './java_server'
    },
    // Not: Bedrock genellikle zip olarak iner, bu örnek doğrudan çalıştırma üzerine kurgulanmıştır.
    bedrock: {
        url: 'https://file_flexgame_server.com/bin/bedrock/stable/bedrock-server.zip',
        fileName: 'bedrock_server',
        dir: './bedrock_server'
    }
};

/**
 * Dosya İndirme Yardımcısı
 */
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`İndirme başarısız: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

/**
 * Sunucu Başlatıcı ve Log Takipçisi
 */
function startMinecraftServer(config) {
    console.log(`--- Sunucu Başlatılıyor: ${config.fileName} ---`);

    // Java sunucusu için komut dizisi
    const args = [`-Xmx${config.ram}`, `-Xms${config.ram}`, '-jar', config.fileName, 'nogui'];

    const serverProcess = spawn('java', args, { cwd: config.dir });

    // Konsol çıktılarını dinle (IP ve Oyuncu Takibi Burada Yapılır)
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(`[SERVER]: ${output}`);

        // Oyuncu katılımını ve IP adresini yakalamak için basit Regex
        if (output.includes('joined the game') || output.includes('logged in with entity id')) {
            console.log('>>> BİLGİ: Bir oyuncu bağlandı!');
        }
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[SUNUCU HATASI]: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Sunucu kapandı. Çıkış kodu: ${code}`);
    });
}

/**
 * ANA AKIŞ: Kurulum ve Çalıştırma
 */
async function run() {
    try {
        // 1. Klasör Kontrolü
        if (!fs.existsSync(CONFIG.java.dir)) {
            fs.mkdirSync(CONFIG.java.dir);
        }

        const jarPath = path.join(CONFIG.java.dir, CONFIG.java.fileName);
        const eulaPath = path.join(CONFIG.java.dir, 'eula.txt');

        // 2. Dosya İndirme (Eğer dosya yoksa)
        if (!fs.existsSync(jarPath)) {
            console.log("Sunucu dosyası eksik. İndirme başlatılıyor...");
            await download(CONFIG.java.url, jarPath);
            console.log("İndirme tamamlandı.");
        }

        // 3. EULA Onayı (Otomatik)
        if (!fs.existsSync(eulaPath)) {
            fs.writeFileSync(eulaPath, 'eula=true');
            console.log("EULA dosyası oluşturuldu ve onaylandı.");
        }

        // 4. Sunucuyu Başlat
        startMinecraftServer(CONFIG.java);

    } catch (err) {
        console.error("Kritik Hata:", err.message);
    }
}

// Uygulamayı Başlat
run();