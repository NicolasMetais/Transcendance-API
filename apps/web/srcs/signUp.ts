export function createSignUpPage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	app.innerHTML = `
		<div class="min-h-screen bg-indigo-500 text-white flex flex-col items-center justify-center">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-2">Créer un compte</h1>
		</div>

		<form id="signupForm" class="bg-white text-black rounded-lg shadow-lg p-8 w-96 space-y-4">
			<div>
			<label class="block font-medium mb-1" for="username">Nom d'utilisateur</label>
			<input id="username" name="username" type="text" required minlength="3"
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300">
			</div>

			<div>
			<label class="block font-medium mb-1" for="email">Email</label>
			<input id="email" name="email" type="email" required
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300">
			</div>

			<div>
			<label class="block font-medium mb-1" for="password">Mot de passe</label>
			<input id="password" name="password" type="password" required
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300">
			</div>

			<div>
			<label class="block font-medium mb-1" for="is_2fa">Activer 2FA</label>
			<select id="is_2fa" name="is_2fa" required
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300">
				<option value="0">Non</option>
				<option value="1">Oui</option>
			</select>
			</div>

			<button type="submit"
					class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
			S'inscrire
			</button>

			<p class="text-sm text-gray-600">Déjà un compte ? <a id="goSignIn" href="#" class="text-indigo-600 hover:underline">Se connecter</a></p>
		</form>

		<p id="message" class="mt-4 text-sm text-yellow-200"></p>
		</div>
	`;

	const form = document.getElementById("signupForm") as HTMLFormElement;
	const message = document.getElementById("message") as HTMLParagraphElement;
	const goSignIn = document.getElementById("goSignIn") as HTMLAnchorElement | null;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const payload =
		{
			username: formData.get("username") as string,
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			is_2fa: Number(formData.get("is_2fa")),
			avatar_url: "placeholder.jpg",
			isLogged: "offline",
			secret_2fa: null
		};

		try {
			const res = await fetch("https://localhost:8443/signUp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				mode: 'cors'
			});

			const data = await res.json();
			if (res.status === 201) {
				message.textContent = "Compte créé ! Redirection vers la connexion...";
				setTimeout(() => {
					window.history.pushState({}, '', '/signIn');
					window.dispatchEvent(new PopStateEvent('popstate'));
				}, 600);
				return;
			}
			message.textContent = data?.error || "Inscription échouée";
		}
		catch (err) {
			console.error(err);
			message.textContent = "Erreur de connexion au serveur";
		}
	});

	if (goSignIn) {
		goSignIn.addEventListener('click', (e) => {
			e.preventDefault();
			window.history.pushState({}, '', '/signIn');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}
