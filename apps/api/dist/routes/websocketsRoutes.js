import { updateUserStatus } from '../controllers/usersController.js';
import { verifyToken } from '../jwt.js';
const websocketsRoutes = async (fastify, opts) => {
    const { db } = opts;
    fastify.get('/connexionStatus', { websocket: true }, (connection, req) => {
        const token = req.cookies.jwt;
        try {
            const payload = verifyToken(token);
            if (!payload) {
                connection.socket.close();
                return;
            }
            const userId = payload.userId;
            updateUserStatus(db, userId, true);
            console.log(`${userId} is online`);
            connection.socket.on('close', () => {
                updateUserStatus(db, userId, false);
                console.log(`${userId} is offline`);
            });
        }
        catch {
            connection.socket.close();
        }
    });
};
export default websocketsRoutes;
