import fs from 'fs'
import { Dropbox } from 'dropbox'
import dotenv from 'dotenv'

dotenv.config();

import { logger } from './logger.js'

const BACKUP_DIR = process.env.BACKUP_DIR
const APP_KEY = process.env.DROPBOX_API_KEY
const APP_SECRET = process.env.DROPBOX_API_SECRET
const REFRESH_TOKEN = process.env.DROPBOX_API_REFRESH_TOKEN

async function getAccessToken() {
    try {
        const response = await fetch("https://api.dropbox.com/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: REFRESH_TOKEN,
                client_id: APP_KEY,
                client_secret: APP_SECRET
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();
        logger.log("uploadFile.getAccessToken - token:", data.access_token);
        return { data: data.access_token, error: null}
    } catch (error) {
        logger.error("uploadFile.getAccessToken - error:", error.message);
        return { error: error.message || 'Erro ao obter token' }
    }
}

async function uploadFile(filePath) {
  const accessTokenResult = await getAccessToken()
  if (accessTokenResult.error) {
    return accessTokenResult
  }

  const dbx = new Dropbox({ accessToken: accessTokenResult.data });

  const fileName = filePath.split('/').pop() // Extract file name from path
  
  return new Promise((resolve) => {
    fs.readFile(filePath, (err, contents) => {
      if (err) {
        logger.log('uploadFile - read file error: ', err);
        resolve({ error: err })
      }
        
      dbx.filesUpload({ path: `/${fileName}`, contents })
        .then((response) => {
          resolve({ data: response?.result })
        })
        .catch((uploadErr) => {
          resolve({ error: uploadErr })
      });
    });    
  });
}

export { uploadFile }