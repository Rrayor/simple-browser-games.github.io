import { Application, Text, Container, Sprite, Assets, TilingSprite, Texture, Graphics } from 'pixi.js';
import bgUrl from './assets/background.png';

export class FlappyBalloonGame {
    public app: Application;
    private balloon: Graphics | null = null;
    private background: TilingSprite | null = null;
    private velocity: number = 0;
    private gravity: number = 0.5;
    private jumpStrength: number = -8;
    private isRunning: boolean = false;
    private obstacles: Container[] = [];
    private obstacleSpeed: number = 3;
    private spawnTimer: number = 0;
    private score: number = 0;
    private scoreText: Text | null = null;
    private gameOverText: Text | null = null;

    constructor() {
        this.app = new Application();
    }

    async init(container: HTMLElement) {
        await this.app.init({
            background: '#87CEEB',
            resizeTo: container,
            antialias: true,
            width: container.clientWidth,
            height: container.clientHeight
        });

        container.appendChild(this.app.canvas);

        // Load Assets (only background)
        await this.loadAssets();

        this.setup();
        this.startGameLoop();
    }

    async loadAssets() {
        try {
            const bgTexture = await Assets.load(bgUrl);

            // Setup Background
            this.background = new TilingSprite({
                texture: bgTexture,
                width: this.app.screen.width,
                height: this.app.screen.height
            });
            this.app.stage.addChild(this.background);
        } catch (e) {
            console.error("Failed to load background", e);
            // Fallback to blue color if fails, app background handles it
        }
    }

    setup() {
        // Create Balloon (Graphics)
        this.balloon = new Graphics();
        this.balloon.circle(0, 0, 25); // Radius 25
        this.balloon.fill(0xFF4500); // Red
        // String
        this.balloon.moveTo(0, 25);
        this.balloon.quadraticCurveTo(5, 35, 0, 45);
        this.balloon.stroke({ width: 2, color: 0xffffff });

        this.balloon.x = this.app.screen.width / 4;
        this.balloon.y = this.app.screen.height / 2;

        this.app.stage.addChild(this.balloon);

        // Add instruction text
        const style = { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center' as const, stroke: { color: 0x000000, width: 4 } };
        const text = new Text({ text: 'Click to Jump', style });
        text.anchor.set(0.5, 0);
        text.x = this.app.screen.width / 2;
        text.y = 50;
        this.app.stage.addChild(text);

        setTimeout(() => {
            this.app.stage.removeChild(text);
            text.destroy();
        }, 3000);

        // Score
        this.scoreText = new Text({ text: 'Score: 0', style: { ...style, fontSize: 30 } });
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);

        // Input handling
        this.app.canvas.addEventListener('pointerdown', () => this.jump());
        window.addEventListener('keydown', this.handleKeyDown);

        this.isRunning = true;
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            this.jump();
            e.preventDefault();
        } else if (e.code === 'KeyR' && !this.isRunning) {
            this.reset();
        }
    }

    jump() {
        if (!this.isRunning) {
            if (this.gameOverText?.parent) {
                this.reset();
                return;
            }
        }
        this.velocity = this.jumpStrength;
    }

    startGameLoop() {
        this.app.ticker.add((ticker) => {
            // Scroll background
            if (this.background) {
                this.background.tilePosition.x -= 1 * ticker.deltaTime;
            }

            if (!this.isRunning || !this.balloon) return;

            // Physics
            this.velocity += this.gravity * ticker.deltaTime;
            this.balloon.y += this.velocity * ticker.deltaTime;

            // Rotation based on velocity
            this.balloon.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.velocity * 0.1)));

            // Obstacles
            this.spawnTimer += ticker.deltaTime;
            if (this.spawnTimer > 120) {
                this.spawnObstacle();
                this.spawnTimer = 0;
            }

            this.updateObstacles(ticker.deltaTime);

            // Bounds check
            if (this.balloon.y > this.app.screen.height + 30 || this.balloon.y < -30) {
                this.gameOver();
            }
        });
    }

    spawnObstacle() {
        const gapSize = 180;
        const gapY = Math.random() * (this.app.screen.height - gapSize - 200) + 100;

        const obstacleContainer = new Container();
        obstacleContainer.x = this.app.screen.width + 50;

        // Draw Spikes
        const spikeWidth = 80;
        const spikeHeight = 400; // Arbitrary tall height
        const color = 0x555555; // Dark grey

        // Top Spike (pointing down)
        // Triangle: Top-left(-w/2, -h), Top-right(w/2, -h), Bottom(0, 0)
        // Positioned at (0, gapY)
        const topSpike = new Graphics();
        topSpike.moveTo(-spikeWidth / 2, -spikeHeight);
        topSpike.lineTo(spikeWidth / 2, -spikeHeight);
        topSpike.lineTo(0, 0); // Tip at 0,0
        topSpike.fill(color);
        topSpike.y = gapY;
        obstacleContainer.addChild(topSpike);

        // Bottom Spike (pointing up)
        // Triangle: Top(0, 0), Bottom-right(w/2, h), Bottom-left(-w/2, h)
        // Positioned at (0, gapY + gapSize)
        const bottomSpike = new Graphics();
        bottomSpike.moveTo(0, 0); // Tip at 0,0
        bottomSpike.lineTo(spikeWidth / 2, spikeHeight);
        bottomSpike.lineTo(-spikeWidth / 2, spikeHeight);
        bottomSpike.fill(color);
        bottomSpike.y = gapY + gapSize;
        obstacleContainer.addChild(bottomSpike);

        // Mark checked
        (obstacleContainer as any).passed = false;

        this.app.stage.addChild(obstacleContainer);
        this.obstacles.push(obstacleContainer);

        // Ensure balloon is on top
        if (this.balloon) this.app.stage.setChildIndex(this.balloon, this.app.stage.children.length - 1);
        if (this.scoreText) this.app.stage.setChildIndex(this.scoreText, this.app.stage.children.length - 1);
    }

    updateObstacles(delta: number) {
        if (!this.balloon) return;
        const balloonRadius = 25; // As defined in circle
        const balloonCenter = { x: this.balloon.x, y: this.balloon.y };

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.obstacleSpeed * delta;

            // Score update (check passing)
            if (!(obs as any).passed && obs.x < this.balloon.x) {
                (obs as any).passed = true;
                this.score++;
                if (this.scoreText) this.scoreText.text = `Score: ${this.score}`;
            }

            // Remove offcode
            if (obs.x < -100) {
                this.app.stage.removeChild(obs);
                this.obstacles.splice(i, 1);
                obs.destroy({ children: true });
                continue;
            }

            // Collision - Precise Circle vs Triangle
            // Top Spike: Tip at (obs.x, obs.children[0].y), Base at y - 400
            // Bottom Spike: Tip at (obs.x, obs.children[1].y), Base at y + 400
            // Spikes are 80px wide at base ( +/- 40 from x )

            const topSpikeY = obs.children[0].y;
            const bottomSpikeY = obs.children[1].y;

            // Define Triangle points (World Coordinates)
            // Top Spike
            const t1 = [
                { x: obs.x - 40, y: topSpikeY - 400 },
                { x: obs.x + 40, y: topSpikeY - 400 },
                { x: obs.x, y: topSpikeY }
            ];

            // Bottom Spike
            const t2 = [
                { x: obs.x, y: bottomSpikeY },
                { x: obs.x + 40, y: bottomSpikeY + 400 },
                { x: obs.x - 40, y: bottomSpikeY + 400 }
            ];

            // Reduced hitbox radius for fairness (visual is 25, hitbox 20)
            if (this.checkCollision(balloonCenter, 20, t1) || this.checkCollision(balloonCenter, 20, t2)) {
                this.gameOver();
            }
        }
    }

    // Helper: Circle vs Triangle Collision
    checkCollision(circle: { x: number, y: number }, radius: number, triangle: { x: number, y: number }[]) {
        // 1. Check if circle center is inside triangle
        // (Not strictly necessary if purely avoiding edges, but good for completeness)
        // But for Flappy Bird, edge collision is main concern.

        // 2. Check intersection with edges
        for (let i = 0; i < 3; i++) {
            const p1 = triangle[i];
            const p2 = triangle[(i + 1) % 3];

            if (this.lineCircleIntersect(p1, p2, circle, radius)) {
                return true;
            }
        }
        return false;
    }

    lineCircleIntersect(p1: { x: number, y: number }, p2: { x: number, y: number }, circle: { x: number, y: number }, radius: number) {
        // Vector from p1 to p2
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        // Vector from p1 to circle center
        const fx = circle.x - p1.x;
        const fy = circle.y - p1.y;

        const len2 = dx * dx + dy * dy;
        // Projection of f onto d, clamped between 0 and 1
        let t = (fx * dx + fy * dy) / len2;
        t = Math.max(0, Math.min(1, t));

        // Closest point on segment
        const closestX = p1.x + t * dx;
        const closestY = p1.y + t * dy;

        // Distance from circle to closest point
        const distX = closestX - circle.x;
        const distY = closestY - circle.y;

        return (distX * distX + distY * distY) < (radius * radius);
    }

    gameOver() {
        if (!this.isRunning) return;
        this.isRunning = false;

        const style = { fontFamily: 'Arial', fontSize: 40, fill: 0xff0000, align: 'center' as const, stroke: { color: 0xffffff, width: 4 } };
        this.gameOverText = new Text({ text: 'GAME OVER\nClick or R to Restart', style });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = this.app.screen.width / 2;
        this.gameOverText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.gameOverText);
    }

    reset() {
        // Clear obstacles
        for (const obs of this.obstacles) {
            this.app.stage.removeChild(obs);
            obs.destroy({ children: true });
        }
        this.obstacles = [];
        this.spawnTimer = 0;

        if (this.gameOverText) {
            this.app.stage.removeChild(this.gameOverText);
            this.gameOverText.destroy();
            this.gameOverText = null;
        }

        if (this.balloon) {
            this.balloon.y = this.app.screen.height / 2;
            this.balloon.rotation = 0;
        }
        this.velocity = 0;
        this.score = 0;
        if (this.scoreText) this.scoreText.text = 'Score: 0';

        this.isRunning = true;
    }

    destroy() {
        this.isRunning = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        this.app.destroy({ removeView: true }, { children: true, texture: true });
    }
}
