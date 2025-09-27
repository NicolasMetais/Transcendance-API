CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	is_2fa BOOLEAN DEFAULT FALSE,
	secret_2fa TEXT,
	timer_2fa DATETIME DEFAULT CURRENT_TIMESTAMP,
	avatar_url TEXT,
	isLogged TEXT CHECK(isLogged IN ('offline', 'online')) DEFAULT 'offline',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player1_id INTEGER NOT NULL,
	player2_id INTEGER NOT NULL,
	winner_id INTEGER NOT NULL,
	score_player1 INTEGER,
	score_player2 INTEGER,
	played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (player1_id) REFERENCES users(id),
	FOREIGN KEY (player2_id) REFERENCES users(id),
	FOREIGN KEY (winner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS friends (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL,
	friend_id INTEGER NOT NULL,
	status TEXT CHECK(status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (friend_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stats (
	user_id INTEGER PRIMARY KEY,
	game_played INTEGER DEFAULT 0,
	games_won INTEGER DEFAULT 0,
	total_score INTEGER DEFAULT 0,
	
	FOREIGN KEY (user_id) REFERENCES users(id)
);

---insert de test---
INSERT OR IGNORE INTO users (username, email, password_hash, is_2fa, secret_2fa, avatar_url) VALUES
  ('deleted_user', 'user@deleted', 'deleted', 0, NULL, 'deleted'),
  ('alice', 'alice@example.com', 'hash_alice', 0, NULL, 'https://example.com/avatars/alice.png'),
  ('bob', 'bob@example.com', 'hash_bob', 1, 'secretbob', 'https://example.com/avatars/bob.png'),
  ('charlie', 'charlie@example.com', 'hash_charlie', 0, NULL, NULL);

INSERT OR IGNORE INTO matches (player1_id, player2_id, winner_id, score_player1, score_player2) VALUES
  (1, 2, 1, 10, 8),
  (2, 3, 3, 7, 9);

INSERT OR IGNORE INTO friends (user_id, friend_id, status) VALUES
  (1, 2, 'accepted'),
  (2, 3, 'pending'),
  (3, 1, 'blocked');

INSERT OR IGNORE INTO stats (user_id, game_played, games_won, total_score) VALUES
  (1, 20, 12, 1500),
  (2, 15, 7, 900),
  (3, 10, 5, 700);