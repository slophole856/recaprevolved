import { formatDateTime, formatHours, formatMinutes } from './formatters.js';
import { apiAssetUrl } from './api.js';

function cloneTemplate(id) {
  const template = document.querySelector(id);
  return template.content.cloneNode(true);
}

function colorFromString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 34% 42%)`;
}

function paintGameSwatch(swatch, game) {
  const bannerUrl = apiAssetUrl(game.banner_url);
  swatch.style.backgroundColor = colorFromString(game.name);

  if (bannerUrl) {
    swatch.style.backgroundImage = `url("${bannerUrl}")`;
  }
}

export function createMetric(label, value) {
  const node = cloneTemplate('#metric-template');
  node.querySelector('.metric-label').textContent = label;
  node.querySelector('.metric-value').textContent = value;
  return node;
}

export function createFact(label, value, copy) {
  const node = cloneTemplate('#fact-template');
  node.querySelector('.fact-label').textContent = label;
  node.querySelector('.fact-value').textContent = value;
  node.querySelector('.fact-copy').textContent = copy;
  return node;
}

export function createGameRow(game, selectedGameId) {
  const node = cloneTemplate('#game-row-template');
  const button = node.querySelector('.game-row');

  button.dataset.gameId = game.id;
  if (game.id === selectedGameId) button.classList.add('selected');

  node.querySelector('.game-name').textContent = game.name;
  paintGameSwatch(node.querySelector('.game-swatch'), game);

  return node;
}

export function createTopGameRow(game, maxPlaytime) {
  const node = cloneTemplate('#top-game-template');
  node.querySelector('.top-game-name').textContent = game.name;
  node.querySelector('.top-game-hours').textContent = formatHours(game.playtime_hours);

  const fill = node.querySelector('.bar-fill');
  fill.style.width = `${Math.round((game.playtime_hours / maxPlaytime) * 100)}%`;

  return node;
}

export function createSessionRow(session) {
  const node = cloneTemplate('#session-template');
  node.querySelector('.session-name').textContent = session.game_name;
  node.querySelector('.session-date').textContent = formatDateTime(session.start_time);
  node.querySelector('.session-duration').textContent = formatMinutes(session.duration_minutes);
  return node;
}

export function createEmptyState(title, copy) {
  const node = cloneTemplate('#empty-state-template');
  node.querySelector('.empty-title').textContent = title;
  node.querySelector('.empty-copy').textContent = copy;
  return node;
}
