export interface GameMetadata {
    slug: string;
    title: string;
    description: string;
    thumbnail?: string;
}

export const games: GameMetadata[] = [
    {
        slug: 'flappy-balloon',
        title: 'Flappy Balloon',
        description: 'Navigate the balloon through the spikes! A Flappy Bird clone.'
    },
    {
        slug: 'snake',
        title: 'Snake',
        description: 'The classic Snake game. Eat food and grow longer.'
    },
    {
        slug: 'pong',
        title: 'Pong',
        description: 'Classic arcade table tennis game.'
    },
    {
        slug: 'asteroid-impact',
        title: 'Asteroid Impact',
        description: 'Destroy asteroids and survive in space.'
    },
    {
        slug: 'void-runner',
        title: 'Void Runner',
        description: 'Cyberpunk FPS parkour. Jump, wall-run, and survive the neon void.'
    }
];
