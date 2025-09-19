import { Database } from 'sqlite'
import { signToken } from '../jwt.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../controllers/mailsController.js';

export const createUser = async (db: Database, username: string,email: string, password: string, 
	is_2fa: number, secret_2fa: string | null, avatar_url: string = "placeholder.jpg", isLogged: string = "offline") => {

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

export const getProfile = async (db: Database, id: number) => {
	const user = await db.get('SELECT username, avatar_url, isLogged FROM users WHERE id = ?', [id]);
	const friends = await db.all('SELECT * FROM friends WHERE user_id = ? OR friends_id = ?', [id, id]);
	const matches = await db.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id = ?', [id, id]);
	const stats = await db.get('SELECT * FROM stats WHERE user_id = ? ', [id]);
	return { user, friends, matches, stats };
};

export const getPersonnalData = async (db: Database, id: number) => {
	const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
	const friends = await db.all('SELECT * FROM friends WHERE user_id = ? OR friend_id = ?', [id, id]);
	const matches = await db.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id = ?', [id, id]);
	const stats = await db.get('SELECT * FROM stats WHERE user_id = ? ', [id]);
	return { user, friends, matches, stats };
};

export const getUser = async (db: Database, id: number) => {
	return await db.get('SELECT id, username FROM users WHERE id = ?', [id]);
};

export const getAvatar = async (db: Database, id: number) => {
	return await db.get('SELECT id, avatar_url FROM users WHERE id = ?', [id]);
};

export const anonymiseUser = async (db: Database, id: number) => {
	const user = await getUser(db, id);
	if (!user)
		return null;
	const username = `username${user.id}`
	const email = `email${user.id}@anonyme.com`
	const avatar = 'placeholder.jpg';
	await db.run('UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE id = ?', [username, email, avatar, id]);
	return { username, email };
};

type UserUpdateFields = {
  username?: string;
  email?: string;
  password_hash?: string;
  is_2fa?: number;
  secret_2fa?: string | null;
  avatar_url?: string;
};

export const updateUser = async (db: Database, id: number, updates: UserUpdateFields) => {
	const obj = Object.keys(updates) as (keyof UserUpdateFields)[];
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

export const deleteUser = async (db: Database, id: number) => {
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

export const signIn = async (db: Database, email: string, password: string) => {

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
		await db.run(`UPDATE users SET secret_2fa = ?, timer_2fa = datetime('now', '+5 minutes') WHERE id = ?`, [hash, user.id])
		await sendEmail (user.email, "Authentification code", `here is your code: ${secret_2fa}`);
		return { require2FA: true, userId: user.id };
	}
	const token = signToken({ userId: user.id });
	return { token }
};

export const req_2fa = async (db: Database, id: number, secret_2fa: string) => {

	const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
	if (!user)
		return { error: 'user' };
	const now = new Date();
	const expired = new Date(user.timer_2fa);
	if (now > expired)
		return { error: 'expired' }
	const isCodeValid = await bcrypt.compare(secret_2fa, user.secret_2fa);
	if (!isCodeValid)
		return { error: 'code' };
	await db.run(`UPDATE users SET secret_2fa = NULL WHERE id = ?`, [id])
	const token = signToken({ userId: user.id });
	return { token }
};

export const updateUserStatus = async (db: Database, id:number, status: boolean) => {
	await db.run(`UPDATE users SET isLogged = ? WHERE id = ?`, status, id);
};

export const upload = async (db: Database, id: number, avatar: string) => {
	await db.run("UPDATE users SET avatar_url = ? WHERE id = ?", [avatar, id]);
};
