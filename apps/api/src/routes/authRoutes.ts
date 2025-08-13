import { FastifyPluginAsync } from 'fastify';
import { Database } from 'sqlite';
import { googleOAuth } from '../controllers/authController.js';
import { friendProperties } from '../schemas/schema.js';

const authRoutes: FastifyPluginAsync <{ db: Database }> = async (fastify: any, opts: any) => {
	const { db } = opts;

	fastify.route({
		method: 'GET',
		url: "/auth/google/callback",
		schema: {
			params: {
				type : 'object',
				required: ['code'],
				properties: {
					code: {type: 'string' }
				}
			},
			response: {
				201: { type: 'string' },
				},
			},
		handler: async(request: any, reply: any) => {
			const { code } = request.params as { code: string };
			try {
				const google = await googleOAuth(db, code);
				reply.code(201).send(google);
			} catch (err: any) {
				if (err.code === 'SQLITE_CONSTRAINT') {
						reply.code(409).send({ error: 'Constraint problems' });
				} else {
					throw err;
				}
			};
		},
	});
}
export default authRoutes;