export const incrementGameplayed = async (db, player1_id, player2_id) => {
    const player1 = await db.get('SELECT * FROM users WHERE id = ?', [player1_id]);
    if (!player1)
        return { error: 'user' };
    const player2 = await db.get('SELECT * FROM users WHERE id = ?', [player2_id]);
    if (!player2)
        return { error: 'user' };
    await db.get("UPDATE stats SET game_played = game_played + 1 WHERE id = ? ", [player1_id]);
    await db.get("UPDATE stats SET game_played = game_played + 1 WHERE id = ? ", [player2_id]);
    return { message: "incremented" };
};
