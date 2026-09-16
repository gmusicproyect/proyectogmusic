module.exports = {
  apps: [{
    name: "gmusic-api",
    cwd: process.env.GMUSIC_APP_DIR || "/srv/gmusic/current/Página de cursos de música",
    script: "server/index.ts",
    interpreter: "node",
    node_args: "--env-file=/etc/gmusic/api.env --import tsx --import ./sentry.server.instrument.ts",
    instances: 1,
    exec_mode: "fork",
    env: { NODE_ENV: "production", PORT: "3001" },
    max_memory_restart: "600M",
    kill_timeout: 15000,
    time: true,
  }],
};
