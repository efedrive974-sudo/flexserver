const fs = require('fs');
const https = require('https');
const { spawn } = require('child_process');
const path = require('path');

const CONFIG = {
    serverUrl: 'https://efedrive974-sudo.github.io/flexserver/server/fabric/file/lastest/fabric_server_loader/fabric-server-launch.jar',
    serverFileName: 'fabric-server-launch.jar',
    workingDir: path.join(__dirname, 'server_files'),
    ram: '10G',
    mods: [
        { name: 'fabric-api.jar', url: 'https://cdn.modrinth.com/data/P7dR8mSH/versions/g58ofrov/fabric-api-0.136.1%2B1.21.8.jar' },
        { name: 'sodium.jar', url: 'https://cdn.modrinth.com/data/AANobbMI/versions/7pwil2dy/sodium-fabric-0.7.3%2Bmc1.21.8.jar' },
        { name: 'voicechat.jar', url: 'https://cdn.modrinth.com/data/9eGKb6K1/versions/KYSxRYEb/voicechat-fabric-1.21.8-2.6.11.jar' },
        { name: 'geyser.jar', url: 'https://download.geysermc.org/v2/projects/geyser/versions/2.9.3/builds/1063/downloads/fabric' },
        { name: 'floodgate.jar', url: 'https://cdn.modrinth.com/data/bWrNNfkb/versions/ps3IuRel/Floodgate-Fabric-2.2.5-b45.jar' },
        { name: 'lithium.jar', url: 'https://mediafilez.forgecdn.net/files/7047/230/lithium-fabric-0.18.1%2Bmc1.21.8.jar' },
        { name: 'ferritecore.jar', url: 'https://cdn.modrinth.com/data/uXXizFIs/versions/LdlksamY/ferritecore-8.0.4-fabric.jar' },
        { name: 'iris.jar', url: 'https://cdn.modrinth.com/data/YL57xq9U/versions/Rhzf61g1/iris-fabric-1.9.6%2Bmc1.21.8.jar' },
        { name: 'terralith.jar', url: 'https://cdn.modrinth.com/data/8oi3bsk5/versions/JKg71Gq0/Terralith_1.21.x_v2.5.13.jar' },
        { name: 'tne-lite.jar', url: 'https://mediafilez.forgecdn.net/files/903/193/TNELite.jar' },
        { name: 'spark.jar', url: 'https://cdn.modrinth.com/data/l6YH9Als/versions/3KCl7Vx0/spark-1.10.142-fabric.jar' },
        { name: 'tectonic.jar', url: 'https://cdn.modrinth.com/data/lWDHr9jE/versions/G6Ed4Wsp/tectonic-3.0.13-fabric-1.21.8.jar' },
        { name: 'towns-towers.jar', url: 'https://cdn.modrinth.com/data/DjLobEOy/versions/HEqgNPcC/t_and_t-fabric-neoforge-1.13.5.jar' },
        { name: 'no-chat-reports.jar', url: 'https://cdn.modrinth.com/data/qQyHxfxd/versions/pmpg6ocz/NoChatReports-FABRIC-1.21.8-v2.15.0.jar' },
        { name: 'viafabricplus.jar', url: 'https://cdn.modrinth.com/data/rIC2XJV4/versions/A9NeiMwQ/ViaFabricPlus-4.2.5.jar' },
        { name: 'appleskin.jar', url: 'https://cdn.modrinth.com/data/EsAfCjCV/versions/YAjCkZ29/appleskin-fabric-mc1.21.6-3.0.6.jar' },
        { name: 'cloth-config.jar', url: 'https://cdn.modrinth.com/data/9s6osm5g/versions/cz0b1j8R/cloth-config-19.0.147-fabric.jar' },
        { name: 'xaero-minimap.jar', url: 'https://cdn.modrinth.com/data/1bokaNcj/versions/fZaO8piK/xaerominimap-fabric-1.21.8-25.3.10.jar' },
        { name: 'luckperms.jar', url: 'https://cdn.modrinth.com/data/Vebnzrzj/versions/uStOaYyZ/LuckPerms-Fabric-5.5.10.jar' },
        { name: 'cristellib.jar', url: 'https://cdn.modrinth.com/data/cl223EMc/versions/a2knYCon/cristellib-fabric-1.21.7-3.0.2.jar' },
        { name: 'lithostitched.jar', url: 'https://cdn.modrinth.com/data/89upU9un/versions/v1.3.1/lithostitched-fabric-1.3.1.jar' }
    ]
};

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) return reject(new Error(`Kod: ${res.statusCode}`));
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
    });
}

async function main() {
    try {
        if (!fs.existsSync(CONFIG.workingDir)) fs.mkdirSync(CONFIG.workingDir);
        const modsDir = path.join(CONFIG.workingDir, 'mods');
        if (!fs.existsSync(modsDir)) fs.mkdirSync(modsDir);

        console.log("📥 Kontrol ve İndirme başlıyor...");
        for (const mod of CONFIG.mods) {
            const p = path.join(modsDir, mod.name);
            if (!fs.existsSync(p)) {
                console.log(`📡 + ${mod.name}`);
                try { await download(mod.url, p); } catch (e) { console.log(`⚠️ ${mod.name} atlandı (Hata).`); }
            }
        }

        const j = path.join(CONFIG.workingDir, CONFIG.serverFileName);
        if (!fs.existsSync(j)) await download(CONFIG.serverUrl, j);

        fs.writeFileSync(path.join(CONFIG.workingDir, 'eula.txt'), 'eula=true');
        console.log("🚀 SUNUCU AÇILIYOR!");

        spawn('java', [`-Xmx${CONFIG.ram}`, `-Xms${CONFIG.ram}`, '-jar', CONFIG.serverFileName, 'nogui'],
            { cwd: CONFIG.workingDir, stdio: 'inherit' });

    } catch (e) { console.log("Hata:", e.message); }
}
main();