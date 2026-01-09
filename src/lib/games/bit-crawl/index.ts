import { SnakeGame } from './game';

let activeGame: SnakeGame | null = null;

export const mount = async (node: HTMLElement) => {
    if (activeGame) activeGame.destroy();
    activeGame = new SnakeGame();
    await activeGame.init(node);
    return activeGame;
};

export const destroy = () => {
    if (activeGame) {
        activeGame.destroy();
        activeGame = null;
    }
};
