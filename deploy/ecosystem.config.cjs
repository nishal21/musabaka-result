/** PM2 — run from app root after `npm run build`. Secrets come from `.env`, not this file. */
module.exports = {
  apps: [
    {
      name: "musabaka",
      cwd: "/opt/musabaka",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: "3003",
      },
    },
  ],
};
