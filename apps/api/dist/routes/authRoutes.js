import { googleOAuth } from '../controllers/authController.js';
const authRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'GET',
        url: "/auth/google/callback",
        schema: {
            params: {
                type: 'object',
                required: ['code'],
                properties: {
                    code: { type: 'string' }
                }
            },
            response: {
                201: { type: 'string' },
            },
        },
        handler: async (request, reply) => {
            const { code } = request.params;
            try {
                const google = await googleOAuth(db, code);
                reply.code(201).send(google);
            }
            catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    reply.code(409).send({ error: 'Constraint problems' });
                }
                else {
                    throw err;
                }
            }
            ;
        },
    });
};
export default authRoutes;
