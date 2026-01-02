# simple-browser-games.github.io

A repository for some vibe-coded games. That will get hosted on a common site. It's for fun vibe-coding experiments, Don't expect the games to be original or polished.

## Directory structure

- `index.html` - The main page
- `games/` - The games
- `src/` - The source code for the website

Each game will have it's source code and resources in a subdirectory of `games/`. The website will have it's source code in `src/`.

The website will be the navigation page for the games.

## Tech-stack

### For the website

- TypeScript
- SvelteKit
- TailwindCSS
- Vite
- GitHub Pages

### For the games

- TypeScript
- Three.js for 3D games
- PixiJS for 2D games

## Vibe coding guidelines

All the code and resources for the games should be AI generated. The AI should be able to generate the code and resources for the games on it's own. It should also generate the website and link the games to it.

## 2D Games

- Flappy Balloon: A simple flappy bird clone with a balloon instead of a bird and spikes instead of pipes.
- Snake clone: A simple snake clone with a snake that can eat food and grow.
- Deep impact clone: A simple deep impact clone with a ship that can shoot bullets and destroy asteroids.

## 3D Games

- Platformer FPS: A simple platformer with an FPS view and a player that can move, jump, double jump and wall-run. The platforms are randomly floating in from the bottom 3 at a time. Each platform the player comes into contact with adds to the player score. The game is also timed. The final score is calculated by how many platforms the player has come into contact with and how fast. The game is endless. When the player comes into contact with a platform, past platforms disappear only  2 of the previous platforms stay alive at all times to help orientation. When the player falls below the bottom of the game area, the game is over and the final score is displayed. The game has a low-poly cyberpunk aesthetic with neon lights and a dark color scheme.
