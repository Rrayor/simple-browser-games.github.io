import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { SoundManager } from './sound_manager';

export class VoidRunnerGame {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: PointerLockControls | null = null;
    private container: HTMLElement | null = null;
    private animationId: number | null = null;
    private platforms: THREE.Mesh[] = [];
    private soundManager = new SoundManager();

    // Physics & Movement
    private velocity = new THREE.Vector3();
    private direction = new THREE.Vector3();
    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private canJump = false;
    private jumpCount = 0;
    private maxJumps = 2;
    private isWallRunning = false;
    private prevTime = performance.now();
    private lastStepTime = 0; // For audio timing

    private overlay: HTMLDivElement | null = null;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        // Cyberpunk vibe
        this.scene.background = new THREE.Color(0x050510);
        this.scene.fog = new THREE.Fog(0x050510, 10, 50);
    }

    async init(container: HTMLElement) {
        this.container = container;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        this.controls = new PointerLockControls(this.camera, document.body);

        this.setupOverlay(container);
        this.setupLights();
        this.setupInitialEnvironment();

        this.camera.position.set(0, 2, 0); // Spawn on the start platform (0,0,0)

        this.startLoop();

        window.addEventListener('resize', this.onResize);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    private setupOverlay(container: HTMLElement) {
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.overlay.style.display = 'flex';
        this.overlay.style.flexDirection = 'column';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.cursor = 'pointer';
        this.overlay.style.zIndex = '10';
        this.overlay.style.color = '#ff00ff';
        this.overlay.style.fontFamily = 'Courier New, monospace';

        const title = document.createElement('h1');
        title.innerText = 'VOID RUNNER';
        title.style.fontSize = '3rem';
        title.style.textShadow = '0 0 10px #ff00ff';
        this.overlay.appendChild(title);

        const instructions = document.createElement('p');
        instructions.innerText = 'CLICK TO START\n(WASD to Move, SPACE to Jump)';
        instructions.style.textAlign = 'center';
        instructions.style.marginTop = '1rem';
        this.overlay.appendChild(instructions);

        this.overlay.addEventListener('click', (e) => {
            // Prevent locking if clicking buttons
            if ((e.target as HTMLElement).tagName === 'BUTTON') return;

            this.controls?.lock();
            this.soundManager.init().then(() => {
                if (!this.soundManager.muteMusic) this.soundManager.playMusic();
            });
            this.prevTime = performance.now();
        });

        this.controls?.addEventListener('lock', () => {
            if (this.overlay) this.overlay.style.display = 'none';
        });

        this.controls?.addEventListener('unlock', () => {
            if (this.overlay) this.overlay.style.display = 'flex';
        });

        // Audio Controls Container
        const audioControls = document.createElement('div');
        audioControls.style.marginTop = '20px';
        audioControls.style.display = 'flex';
        audioControls.style.gap = '20px';

        // Music Toggle
        const btnMusic = document.createElement('button');
        btnMusic.innerText = 'MUSIC: ON';
        btnMusic.style.padding = '10px 20px';
        btnMusic.style.background = '#00aaff';
        btnMusic.style.border = 'none';
        btnMusic.style.color = 'black';
        btnMusic.style.fontFamily = 'monospace';
        btnMusic.style.cursor = 'pointer';
        btnMusic.onclick = (e) => {
            e.stopPropagation();
            this.soundManager.muteMusic = !this.soundManager.muteMusic;
            if (this.soundManager.muteMusic) {
                this.soundManager.stopMusic();
                btnMusic.innerText = 'MUSIC: OFF';
                btnMusic.style.background = '#444';
            } else {
                // Don't play immediately if on start screen, wait for start
                if (this.controls?.isLocked) this.soundManager.playMusic();
                btnMusic.innerText = 'MUSIC: ON';
                btnMusic.style.background = '#00aaff';
            }
        };

        // SFX Toggle
        const btnSfx = document.createElement('button');
        btnSfx.innerText = 'SFX: ON';
        btnSfx.style.padding = '10px 20px';
        btnSfx.style.background = '#00aaff';
        btnSfx.style.border = 'none';
        btnSfx.style.color = 'black';
        btnSfx.style.fontFamily = 'monospace';
        btnSfx.style.cursor = 'pointer';
        btnSfx.onclick = (e) => {
            e.stopPropagation();
            this.soundManager.muteSfx = !this.soundManager.muteSfx;
            btnSfx.innerText = this.soundManager.muteSfx ? 'SFX: OFF' : 'SFX: ON';
            btnSfx.style.background = this.soundManager.muteSfx ? '#444' : '#00aaff';
        };

        audioControls.appendChild(btnMusic);
        audioControls.appendChild(btnSfx);
        this.overlay.appendChild(audioControls);

        container.appendChild(this.overlay);

        // Visibility Change Handler
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    private onKeyDown = (event: KeyboardEvent) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = true; break;
            case 'Space':
                if (this.jumpCount < this.maxJumps) {
                    this.velocity.y = 12; // Adjusted jump force
                    this.jumpCount++;

                    if (this.jumpCount === 1) this.soundManager.playJump();
                    else this.soundManager.playDoubleJump();

                    this.canJump = false;
                }
                break;
        }
    };

    private onKeyUp = (event: KeyboardEvent) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = false; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = false; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = false; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = false; break;
        }
    };

    private setupLights() {
        // Hemisphere Light: Sky Color (Cyber Blue) vs Ground Color (Black)
        // This lights the TOP of platforms for visibility, keeps sides dark
        const hemisphereLight = new THREE.HemisphereLight(0x00aaff, 0x000000, 0.6);
        this.scene.add(hemisphereLight);

        // Directional Light: Strong key light for shadows and definition
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);

        // Ambient: Very low base
        const ambientLight = new THREE.AmbientLight(0x111111, 0.5);
        this.scene.add(ambientLight);
    }

    private raycaster = new THREE.Raycaster();
    private nextZ = -15;
    private score = 0;
    private contactedPlatforms: Set<THREE.Mesh> = new Set();
    private cars: THREE.Object3D[] = [];

    private setupInitialEnvironment() {
        // Fog & Lighting
        this.scene.fog = new THREE.FogExp2(0x050510, 0.02);
        this.scene.add(new THREE.AmbientLight(0x222222));

        // Procedural City Pipes (Understructure Highway)
        // Strictly below play area (-20 or lower), tight width (-40 to 40)
        // Darkened significantly for visibility fix
        const pipeMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const pipeLightMat = new THREE.MeshBasicMaterial({ color: 0x004444 }); // Dimmer cyan lines

        const pipeCountX = 7; // Max ~7 wide
        const pipeSpacingX = 10;

        for (let i = 0; i < pipeCountX; i++) {
            // Create long continuous looking pipes via segments or just very long cylinders
            // We'll use very long cylinders for the "highway" feel
            const r = 2 + Math.random() * 2;
            const h = 1000; // Infinite highway feel
            const geo = new THREE.CylinderGeometry(r, r, h, 16);
            const pipe = new THREE.Mesh(geo, pipeMaterial);

            // Layout: Grid/Highway under the player
            // X: centred around 0, spaced out
            const x = (i - (pipeCountX / 2)) * pipeSpacingX + (Math.random() - 0.5) * 5;
            const y = -30 - Math.random() * 10; // Deep below
            const z = 0; // Centered Z, but extends infinitely

            pipe.position.set(x, y, z);
            pipe.rotation.x = Math.PI / 2; // Lie flat along Z

            this.scene.add(pipe);

            // LED Rings (Periodic)
            const ringCount = 20;
            for (let rC = 0; rC < ringCount; rC++) {
                if (Math.random() > 0.5) continue; // Sparse lights
                const lineGeo = new THREE.CylinderGeometry(r + 0.1, r + 0.1, 1, 16, 1, true);
                const line = new THREE.Mesh(lineGeo, pipeLightMat);
                // Spread along the length
                line.position.y = (Math.random() - 0.5) * h * 0.9;
                pipe.add(line);
            }
        }

        // Flying Cars (Glowing Sprites)
        this.cars = [];
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
        }
        const carTexture = new THREE.CanvasTexture(canvas);

        const carColors = [0x00ffff, 0xffff00, 0xff00ff, 0xffffff];

        for (let i = 0; i < 20; i++) {
            const color = carColors[Math.floor(Math.random() * carColors.length)];
            const carMat = new THREE.SpriteMaterial({
                map: carTexture,
                color: color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });

            const car = new THREE.Sprite(carMat);
            car.scale.set(6, 6, 1); // Big blurry glow

            // Traffic above the pipes/understructure
            const x = (Math.random() - 0.5) * 60; // Slightly wider than pipes
            const y = -25 + (Math.random() * 10); // Hovering near pipes
            const z = (Math.random() - 0.5) * 400;

            car.position.set(x, y, z);
            (car as any).speed = (Math.random() + 0.5) * 80; // Fast highway speed
            this.scene.add(car);
            this.cars.push(car);
        }

        // Start platform (safe)
        this.createPlatform(0, -2, 0, true);

        // Initial path - Ensure first is reachable
        this.nextZ = -8; // First one guaranteed close
        this.spawnNextPlatform(); // Spawn one reachable

        for (let i = 0; i < 4; i++) {
            this.spawnNextPlatform();
        }
    }

    private spawnNextPlatform() {
        const difficulty = Math.min(1, this.score / 20); // Ramp up

        // Vary spacing
        const gapType = Math.random();
        let zGap = 10 + (Math.random() * 5); // Default medium

        if (gapType < 0.3) zGap = 8; // Easy single jump
        else if (gapType > 0.8) zGap = 18 + (difficulty * 5); // Hard long jump

        // CORRECTION: First platform MUST be reachable
        if (this.score === 0 && this.platforms.length <= 1) {
            zGap = 8; // Guarantee minimal gap for first spawn
        }

        this.nextZ -= zGap;

        // X Spread
        const xSpread = 10 + (difficulty * 10);
        let x = (Math.random() - 0.5) * xSpread;
        if (this.score === 0 && this.platforms.length <= 1) x = 0; // Center first one

        // Y Change (Verticality)
        let yChange = (Math.random() - 0.5) * (5 + difficulty * 10);

        // Clamp Y for early game
        if (this.score < 2) yChange = Math.max(-2, Math.min(2, yChange));

        const y = Math.max(-10, Math.min(20, this.camera.position.y + yChange));

        const isWall = Math.random() > 0.7;
        this.createPlatform(x, y, this.nextZ, false, isWall);
    }

    private createPlatform(x: number, y: number, z: number, immediate = false, isWall = false) {
        const h = isWall ? 10 : 0.5;
        const w = isWall ? 2 : 5;
        const d = isWall ? 8 : 5;

        // Muted Palette
        const colors = [0x4b0082, 0x800080, 0x8b0000, 0x2f4f4f, 0x556b2f];
        const accentColor = colors[Math.floor(Math.random() * colors.length)];

        // Shape Variety
        let geometry: THREE.BufferGeometry;
        let shapeType = Math.floor(Math.random() * 3); // 0: Box, 1: Cylinder, 2: Triangle (Prism)
        if (isWall) shapeType = 0; // Walls stay boxy for collision predictability

        if (shapeType === 1) { // Cylinder (Oval)
            geometry = new THREE.CylinderGeometry(w / 2, w / 2, h, 16);
        } else if (shapeType === 2) { // Triangle (Prism)
            geometry = new THREE.CylinderGeometry(w / 2, w / 2, h, 3);
        } else { // Box
            geometry = new THREE.BoxGeometry(w, h, d);
        }

        // Base Material (Dark Grey but VISIBLE via Specular Highlights)
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222, // Dark Grey
            emissive: 0x050505, // Very subtle glow
            specular: 0xffffff, // High gloss to catch the blue sky light
            shininess: 40
        });

        const mesh = new THREE.Mesh(geometry, baseMaterial);

        // LED Accents (Always Protruding for Visibility)
        // We ensure LED geometry is slightly larger than the platform logic to prevent clipping
        const ledGeometry = shapeType === 0 ?
            new THREE.BoxGeometry(w + 0.1, 0.1, d + 0.1) : // Protrude Box
            new THREE.CylinderGeometry(w / 2 + 0.05, w / 2 + 0.05, 0.1, shapeType === 1 ? 16 : 3); // Protrude Cylinder/Prism

        const ledMaterial = new THREE.MeshBasicMaterial({ color: accentColor });
        const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);

        // Place LED strip randomly on the platform
        ledMesh.position.y = (Math.random() - 0.5) * h * 0.8;
        mesh.add(ledMesh);

        // Second LED strip for walls
        if (isWall) {
            const ledMesh2 = ledMesh.clone();
            ledMesh2.position.y = -ledMesh.position.y;
            mesh.add(ledMesh2);
        }

        if (immediate) {
            mesh.position.set(x, y, z);
        } else {
            mesh.position.set(x, y - 25, z); // Start deeper for dramatic rise
            (mesh as any).targetY = y;
        }

        this.scene.add(mesh);
        this.platforms.push(mesh);
    }

    private startLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            if (this.controls?.isLocked) {
                const time = performance.now();
                const delta = (time - this.prevTime) / 1000;

                // Friction
                this.velocity.x -= this.velocity.x * 10.0 * delta;
                this.velocity.z -= this.velocity.z * 10.0 * delta;
                this.velocity.y -= 9.8 * 3.0 * delta; // Gravity

                this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
                this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
                this.direction.normalize();

                if (this.moveForward || this.moveBackward) {
                    this.velocity.z -= this.direction.z * 100.0 * delta;
                }
                if (this.moveLeft || this.moveRight) {
                    this.velocity.x -= this.direction.x * 100.0 * delta;
                }

                // Step Sounds
                if (this.canJump && (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)) {
                    if (time - this.lastStepTime > 350) { // Step frequency
                        this.soundManager.playStep();
                        this.lastStepTime = time;
                    }
                }

                // Horizontal Collision Check
                const checkCollision = (direction: THREE.Vector3) => {
                    this.raycaster.ray.origin.copy(this.camera.position);
                    this.raycaster.ray.origin.y -= 1; // Check lower body/feet level
                    this.raycaster.ray.direction.copy(direction);
                    const hits = this.raycaster.intersectObjects(this.platforms);
                    return hits.length > 0 && hits[0].distance < 1.5;
                };

                // Local direction vectors
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
                forward.y = 0; forward.normalize();

                const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
                right.y = 0; right.normalize();

                const back = forward.clone().negate();
                const left = right.clone().negate();

                // Prevent movement if blocked
                if (this.velocity.z < 0 && checkCollision(forward)) this.velocity.z = 0;
                if (this.velocity.z > 0 && checkCollision(back)) this.velocity.z = 0;
                if (this.velocity.x < 0 && checkCollision(right)) this.velocity.x = 0;
                if (this.velocity.x > 0 && checkCollision(left)) this.velocity.x = 0;

                this.controls.moveRight(-this.velocity.x * delta);
                this.controls.moveForward(-this.velocity.z * delta);
                this.camera.position.y += (this.velocity.y * delta);

                // Platform Collision & Animation
                this.canJump = false;
                this.raycaster.ray.origin.copy(this.camera.position);
                this.raycaster.ray.direction.set(0, -1, 0);

                const intersections = this.raycaster.intersectObjects(this.platforms);
                const onObject = intersections.length > 0 && intersections[0].distance < 2;

                let targetRoll = 0;

                if (onObject) {
                    this.velocity.y = Math.max(0, this.velocity.y);
                    this.canJump = true;
                    this.jumpCount = 0; // Reset jumps
                    this.isWallRunning = false;
                    this.camera.position.y = intersections[0].object.position.y + 2;

                    // Scoring
                    const platform = intersections[0].object as THREE.Mesh;
                    if (!this.contactedPlatforms.has(platform)) {
                        this.contactedPlatforms.add(platform);
                        this.score++;
                        this.updateInstructions();
                        this.spawnNextPlatform();
                    }
                } else {
                    // Check for Wall Run
                    this.isWallRunning = false;

                    // Force level rays (ignore pitch)
                    const yaw = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ').y;
                    const leftRay = new THREE.Vector3(-1, 0, 0).applyEuler(new THREE.Euler(0, yaw, 0));
                    const rightRay = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, yaw, 0));

                    this.raycaster.ray.origin.copy(this.camera.position);
                    this.raycaster.far = 4; // Check slightly further

                    this.raycaster.ray.direction.copy(leftRay);
                    const leftHits = this.raycaster.intersectObjects(this.platforms);

                    this.raycaster.ray.direction.copy(rightRay);
                    const rightHits = this.raycaster.intersectObjects(this.platforms);

                    if ((leftHits.length > 0 && leftHits[0].distance < 3) ||
                        (rightHits.length > 0 && rightHits[0].distance < 3)) {

                        if (this.velocity.y < 0) {
                            this.isWallRunning = true;
                            this.velocity.y = -0.2; // Even slower descent
                            this.jumpCount = 0; // Reset for full double jump capability

                            // Wall Run Spawning Logic
                            const wallHits = leftHits.length > 0 ? leftHits : rightHits;
                            if (wallHits.length > 0) {
                                const wall = wallHits[0].object as THREE.Mesh;
                                if (!this.contactedPlatforms.has(wall)) {
                                    this.contactedPlatforms.add(wall);
                                    this.score++;
                                    this.updateInstructions();
                                    this.spawnNextPlatform();
                                }
                            }

                            // Camera Tilt Logic
                            if (leftHits.length > 0) targetRoll = -0.15; // Tilt right (away)
                            else if (rightHits.length > 0) targetRoll = 0.15; // Tilt left (away)
                        }
                    }
                }

                // Apply Camera Roll
                const currentRoll = this.camera.rotation.z;
                this.camera.rotation.z += (targetRoll - currentRoll) * 0.1;

                // Animate Cars
                this.cars.forEach(car => {
                    car.position.z += (car as any).speed * delta;
                    if (car.position.z > 200) car.position.z = -200;
                });

                // Animate platforms floating up
                this.platforms.forEach(p => {
                    const targetY = (p as any).targetY;
                    if (targetY !== undefined && p.position.y < targetY) {
                        p.position.y += 10 * delta;
                        if (p.position.y > targetY) p.position.y = targetY;
                    }
                });

                // Cleanup far platforms
                if (this.platforms.length > 20) { // Keep more for density
                    const old = this.platforms.shift();
                    if (old) {
                        this.scene.remove(old);
                        old.geometry.dispose();
                        (old.material as THREE.Material).dispose();
                    }
                }

                // Check falling below void
                if (this.camera.position.y < -30) {
                    this.onGameOver();
                }

                this.prevTime = time;
            }
            this.renderer.render(this.scene, this.camera);
        };
        requestAnimationFrame(animate);
    }

    private updateInstructions() {
        if (!this.overlay) return;
        const title = this.overlay.querySelector('h1');
        if (title) title.innerText = `SCORE: ${this.score}`;
    }

    private onGameOver() {
        if (this.controls) this.controls.unlock();
        this.camera.position.set(0, 2, 0);
        this.velocity.set(0, 0, 0);

        // Update Overlay with FINAL SCORE
        if (this.overlay) {
            const title = this.overlay.querySelector('h1');
            if (title) title.innerText = 'GAME OVER';
            const p = this.overlay.querySelector('p');
            if (p) {
                p.innerHTML = `FINAL SCORE: ${this.score}<br><br>CLICK TO RESTART\n(WASD to Move, SPACE to Jump)`;
            }
            this.overlay.style.display = 'flex';
        }

        this.score = 0;

        // Reset world
        this.platforms.forEach(p => {
            this.scene.remove(p);
            p.geometry.dispose();
            (p.material as THREE.Material).dispose();
        });
        this.platforms = [];
        this.contactedPlatforms.clear();
        this.nextZ = -15;
        this.setupInitialEnvironment();
    }

    private onResize = () => {
        if (!this.container) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    };

    private onVisibilityChange = () => {
        if (document.hidden) {
            this.soundManager.stopMusic();
        } else {
            if (!this.soundManager.muteMusic && this.controls?.isLocked) {
                this.soundManager.playMusic();
            }
        }
    };

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);

        this.soundManager.stopMusic();

        this.container?.removeChild(this.renderer.domElement);
        if (this.overlay && this.container?.contains(this.overlay)) {
            this.container.removeChild(this.overlay);
        }
    }
}
