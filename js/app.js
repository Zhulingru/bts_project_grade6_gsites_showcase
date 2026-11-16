const CLASSES = ['D', 'B', 'G'];

const state = {
  students: [],
  classFilter: 'all',
  query: '',
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[c]));
}

function getSiteUrl(student) {
  return String(student && student.siteUrl || '').trim();
}

function sourceLabel(url) {
  if (/sites\.google\.com/i.test(url)) return 'Google 網站';
  if (url) return '網站';
  return '尚未提供';
}

function publishedSiteUrl(raw) {
  const u = String(raw || '').trim();
  if (!u || u === '#') return '';
  let url;
  try {
    url = new URL(u);
  } catch {
    return '';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
  url.searchParams.delete('authuser');
  url.searchParams.delete('pli');
  url.hash = '';
  return url.toString();
}

function flattenStudents(data) {
  return CLASSES.flatMap((cls) =>
    (data[cls] || []).map((student, index) => ({
      id: student.id || `${cls.toLowerCase()}${index + 1}`,
      name: student.name || '未命名',
      siteTitle: student.siteTitle || '',
      siteUrl: student.siteUrl || '',
      thumbUrl: student.thumbUrl || '',
      class: cls,
    }))
  );
}

async function loadStudents() {
  try {
    const res = await fetch('data/students.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return flattenStudents(await res.json());
  } catch (err) {
    console.error('無法載入學生名單', err);
    return null;
  }
}

function filteredStudents() {
  const q = state.query.trim().toLowerCase();
  return state.students.filter((s) => {
    const classOk = state.classFilter === 'all' || s.class === state.classFilter;
    const nameOk = !q || String(s.name).toLowerCase().includes(q);
    const titleOk = !q || String(s.siteTitle).toLowerCase().includes(q);
    return classOk && (nameOk || titleOk);
  });
}

function renderCards() {
  const grid = document.getElementById('student-grid');
  const count = document.getElementById('works-count');
  const empty = document.getElementById('empty-state');
  if (!grid || !count || !empty) return;

  if (state.students === null) {
    grid.innerHTML = '';
    count.textContent = '學生名單載入失敗';
    empty.hidden = false;
    empty.textContent = '讀不到 data/students.json。請用本機伺服器開啟這個資料夾，不要直接雙擊 index.html。';
    return;
  }

  const list = filteredStudents();
  const classLabel = state.classFilter === 'all' ? '三班' : `${state.classFilter} 班`;
  count.textContent = `目前顯示 ${classLabel} ${list.length} 位學生`;

  if (list.length === 0) {
    empty.hidden = false;
    empty.textContent = state.students.length === 0
      ? '還沒有學生資料。請在 data/students.json 填上姓名與 Google 網站網址。'
      : '找不到符合的學生，請改班級或再試一次姓名。';
  } else {
    empty.hidden = true;
  }

  grid.innerHTML = '';

  list.forEach((student) => {
    const url = publishedSiteUrl(getSiteUrl(student));
    const ready = Boolean(url);
    const card = document.createElement(ready ? 'a' : 'div');
    card.className = 'student-card' + (ready ? '' : ' is-empty');
    if (ready) {
      card.href = url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    card.setAttribute('aria-label', ready
      ? `${student.name}，${student.class} 班，開啟 Google 網站`
      : `${student.name}，${student.class} 班，尚未提供網站連結`);

    const previewTitle = student.siteTitle || (ready ? 'Google 網站' : '尚未提供');
    const titleLine = student.siteTitle
      ? `<p class="student-site">${escapeHtml(student.siteTitle)}</p>`
      : '';

    card.innerHTML = `
      <div class="student-thumb">
        <div class="browser-mock" aria-hidden="true">
          <div class="browser-mock__bar"><span></span><span></span><span></span></div>
          <p class="browser-mock__title">${escapeHtml(previewTitle)}</p>
        </div>
      </div>
      <div class="student-body">
        <div class="student-meta">
          <span class="pill">${escapeHtml(student.class)} 班</span>
          <span class="source">${escapeHtml(sourceLabel(url))}</span>
        </div>
        <p class="student-name">${escapeHtml(student.name)}</p>
        ${titleLine}
      </div>
    `;

    const localThumb = String(student.thumbUrl || '').trim();
    if (localThumb) {
      const img = document.createElement('img');
      img.alt = `${student.name} 的網站封面`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = localThumb;
      img.addEventListener('error', () => img.remove());
      card.querySelector('.student-thumb').appendChild(img);
    }

    grid.appendChild(card);
  });
}

function setClassFilter(next, updateHash = true) {
  state.classFilter = next;
  document.querySelectorAll('.class-tab').forEach((btn) => {
    const active = btn.dataset.class === next;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  if (updateHash) {
    const hash = next === 'all' ? '' : `#class-${next.toLowerCase()}`;
    if (`${location.pathname}${location.search}${location.hash}` !== `${location.pathname}${location.search}${hash}`) {
      history.replaceState(null, '', hash || (location.pathname + location.search));
    }
  }
  renderCards();
}

function initTabs() {
  document.querySelectorAll('.class-tab').forEach((btn) => {
    btn.addEventListener('click', () => setClassFilter(btn.dataset.class));
  });
}

function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    state.query = input.value;
    renderCards();
  });
}

function classFromHash() {
  const hash = (location.hash || '').replace('#', '').toLowerCase();
  const match = hash.match(/^class-([dbg])$/);
  return match ? match[1].toUpperCase() : 'all';
}

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initSearch();
  state.students = await loadStudents();
  setClassFilter(classFromHash(), false);
  window.addEventListener('hashchange', () => setClassFilter(classFromHash(), false));
});
