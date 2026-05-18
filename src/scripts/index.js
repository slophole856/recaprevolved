import { api, apiAssetUrl } from './api.js';
import { buildLastNDaysData, buildMonthlyData } from './activityData.js';
import { renderMinutesChart, renderStatsChart } from './charts.js';
import { formatHours, formatMinutes, formatRelativeDay } from './formatters.js';
import {
  createEmptyState,
  createFact,
  createGameRow,
  createMetric,
  createSessionRow,
  createTopGameRow
} from './templates.js';

const state = {
  selectedGameId: null,
  search: '',
  statsRange: '1m',
  statsGameId: ''
};

const els = {
  searchInput: document.querySelector('#searchInput'),
  gameList: document.querySelector('#gameList'),
  gameName: document.querySelector('#gameName'),
  gameBanner: document.querySelector('#gameBanner'),
  detailsGrid: document.querySelector('#detailsGrid'),
  dashboardMetrics: document.querySelector('#dashboardMetrics'),
  dashboardFacts: document.querySelector('#dashboardFacts'),
  topGamesList: document.querySelector('#topGamesList'),
  recentSessionsList: document.querySelector('#recentSessionsList'),
  statsRangePicker: document.querySelector('#statsRangePicker'),
  statsGameFilter: document.querySelector('#statsGameFilter'),
  statsMetrics: document.querySelector('#statsMetrics'),
  statsTopGamesList: document.querySelector('#statsTopGamesList')
};

let weeklyChart = null;
let trendChart = null;
let statsChart = null;

function resizeCharts() {
  weeklyChart?.resize();
  trendChart?.resize();
  statsChart?.resize();
}

function setGameBanner(game) {
  const banner = document.querySelector('.game-banner');
  const imageUrl = apiAssetUrl(game?.banner_url);

  if (imageUrl) {
    banner.style.backgroundImage = `url("${imageUrl}")`;
  } else {
    banner.style.removeProperty('background-image');
  }
}

function daysSinceFirstSession(sessions) {
  if (sessions.length === 0) return 1;

  const firstPlayed = new Date(sessions[sessions.length - 1].start_time);
  firstPlayed.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.max(1, Math.round((today - firstPlayed) / 86400000) + 1);
}

function renderDashboardFacts(facts = {}) {
  const cards = [];

  if (facts.longest_session) {
    cards.push(createFact(
      'Longest session',
      facts.longest_session.game_name,
      `${formatMinutes(facts.longest_session.duration_minutes)} on ${formatRelativeDay(facts.longest_session.start_time)}`
    ));
  }

  if (facts.most_played_this_week) {
    cards.push(createFact(
      'Most played this week',
      facts.most_played_this_week.name,
      `${formatHours(facts.most_played_this_week.playtime_hours)} across recent sessions`
    ));
  }

  if (facts.biggest_day_this_month) {
    cards.push(createFact(
      'Biggest day this month',
      formatRelativeDay(facts.biggest_day_this_month.day),
      formatMinutes(facts.biggest_day_this_month.minutes)
    ));
  }

  if (facts.last_played) {
    cards.push(createFact(
      'Last played',
      facts.last_played.game_name,
      formatRelativeDay(facts.last_played.start_time)
    ));
  }

  els.dashboardFacts.replaceChildren(
    ...(cards.length ? cards : [createEmptyState('No facts yet', 'Play a game to build dashboard highlights.')])
  );
}

function renderDashboard(dashboard, recent) {
  const s = dashboard.summary;

  els.dashboardMetrics.replaceChildren(
    createMetric('Today', formatHours(s.today_playtime_hours)),
    createMetric('Sessions today', s.sessions_today),
    createMetric('This week', formatHours(s.week_playtime_hours)),
    createMetric('Active days', s.active_days_this_week),
    createMetric('Current streak', `${s.current_streak}d`)
  );

  renderDashboardFacts(dashboard.facts);

  const { labels: monthLabels, data: monthData } = buildMonthlyData(dashboard.monthly_activity);
  weeklyChart = renderMinutesChart(weeklyChart, 'weekly-chart', monthData, monthLabels);

  const maxPlaytime = Math.max(1, ...dashboard.top_games.map((g) => g.playtime_hours));
  els.topGamesList.replaceChildren(
    ...dashboard.top_games.map((game) => createTopGameRow(game, maxPlaytime))
  );

  els.recentSessionsList.replaceChildren(
    ...recent.map((session) => createSessionRow(session))
  );
}

function populateStatsGameFilter(games) {
  const options = [
    new Option('All games', ''),
    ...games.map((game) => new Option(game.name, game.id))
  ];
  els.statsGameFilter.replaceChildren(...options);
}

function setActiveStatsRange() {
  els.statsRangePicker.querySelectorAll('.range-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.range === state.statsRange);
  });
}

async function renderStatsView() {
  setActiveStatsRange();
  els.statsGameFilter.value = state.statsGameId;

  const stats = await api.stats({
    range: state.statsRange,
    gameId: state.statsGameId
  });

  const s = stats.summary;
  els.statsMetrics.replaceChildren(
    createMetric('Playtime', formatHours(s.playtime_hours)),
    createMetric('Sessions', s.sessions),
    createMetric('Daily avg', formatMinutes(s.avg_daily_minutes)),
    createMetric('Games launched', s.launched_games)
  );

  statsChart = renderStatsChart(statsChart, 'stats-chart', stats.history);

  if (stats.top_games.length === 0) {
    els.statsTopGamesList.replaceChildren(
      createEmptyState('No activity', 'Try a longer range or a different game.')
    );
    return;
  }

  const maxPlaytime = Math.max(1, ...stats.top_games.map((g) => g.playtime_hours));
  els.statsTopGamesList.replaceChildren(
    ...stats.top_games.map((game) => createTopGameRow(game, maxPlaytime))
  );
}

async function renderGamesView(games, dashboard) {
  const gamesSorted = [...games].sort((a, b) => a.name.localeCompare(b.name));
  const filteredGames = gamesSorted.filter((g) =>
    g.name.toLowerCase().includes(state.search.toLowerCase())
  );

  if (!state.selectedGameId && gamesSorted.length > 0) {
    state.selectedGameId = gamesSorted[0].id;
  }

  const selectedGame =
    gamesSorted.find((g) => g.id === state.selectedGameId) ||
    filteredGames[0] ||
    gamesSorted[0] ||
    null;

  els.searchInput.value = state.search;

  if (filteredGames.length === 0) {
    els.gameList.replaceChildren(
      createEmptyState('No matching games', 'Try a different search term.')
    );
  } else {
    const listFragment = document.createDocumentFragment();
    filteredGames.forEach((game) => {
      const row = createGameRow(game, selectedGame?.id ?? null);
      row.querySelector('.game-row').addEventListener('click', async () => {
        state.selectedGameId = game.id;
        await renderGamesView(games, dashboard); // should i even leave this here i wonder
      });
      listFragment.appendChild(row);
    });
    els.gameList.replaceChildren(listFragment);
  }

  if (!selectedGame) {
    els.gameName.textContent = 'No game selected';
    els.gameBanner.textContent = 'Choose a title from the list.';
    setGameBanner(null);
    els.detailsGrid.replaceChildren();
    return;
  }

  const sessions = await api.sessions(selectedGame.id);
  const { labels: dayLabels, data: dayData } = buildLastNDaysData(sessions, 10);

  const totalMinutes = sessions.reduce((sum, s) => sum + Math.max(0, s.duration_minutes || 0), 0);
  const totalHours = totalMinutes / 60;
  const dailyAverageMinutes = Math.round(totalMinutes / daysSinceFirstSession(sessions));
  const lastPlayed = sessions[0]?.start_time;

  els.gameName.textContent = selectedGame.name;
  els.gameBanner.textContent = selectedGame.notes || selectedGame.developer || '';
  setGameBanner(selectedGame);

  els.detailsGrid.replaceChildren(
    createMetric('Total playtime', formatHours(totalHours)),
    createMetric('Daily avg', formatMinutes(dailyAverageMinutes)),
    createMetric('Sessions', sessions.length),
    createMetric('Last played', formatRelativeDay(lastPlayed))
  );

  trendChart = renderMinutesChart(trendChart, 'trend-chart', dayData, dayLabels);
}

function initViewSwitcher() {
  const buttons = document.querySelectorAll('.view-btn');
  const views = document.querySelectorAll('.view');

  const lastTab = localStorage.getItem('lastTab') || 'dashboard';

  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === lastTab);
  });
  views.forEach((v) => {
    v.classList.toggle('active', v.dataset.view === lastTab);
  });

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      localStorage.setItem('lastTab', target);
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      views.forEach((v) =>
        v.classList.toggle('active', v.dataset.view === target)
      );
      requestAnimationFrame(resizeCharts);
    });
  });
}

async function init() {
  const [dashboard, games, recent] = await Promise.all([
    api.dashboard(),
    api.games(),
    api.recent(5)
  ]);

  els.searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    renderGamesView(games, dashboard);
  });

  els.statsRangePicker.addEventListener('click', async (e) => {
    const button = e.target.closest('.range-btn');
    if (!button) return;

    state.statsRange = button.dataset.range;
    await renderStatsView();
  });

  els.statsGameFilter.addEventListener('change', async (e) => {
    state.statsGameId = e.target.value;
    await renderStatsView();
  });

  initViewSwitcher();
  populateStatsGameFilter(games);
  renderDashboard(dashboard, recent);
  await renderStatsView();
  await renderGamesView(games, dashboard);
}

init();
