# 🔄 Automatização de Backup do PostgreSQL com Node.js, PM2, Dropbox e Resend

Este projeto realiza backups automáticos de um banco de dados PostgreSQL, envia os arquivos para o Dropbox e envia notificações por e-mail utilizando o serviço Resend. O agendamento é feito com `cron` e o processo é mantido ativo com `PM2`.

---

## ✅ Requisitos

Antes de iniciar, certifique-se de que os seguintes itens estão configurados:

- Sistema operacional Linux
- Cliente PostgreSQL instalado (necessário para rodar `pg_dump`)
  ```bash
  sudo apt-get install postgresql-client
  ```
- Node.js versão **18.8.0 ou superior**
- Arquivo `.env` com as variáveis de ambiente necessárias:
  ```env
  DB_HOST=
  DB_PORT=
  DB_USER=
  DB_PASSWORD=
  DB_NAME=
  BACKUP_DIR=
  ```

---

## ⚙️ Inicialização com PM2

### Passo 1: Configurar o PM2 para iniciar com o sistema

> Obs: Caso o PM2 já esteja configurado para inicialização automática, você pode pular este passo.

Execute o comando abaixo:

```bash
pm2 startup
```

O terminal irá retornar um comando semelhante a este:

```bash
sudo env PATH=$PATH:/home/usuario/.nvm/versions/node/v18.18.0/bin \
/home/usuario/.nvm/versions/node/v18.18.0/lib/node_modules/pm2/bin/pm2 \
startup systemd -u usuario --hp /home/usuario
```

Copie e execute o comando gerado para registrar o PM2 como serviço de inicialização.

---

### Passo 2: Iniciar o serviço de backup e salvar o snapshot

Inicie o processo com o PM2:

```bash
pm2 start ./build/start-cron-backup.cjs --name database-backup-cron
```

Em seguida, salve o snapshot:

```bash
pm2 save
```

Isso garante que o processo será restaurado automaticamente após reinicializações do sistema.

---

### Passo 3: Verificar se está funcionando após reinicialização

1. Reinicie o servidor:

   ```bash
   sudo reboot
   ```

2. Após reiniciar, verifique se o processo está ativo:

   ```bash
   pm2 list
   ```

Se o processo `database-backup-cron` estiver na lista, tudo está funcionando corretamente! ✅

Para remover o agendamento:

```bash
pm2 delete database-backup-cron
```

---

## 💾 Executar o Backup Manualmente

Se quiser rodar o backup manualmente:

```bash
npm run backup
```

---

## ♻️ Restaurando o Backup

### Etapa 1: Subir um novo banco de dados com Docker (exemplo)

```bash
docker run --name postgres_restore \
  -e POSTGRES_PASSWORD=docker \
  -e POSTGRESQL_DATABASE=postgres-database \
  -p 5433:5432 \
  -d postgres
```

### Etapa 2: Executar o script de restauração

```bash
npm run restore
```

---