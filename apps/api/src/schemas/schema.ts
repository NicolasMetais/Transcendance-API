export const userProperties = {
	id: { type: 'number' },
		username: { type: 'string' },
		email: { type: 'string' },
		is_2fa: { type: 'number'},
		avatar_url: {type: 'string' },
		isLogged: { type: 'string' },
};

export const userResponseSchema = {
	type: 'object',
	properties: userProperties,
}

export const matchProperties = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			id : {type : 'number'},
			player1_id: {type : 'number'},
			player2_id: {type : 'number'},
			winner_id: {type : 'number'},
			score_player1: {type : 'number'},
			score_player2: { type: 'number' },
		},
	}
};

export const friendProperties = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			id : {type : 'number'},
			user_id: {type : 'number'},
			friend_id: {type : 'number'},
			status: {type : 'string'},
		},
	}
};

export const ProfileResponseSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        avatar_url: { type: 'string' },
        isLogged: { type: 'string' },
      },
      required: ['username', 'avatar_url', 'isLogged'],
    },
    friends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          user_id: { type: 'integer' },
          friend_id: { type: 'integer' },
        },
      },
    },
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          player1_id: { type: 'integer' },
          player2_id: { type: 'integer' },
		  winner_id: { type: 'integer' },
          score_player1: { type: 'integer' },
          score_player2: { type: 'integer' },
          played_at: { type: 'integer' },
        },
      },
    },
    stats: {
      type: 'object',
      properties: {
        user_id: { type: 'integer' },
        games_played: { type: 'integer' },
        games_won: { type: 'integer' },
        total_score: { type: 'integer' },
      },
      required: ['user_id', 'games_played', 'games_won', 'total_score'],
    },
  },
  required: ['user', 'friends', 'matches', 'stats'],
};