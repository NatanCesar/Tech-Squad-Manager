import os from 'os';
import { spawn } from 'child_process';

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const localIp = getLocalIp();
const backendUrl = `http://${localIp}:3001`;
const frontendUrl = `http://${localIp}:5173/Tech-Squad-Manager/`;

console.log('\n===============================================================');
console.log('🎮  TECH SQUAD MANAGER — SERVIDOR DE REDE LOCAL');
console.log('===============================================================');
console.log(`\n📌 Seu IP Local: ${localIp}`);
console.log(`\n👉 Link para a TURMA conectar (copie e envie):`);
console.log(`   ${frontendUrl}`);
console.log(`\n⚙️  Backend rodando em: ${backendUrl}`);
console.log('===============================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Inicia o backend
const backend = spawn(npmCmd, ['run', 'dev'], {
    cwd: './backend',
    stdio: 'inherit',
    shell: true,
});

// Inicia o frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
    cwd: './frontend',
    stdio: 'inherit',
    shell: true,
});

function cleanup() {
    console.log('\nEncerrando servidores...');
    backend.kill();
    frontend.kill();
    process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
