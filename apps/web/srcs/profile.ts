export function createProfilePage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	const token = localStorage.getItem('auth_token');
	if (!token) {
		window.history.pushState({}, '', '/signIn');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return;
	}

	let userId: number;
	try {
		const payload = JSON.parse(atob(token.split('.')[1]));
		userId = payload.userId;
	} catch (error) {
		console.error('Error decoding token:', error);
		window.history.pushState({}, '', '/signIn');
		window.dispatchEvent(new PopStateEvent('popstate'));
		return;
	}

	app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
          <!-- Header with back button -->
          <div class="flex items-center mb-6">
            <button id="backBtn" class="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Profile picture</label>
              <div class="flex items-center space-x-4">
                <div id="currentAvatar" class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  <span class="text-3xl text-indigo-600">👤</span>
                </div>
                <div class="flex-1">
                  <input type="file" id="avatarInput" accept="image/*" class="hidden">
                  <button id="changeAvatarBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Change photo
                  </button>
                  <p class="text-sm text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF (max 5MB)</p>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div class="flex space-x-2">
                <input type="text" id="username" placeholder="Your username" 
                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <button id="saveUsernameBtn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Save
                </button>
              </div>
              <p id="usernameMessage" class="text-sm mt-2"></p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" id="email" readonly 
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              <p class="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Connection status</label>
              <div class="flex items-center space-x-2">
                <span id="statusIndicator" class="w-3 h-3 bg-green-500 rounded-full"></span>
                <span id="statusText" class="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 border border-red-200">
            <h2 class="text-xl font-semibold text-red-700 mb-4">Danger zone</h2>
            
            <div class="mb-4">
              <h3 class="text-lg font-medium text-red-700 mb-2">Delete my account</h3>
              <p class="text-sm text-gray-600 mb-4">
                This action is irreversible. All your data, friends, and statistics will be permanently deleted.
              </p>
              <button id="deleteAccountBtn" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                Delete my account
              </button>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Log out</h3>
              <p class="text-sm text-gray-600 mb-4">
                Close your current session and return to the home page.
              </p>
              <button id="logoutBtn" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
                Log out
              </button>
            </div>
          </div>

          <!-- status message -->
          <div id="message" class="mt-6 text-center text-sm"></div>
        </div>
      </div>
    </div>
  `;

	const backBtn = document.getElementById('backBtn') as HTMLButtonElement;
	const changeAvatarBtn = document.getElementById('changeAvatarBtn') as HTMLButtonElement;
	const avatarInput = document.getElementById('avatarInput') as HTMLInputElement;
	const username = document.getElementById('username') as HTMLInputElement;
	const saveUsernameBtn = document.getElementById('saveUsernameBtn') as HTMLButtonElement;
	const usernameMessage = document.getElementById('usernameMessage') as HTMLParagraphElement | null;
	const email = document.getElementById('email') as HTMLInputElement;
	const deleteAccountBtn = document.getElementById('deleteAccountBtn') as HTMLButtonElement;
	const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
	const message = document.getElementById('message') as HTMLDivElement;

	loadProfileData();

	backBtn.addEventListener('click', () => {
		window.history.pushState({}, '', '/dashboard');
		window.dispatchEvent(new PopStateEvent('popstate'));
	});

	changeAvatarBtn.addEventListener('click', () => {
		avatarInput.click();
	});

	avatarInput.addEventListener('change', async (event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			showMessage('The file is too large (max 5MB)', 'error');
			return;
		}

		if (!file.type.startsWith('image/')) {
			showMessage('Please select a valid image file', 'error');
			return;
		}

		try {
			const reader = new FileReader();
			reader.onload = (e) => {
				const currentAvatar = document.getElementById('currentAvatar');
				if (currentAvatar) {
					currentAvatar.innerHTML = `<img src="${e.target?.result}" alt="Avatar" class="w-full h-full object-cover">`;
				}
			};
			reader.readAsDataURL(file);

			// TODO: upload sur le serv
			showMessage('Profile picture updated!', 'success');
		} catch (error) {
			showMessage('Error updating profile picture', 'error');
		}
	});

	saveUsernameBtn.addEventListener('click', async () => {
		const newUsername = username.value.trim();
		if (!newUsername) {
			showMessage('Please enter a username', 'error');
			return;
		}

		if (newUsername.length < 3) {
			showMessage('Username must be at least 3 characters', 'error');
			return;
		}

		try {
			const response = await fetch(`https://localhost:8443/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					username: newUsername
				})
			});

			if (response.ok) {
				showMessage('Username updated successfully!', 'success');
			} else {
				const error = await response.json();
				showMessage(error.error || 'Error updating username', 'error');
			}
		} catch (error) {
			showMessage('Error updating username', 'error');
		}
	});

	deleteAccountBtn.addEventListener('click', async () => {
		if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) {
			return;
		}

		try {
			const response = await fetch(`https://localhost:8443/users/${userId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			if (response.ok) {
				showMessage('Account deleted successfully. Redirecting...', 'success');
				localStorage.removeItem('auth_token');
				setTimeout(() => {
					window.history.pushState({}, '', '/');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 2000);
			} else {
				const error = await response.json();
				showMessage(error.error || 'Error deleting account', 'error');
			}
		} catch (error) {
			showMessage('Error deleting account', 'error');
		}
	});


	logoutBtn.addEventListener('click', () => {
		localStorage.removeItem('auth_token');
		showMessage('Logged out successfully! Redirecting...', 'success');
		setTimeout(() => {
			window.history.pushState({}, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));
		}, 1000);
	});

	async function loadProfileData() {
		try {
			const response = await fetch(`https://localhost:8443/myprofile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ id: userId })
			});

			if (response.ok) {
				const data = await response.json();
				displayProfileData(data);
			} else {
				showMessage('Error loading profile', 'error');
			}
		} catch (error) {
			showMessage('Error loading profile', 'error');
		}
	}

	function displayProfileData(data: any) {
		if (data.user) {
			username.value = data.user.username || '';
			email.value = data.user.email || '';

			if (data.user.avatar_url && data.user.avatar_url !== 'placeholder.jpg') {
				const currentAvatar = document.getElementById('currentAvatar');
				if (currentAvatar) {
					currentAvatar.innerHTML = `<img src="${data.user.avatar_url}" alt="Avatar" class="w-full h-full object-cover">`;
				}
			}

			const statusIndicator = document.getElementById('statusIndicator');
			const statusText = document.getElementById('statusText');
			if (statusIndicator && statusText) {
				if (data.user.isLogged === 'online') {
					statusIndicator.className = 'w-3 h-3 bg-green-500 rounded-full';
					statusText.textContent = 'Online';
				} else {
					statusIndicator.className = 'w-3 h-3 bg-gray-400 rounded-full';
					statusText.textContent = 'Offline';
				}
			}
		}
	}

	function showMessage(text: string, type: 'success' | 'error' | 'info' = 'info') {
		message.textContent = text;
		message.className = `mt-6 text-center text-sm ${type === 'success' ? 'text-green-600' :
			type === 'error' ? 'text-red-600' : 'text-blue-600'
			}`;

		if (usernameMessage) {
			usernameMessage.textContent = text;
			usernameMessage.className = `text-sm mt-2 ${type === 'success' ? 'text-green-600' :
				type === 'error' ? 'text-red-600' : 'text-blue-600'}`;
		}

		setTimeout(() => {
			message.textContent = '';
			message.className = 'mt-6 text-center text-sm';
			if (usernameMessage) {
				usernameMessage.textContent = '';
				usernameMessage.className = 'text-sm mt-2';
			}
		}, 5000);
	}
}
