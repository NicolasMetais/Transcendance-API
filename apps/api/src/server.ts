import Fastify from 'fastify'
import cors from "@fastify/cors";
import multipart from '@fastify/multipart';
import fastifyCookie from '@fastify/cookie';
import bdd from './app.js';
import dotenv from 'dotenv';
dotenv.config();

import defaultRoute from "./routes/testRoutes.js"
import userRoutes from "./routes/usersRoutes.js";
import matchesRoutes from "./routes/matchesRoutes.js";
import friendsRoutes from "./routes/friendsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import websocketsRoutes from './routes/websocketsRoutes.js';

import { verifyToken } from './jwt.js';

//manipulation de fichiers
import fs from "fs";
//construire des paths
import path from "path";
import {fileURLToPath } from "url";
import fastifyStatic from '@fastify/static'
import fastifyWebsocket from '@fastify/websocket';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function start () {
// Chargement des certifs auto-signés
const keyPath = path.resolve(__dirname, "../infra/certs/key.pem");
const certPath = path.resolve(__dirname, "../infra/certs/cert.pem");

const app = Fastify({
  https: {
	key: fs.readFileSync(keyPath),
	cert: fs.readFileSync(certPath),
  },
  logger: true,
  ajv: {
	customOptions: {
		allErrors: true,
		verbose: true
	}
  }
});

//generic request error handler
//CE TRUC EST JAMAIS APPELER MANUELLEMENT MAIS FASTIFY LE FAIT TOUT SEUL
app.setErrorHandler((error: any, request: any, reply: any) => {
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation error',
      message: error.message,
      details: error.validation
    });
  }
  console.error(error)
  return reply.status(500).send({ error : 'Internal Server Error'});
});

// Autorise http://localhost:5173 à appeler l'API en dev
await app.register(cors, {
	origin: ["http://localhost:5173"],
	credentials: true
});

await app.register(fastifyWebsocket);

console.log(__dirname);

await app.register(fastifyStatic, {
  root: path.join(__dirname, 'routes/uploads'),
  prefix: '/uploads/',
});

await app.register(multipart, {
  limits: {
    fileSize: 1_000_000,
    files: 1,
  }
});

await app.register(fastifyCookie);
const db = await bdd();

//routes non protegee par un JWT
const openPaths = ['/signUp', '/signIn', '/auth/google/callback', '/2fa_req', '/connexionStatus', '/showUsers', '/showStats', '/showFriends', '/showMatches']

app.addHook('preHandler', (request: any, reply: any, done: any) => {
  if (openPaths.includes(request.routerPath)) {
    done();
    return ;
  }
  if (request.raw.url?.startsWith('/uploads/'))
  {
      done();
      return ;
  }
  const url = request.raw.url.split('?')[0];
  if (openPaths.includes(url)) {
    done();
    return;
  }
  const authHeader = request.headers['authorization'];
  if (!authHeader){
    reply.status(401).send({ error: 'Missing Authorization header'});
    return ;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    reply.status(401).send({ error: 'Invalid Token' });
    return;
  }
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      reply.status(401).send( {error: 'Token expired'});
      return ;
    }
    (request as any).user = decoded;
    done();
  } catch (err) {
    reply.status(401).send({ error: 'Invalid token'});
    return ;
  }
});

app.register(defaultRoute, { db });
app.register(userRoutes, { db });
app.register(matchesRoutes, { db });
app.register(friendsRoutes, { db });
app.register(authRoutes, { db });
app.register(websocketsRoutes, { db });



const PORT = 8443;
try {
	app.listen({ port: PORT, host: '0.0.0.0'});
	console.log(`server Listening at ${PORT}`);
} catch (err) {
	app.log.error(err);
	process.exit(1);
	}
}

start ();