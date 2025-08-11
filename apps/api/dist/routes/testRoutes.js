export default async function (fastify, opts) {
    const db = opts.db;
    fastify.get('/showUsers', async () => {
        const users = await db.all('SELECT * FROM users');
        return users;
    });
    fastify.get('/showStats', async () => {
        const users = await db.all('SELECT * FROM stats');
        return users;
    });
    fastify.get('/showFriends', async () => {
        const users = await db.all('SELECT * FROM friends');
        return users;
    });
    fastify.get('/showMatches', async () => {
        const users = await db.all('SELECT * FROM matches');
        return users;
    });
}
;
