import { incrementGameplayed } from '../controllers/statsController.js';
const statsRoute = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'PATCH',
        url: "/incrementGameplayed",
        schema: {
            body: {
                type: 'object',
                required: ['player1_id', 'player2_id'],
                properties: {
                    player1_id: { type: 'number' },
                    player2_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' }
                        }
                    }
                },
            },
        },
        handler: async (request, reply) => {
            const { player1_id, player2_id } = request.body;
            try {
                const gameplayed = await incrementGameplayed(db, player1_id, player2_id);
                if ('error' in gameplayed) {
                    reply.code(404).send({ error: gameplayed.error });
                }
                reply.send({ message: gameplayed.message });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to increment game played' });
            }
        }
    });
};
