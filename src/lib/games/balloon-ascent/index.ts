import type { Game } from '$lib/types/game';
import { FlappyBalloonGame } from './game';

let activeGame: FlappyBalloonGame | null = null;

export const mount: Game['mount'] = async (container) => {
    activeGame = new FlappyBalloonGame();
    await activeGame.init(container);
};

export const destroy: Game['destroy'] = () => {
    if (activeGame) {
        activeGame.destroy();
        activeGame = null;
    }
};
