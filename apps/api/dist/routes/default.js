export default async function (fastify, opts) {
    const db = opts.db;
    fastify.get('/test', async () => {
        const users = await db.all('SELECT * FROM users');
        return users;
    });
}
