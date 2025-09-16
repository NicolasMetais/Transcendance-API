import {
	Engine,
	Scene,
	Vector3,
	MeshBuilder,
	StandardMaterial,
	Color3,
	HemisphericLight,
	ArcRotateCamera,
	KeyboardEventTypes,
	Mesh,
	PointLight,
	Animation,
	EasingFunction,
	CircleEase,
	GlowLayer,
	Color4
} from '@babylonjs/core';

export class Pong3D
{
	private canvas: HTMLCanvasElement;
	private engine: Engine;
	private scene: Scene;
	private camera: ArcRotateCamera;

	private ball: Mesh;
	private paddle1: Mesh;
	private paddle2: Mesh;
	private walls: Mesh[];

	private ballVelocity: Vector3 = new Vector3(0.12, 0.08, 0);
	private paddleSpeed: number = 0.15;
	private score1: number = 0;
	private score2: number = 0;
	private gameRunning: boolean = false;
	private waiting: boolean = true;
	private gameOver: boolean = false;
	private winner: 1 | 2 | null = null;
	private ballSpeedMultiplier: number = 1.0;
	private paddle1Velocity: number = 0;
	private paddle2Velocity: number = 0;

	private keys: { [key: string]: boolean } = {};

	private player1Name: string = "Joueur 1";
	private player2Name: string = "Joueur 2";

	private gameOverUI: HTMLDivElement | null = null;

	private showOverlayOnGameOver: boolean = true;

	public setShowOverlayOnGameOver(show: boolean): void {
		this.showOverlayOnGameOver = show;
	}

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.engine = new Engine(canvas, true);
		this.scene = new Scene(this.engine);
		this.walls = [];

		this.setupScene();
		this.setupGameObjects();
		this.setupInput();
		this.setupGameLoop();
		this.loadPlayerNames();
	}

	private setupScene(): void {
		this.camera = new ArcRotateCamera("camera", 1.55, 1.5, 15, Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas, true);
		this.camera.lowerRadiusLimit = 8;
		this.camera.upperRadiusLimit = 30;
		this.camera.wheelDeltaPercentage = 0.1;
		this.camera.pinchDeltaPercentage = 0.1;

		this.camera.keysUp = [];
		this.camera.keysDown = [];
		this.camera.keysLeft = [];
		this.camera.keysRight = [];

		const hemisphericLight = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), this.scene);
		hemisphericLight.intensity = 0.6;
		hemisphericLight.groundColor = new Color3(0.1, 0.1, 0.2);

		const pointLight1 = new PointLight("pointLight1", new Vector3(-6, 3, 0), this.scene);
		pointLight1.intensity = 2.0;
		pointLight1.diffuse = new Color3(1.0, 0.4, 0.4);
		pointLight1.specular = new Color3(1.0, 0.6, 0.6);
		pointLight1.range = 8;

		const pointLight2 = new PointLight("pointLight2", new Vector3(6, 3, 0), this.scene);
		pointLight2.intensity = 2.0;
		pointLight2.diffuse = new Color3(0.3, 0.7, 1.0);
		pointLight2.specular = new Color3(0.5, 0.8, 1.0);
		pointLight2.range = 8;

		const ballLight = new PointLight("ballLight", Vector3.Zero(), this.scene);
		ballLight.intensity = 0.8;
		ballLight.diffuse = new Color3(1, 1, 0.8);
		ballLight.range = 3;

		const ambientLight = new HemisphericLight("ambientLight", new Vector3(0, -1, 0), this.scene);
		ambientLight.intensity = 0.3;
		ambientLight.diffuse = new Color3(0.8, 0.8, 1.0);

		this.scene.clearColor = new Color4(0.02, 0.03, 0.08, 1);

		const glowLayer = new GlowLayer("glow", this.scene);
		glowLayer.intensity = 0.8;
		glowLayer.blurKernelSize = 32;
	}

	private setupGameObjects(): void {

		this.ball = MeshBuilder.CreateSphere("ball", { diameter: 0.4, segments: 32 }, this.scene);
		this.ball.position = new Vector3(0, 0, 0);

		const ballMaterial = new StandardMaterial("ballMaterial", this.scene);
		ballMaterial.diffuseColor = new Color3(0.9, 0.9, 0.8);
		ballMaterial.specularColor = new Color3(1, 1, 1);
		ballMaterial.specularPower = 100;
		ballMaterial.emissiveColor = new Color3(0.1, 0.1, 0.05);

		this.ball.material = ballMaterial;

		this.paddle1 = MeshBuilder.CreateBox("paddle1", {
			width: 0.4,
			height: 2.5,
			depth: 0.4
		}, this.scene);
		this.paddle1.position = new Vector3(-6, 0, 0);

		const paddle1Material = new StandardMaterial("paddle1Material", this.scene);
		paddle1Material.diffuseColor = new Color3(1.0, 0.3, 0.3);
		paddle1Material.specularColor = new Color3(1.0, 0.6, 0.6);
		paddle1Material.specularPower = 50;
		paddle1Material.emissiveColor = new Color3(0.4, 0.1, 0.1);

		this.paddle1.material = paddle1Material;

		this.paddle2 = MeshBuilder.CreateBox("paddle2", {
			width: 0.4,
			height: 2.5,
			depth: 0.4
		}, this.scene);
		this.paddle2.position = new Vector3(6, 0, 0);

		const paddle2Material = new StandardMaterial("paddle2Material", this.scene);
		paddle2Material.diffuseColor = new Color3(0.2, 0.6, 1.0);
		paddle2Material.specularColor = new Color3(0.5, 0.8, 1.0);
		paddle2Material.specularPower = 50;
		paddle2Material.emissiveColor = new Color3(0.1, 0.2, 0.4);

		this.paddle2.material = paddle2Material;

		this.createWalls();
		this.createField();
		this.setupBallAnimation();
	}

	private createWalls(): void {
		const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
		wallMaterial.diffuseColor = new Color3(0.8, 0.8, 0.9);
		wallMaterial.specularColor = new Color3(1, 1, 1);
		wallMaterial.specularPower = 80;
		wallMaterial.emissiveColor = new Color3(0.1, 0.1, 0.15);

		const topWall = MeshBuilder.CreateBox("topWall", { width: 12, height: 0.3, depth: 0.3 }, this.scene);
		topWall.position = new Vector3(0, 4, 0);
		topWall.material = wallMaterial;
		this.walls.push(topWall);

		const bottomWall = MeshBuilder.CreateBox("bottomWall", { width: 12, height: 0.3, depth: 0.3 }, this.scene);
		bottomWall.position = new Vector3(0, -4, 0);
		bottomWall.material = wallMaterial;
		this.walls.push(bottomWall);
	}

	private createField(): void {

		const fieldMaterial = new StandardMaterial("fieldMaterial", this.scene);
		fieldMaterial.diffuseColor = new Color3(0.05, 0.08, 0.12);
		fieldMaterial.specularColor = new Color3(0.2, 0.3, 0.4);
		fieldMaterial.specularPower = 20;
		fieldMaterial.emissiveColor = new Color3(0.02, 0.03, 0.05);

		const field = MeshBuilder.CreatePlane("field", { width: 14, height: 10 }, this.scene);
		field.position = new Vector3(0, 0, -0.5);
		field.material = fieldMaterial;

		const centerLineMaterial = new StandardMaterial("centerLineMaterial", this.scene);
		centerLineMaterial.diffuseColor = new Color3(0.6, 0.6, 0.8);
		centerLineMaterial.emissiveColor = new Color3(0.1, 0.1, 0.2);

		const centerLine = MeshBuilder.CreatePlane("centerLine", { width: 0.1, height: 8 }, this.scene);
		centerLine.position = new Vector3(0, 0, -0.4);
		centerLine.material = centerLineMaterial;

		const goalMaterial = new StandardMaterial("goalMaterial", this.scene);
		goalMaterial.diffuseColor = new Color3(0.1, 0.2, 0.3);
		goalMaterial.emissiveColor = new Color3(0.05, 0.1, 0.15);

		const leftGoal = MeshBuilder.CreatePlane("leftGoal", { width: 0.5, height: 8 }, this.scene);
		leftGoal.position = new Vector3(-6.5, 0, -0.4);
		leftGoal.material = goalMaterial;

		const rightGoal = MeshBuilder.CreatePlane("rightGoal", { width: 0.5, height: 8 }, this.scene);
		rightGoal.position = new Vector3(6.5, 0, -0.4);
		rightGoal.material = goalMaterial;
	}

	private setupBallAnimation(): void {
		const ballRotationAnimation = new Animation(
			"ballRotation",
			"rotation",
			30,
			Animation.ANIMATIONTYPE_VECTOR3,
			Animation.ANIMATIONLOOPMODE_CYCLE
		);

		const keyFrames: { frame: number; value: Vector3 }[] = [];
		keyFrames.push({
			frame: 0,
			value: new Vector3(0, 0, 0)
		});
		keyFrames.push({
			frame: 30,
			value: new Vector3(0, Math.PI * 2, 0)
		});

		ballRotationAnimation.setKeys(keyFrames as any);

		const easingFunction = new CircleEase();
		easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
		ballRotationAnimation.setEasingFunction(easingFunction);

		this.ball.animations = [ballRotationAnimation];
		this.scene.beginAnimation(this.ball, 0, 30, true);
	}

	private setupInput(): void {
		this.scene.onKeyboardObservable.add((kbInfo) => {
			if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
				this.keys[kbInfo.event.code] = true;

				if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(kbInfo.event.code)) {
					kbInfo.event.preventDefault();
					this.startGame();
				}
			}

			if (kbInfo.type === KeyboardEventTypes.KEYUP) {
				this.keys[kbInfo.event.code] = false;
				if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'].includes(kbInfo.event.code)) {
					kbInfo.event.preventDefault();
				}
			}
		});
	}

	private setupGameLoop(): void {
		this.scene.registerBeforeRender(() => {
			this.update();
		});
	}

	private async loadPlayerNames(): Promise<void> {
		try {
			const token = localStorage.getItem('auth_token');
			if (token) {
				const payload = JSON.parse(atob(token.split('.')[1]));
				const userId = payload.userId;

				const res = await fetch(`https://localhost:8443/users/${userId}`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (res.ok) {
					const data = await res.json();
					this.player1Name = data?.user?.username || "Joueur 1";
				}
			}
		} catch (error) {
			console.error('Erreur lors du chargement du nom du joueur:', error);
		}
	}

	private update(): void {
		if (!this.gameRunning) return;

		const currentVelocity = this.ballVelocity.clone();
		currentVelocity.scaleInPlace(this.ballSpeedMultiplier);
		this.ball.position.addInPlace(currentVelocity);

		const ballLight = this.scene.getLightByName("ballLight") as PointLight;
		if (ballLight) {
			ballLight.position = this.ball.position;
		}

		if (this.ball.position.y >= 3.5 || this.ball.position.y <= -3.5) {
			this.ballVelocity.y *= -1;
			this.addCollisionEffect();
		}

		if (this.checkPaddleCollision(this.paddle1) || this.checkPaddleCollision(this.paddle2)) {
			const paddle = this.checkPaddleCollision(this.paddle1) ? this.paddle1 : this.paddle2;
			const paddleVelocity = this.getPaddleVelocity(paddle);

			this.ballVelocity.x *= -1;
			this.ballVelocity.y += paddleVelocity * 0.3;
			this.ballVelocity.y += (Math.random() - 0.5) * 0.02;
			if (Math.abs(this.ballVelocity.x) < 0.12) {
				this.ballVelocity.x = 0.12 * (this.ballVelocity.x > 0 ? 1 : -1);
			}

			this.ballSpeedMultiplier += 0.05;
			this.addCollisionEffect();
		}

		if (this.ball.position.x > 8) {
			this.score2++;
			this.resetBall();
		} else if (this.ball.position.x < -8) {
			this.score1++;
			this.resetBall();
		}

		if (!this.gameOver && (this.score1 >= 5 || this.score2 >= 5)) {
			this.gameOver = true;
			this.winner = this.score1 >= 5 ? 1 : 2;
			this.gameRunning = false;
			this.waiting = false;
			if (this.showOverlayOnGameOver) {
				this.showGameOverScreen();
			}
		}

		this.updatePaddles();
	}

	private addCollisionEffect(): void {
		const ballLight = this.scene.getLightByName("ballLight") as PointLight;
		if (ballLight) {
			const originalIntensity = ballLight.intensity;
			const originalRange = ballLight.range;

			ballLight.intensity = 3.0;
			ballLight.range = 5;
			ballLight.diffuse = new Color3(1, 0.8, 0.4);

			setTimeout(() => {
				ballLight.intensity = originalIntensity;
				ballLight.range = originalRange;
				ballLight.diffuse = new Color3(1, 1, 0.8);
			}, 150);
		}
	}

	private checkPaddleCollision(paddle: Mesh): boolean {
		const ballPos = this.ball.position;
		const paddlePos = paddle.position;

		const paddleHalfHeight = 1.25;
		const paddleHalfWidth = 0.2;
		const ballRadius = 0.2;

		return (
			Math.abs(ballPos.x - paddlePos.x) < (paddleHalfWidth + ballRadius) &&
			Math.abs(ballPos.y - paddlePos.y) < (paddleHalfHeight + ballRadius)
		);
	}

	private getPaddleVelocity(paddle: Mesh): number {
		if (paddle === this.paddle1) {
			return this.paddle1Velocity;
		} else if (paddle === this.paddle2) {
			return this.paddle2Velocity;
		}
		return 0;
	}

	private updatePaddles(): void {
		if (this.keys['ArrowUp'] && this.paddle1.position.y < 2.5) {
			this.paddle1.position.y += this.paddleSpeed;
			this.paddle1Velocity = this.paddleSpeed;
		} else if (this.keys['ArrowDown'] && this.paddle1.position.y > -2.5) {
			this.paddle1.position.y -= this.paddleSpeed;
			this.paddle1Velocity = -this.paddleSpeed;
		} else {
			this.paddle1Velocity = 0;
		}

		if (this.keys['KeyW'] && this.paddle2.position.y < 2.5) {
			this.paddle2.position.y += this.paddleSpeed;
			this.paddle2Velocity = this.paddleSpeed;
		} else if (this.keys['KeyS'] && this.paddle2.position.y > -2.5) {
			this.paddle2.position.y -= this.paddleSpeed;
			this.paddle2Velocity = -this.paddleSpeed;
		} else {
			this.paddle2Velocity = 0;
		}
	}

	private resetBall(): void {
		this.ball.position = new Vector3(0, 0, 0);
		this.ballVelocity = new Vector3(
			0.12 * (Math.random() < 0.5 ? -1 : 1),
			0.02 * (Math.random() < 0.5 ? -1 : 1), 
			0
		);
		this.waiting = true;
		this.gameRunning = false;
		this.ballSpeedMultiplier = 1.0;
	}

	public startGame(): void {
		if (this.gameOver) return;
		if (this.waiting) {
			this.waiting = false;
			this.gameRunning = true;
			this.ballVelocity = new Vector3(
				0.12 * (Math.random() < 0.5 ? -1 : 1),
				0.02 * (Math.random() < 0.5 ? -1 : 1),
				0
			);
			this.ballSpeedMultiplier = 1.0;
		}
	}

	private showGameOverScreen(): void {
		if (this.gameOverUI) {
			this.gameOverUI.remove();
		}

		this.gameOverUI = document.createElement('div');
		this.gameOverUI.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
		this.gameOverUI.innerHTML = `
			<div class="bg-gray-900 border-2 border-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
				<div class="mb-6">
					<h2 class="text-3xl font-bold text-white mb-2">🎮 Game Over</h2>
					<div class="text-6xl mb-4">🏆</div>
					<h3 class="text-2xl font-bold text-white mb-2">
						${this.winner === 1 ? this.player1Name : this.player2Name} wins!
					</h3>
					<div class="text-lg text-gray-300 mb-4">
						Final score: <span class="text-white">${this.score1}</span> - <span class="text-red-400">${this.score2}</span>
					</div>
					<div class="text-sm text-gray-400">
						${this.player1Name} vs ${this.player2Name}
					</div>
				</div>
				<div class="flex flex-col gap-3">
					<button id="replayBtn" class="bg-white hover:bg-slate-100 text-black font-bold py-3 px-6 rounded-lg transition-colors">
						🔄 Replay
					</button>
					<button id="backToMenuBtn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
						🏠 Back to menu
					</button>
				</div>
			</div>
		`;

		document.body.appendChild(this.gameOverUI);

		const replayBtn = this.gameOverUI.querySelector('#replayBtn');
		const backToMenuBtn = this.gameOverUI.querySelector('#backToMenuBtn');

		if (replayBtn) {
			replayBtn.addEventListener('click', () => {
				this.hideGameOverScreen();
				this.restartGame();
			});
		}

		if (backToMenuBtn) {
			backToMenuBtn.addEventListener('click', () => {
				this.hideGameOverScreen();
				history.back();
			});
		}
	}

	private hideGameOverScreen(): void {
		if (this.gameOverUI) {
			this.gameOverUI.remove();
			this.gameOverUI = null;
		}
	}

	public restartGame(): void {
		this.score1 = 0;
		this.score2 = 0;
		this.gameOver = false;
		this.winner = null;
		this.resetBall();
		this.paddle1.position.y = 0;
		this.paddle2.position.y = 0;
		this.hideGameOverScreen();
		this.ballSpeedMultiplier = 1.0;
	}

	public forceReset(): void {
		this.score1 = 0;
		this.score2 = 0;
		this.gameOver = false;
		this.winner = null;
		this.gameRunning = false;
		this.waiting = true;
		this.ballSpeedMultiplier = 1.0;
		this.paddle1Velocity = 0;
		this.paddle2Velocity = 0;
		this.resetBall();
		this.paddle1.position.y = 0;
		this.paddle2.position.y = 0;
		this.hideGameOverScreen();
		this.keys = {};
	}

	public getScore(): { p1: number; p2: number } {
		return { p1: this.score1, p2: this.score2 };
	}

	public isGameOver(): boolean {
		return this.gameOver;
	}

	public getFinal(): { winner: 1 | 2 | null; score1: number; score2: number } {
		return { winner: this.winner, score1: this.score1, score2: this.score2 };
	}

	public render(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
		});
	}

	public dispose(): void {
		this.hideGameOverScreen();
		this.engine.dispose();
	}
}
