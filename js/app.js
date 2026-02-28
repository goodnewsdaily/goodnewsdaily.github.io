/**
 * app.js - Main renderer for GoodNewsDaily
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Data.init();
    await I18n.init();
  } catch (e) { console.error('Init failed:', e); return; }

  const page = detectPage();
  renderPage(page);

  document.addEventListener('gnd-lang-change', () => renderPage(detectPage()));
});

/* ========== PAGE DETECTION ========== */
function detectPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('news')) return 'news';
  if (path.includes('music')) return 'music';
  if (path.includes('comedy')) return 'comedy';
  return 'index';
}

function renderPage(page) {
  const renderers = {
    'index': renderIndex,
    'news': renderNews,
    'music': renderMusic,
    'comedy': renderComedy
  };
  if (renderers[page]) renderers[page]();
}

/* ========== HELPERS ========== */
function _t(key) { return I18n.t(key); }
function _loc(obj) { return I18n.getLocalizedText(obj); }

function _backLink() {
  return `<a href="index.html" class="back-link">\u2190 ${_t('detail.back')}</a>`;
}

function _catColor(catId) {
  const cat = Data.getNewsCategories().find(c => c.id === catId);
  return cat ? cat.color : '#FF6B35';
}

function _catIcon(catId) {
  const cat = Data.getNewsCategories().find(c => c.id === catId);
  return cat ? cat.icon : '';
}

function _formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(I18n.getLang(), { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

/* ========== NEWS CARD ========== */
function _newsCardHtml(story) {
  const color = _catColor(story.category);
  return `<div class="news-card" style="border-left-color:${color}">
    <div class="news-card-header">
      <span class="news-card-icon">${story.emoji || _catIcon(story.category)}</span>
      <div>
        <div class="news-card-title">${_loc(story.title)}</div>
        <div class="news-card-meta">${_formatDate(story.date)} · ${story.source}</div>
      </div>
    </div>
    <div class="news-card-summary">${_loc(story.summary)}</div>
    <div class="news-card-matters">
      <strong>${_t('news.why_it_matters')}:</strong> ${_loc(story.why_it_matters)}
    </div>
    <div class="news-card-tags">${(story.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
  </div>`;
}

/* ========== MUSIC CARD ========== */
function _musicCardHtml(pick) {
  const embed = pick.youtube_id
    ? `<div class="music-embed"><iframe src="https://www.youtube.com/embed/${pick.youtube_id}" title="${pick.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    : '';
  return `<div class="music-card">
    <div class="music-card-header">
      <div class="music-card-title">${pick.title}</div>
      <div class="music-card-artist">${pick.artist} · ${pick.year}</div>
      <div class="music-card-genre">${pick.genre}</div>
    </div>
    ${embed}
    <div class="music-card-why">${_loc(pick.why_listen)}</div>
    <div class="music-card-tags">${(pick.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
  </div>`;
}

/* ========== COMEDIAN CARD ========== */
function _comedianCardHtml(c) {
  return `<div class="comedian-card">
    <div class="comedian-header">
      <span class="comedian-emoji">\ud83c\udfa4</span>
      <div>
        <div class="comedian-name">${c.name}</div>
        <div class="comedian-meta">${c.years} · ${c.origin}</div>
        <div class="comedian-style">${c.style}</div>
      </div>
    </div>
    <div class="comedian-bio">${_loc(c.bio)}</div>
    <div class="comedian-famous"><strong>${_t('comedy.famous_for')}:</strong> ${_loc(c.famous_for)}</div>
    <div class="comedian-bit"><strong>${_t('comedy.best_bit')}:</strong> ${_loc(c.best_bit)}</div>
    <div class="comedian-tags">${(c.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    ${c.youtube_id ? `<a href="https://www.youtube.com/watch?v=${c.youtube_id}" target="_blank" rel="noopener" class="btn btn-secondary" style="margin-top:0.75rem">\u25b6 Watch</a>` : ''}
  </div>`;
}

/* ========== JOKE CARD ========== */
function _jokeCardHtml(joke) {
  return `<div class="joke-card">
    <div class="joke-text">${_loc(joke.text)}</div>
    ${joke.attribution && joke.attribution !== 'Anonymous' ? `<div class="joke-attribution">— ${joke.attribution}</div>` : ''}
  </div>`;
}

/* ========== RENDER: INDEX ========== */
function renderIndex() {
  const heroStats = document.getElementById('hero-stats');
  if (heroStats) {
    heroStats.textContent = _t('hero.stats')
      .replace('{news}', Data.getNews().length)
      .replace('{music}', Data.getMusic().length)
      .replace('{jokes}', Data.getJokes().length);
  }

  /* Latest News */
  const newsSection = document.getElementById('latest-news-cards');
  if (newsSection) {
    const latest = Data.getLatestNews(3);
    newsSection.innerHTML = latest.map(s => _newsCardHtml(s)).join('');
  }

  /* Music Pick of the Day */
  const musicSection = document.getElementById('music-pick-box');
  if (musicSection) {
    const music = Data.getMusic();
    if (music.length) {
      const dayIdx = Math.floor(Date.now() / 86400000) % music.length;
      const pick = music[dayIdx];
      musicSection.innerHTML = `<div class="daily-pick-box">
        <h3>${_t('index.music_pick')}</h3>
        ${_musicCardHtml(pick)}
      </div>`;
    }
  }

  /* Joke of the Day */
  const jokeSection = document.getElementById('joke-of-day-box');
  if (jokeSection) {
    const jokes = Data.getJokes();
    if (jokes.length) {
      const dayIdx = Math.floor(Date.now() / 86400000) % jokes.length;
      const joke = jokes[dayIdx];
      jokeSection.innerHTML = `<div class="daily-joke-box">
        <h3>${_t('index.joke_of_day')}</h3>
        <div class="daily-joke-text">${_loc(joke.text)}</div>
        ${joke.attribution && joke.attribution !== 'Anonymous' ? `<div class="daily-joke-attr">— ${joke.attribution}</div>` : ''}
      </div>`;
    }
  }

  /* Comedian Spotlight */
  const comedianSection = document.getElementById('comedian-spotlight-box');
  if (comedianSection) {
    const comedians = Data.getComedians();
    if (comedians.length) {
      const weekIdx = Math.floor(Date.now() / (86400000 * 7)) % comedians.length;
      const c = comedians[weekIdx];
      comedianSection.innerHTML = `<div class="spotlight-box">
        <h3>${_t('index.comedian_spotlight')}</h3>
        ${_comedianCardHtml(c)}
      </div>`;
    }
  }
}

/* ========== RENDER: NEWS ========== */
function renderNews() {
  const el = document.getElementById('news-content');
  if (!el) return;

  const categories = Data.getNewsCategories();
  let activeFilter = 'all';

  function render() {
    const stories = activeFilter === 'all' ? Data.getNews() : Data.getNewsByCategory(activeFilter);

    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('news.title')}</h1>
      <p class="section-subtitle">${_t('news.subtitle')}</p>

      <div class="filter-bar">
        <button class="btn ${activeFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">${_t('news.filter_all')}</button>
        ${categories.map(c => `<button class="btn ${activeFilter === c.id ? 'btn-primary' : ''}" data-filter="${c.id}" style="${activeFilter === c.id ? 'background:'+c.color+';border-color:'+c.color : ''}">${c.icon} ${_t(c.name_key)}</button>`).join('')}
      </div>

      <div class="news-grid">
        ${stories.map(s => _newsCardHtml(s)).join('')}
      </div>

      ${stories.length === 0 ? '<p style="text-align:center;color:var(--text-gray);margin:2rem 0">No stories in this category yet.</p>' : ''}
    `;

    el.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });
  }

  render();
}

/* ========== RENDER: MUSIC ========== */
function renderMusic() {
  const el = document.getElementById('music-content');
  if (!el) return;

  const regions = Data.getMusicRegions();
  let activeFilter = 'all';

  function render() {
    const picks = activeFilter === 'all' ? Data.getMusic() : Data.getMusicByRegion(activeFilter);

    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('music.title')}</h1>
      <p class="section-subtitle">${_t('music.subtitle')}</p>

      <div class="filter-bar">
        <button class="btn ${activeFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">${_t('music.filter_all')}</button>
        ${regions.map(r => `<button class="btn ${activeFilter === r.id ? 'btn-primary' : ''}" data-filter="${r.id}">${r.icon} ${_t(r.name_key)}</button>`).join('')}
      </div>

      <div class="music-grid">
        ${picks.map(m => _musicCardHtml(m)).join('')}
      </div>
    `;

    el.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        render();
      });
    });
  }

  render();
}

/* ========== RENDER: COMEDY ========== */
function renderComedy() {
  const el = document.getElementById('comedy-content');
  if (!el) return;

  const jokeCats = Data.getJokeCategories();
  let jokeFilter = 'all';

  function render() {
    const comedians = Data.getComedians();
    const jokes = jokeFilter === 'all' ? Data.getJokes() : Data.getJokesByCategory(jokeFilter);

    el.innerHTML = `
      ${_backLink()}
      <h1>${_t('comedy.title')}</h1>
      <p class="section-subtitle">${_t('comedy.subtitle')}</p>

      <h2>${_t('comedy.comedians')}</h2>
      <div class="comedian-grid">
        ${comedians.map(c => _comedianCardHtml(c)).join('')}
      </div>

      <h2 style="margin-top:3rem">${_t('comedy.jokes')}</h2>

      <div class="joke-controls">
        <div class="filter-bar">
          <button class="btn ${jokeFilter === 'all' ? 'btn-primary' : ''}" data-jfilter="all">${_t('comedy.filter_all')}</button>
          ${jokeCats.map(c => `<button class="btn ${jokeFilter === c ? 'btn-primary' : ''}" data-jfilter="${c}">${_t('joke.cat.' + c)}</button>`).join('')}
        </div>
        <button class="btn btn-accent" id="random-joke-btn">\ud83c\udfb2 ${_t('comedy.random_joke')}</button>
      </div>

      <div id="random-joke-display" style="display:none"></div>

      <div class="joke-grid">
        ${jokes.map(j => _jokeCardHtml(j)).join('')}
      </div>
    `;

    el.querySelectorAll('[data-jfilter]').forEach(btn => {
      btn.addEventListener('click', () => {
        jokeFilter = btn.dataset.jfilter;
        render();
      });
    });

    document.getElementById('random-joke-btn').addEventListener('click', () => {
      const joke = Data.getRandomJoke();
      if (!joke) return;
      const display = document.getElementById('random-joke-display');
      display.style.display = 'block';
      display.innerHTML = `<div class="random-joke-box">
        <div class="random-joke-text">${_loc(joke.text)}</div>
        ${joke.attribution && joke.attribution !== 'Anonymous' ? `<div class="random-joke-attr">— ${joke.attribution}</div>` : ''}
        <button class="btn btn-accent" id="another-joke-btn">${_t('comedy.another_joke')}</button>
      </div>`;
      document.getElementById('another-joke-btn').addEventListener('click', () => {
        document.getElementById('random-joke-btn').click();
      });
      display.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  render();
}
