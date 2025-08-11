import { createUser, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { userResponseSchema } from '../schemas/schema.js';
const userRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'POST',
        url: "/users",
        schema: {
            body: {
                type: 'object',
                required: ['username', 'email', 'password_hash', 'is_2fa', 'secret_2fa'],
                properties: {
                    username: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password_hash: { type: 'string' },
                    is_2fa: { type: 'integer', enum: [0, 1] },
                    secret_2fa: { type: ['string', 'null'] },
                    avatar_url: { type: 'string', default: 'placeholder.jpg' },
                },
                additionalProperties: false,
            },
            response: {
                201: userResponseSchema,
            },
        },
        handler: async (request, reply) => {
            const { username, email, password_hash, is_2fa, secret_2fa, avatar_url = "placeholder.jpg", } = request.body;
            try {
                const user = await createUser(db, username, email, password_hash, is_2fa, secret_2fa, avatar_url);
                if (user?.error == 'username') {
                    reply.code(409).send({ error: 'Username unavalaible' });
                    return;
                }
                if (user?.error == 'email') {
                    reply.code(409).send({ error: 'Email already exists' });
                    return;
                }
                reply.code(201).send(user);
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
        url: "/users/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: userResponseSchema,
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
                const user = await getUser(db, id);
                if (!user) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send(user);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to fetch user' });
            }
        }
    });
    fastify.route({
        method: 'PATCH',
        url: "/users/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    username: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password_hash: { type: 'string' },
                    is_2fa: { type: 'integer', enum: [0, 1] },
                    secret_2fa: { type: ['string', 'null'] },
                    avatar_url: { type: 'string' },
                },
                additionalProperties: false,
            },
            response: {
                200: userResponseSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
        handler: async (request, reply) => {
            const { id } = request.params;
            const updates = request.body;
            try {
                const user = await getUser(db, id);
                if (!user) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                const updatedUser = await updateUser(db, id, updates);
                reply.send(updatedUser);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to update user' });
            }
        }
    });
    fastify.route({
        method: 'DELETE',
        url: "/users/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: userResponseSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
        handler: async (request, reply) => {
            const { id } = request.params;
            try {
                const deletedUser = await deleteUser(db, id);
                if (!deletedUser) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send(deletedUser);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to delete user' });
            }
        }
    });
};
export default userRoutes;
