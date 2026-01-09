export interface GameMetadata {
    slug: string;
    title: string;
    description: string;
    thumbnail?: string;
}

export const games: GameMetadata[] = [
    {
        slug: 'balloon-ascent',
        title: 'Balloon Ascent',
        description: 'Navigate the balloon through the spikes! A classic ascent challenge.'
    },
    {
        slug: 'bit-crawl',
        title: 'Bit Crawl',
        description: 'The classic crawl. Eat bits and grow longer.'
    },
    {
        slug: 'cosmic-clash',
        title: 'Cosmic Clash',
        description: 'Destroy cosmic debris and survive in space.'
    },
    {
        slug: 'void-runner',
        title: 'Void Runner',
        description: 'Cyberpunk FPS parkour. Jump, double-jump, wall-run, and survive the neon void.'
    }
];
