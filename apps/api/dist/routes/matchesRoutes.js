import { createMatch, getMatches } from '../controllers/matchesController.js';
import { matchProperties } from '../schemas/schema.js';
const matchesRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'POST',
        url: "/newMatch",
        schema: {
            body: {
                type: 'object',
                required: ['player1_id', 'player2_id', 'winner_id', 'score_player1', 'score_player2'],
                properties: {
                    player1_id: { type: 'number' },
                    player2_id: { type: 'number' },
                    winner_id: { type: 'number' },
                    score_player1: { type: 'number', minimum: 0 },
                    score_player2: { type: 'number', minimum: 0 },
                },
                additionalProperties: false,
            },
            response: {
                201: { type: 'null' }
            },
        },
        handler: async (request, reply) => {
            const { player1_id, player2_id, winner_id, score_player1, score_player2 } = request.body;
            try {
                const match = await createMatch(db, player1_id, player2_id, winner_id, score_player1, score_player2);
                if ('error' in match) {
                    reply.code(409).send({ error: match.error });
                    return;
                }
                reply.code(201).send();
            }
            catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    reply.code(409).send({ error: 'constraint problems' });
                }
                else {
                    throw err;
                }
            }
            ;
        },
    });
    fastify.route({
        method: 'GET',
        url: "/matches/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: matchProperties,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { id } = request.params;
            try {
                console.log('Matches for player', id);
                const matches = await getMatches(db, id);
                if (matches.length == 0) {
                    reply.code(404).send({ error: "No matches found" });
                    return;
                }
                reply.send(matches);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to fetch user' });
            }
        }
    });
};
export default matchesRoutes;
