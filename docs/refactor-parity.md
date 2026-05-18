# Refactor Parity Checklist

Use this checklist before and after each refactor pass that changes frontend structure,
backend structure, or shared data shaping.

## Frontend
- Dashboard tab is selected by default unless `localStorage.lastTab` contains another view.
- Dashboard metrics render today playtime, sessions today, this week, active days, and current streak.
- Dashboard facts render longest session, most played this week, biggest day this month, and last played.
- Monthly activity chart renders in the dashboard chart area.
- Top games render with proportional bars.
- Recent sessions render with game name, start time, and duration.
- Library search filters the loaded game list without reloading the page.
- Selecting a library row updates the selected styling, detail metrics, banner copy, and trend chart.
- Library detail metrics show all-time daily average playtime for the selected game.
- Empty library search shows the empty state.
- Stats tab renders range controls, game filter, summary metrics, historical chart, and top games.
- Stats range changes update metrics, chart data, and top games without changing tabs.
- Stats game filter supports all games and individual games.
- Stats summary shows daily average playtime, not average session length.
- Stats chart timelines end at today for daily ranges and the current month for monthly ranges.
- Stats chart fills inactive periods with `0` minutes and clamps negative period totals to `0`.
- Minutes charts clamp negative values to `0` and keep the y-axis baseline at `0`.

## Backend
- `GET /games` returns games ordered by name.
- `GET /games?search=<term>` filters by game name and preserves name ordering.
- `GET /games/{game_id}` returns one game or 404 for a missing ID.
- `GET /games/{game_id}/sessions` returns sessions newest first with `duration_minutes`.
- `GET /games/{game_id}/executables` returns executables for the game.
- `GET /sessions/recent?limit=5` returns the latest sessions with `game_name`.
- `GET /dashboard` returns `summary`, `top_games`, and `monthly_activity`.
- `GET /stats?range=1m` returns `summary`, `history`, and `top_games`.
- `GET /stats?range=1m&game_id=<id>` scopes stats to one game.
- `GET /stats` history includes zero-filled periods through the current period.

## Commands
```bash
npm run build
```

```bash
uvicorn server:app --reload --port 8000
```

## Manual Smoke Test
- Start the API on port 8000.
- Start the Vite frontend.
- Open the dashboard and library tabs.
- Perform one search that returns results and one search that returns none.
- Select at least two different games and verify the chart redraws.
