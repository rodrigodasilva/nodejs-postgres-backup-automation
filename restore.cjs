import { spawn } from 'child_process'
import fs from "node:fs"
import path from "node:path"
import dotenv from 'dotenv'
dotenv.config();

const DB_HOST = '';
const DB_PORT = 5433;
const DB_USER = '';
const DB_PASSWORD = '';
const DB_NAME = '';
const BACKUP_DIR = process.env.BACKUP_DIR;

async function restore() {
    console.log("restore - Iniciando processo de restauração...");

    if (!BACKUP_DIR) {
        console.error("restore - BACKUP_DIR não está definido.");
        return;
    }

    // Listar e ordenar arquivos de backup
    console.log("restore - Buscando arquivos de backup...");
    const files = fs.readdirSync(BACKUP_DIR)
        .filter((file) => fs.lstatSync(path.join(BACKUP_DIR, file)).isFile())
        .map((file) => ({ file, mtime: fs.lstatSync(path.join(BACKUP_DIR, file)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (!files.length) {
        console.error("restore - Nenhum backup encontrado.");
        return;
    }

    const restoreFileName = files[0].file;
    const restoreFilePath = path.join(BACKUP_DIR, restoreFileName);
    console.log(`restore - Arquivo de backup encontrado: ${restoreFileName}`);

    // Executar o comando de restauração
    console.log(`restore - Iniciando restauração do banco de dados: ${DB_NAME}`);
    const restoreProcess = spawn('pg_restore', [
        '-cC',
        '-U', DB_USER,
        '-h', DB_HOST,
        '-p', DB_PORT,
        '-d', DB_NAME,
        restoreFilePath
    ], {
        env: { ...process.env, PGPASSWORD: DB_PASSWORD },
        stdio: 'inherit' // Exibe logs diretamente no terminal
    });

    // Capturar eventos de saída e erro
    restoreProcess.on('exit', (code) => {
        if (code === 0) {
            console.log("restore - Restauração concluída com sucesso!");
        } else {
            console.error(`restore - Falha na restauração (código: ${code}).`);
        }
    });

    restoreProcess.on('error', (err) => {
        console.error("restore - Erro ao iniciar a restauração:", err);
    });
}

restore();
