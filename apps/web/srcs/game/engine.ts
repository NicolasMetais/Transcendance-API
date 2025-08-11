export class FixedLoop {
  private accumulator = 0;
  private lastTime = 0;
  private animationId: number | null = null;
  private running = false;

  constructor(
    private update: (dt: number) => void,
    private render: () => void,
    private fps: number = 60
  ) {
    this.timestep = 1000 / this.fps;
  }

  private timestep: number;

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private loop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.timestep) {
      this.update(this.timestep / 1000); // Convertir en secondes
      this.accumulator -= this.timestep;
    }

    this.render();

    this.animationId = requestAnimationFrame(() => this.loop());
  }
} 