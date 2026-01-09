import { AsteroidImpactGame } from './game';

let activeGame: AsteroidImpactGame | null = null;

export const mount = async (node: HTMLElement) => {
    if (activeGame) activeGame.destroy();
    activeGame = new AsteroidImpactGame();
    await activeGame.init(node);
};

export const destroy = () => {
    if (activeGame) {
        activeGame.destroy();
        activeGame = null;
    }
};
