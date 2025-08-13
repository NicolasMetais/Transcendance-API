export const createMatch = async (db, player1_id, player2_id, winner_id, score_player1, score_player2) => {
    const p1Exist = await db.get('SELECT 1 FROM users WHERE id = ?', [player1_id]);
    if (!p1Exist)
        return { error: 'Invalid player1 id' };
    const p2Exist = await db.get('SELECT 1 FROM users WHERE id = ?', [player2_id]);
    if (!p2Exist)
        return { error: 'Invalid player2 id' };
    if (player1_id != winner_id && player2_id != winner_id)
        return { error: 'Invalid winner id' };
    const result = await db.run(`INSERT INTO matches (player1_id, player2_id, winner_id, score_player1, score_player2) VALUES (?,?,?,?,?)`, [player1_id, player2_id, winner_id, score_player1, score_player2]);
    await db.run("UPDATE stats SET games_won = games_won + 1 WHERE id = ?", [winner_id]);
    await db.run("UPDATE stats SET total_score = total_score + ? WHERE id = ?", [score_player1, player1_id]);
    await db.run("UPDATE stats SET total_score = total_score + ? WHERE id = ?", [score_player2, player2_id]);
    return result;
};
export const getMatches = async (db, player_id) => {
    const result = await db.all('SELECT * FROM matches WHERE player1_id = ? OR player2_id = ?', [player_id, player_id]);
    return result;
};
