import { Application, Graphics, Text } from 'pixi.js';

const GRID_SIZE = 20;
const TILE_SIZE = 20; // Will be dynamic based on screen size ideally, or fixed 
// Let's use a fixed internal resolution and scale it?
// Or just dynamic. Let's do dynamic based on screen but keep it simple first.
// Actually, fixed logical grid is easier.
const LOGICAL_WIDTH = 600;
const LOGICAL_HEIGHT = 600;
const COLS = 20;
const ROWS = 20;

export class SnakeGame {
    public app: Application;
    private snake: { x: number, y: number }[] = [];
    private direction: { x: number, y: number } = { x: 1, y: 0 };
    private nextDirection: { x: number, y: number } = { x: 1, y: 0 };
    private apple: { x: number, y: number } = { x: 5, y: 5 };
    private score: number = 0;
    private isRunning: boolean = false;
    private moveTimer: number = 0;
    private moveInterval: number = 100; // ms
    private graphics: Graphics | null = null;
    private scoreText: Text | null = null;
    private gameOverText: Text | null = null;
    private cellSize: number = 0;

    constructor() {
        this.app = new Application();
    }

    async init(container: HTMLElement) {
        await this.app.init({
            background: '#000000', // Nokia-ish? Or just classic black/green
            resizeTo: container,
            antialias: true
        });

        container.appendChild(this.app.canvas);

        // Calculate cell size to fit grid in screen while maintaining aspect ratio
        // We want the 20x20 grid to fit within the smallest dimension
        const dim = Math.min(this.app.screen.width, this.app.screen.height);
        this.cellSize = Math.floor((dim - 40) / COLS); // -40 for padding

        this.setup();
        this.startGameLoop();
    }

    setup() {
        this.graphics = new Graphics();

        // Center the grid
        const gridWidth = COLS * this.cellSize;
        const gridHeight = ROWS * this.cellSize;
        this.graphics.x = (this.app.screen.width - gridWidth) / 2;
        this.graphics.y = (this.app.screen.height - gridHeight) / 2;

        this.app.stage.addChild(this.graphics);

        // Score
        this.scoreText = new Text({
            text: 'Score: 0',
            style: { fontFamily: 'Courier New', fontSize: 24, fill: 0x00ff00, fontWeight: 'bold' }
        });
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);

        // Input
        window.addEventListener('keydown', this.handleKeyDown);

        this.reset();
    }

    handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
            case 'r':
            case 'R':
                if (!this.isRunning) this.reset();
                break;
        }
    }

    startGameLoop() {
        this.app.ticker.add((ticker) => {
            if (!this.isRunning) return;

            this.moveTimer += ticker.deltaMS;
            if (this.moveTimer > this.moveInterval) {
                this.update();
                this.moveTimer = 0;
            }
            this.render();
        });
    }

    update() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Wall Collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            this.gameOver();
            return;
        }

        // Self Collision
        for (const segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // Eat Apple
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score++;
            if (this.scoreText) this.scoreText.text = `Score: ${this.score}`;
            this.spawnApple();
            // Speed up slightly?
            this.moveInterval = Math.max(50, 100 - this.score * 2);
        } else {
            this.snake.pop();
        }
    }

    spawnApple() {
        let valid = false;
        while (!valid) {
            this.apple.x = Math.floor(Math.random() * COLS);
            this.apple.y = Math.floor(Math.random() * ROWS);
            valid = true;
            for (const segment of this.snake) {
                if (segment.x === this.apple.x && segment.y === this.apple.y) {
                    valid = false;
                    break;
                }
            }
        }
    }

    render() {
        if (!this.graphics) return;
        this.graphics.clear();

        // Draw Board Boundary
        this.graphics.rect(0, 0, COLS * this.cellSize, ROWS * this.cellSize);
        this.graphics.stroke({ width: 2, color: 0x333333 });

        // Draw Apple
        this.graphics.rect(
            this.apple.x * this.cellSize + 1,
            this.apple.y * this.cellSize + 1,
            this.cellSize - 2,
            this.cellSize - 2
        );
        this.graphics.fill(0xff0000); // Red Apple

        // Draw Snake
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const isHead = i === 0;
            this.graphics.rect(
                segment.x * this.cellSize + 1,
                segment.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
            this.graphics.fill(isHead ? 0x00ff00 : 0x00cc00); // Bright green head, slightly darker body
        }
    }

    gameOver() {
        this.isRunning = false;
        const style = { fontFamily: 'Courier New', fontSize: 40, fill: 0x00ff00, align: 'center' as const };
        this.gameOverText = new Text({ text: 'GAME OVER\nPress R to Restart', style });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = this.app.screen.width / 2;
        this.gameOverText.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.gameOverText);
    }

    reset() {
        this.snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]; // Tail down?
        this.direction = { x: 0, y: -1 }; // Moving up
        this.nextDirection = { x: 0, y: -1 };
        this.score = 0;
        this.moveInterval = 100;
        this.isRunning = true;

        if (this.scoreText) this.scoreText.text = 'Score: 0';
        if (this.gameOverText) {
            this.app.stage.removeChild(this.gameOverText);
            this.gameOverText.destroy();
            this.gameOverText = null;
        }

        this.spawnApple();
        this.render(); // Initial render
    }

    destroy() {
        this.isRunning = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        this.app.destroy({ removeView: true }, { children: true, texture: true });
    }
}
