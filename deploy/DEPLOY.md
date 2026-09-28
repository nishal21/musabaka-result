# Deploy (example: musabaka.nishal.dev)

| | |
|---|---|
| App path | `/opt/musabaka` |
| PM2 name | `musabaka` on port `3003` |
| Public URL | set `NEXT_PUBLIC_SITE_URL` in `.env` |

## DNS

Point an A record at your VPS IP.

## Install

```bash
git clone <YOUR_REPO_URL> /opt/musabaka
cd /opt/musabaka
cp .env.example .env
# fill ADMIN_PASSWORD, SESSION_SECRET (≥32 chars), NEXT_PUBLIC_SITE_URL, DATABASE_URL
mkdir -p data
npm ci
npx prisma migrate deploy
npm run build
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Or: `bash deploy/install.sh`

Put real secrets only in `/opt/musabaka/.env` on the server. Do not put them in git, nginx samples, or `ecosystem.config.cjs`.

## Nginx + TLS

Sample configs in this folder use `musabaka.nishal.dev` — edit `server_name` and cert paths for your domain.

```bash
cp deploy/nginx-musabaka.nishal.dev-http-only.conf /etc/nginx/sites-available/musabaka.nishal.dev
ln -sf /etc/nginx/sites-available/musabaka.nishal.dev /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot certonly --nginx -d musabaka.nishal.dev
cp deploy/nginx-musabaka.nishal.dev.conf /etc/nginx/sites-available/musabaka.nishal.dev
nginx -t && systemctl reload nginx
```

Do not open port 3003 to the public internet.

## Update

```bash
cd /opt/musabaka
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart musabaka
```

## Check

```bash
curl -I http://127.0.0.1:3003
pm2 status
nginx -t
```
