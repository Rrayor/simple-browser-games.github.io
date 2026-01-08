import { VoidRunnerGame } from './game';

let activeGame: VoidRunnerGame | null = null;

export const mount = async (node: HTMLElement) => {
    if (activeGame) activeGame.destroy();
    activeGame = new VoidRunnerGame();
    await activeGame.init(node);
};

export const destroy = () => {
    if (activeGame) {
        activeGame.destroy();
        activeGame = null;
    }
};
