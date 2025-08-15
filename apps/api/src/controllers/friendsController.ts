import { Database } from 'sqlite';

export const createFriend = async (db: Database, user_id: number, friend_id: number , status: string):
	Promise<any | { error: string }> => {
	if (user_id == friend_id)
		return { error: 'same id'}
	const isFriend = await db.get("SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", [user_id, friend_id, friend_id, user_id]);
	if (isFriend)
		return { error: 'friend'};
	const user = await db.get("SELECT 1 FROM users WHERE id = ?", [user_id]);
	if (!user)
		return { error: 'user id'};
	const friend = await db.get("SELECT 1 FROM users WHERE id = ?", [friend_id]);
	if (!friend)
		return { error: 'friend id'};
	const result = await db.run(`INSERT INTO friends (user_id, friend_id, status) VALUES (?,?,?)`, [user_id, friend_id, status]);
	return result;
};

export const getFriendList = async (db: Database, id: number) => {
	const result = await db.all(`SELECT * FROM friends WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'`, [id, id]);
	return result;
};

export const getFriendsRequest = async (db: Database, id: number) => {
	const result = await db.all(`SELECT * FROM friends WHERE friend_id = ? AND status = 'pending'`, [id]);
	return result;
};

export const acceptFriend = async (db: Database, user_id: number, friend_id: number) => {
	const result = await db.run(`UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ? AND status = 'pending'`, [user_id, friend_id]);
	return result
};

export const refuseFriend = async (db: Database, user_id: number, friend_id: number) => {
	const result = await db.run(`DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'`, [user_id, friend_id]);
	return result
};

export const deleteFriend = async (db: Database, user_id: number, friend_id: number) => {
	const result = await db.run(`DELETE FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`, [user_id, friend_id, friend_id, user_id]);
	return result
};

export const BlockFriend = async (db: Database, user_id: number, friend_id: number) => {
	const result = await db.run(`UPDATE friends SET status = 'blocked' WHERE user_id = ? AND friend_id = ?`, [user_id, friend_id]);
	return result
};

export const UnblockFriend = async (db: Database, user_id: number, friend_id: number) => {
	const result = await db.run(`DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'blocked'`, [user_id, friend_id]);
	return result
};
