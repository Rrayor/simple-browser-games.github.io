import { Application, Graphics, Text, Sprite, Assets, Container } from 'pixi.js';

interface Bullet {
    sprite: Graphics;
    x: number;
    y: number;
}

interface Asteroid {
    sprite: Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    size: number;
}

export class AsteroidImpactGame {
    public app: Application;
    private ship: Graphics | null = null;
    private bullets: Bullet[] = [];
    private asteroids: Asteroid[] = [];
    private score: number = 0;
    private isRunning: boolean = false;
    private scoreText: Text | null = null;
    private gameOverText: Text | null = null;
    private keys: Record<string, boolean> = {};
    private spawnTimer: number = 0;
    private planetHealth: number = 100;
    private healthBarUI: Graphics | null = null;
    private gameContainer: Container | null = null;

    constructor() {
        this.app = new Application();
    }

    async init(container: HTMLElement) {
        await this.app.init({
            background: '#050510',
            resizeTo: container,
            antialias: true
        });

        container.appendChild(this.app.canvas);

        await this.setup();
        this.startGameLoop();
    }

    async setup() {
        this.gameContainer = new Container();
        this.app.stage.addChild(this.gameContainer);

        // Ship (Vector instead of Sprite to avoid baked-in checkerboard)
        this.ship = new Graphics();
        this.ship.poly([
            -20, -10,
            20, 0,
            -20, 10,
            -10, 0
        ]);
        this.ship.fill(0x00aaff);
        this.ship.stroke({ width: 2, color: 0xffffff });
        this.ship.x = 100;
        this.ship.y = this.app.screen.height / 2;
        this.gameContainer.addChild(this.ship);

        // Score
        this.scoreText = new Text({
            text: 'Score: 0',
            style: {
                fontFamily: 'Courier New',
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold' as const
            }
        });
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);

        // Initial State
        const startStyle = {
            fontFamily: 'Courier New',
            fontSize: 32,
            fill: 0x00ffff,
            align: 'center' as const,
            fontWeight: 'bold' as const
        };
        this.gameOverText = new Text({ text: 'ASTEROID IMPACT\nPress R to Start', style: startStyle });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = this.app.screen.width / 2;
        this.gameOverText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.gameOverText);

        // Health Bar UI
        this.healthBarUI = new Graphics();
        this.updateHealthBar();
        this.app.stage.addChild(this.healthBarUI);

        // Input
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' && this.isRunning) this.shoot();
            if ((e.key === 'r' || e.key === 'R') && !this.isRunning) this.reset();
        });

        this.isRunning = false; // Wait for R to start
    }

    private updateHealthBar() {
        if (!this.healthBarUI) return;
        this.healthBarUI.clear();

        const width = 200;
        const height = 20;
        const x = this.app.screen.width - width - 20;
        const y = 20;

        // Background
        this.healthBarUI.rect(x, y, width, height);
        this.healthBarUI.fill(0x330000);
        this.healthBarUI.stroke({ width: 2, color: 0xffffff });

        // Foreground
        const fillWidth = (this.planetHealth / 100) * width;
        if (fillWidth > 0) {
            this.healthBarUI.rect(x, y, fillWidth, height);
            this.healthBarUI.fill(0xff0000);
        }

        // Label
        if (!this.healthBarUI.children.length) {
            const label = new Text({
                text: 'PLANET HEALTH',
                style: { fontFamily: 'Courier New', fontSize: 14, fill: 0xffffff, fontWeight: 'bold' }
            });
            label.x = x;
            label.y = y + height + 5;
            this.healthBarUI.addChild(label);
        }
    }

    private shoot() {
        if (!this.ship || !this.gameContainer) return;
        const bullet = new Graphics();
        bullet.rect(0, 0, 10, 4);
        bullet.fill(0x00ffff);
        bullet.x = this.ship.x + 20;
        bullet.y = this.ship.y - 2;
        this.gameContainer.addChild(bullet);
        this.bullets.push({ sprite: bullet, x: bullet.x, y: bullet.y });
    }

    private spawnAsteroid() {
        if (!this.gameContainer) return;
        const size = 20 + Math.random() * 40;
        const asteroidGraphics = new Graphics();

        // Jagged primitive polygon for "slop" feel
        const points = [];
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const r = size * (0.8 + Math.random() * 0.4);
            points.push(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        asteroidGraphics.poly(points, true);
        asteroidGraphics.fill(0x666666);
        asteroidGraphics.stroke({ width: 2, color: 0x888888 });

        const asteroid: Asteroid = {
            sprite: asteroidGraphics,
            x: this.app.screen.width + size,
            y: Math.random() * this.app.screen.height,
            vx: -(2 + Math.random() * 3),
            vy: (Math.random() - 0.5) * 2,
            rotation: (Math.random() - 0.5) * 0.1,
            size: size
        };

        asteroidGraphics.x = asteroid.x;
        asteroidGraphics.y = asteroid.y;
        this.gameContainer.addChild(asteroidGraphics);
        this.asteroids.push(asteroid);
    }

    startGameLoop() {
        this.app.ticker.add((ticker) => {
            if (!this.isRunning) return;

            this.update(ticker.deltaTime);
        });
    }

    update(delta: number) {
        if (!this.ship || !this.gameContainer) return;

        // Player movement - Increased agility (8 instead of 5)
        const speed = 8 * delta;
        if (this.keys['ArrowUp'] || this.keys['w']) this.ship.y -= speed;
        if (this.keys['ArrowDown'] || this.keys['s']) this.ship.y += speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) this.ship.x -= speed;
        if (this.keys['ArrowRight'] || this.keys['d']) this.ship.x += speed;

        // Keep in bounds
        this.ship.x = Math.max(20, Math.min(this.app.screen.width - 20, this.ship.x));
        this.ship.y = Math.max(20, Math.min(this.app.screen.height - 20, this.ship.y));

        // Spawn asteroids
        this.spawnTimer += delta;
        if (this.spawnTimer > 60) {
            this.spawnAsteroid();
            this.spawnTimer = 0;
        }

        // Update Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += 10 * delta;
            b.sprite.x = b.x;
            if (b.x > this.app.screen.width) {
                this.gameContainer.removeChild(b.sprite);
                this.bullets.splice(i, 1);
            }
        }

        // Update Asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];
            a.x += a.vx * delta;
            a.y += a.vy * delta;
            a.sprite.x = a.x;
            a.sprite.y = a.y;
            a.sprite.rotation += a.rotation * delta;

            if (a.x < -a.size) {
                this.gameContainer.removeChild(a.sprite);
                this.asteroids.splice(i, 1);

                // Damage planet
                this.planetHealth -= 10;
                this.updateHealthBar();
                if (this.planetHealth <= 0) {
                    this.gameOver("EXTINCTION EVENT");
                }
                continue;
            }

            // Ship collision
            const dx = a.x - this.ship.x;
            const dy = a.y - this.ship.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < a.size + 15) {
                this.gameOver();
                return;
            }

            // Bullet collision
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                const bdx = a.x - b.x;
                const bdy = a.y - b.y;
                const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
                if (bdist < a.size) {
                    this.score += 10;
                    if (this.scoreText) this.scoreText.text = `Score: ${this.score}`;
                    this.gameContainer.removeChild(a.sprite);
                    this.asteroids.splice(i, 1);
                    this.gameContainer.removeChild(b.sprite);
                    this.bullets.splice(j, 1);
                    break;
                }
            }
        }
    }

    gameOver(reason: string = "MISSION FAILED") {
        this.isRunning = false;
        const style = {
            fontFamily: 'Courier New',
            fontSize: 48,
            fill: 0xff0000,
            align: 'center' as const,
            fontWeight: 'bold' as const
        };
        this.gameOverText = new Text({ text: `${reason}\nPress R to Restart`, style });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = this.app.screen.width / 2;
        this.gameOverText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.gameOverText);
    }

    reset() {
        if (!this.gameContainer || !this.ship) return;

        this.bullets.forEach(b => this.gameContainer?.removeChild(b.sprite));
        this.asteroids.forEach(a => this.gameContainer?.removeChild(a.sprite));
        this.bullets = [];
        this.asteroids = [];
        this.score = 0;
        this.planetHealth = 100;
        if (this.scoreText) this.scoreText.text = 'Score: 0';
        this.updateHealthBar();

        this.ship.x = 100;
        this.ship.y = this.app.screen.height / 2;

        if (this.gameOverText) {
            this.app.stage.removeChild(this.gameOverText);
            this.gameOverText.destroy();
            this.gameOverText = null;
        }

        this.isRunning = true;
    }

    destroy() {
        this.isRunning = false;
        // Clean up listeners is handled by browser if we don't bind, 
        // but let's be safe (though this is vibe-coded)
        this.app.destroy({ removeView: true }, { children: true, texture: true });
    }
}
