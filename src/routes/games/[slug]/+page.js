import { games } from '$lib/games/registry';

/** @type {import('./$types').EntryGenerator} */
export function entries() {
    return games.map((game) => ({ slug: game.slug }));
}

export const prerender = true;
