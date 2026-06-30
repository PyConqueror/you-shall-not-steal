import { startServer } from "@/fastify-app";

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
