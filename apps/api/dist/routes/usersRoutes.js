import { createUser, getUser, updateUser, deleteUser, signIn, req_2fa, getProfile, getPersonnalData, anonymiseUser } from '../controllers/usersController.js';
import { userResponseSchema, ProfileResponseSchema } from '../schemas/schema.js';
import { verifyToken } from '../jwt.js';
const userRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'POST',
        url: "/signUp",
        schema: {
            body: {
                type: 'object',
                required: ['username', 'email', 'password', 'is_2fa'],
                properties: {
                    username: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    is_2fa: { type: 'integer', enum: [0, 1] },
                    avatar_url: { type: 'string' },
                    isLogged: { type: 'string' },
                    secret_2fa: { type: ['string', 'null'] },
                },
                additionalProperties: false,
            },
            response: {
                201: userResponseSchema,
            },
        },
        handler: async (request, reply) => {
            const { username, email, password, is_2fa, avatar_url = "placeholder.jpg", isLogged = "offline", secret_2fa = null, } = request.body;
            try {
                const user = await createUser(db, username, email, password, is_2fa, secret_2fa, avatar_url, isLogged);
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
        method: 'POST',
        url: "/signIn",
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        require2FA: { type: 'string' },
                        userId: { type: 'integer' }
                    },
                },
                401: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    },
                }
            },
        },
        handler: async (request, reply) => {
            const { email, password, } = request.body;
            try {
                const res = await signIn(db, email, password);
                if (res?.error == 'email') {
                    reply.code(401).send({ error: 'Invalid email' });
                    return;
                }
                if (res?.error == 'password') {
                    reply.code(401).send({ error: 'Invalid password' });
                    return;
                }
                if (res?.require2FA) {
                    reply.code(200).send({ require2FA: true, userId: res.userId });
                    return;
                }
                reply.code(200).send({ token: res.token });
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
                const user = await getProfile(db, id);
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
        method: 'POST',
        url: "/myprofile",
        schema: {
            body: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: ProfileResponseSchema,
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { id } = request.body;
            try {
                const token = request.cookie.jwt;
                const payload = verifyToken(token);
                if (!payload) {
                    reply.code(401).send({ error: "Unauthorized" });
                    return;
                }
                const userId = payload.userId;
                const data = await getPersonnalData(db, userId);
                if (!data.user) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send(data);
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
                    isLogged: { type: 'string' },
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
        method: 'PATCH',
        url: "/anonymise",
        schema: {
            body: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
                required: ['id'],
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        username: { type: 'string' },
                        email: { type: 'string' },
                    },
                    required: ['username', 'email'],
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            },
        },
        handler: async (request, reply) => {
            const { id } = request.body;
            try {
                const data = await anonymiseUser(db, id);
                if (!data) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send(data);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to anonymise user' });
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
    fastify.route({
        method: 'POST',
        url: "/2fa_req",
        schema: {
            body: {
                type: 'object',
                required: ['id', 'secret_2fa'],
                properties: {
                    id: { type: 'number' },
                    secret_2fa: { type: 'string', pattern: '^[0-9]{6}$' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' }
                    },
                    required: ['token']
                }
            },
        },
        handler: async (request, reply) => {
            const { id, secret_2fa, } = request.body;
            try {
                const res = await req_2fa(db, id, secret_2fa);
                if (res?.error == 'user') {
                    reply.code(401).send({ error: 'Invalid user' });
                    return;
                }
                if (res?.error == 'expired') {
                    reply.code(401).send({ error: 'code expired: 5min' });
                    return;
                }
                if (res?.error == 'code') {
                    reply.code(401).send({ error: 'Invalid code' });
                    return;
                }
                reply.code(200).send({ token: res.token });
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
};
export default userRoutes;
