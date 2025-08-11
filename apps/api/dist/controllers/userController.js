export const createUser = async (db, username, email, password_hash, is_2fa, secret_2fa, avatar_url = "placeholder.jpg") => {
    const userExist = await db.get("SELECT 1 FROM users WHERE username = ?", [username]);
    if (userExist)
        return { error: 'username' };
    const emailExist = await db.get("SELECT 1 FROM users WHERE email = ?", [email]);
    if (emailExist)
        return { error: 'email' };
    const result = await db.run(`INSERT INTO users (username, email, password_hash, is_2fa, secret_2fa, avatar_url) VALUES (?, ?, ?, ?, ?, ?)`, [username, email, password_hash, is_2fa, secret_2fa, avatar_url]);
    const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    await db.run(`INSERT INTO stats (user_id) VALUES (?)`, [result.lastID]);
    return user;
};
export const getUser = async (db, id) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    return user;
};
export const updateUser = async (db, id, updates) => {
    const obj = Object.keys(updates);
    if (obj.length == 0)
        return getUser(db, id);
    const Datas = obj.map(obj => `${obj} = ?`).join(', ');
    const values = obj.map(obj => updates[obj]);
    values.push(id);
    await db.run(`UPDATE users SET ${Datas} WHERE id = ?`, values);
    return getUser(db, id);
};
export const deleteUser = async (db, id) => {
    const user = getUser(db, id);
    if (!user)
        return null;
    await db.run('DELETE FROM stats WHERE id = ?', [id]);
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    return user;
};
