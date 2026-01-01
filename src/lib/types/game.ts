export interface Game {
    /**
     * Called when the game should mount to a generic container.
     * The game is responsible for appending its canvas/elements to this container.
     */
    mount: (container: HTMLElement) => Promise<void> | void;

    /**
     * Called when the game should cleanup (stop loops, remove listeners, dispose WebGL contexts).
     */
    destroy: () => void;
}
