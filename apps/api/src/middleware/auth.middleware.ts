import type { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await request.server.authenticate(request, reply);
}
