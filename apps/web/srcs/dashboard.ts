export function createDashboardPage(): void {
  const app = document.getElementById('app');
  if (!app) return;

  // token check
  const token = localStorage.getItem('auth_token');
  if (!token) {
    window.history.pushState({}, '', '/signIn');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">

          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p class="text-gray-600 mt-1">Welcome to your personal space</p>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500">Connected</span>
                <button id="logoutBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Log out
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">

            <!-- profile -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl text-indigo-600">👤</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Profile</h3>
                  <p class="text-gray-600">Manage your information</p>
                </div>
              </div>
              <div class="mt-4">
                <button id="profileBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors">
                  View profile
                </button>
              </div>
            </div>


            <!--  matches   -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl text-blue-600">🎮</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Matches</h3>
                  <p class="text-gray-600">Match history</p>
                </div>
              </div>
              <div class="mt-4">
                <button id="matchesBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                  View matches
                </button>
              </div>
            </div>


            <!-- Game -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl text-red-600">🎮</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Pong</h3>
                  <p class="text-gray-600">Start a Pong game</p>
                </div>
              </div>
              <div class="mt-4">
                <button id="playGameBtn" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                  Play
                </button>
              </div>
            </div>

            <!-- tournament -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl text-purple-600">🏆</span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Tournament</h3>
                  <p class="text-gray-600">Join the tournament</p>
                </div>
              </div>
              <div class="mt-4">
                <button id="tournamentBtn" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                  Join tournament
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span class="text-2xl mr-3">👥</span>
              Friends Management
            </h2>
            
            <!-- friend request -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Send a friend request</h3>
              <div class="flex gap-4 items-end">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Search for a user</label>
                  <input type="text" id="searchUser" placeholder="Username..." 
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                <button id="searchBtn" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Search
                </button>
              </div>
              
              <div id="searchResults" class="mt-4 hidden">
                <h4 class="text-md font-medium text-gray-700 mb-2">Results:</h4>
                <div id="usersList" class="space-y-2"></div>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Received friend requests</h3>
              <div id="friendRequests" class="space-y-3">
                <p class="text-gray-500 text-sm">Loading requests...</p>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold text-gray-800 mb-4">My friends</h3>
              <div id="friendsList" class="space-y-3">
                <p class="text-gray-500 text-sm">Loading friends list...</p>
              </div>
            </div>
          </div>

          <!-- status-->
          <div id="message" class="mt-6 text-center text-sm"></div>
        </div>
      </div>
    </div>
  `;

	const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
	const playGameBtn = document.getElementById('playGameBtn') as HTMLButtonElement;
	const message = document.getElementById('message') as HTMLDivElement;
	const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;
	const searchUser = document.getElementById('searchUser') as HTMLInputElement;
	const profileBtn = document.getElementById('profileBtn') as HTMLButtonElement;
	const matchesBtn = document.getElementById('matchesBtn') as HTMLButtonElement;
	const tournamentBtn = document.getElementById('tournamentBtn') as HTMLButtonElement;

	// cache pour limiter les requetes au back
	const usernameCache = new Map<number, string>();

	// la fonction parle d'elle meme
	async function getUsernameById(id: number): Promise<string> {
		if (usernameCache.has(id)) return usernameCache.get(id)!;
		try {
		const token = localStorage.getItem('auth_token');
		const res = await fetch(`https://localhost:8443/users/${id}`, {
			headers: { 'Authorization': `Bearer ${token}` }
		});
		if (res.ok) {
			const data = await res.json();
			const name = data?.user?.username ?? 'User';
			usernameCache.set(id, name);
			return name;
		}
		} catch { }
		return 'User';
	}

	async function preloadAllUsernames(): Promise<void> {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;
		const res = await fetch('https://localhost:8443/showUsers', {
			headers: { 'Authorization': `Bearer ${token}` }
		});
		if (!res.ok) return;
		const users = await res.json();
		for (const user of users) {
			if (typeof user.id === 'number' && typeof user.username === 'string') {
			usernameCache.set(user.id, user.username);
			}
		}
		} catch { }
	}

	// deconnexion
	logoutBtn.addEventListener('click', () => {

		localStorage.removeItem('auth_token');

		message.textContent = 'Successfully logged out! Redirecting...';
		message.className = 'mt-6 text-center text-sm text-green-600';

		setTimeout(() => {
		window.history.pushState({}, '', '/');
		window.dispatchEvent(new PopStateEvent('popstate'));
		}, 1000);
	});


	// events quand on click sur les boutons + redireciton popstate
	playGameBtn.addEventListener('click', () => {
		window.history.pushState({}, '', '/game');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	profileBtn.addEventListener('click', () => {
		window.history.pushState({}, '', '/profile');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	matchesBtn.addEventListener('click', () => {
		window.history.pushState({}, '', '/matches');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});


	tournamentBtn.addEventListener('click', () => {
		window.history.pushState({}, '', '/tournament');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	// recherche users
	searchBtn.addEventListener('click', async () => {
		const searchTerm = searchUser.value.trim();
		if (!searchTerm) {
		showMessage('Please enter a username', 'error');
		return;
		}

		try {
		const token = localStorage.getItem('auth_token');
		if (!token) {
			showMessage('You must be logged in', 'error');
			return;
		}
		const response = await fetch('https://localhost:8443/showUsers', {
			headers: {
			'Authorization': `Bearer ${token}`
			}
		});
		const users = await response.json();

		const filteredUsers = users.filter((user: any) =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase())
		);

		displaySearchResults(filteredUsers);
		} catch (error) {
		showMessage('Error during search', 'error');
		}
	});

	searchUser.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
		searchBtn.click();
		}
	});

	// preload
	preloadAllUsernames().finally(() => {
		loadFriendRequests();
		loadFriendsList();
	});

	function showMessage(text: string, type: 'success' | 'error' | 'info' = 'info') {
		message.textContent = text;
		message.className = `mt-6 text-center text-sm ${type === 'success' ? 'text-green-600' :
		type === 'error' ? 'text-red-600' : 'text-blue-600'
		}`;

		setTimeout(() => {
		message.textContent = '';
		message.className = 'mt-6 text-center text-sm';
		}, 5000);
	}

	function displaySearchResults(users: any[]) {
		const searchResults = document.getElementById('searchResults');
		const usersList = document.getElementById('usersList');

		if (!searchResults || !usersList) return;

		if (users.length === 0) {
		usersList.innerHTML = '<p class="text-gray-500 text-sm">No user found</p>';
		} else {
		usersList.innerHTML = users.map(user => `
					<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div class="flex items-center space-x-3">
							<div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
								<span class="text-lg text-purple-600">👤</span>
							</div>
							<div>
								<p class="font-medium text-gray-900">${user.username}</p>
								<p class="text-sm text-gray-500">${user.isLogged === 'online' ? '🟢 Online' : '🔴 Offline'}</p>
							</div>
						</div>
						<button onclick="sendFriendRequest(${user.id})" 
								class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
							Add
						</button>
					</div>
				`).join('');
		}

		searchResults.classList.remove('hidden');
	}

	async function loadFriendRequests() {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		let userId: number;
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			userId = payload.userId; // token : { userId: user.id }
		} catch (error) {
			console.error('Error decoding token:', error);
			return;
		}

		if (!userId) return;

		const response = await fetch(`https://localhost:8443/friendReq/${userId}`, {
			headers: {
			'Authorization': `Bearer ${token}`
			}
		});

		if (response.ok) {
			const requests = await response.json();
			await displayFriendRequests(requests, userId);
		} else if (response.status === 404) {
			await displayFriendRequests([], userId);
		} else {
			showMessage('Error loading requests', 'error');
		}
		} catch (error) {
		showMessage('Error loading requests', 'error');
		}
	}

	async function loadFriendsList() {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		// permet de recup l'id a partir du token
		let userId: number;
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			userId = payload.userId;
		} catch (error) {
			console.error('Error decoding token:', error);
			return;
		}

		if (!userId) return;

		const response = await fetch(`https://localhost:8443/friendlist/${userId}`, {
			headers: {
			'Authorization': `Bearer ${token}`
			}
		});

		if (response.ok) {
			const friends = await response.json();
			await displayFriendsList(friends, userId);
		} else if (response.status === 404) {
			await displayFriendsList([], userId);
		} else {
			showMessage('Error loading friends list', 'error');
		}
		} catch (error) {
		showMessage('Error loading friends list', 'error');
		}
	}

	async function displayFriendRequests(requests: any[], userId: number) {
		const friendRequests = document.getElementById('friendRequests');
		if (!friendRequests) return;

		if (requests.length === 0) {
		friendRequests.innerHTML = '<p class="text-gray-500 text-sm">No pending friend requests</p>';
		return;
		}

		const uniqueIds = Array.from(new Set(requests.map(r => r.user_id)));
		const names = await Promise.all(uniqueIds.map(id => getUsernameById(id)));
		const idToName = new Map(uniqueIds.map((id, idx) => [id, names[idx]]));
		friendRequests.innerHTML = requests.map(request => `
				<div class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
					<div class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
							<span class="text-lg text-yellow-600">👤</span>
						</div>
						<div>
							<p class="font-medium text-gray-900">Request from ${request.user_id === userId ? 'you' : idToName.get(request.user_id)}</p>
							<p class="text-sm text-gray-500">Awaiting response</p>
						</div>
					</div>
					<div class="flex space-x-2">
						<button onclick="acceptFriendRequest(${request.user_id}, ${request.friend_id})" 
								class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
							Accept
						</button>
						<button onclick="refuseFriendRequest(${request.user_id}, ${request.friend_id})" 
								class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
							Decline
						</button>
					</div>
				</div>
			`).join('');
	}

	async function displayFriendsList(friends: any[], userId: number) {
		const friendsList = document.getElementById('friendsList');
		if (!friendsList) return;

		if (friends.length === 0) {
		friendsList.innerHTML = '<p class="text-gray-500 text-sm">You have no friends yet</p>';
		return;
		}

		const otherIds = friends.map(f => (f.friend_id === userId ? f.user_id : f.friend_id));
		const uniqueFriendIds = Array.from(new Set(otherIds));
		const friendNames = await Promise.all(uniqueFriendIds.map(id => getUsernameById(id)));
		const idToFriendName = new Map(uniqueFriendIds.map((id, idx) => [id, friendNames[idx]]));
		friendsList.innerHTML = friends.map(friend => `
				<div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
					<div class="flex items-center space-x-3">
						<div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
							<span class="text-lg text-green-600">👤</span>
						</div>
						<div>
							<p class="font-medium text-gray-900">${idToFriendName.get(friend.friend_id === userId ? friend.user_id : friend.friend_id)}</p>
							<p class="text-sm text-gray-500">Friendship established</p>
						</div>
					</div>
					<button onclick="removeFriend(${userId}, ${friend.friend_id === userId ? friend.user_id : friend.friend_id})" 
							class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
						Remove
					</button>
				</div>
			`).join('');
	}

	(window as any).sendFriendRequest = async (friendId: number) => {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) {
			showMessage('Missing authentication token', 'error');
			return;
		}

		let userId: number;
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			userId = payload.userId;
			console.log('Decoded token:', payload);
			console.log('Extracted User ID:', userId);
		} catch (error) {
			console.error('Error decoding token:', error);
			showMessage('Error decoding token', 'error');
			return;
		}

		if (!userId) {
			showMessage('User ID not found in token', 'error');
			return;
		}

		console.log('Sending friend request:', { userId, friendId });

		const response = await fetch('https://localhost:8443/friendRequest', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
			user_id: userId,
			friend_id: friendId
			})
		});

		console.log('API response:', response.status, response.statusText);

		if (response.ok) {
			showMessage('Friend request sent successfully!', 'success');
			searchUser.value = '';
			document.getElementById('searchResults')?.classList.add('hidden');
		} else {
			const error = await response.json();
			console.error('API error:', error);
			showMessage(error.error || 'Error sending friend request', 'error');
		}
		} catch (error) {
		console.error('Error sending friend request:', error);
		showMessage('Error sending friend request', 'error');
		}
	};

	(window as any).acceptFriendRequest = async (userId: number, friendId: number) => {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		const response = await fetch('https://localhost:8443/friendAccept', {
			method: 'PATCH',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
			user_id: userId,
			friend_id: friendId
			})
		});

		if (response.ok) {
			showMessage('Friend request accepted!', 'success');
			loadFriendRequests();
			loadFriendsList();
		} else {
			showMessage('Error accepting friend request', 'error');
		}
		} catch (error) {
		showMessage('Error accepting friend request', 'error');
		}
	};

	(window as any).refuseFriendRequest = async (userId: number, friendId: number) => {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		const response = await fetch('https://localhost:8443/friendRefuse', {
			method: 'PATCH',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
			user_id: userId,
			friend_id: friendId
			})
		});

		if (response.ok) {
			showMessage('Friend request declined', 'success');
			loadFriendRequests();
		} else {
			showMessage('Error declining friend request', 'error');
		}
		} catch (error) {
		showMessage('Error declining friend request', 'error');
		}
	};

	(window as any).removeFriend = async (userId: number, friendId: number) => {
		try {
		const token = localStorage.getItem('auth_token');
		if (!token) return;

		const response = await fetch('https://localhost:8443/deleteFriend', {
			method: 'DELETE',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
			user_id: userId,
			friend_id: friendId
			})
		});

		if (response.ok) {
			showMessage('Friend removed from your list', 'success');
			loadFriendsList();
		} else {
			showMessage('Error removing friend', 'error');
		}
		} catch (error) {
		showMessage('Error removing friend', 'error');
		}
	};
}
