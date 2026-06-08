import { config } from "./config.js";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(config.apiPort, () => {
  console.log(`Gmusic Learning Engine API listening on http://localhost:${config.apiPort}`);
  console.log(
    `[dev-auth] Alumno resuelto por GMUSIC_DEV_USER_EMAIL (default: carlos@gmusic.academy)`
  );
});

async function shutdown(signal: string) {
  console.log(`\n${signal} received — closing API and Prisma...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
