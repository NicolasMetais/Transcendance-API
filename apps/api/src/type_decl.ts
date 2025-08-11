declare module '@fastify/jwt' {
  import { FastifyPluginAsync } from 'fastify';

  interface FastifyJWTOptions {
    secret: string | { public: string; private?: string };
  }

  const fastifyJwt: FastifyPluginAsync<FastifyJWTOptions>;

  export default fastifyJwt;
}

declare module 'dotenv' {
  export function config(options?: { path?: string }): { parsed?: Record<string, string>; error?: Error };
}