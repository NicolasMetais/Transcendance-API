import { createFriend, getFriendList, getFriendsRequest, acceptFriend, refuseFriend, deleteFriend, BlockFriend, UnblockFriend } from '../controllers/friendsController.js';
import { friendProperties } from '../schemas/schema.js';
const friendsRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.route({
        method: 'POST',
        url: "/friendRequest",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                201: { type: 'null' },
            },
        },
        handler: async (request, reply) => {
            const { user_id, friend_id, status = 'pending', } = request.body;
            try {
                const friend = await createFriend(db, user_id, friend_id, status);
                if (friend?.error == 'same id') {
                    reply.code(409).send({ error: "feeling lonely ? You can't be friend with yourself sorry" });
                    return;
                }
                if (friend?.error == 'friend') {
                    reply.code(409).send({ error: 'Friend request already exist' });
                    return;
                }
                if (friend?.error == 'user id') {
                    reply.code(409).send({ error: 'Invalid userID' });
                    return;
                }
                if (friend?.error == 'friend id') {
                    reply.code(409).send({ error: 'Invalid friendID' });
                    return;
                }
                reply.code(201).send();
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
    fastify.route({
        method: 'GET',
        url: "/friendlist/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: friendProperties,
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
                const matches = await getFriendList(db, id);
                if (matches.length == 0) {
                    reply.code(404).send({ error: "Empty friendlist" });
                    return;
                }
                reply.send(matches);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to fetch user' });
            }
        }
    });
    fastify.route({
        method: 'GET',
        url: "/friendReq/:id",
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: friendProperties,
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
                const matches = await getFriendsRequest(db, id);
                if (matches.length == 0) {
                    reply.code(404).send({ error: "No friends requests found" });
                    return;
                }
                reply.send(matches);
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to fetch user' });
            }
        }
    });
    fastify.route({
        method: 'PATCH',
        url: "/friendAccept",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
            },
        },
        handler: async (request, reply) => {
            const { user_id, friend_id } = request.body;
            try {
                const friend = await acceptFriend(db, user_id, friend_id);
                if (friend.changes === 0) {
                    reply.code(404).send({ error: "Friend request not found" });
                    return;
                }
                reply.send({ message: "Friend request accepted" });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to accept friend request' });
            }
        }
    });
    fastify.route({
        method: 'PATCH',
        url: "/friendRefuse",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { user_id, friend_id } = request.body;
            try {
                const friend = await refuseFriend(db, user_id, friend_id);
                if (friend.changes === 0) {
                    reply.code(404).send({ error: "Friend request not found" });
                    return;
                }
                reply.send({ message: "Friend request refused" });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to refuse friend request' });
            }
        }
    });
    fastify.route({
        method: 'PATCH',
        url: "/friendBlock",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object', properties: { message: { type: 'string' } }
                },
                404: {
                    type: 'object', properties: { error: { type: 'string' } }
                }
            }
        },
        handler: async (request, reply) => {
            const { user_id, friend_id } = request.body;
            try {
                const friend = await BlockFriend(db, user_id, friend_id);
                if (friend.changes === 0) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send({ message: "Blocked" });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to block friend' });
            }
        }
    });
    fastify.route({
        method: 'DELETE',
        url: "/unblockFriend",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
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
            const { user_id, friend_id } = request.body;
            try {
                const Unblock = await UnblockFriend(db, user_id, friend_id);
                if (Unblock.changes === 0) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send({ message: "Unblocked" });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to unblock user' });
            }
        }
    });
    fastify.route({
        method: 'DELETE',
        url: "/deleteFriend",
        schema: {
            body: {
                type: 'object',
                required: ['user_id', 'friend_id'],
                properties: {
                    user_id: { type: 'number' },
                    friend_id: { type: 'number' },
                },
                additionalProperties: false,
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
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
            const { user_id, friend_id } = request.body;
            try {
                const deletedFriend = await deleteFriend(db, user_id, friend_id);
                if (deletedFriend.changes === 0) {
                    reply.code(404).send({ error: "User not found" });
                    return;
                }
                reply.send({ message: "Friend deleted" });
            }
            catch (err) {
                reply.code(500).send({ error: 'Failed to delete user' });
            }
        }
    });
};
export default friendsRoutes;
