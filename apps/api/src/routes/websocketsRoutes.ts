import { FastifyPluginAsync, FastifyInstance, FastifyRequest } from 'fastify';
import { Database } from 'sqlite';
import { updateUserStatus } from '../controllers/usersController.js';
import { verifyToken } from '../jwt.js';

const websocketsRoutes: FastifyPluginAsync <{ db: Database }> = async (fastify: FastifyInstance, opts: any) => {
	const { db } = opts;

	fastify.get('/connexionStatus', { websocket: true }, (connection: any, req: FastifyRequest) => {
		const token = (req as  any).cookies.jwt;
		try {
			const payload = verifyToken(token);
			if (!payload)
			{
				connection.socket.close();
				return;
			}
			const userId = (payload as any).userId;
			updateUserStatus(db, userId, true);
			console.log(`${userId} is online`);
			connection.socket.on('close', () => {
				updateUserStatus(db, userId, false);
				console.log(`${userId} is offline`);

			});
		} catch {
			connection.socket.close();
		}
	});
}
export default websocketsRoutes;