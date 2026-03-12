/**
 * data.js - Data loader and cache for GoodNewsDaily
 */
const Data = (() => {
  let _news = null;
  let _music = null;
  let _comedians = null;
  let _jokes = null;

  async function _load(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.json();
  }

  async function _loadSafe(url) {
    try { return await _load(url); } catch(e) { console.warn('Optional data not loaded:', url); return null; }
  }

  async function init() {
    if (!_news) {
      const [news, music, comedians, jokes] = await Promise.all([
        _load('data/news.json'),
        _loadSafe('data/music.json'),
        _loadSafe('data/comedians.json'),
        _loadSafe('data/jokes.json')
      ]);
      _news = news;
      _music = music;
      _comedians = comedians;
      _jokes = jokes;
    }
  }

  /* News */
  function getNews() { return (_news || []).slice().sort((a, b) => b.date.localeCompare(a.date)); }
  function getNewsByCategory(cat) { return getNews().filter(n => n.category === cat); }
  function getLatestNews(limit) { return getNews().slice(0, limit || 3); }
  function getNewsCategories() {
    return [
      { id: 'peace', icon: '\ud83d\udd4a\ufe0f', color: '#2E7D32', name_key: 'cat.peace' },
      { id: 'science', icon: '\ud83d\udd2c', color: '#1565C0', name_key: 'cat.science' },
      { id: 'environment', icon: '\ud83c\udf31', color: '#2D6A4F', name_key: 'cat.environment' },
      { id: 'kindness', icon: '\u2764\ufe0f', color: '#C62828', name_key: 'cat.kindness' },
      { id: 'health', icon: '\ud83c\udfe5', color: '#6A1B9A', name_key: 'cat.health' },
      { id: 'technology', icon: '\ud83d\udca1', color: '#E65100', name_key: 'cat.technology' }
    ];
  }

  /* Music */
  function getMusic() { return _music || []; }
  function getMusicByRegion(region) { return getMusic().filter(m => m.region === region); }
  function getMusicRegions() {
    return [
      { id: 'latin-america', icon: '\ud83c\udf34', name_key: 'region.latin_america' },
      { id: 'africa', icon: '\ud83c\udf0d', name_key: 'region.africa' },
      { id: 'asia', icon: '\ud83c\udfef', name_key: 'region.asia' },
      { id: 'europe', icon: '\ud83c\udff0', name_key: 'region.europe' },
      { id: 'north-america', icon: '\ud83d\uddfd', name_key: 'region.north_america' },
      { id: 'middle-east', icon: '\ud83d\udd4c', name_key: 'region.middle_east' }
    ];
  }

  /* Comedians */
  function getComedians() { return _comedians || []; }

  /* Jokes */
  function getJokes() { return _jokes || []; }
  function getJokesByCategory(cat) { return getJokes().filter(j => j.category === cat); }
  function getRandomJoke() {
    const jokes = getJokes();
    return jokes.length ? jokes[Math.floor(Math.random() * jokes.length)] : null;
  }
  function getJokeCategories() {
    return ['wordplay', 'observational', 'one-liners', 'life'];
  }

  // Monthly updates (auto-hides entries older than 2 months)
  const _updates = [
    { id: 'mar2026b', date: '2026-03-12', icon: '\uD83C\uDFB5', titleKey: 'updates.mar2026b.title', descKey: 'updates.mar2026b.desc' },
    { id: 'mar2026', date: '2026-03-01', icon: '\u2600\uFE0F', titleKey: 'updates.mar2026.title', descKey: 'updates.mar2026.desc' }
  ];

  function getUpdates() {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return _updates.filter(u => new Date(u.date) >= cutoff);
  }

  return {
    init,
    getNews, getNewsByCategory, getLatestNews, getNewsCategories,
    getMusic, getMusicByRegion, getMusicRegions,
    getComedians,
    getJokes, getJokesByCategory, getRandomJoke, getJokeCategories,
    getUpdates
  };
})();
