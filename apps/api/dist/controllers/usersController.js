import { signToken } from '../jwt.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../controllers/mailsController.js';
export const createUser = async (db, username, email, password, is_2fa, secret_2fa, avatar_url = "placeholder.jpg", isLogged = "offline") => {
    const userExist = await db.get("SELECT 1 FROM users WHERE username = ?", [username]);
    if (userExist)
        return { error: 'username' };
    const emailExist = await db.get("SELECT 1 FROM users WHERE email = ?", [email]);
    if (emailExist)
        return { error: 'email' };
    const saltRounds = 15;
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await db.run(`INSERT INTO users (username, email, password_hash, is_2fa, secret_2fa, avatar_url, isLogged) VALUES (?, ?, ?, ?, ?, ?, ?)`, [username, email, hash, is_2fa, secret_2fa, avatar_url, isLogged]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    await db.run(`INSERT INTO stats (user_id) VALUES (?)`, [result.lastID]);
    return user;
};
export const getProfile = async (db, id) => {
    const user = await db.get('SELECT username, avatar_url, isLogged FROM users WHERE id = ?', [id]);
    const friends = await db.all('SELECT * FROM friends WHERE user_id = ? OR friends_id = ?', [id, id]);
    const matches = await db.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id = ?', [id, id]);
    const stats = await db.get('SELECT * FROM stats WHERE user_id = ? ', [id]);
    return { user, friends, matches, stats };
};
export const getPersonnalData = async (db, id) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    const friends = await db.all('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?', [id, id]);
    const matches = await db.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id = ?', [id, id]);
    const stats = await db.get('SELECT * FROM stats WHERE user_id = ? ', [id]);
    return { user, friends, matches, stats };
};
export const getUser = async (db, id) => {
    return await db.get('SELECT id, username FROM users WHERE id = ?', [id]);
};
export const getAvatar = async (db, id) => {
    return await db.get('SELECT id, avatar_url FROM users WHERE id = ?', [id]);
};
export const anonymiseUser = async (db, id) => {
    const user = await getUser(db, id);
    if (!user)
        return null;
    const username = `username${user.id}`;
    const email = `email${user.id}@anonyme.com`;
    const avatar = 'placeholder.jpg';
    await db.run('UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?', [username, email, avatar, id]);
    return { username, email };
};
export const updateUser = async (db, id, updates) => {
    const obj = Object.keys(updates);
    if (obj.length == 0)
        return getUser(db, id);
    if ('password_hash' in updates && updates.password_hash) {
        const saltRounds = 10;
        const hash = await bcrypt.hash(updates.password_hash, saltRounds);
        updates.password_hash = hash;
    }
    const Datas = obj.map(obj => `${obj} = ?`).join(', ');
    const values = obj.map(obj => updates[obj]);
    values.push(id);
    await db.run(`UPDATE users SET ${Datas} WHERE id = ?`, values);
    return getUser(db, id);
};
export const deleteUser = async (db, id) => {
    const user = await getUser(db, id);
    if (!user || user.id == 1)
        return null;
    await db.run(`UPDATE matches SET player1_id = 1 WHERE player1_id = ?`, [id]);
    await db.run(`UPDATE matches SET player2_id = 1 WHERE player2_id = ?`, [id]);
    await db.run(`UPDATE matches SET winner_id = 1 WHERE winner_id = ?`, [id]);
    await db.run('DELETE FROM friends WHERE user_id = ? OR friend_id = ?', [id, id]);
    await db.run('DELETE FROM stats WHERE user_id = ?', [id]);
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    return user;
};
export const signIn = async (db, email, password) => {
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user)
        return { error: 'email' };
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
        return { error: 'password' };
    if (user.is_2fa === 1) {
        //niveau de complexite du hash
        const saltRounds = 10;
        const secret_2fa = Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await bcrypt.hash(secret_2fa, saltRounds);
        await db.run(`UPDATE users SET secret_2fa = ?, timer_2fa = datetime('now', '+5 minutes') WHERE id = ?`, [hash, user.id]);
        await sendEmail(user.email, "Authentification code", `here is your code: ${secret_2fa}`);
        return { require2FA: true, userId: user.id };
    }
    const token = signToken({ userId: user.id });
    return { token };
};
export const req_2fa = async (db, id, secret_2fa) => {
    const user = await db.get("SELECT * FROM users WHERE user = ?", [id]);
    if (!user)
        return { error: 'user' };
    const now = new Date();
    const expired = new Date(user.timer_2fa);
    if (now > expired)
        return { error: 'expired' };
    const isCodeValid = await bcrypt.compare(secret_2fa, user.secret_2fa);
    if (!isCodeValid)
        return { error: 'code' };
    await db.run(`UPDATE users SET secret_2fa = NULL WHERE id = ?`, [id]);
    const token = signToken({ userId: user.id });
    return { token };
};
export const updateUserStatus = async (db, id, status) => {
    await db.run(`UPDATE users SET isLogged = ? WHERE id = ?`, status, id);
};
export const upload = async (db, id, avatar) => {
    await db.run("UPDATE users SET avatar_url = ? WHERE id = ?", [avatar, id]);
};
