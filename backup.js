import { spawn } from 'child_process'
import fs from "node:fs"
import path from "node:path"
import dotenv from 'dotenv'
dotenv.config();

import { logger } from './logger.js'
import { uploadFile } from './upload-file.js'
import { sendNotification } from './send-notification.js'

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const BACKUP_DIR = process.env.BACKUP_DIR;

async function backup() {
    logger.log('backup - Inicializando backup...');
    
    if (!BACKUP_DIR) {
        logger.error("backup - BACKUP_DIR não está definido.");
        process.exit(1);
    }
    
    if (!fs.existsSync(BACKUP_DIR)) {
        logger.log("backup - Criando diretório de backup...");
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    
    logger.log(`backup - Iniciando backup do banco de dados: ${DB_NAME}`);
    
    const date = new Date();
    const currentDate = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
    const fileName = path.join(BACKUP_DIR, `backup_${DB_NAME}_${currentDate}.tar`);
    
    const dumpProcess = spawn('pg_dump', [
        '-h', DB_HOST,
        '-p', DB_PORT,
        '-U', DB_USER,
        '-d', DB_NAME,
        '-f', fileName,
        '-F', 't'
    ], {
        env: { ...process.env, PGPASSWORD: DB_PASSWORD },
        stdio: 'inherit' // Exibe a saída do pg_dump diretamente no terminal
    });

    dumpProcess.on('exit', async (code) => {
        if (code !== 0) { 
            logger.error(`backup - Falha no backup (código: ${code}).`);
            const notificationResult =  await sendNotification({ 
                subject: '[Backup com error]',                
                text: `Houve um erro no dump do backup. \n code: ${code}`
            })
            if (notificationResult?.error) {
                logger.log("backup - error ao enviar a notificação!", error);
            }
        }
        
        logger.log(`backup - Backup concluído: ${fileName}`);

        try {
            logger.log(`backup - Fazendo upload do arquivo...`);
            const fileResult =  await uploadFile(fileName);

            logger.log(`backup - Removendo arquivo local: ${fileName}`);
            if (fs.existsSync(fileName)) {
                fs.unlinkSync(fileName);
            }

            if (fileResult?.error) {
                logger.error("backup - Erro ao fazer upload - error", fileResult?.error);
                await sendNotification({ 
                    subject: '[Backup com error]',
                    text: `Houve um erro ao realizar o upload do arquivo. \n error: ${fileResult?.error}`
                })
                return
            }

            logger.log("backup - Upload concluído!");

            const notificationResult =  await sendNotification({ 
                subject: '[Backup com sucesso]',
                text: 'Backup do banco de dados realizado com sucessso'
            })
            if (notificationResult?.error) {
                logger.error("backup - error ao enviar a notificação!", notificationResult?.error);
            }

            logger.log("backup - Processo finalizado com sucesso!");
        } catch (err) {
            logger.error("backup - Erro ao fazer o backup:", err);
            await sendNotification({ 
                subject: '[Backup com error]',
                text: `Houve um erro ao realizar o backup do banco de dados. \n error: ${err.message}`
            })
        }              
    });

    dumpProcess.on('error', (err) => {
        logger.error("backup - Erro ao iniciar o processo de backup:", err);
    });
}

export { backup }
