const BASE = 'https://gs8x9nsl3.duckdns.org:8443';

export function apiAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE}${path}`;
}

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json();
}

export const api = {
  dashboard:  ()         => get('/dashboard'),
  games:      (search)   => get(search ? `/games?search=${encodeURIComponent(search)}` : '/games'),
  game:       (id)       => get(`/games/${id}`),
  sessions:   (gameId)   => get(`/games/${gameId}/sessions`),
  executables:(gameId)   => get(`/games/${gameId}/executables`),
  recent:     (limit=10) => get(`/sessions/recent?limit=${limit}`),
  stats:      ({ range, gameId }) => {
    const params = new URLSearchParams({ range });
    if (gameId) params.set('game_id', gameId);
    return get(`/stats?${params.toString()}`);
  },
};
