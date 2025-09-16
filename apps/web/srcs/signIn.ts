export function createSignInPage(): void {
	const app = document.getElementById('app');
	if (!app) return;

	app.innerHTML = `
		<div class="min-h-screen bg-indigo-500 text-white flex flex-col items-center justify-center">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-2">Connexion</h1>
		</div>

		<form id="signinForm" class="bg-white text-black rounded-lg shadow-lg p-8 w-96 space-y-4">
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

			<button type="submit"
					class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
			Se connecter
			</button>

			<p class="text-sm text-gray-600">Pas de compte ? <a id="goSignUp" href="#" class="text-indigo-600 hover:underline">Créer un compte</a></p>
		</form>

		<div id="twofa" class="hidden bg-white text-black rounded-lg shadow-lg p-8 w-96 space-y-4 mt-6">
			<p class="text-sm text-gray-700">Entrez le code 2FA reçu (valide 5 min).</p>
			<form id="twofaForm" class="space-y-4">
			<input id="code2fa" name="code2fa" type="text" inputmode="numeric" pattern="^[0-9]{6}$" maxlength="6" minlength="6" required
					class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-300" placeholder="Code à 6 chiffres">
			<button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">Valider 2FA</button>
			</form>
		</div>

		<p id="message" class="mt-4 text-sm text-yellow-200"></p>
		</div>
	`;

	const form = document.getElementById("signinForm") as HTMLFormElement;
	const message = document.getElementById("message") as HTMLParagraphElement;
	const twofaContainer = document.getElementById("twofa") as HTMLDivElement;
	const twofaForm = document.getElementById("twofaForm") as HTMLFormElement | null;
	const goSignUp = document.getElementById("goSignUp") as HTMLAnchorElement | null;
	let pendingUserIdFor2FA: number | null = null;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const payload =
		{
			email: formData.get("email") as string,
			password: formData.get("password") as string
		};

		try {
		const res = await fetch("https://localhost:8443/signIn",
			{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			
			// self signed
			mode: 'cors'
			});

		const data = await res.json();
		if (!res.ok) {
			message.textContent = data?.error || "Identifiants invalides";
			return;
		}

		if (data?.require2FA && data?.userId) {
			pendingUserIdFor2FA = Number(data.userId);
			twofaContainer.classList.remove('hidden');
			message.textContent = "2FA requis: entrez le code";
			return;
		}

		if (data?.token) {
			localStorage.setItem('auth_token', data.token as string);
			message.textContent = "Connecté ! Redirection...";
			setTimeout(() => {
			window.history.pushState({}, '', '/');
			window.dispatchEvent(new PopStateEvent('popstate'));
			}, 500);
		}
		else
			message.textContent = "Réponse inattendue du serveur";

		}
		catch (err) {
		console.error(err);
		message.textContent = "Erreur de connexion au serveur";
		}
	});

	if (twofaForm) {
		twofaForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			if (!pendingUserIdFor2FA) {
				message.textContent = "Session 2FA invalide";
				return;
			}
			const codeInput = document.getElementById('code2fa') as HTMLInputElement;
			const code = codeInput.value.trim();
			if (!/^[0-9]{6}$/.test(code)) {
				message.textContent = "Code 2FA invalide";
				return;
			}
			try {
				const res = await fetch("https://localhost:8443/2fa_req",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id: pendingUserIdFor2FA, secret_2fa: code }),
					mode: 'cors'
				});
				const data = await res.json();
				if (!res.ok) {
				message.textContent = data?.error || "Code 2FA incorrect";
				return;
				}
				if (data?.token) {
					localStorage.setItem('auth_token', data.token as string);
					message.textContent = "Connecté ! Redirection...";
					setTimeout(() => {
						window.history.pushState({}, '', '/');
						window.dispatchEvent(new PopStateEvent('popstate'));
					}, 500);
					}
				else
					message.textContent = "Réponse inattendue du serveur";
			}
			catch (err) {
				console.error(err);
				message.textContent = "Erreur de connexion au serveur";
			}
		});
	}

	if (goSignUp) {
		goSignUp.addEventListener('click', (e) => {
		e.preventDefault();
		window.history.pushState({}, '', '/signUp');
		window.dispatchEvent(new PopStateEvent('popstate'));
		});
	}
}
