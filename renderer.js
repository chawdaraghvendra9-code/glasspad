'use strict';

const $ = (id) => document.getElementById(id);

const STORE_KEY = 'glasspad.v1';

let pages = [];
let activeId = null;
let todos = [];
let saveTimer = null;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      pages = Array.isArray(data.pages) ? data.pages : [];
      todos = Array.isArray(data.todos) ? data.todos : [];
      activeId = data.activeId || null;
    }
  } catch (_) {
    pages = [];
    todos = [];
    activeId = null;
  }
  if (!pages.length) {
    pages = [{ id: uid(), content: '', created: Date.now(), updated: Date.now() }];
    activeId = pages[0].id;
  }
  if (!pages.some((p) => p.id === activeId)) activeId = pages[0].id;
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ pages, todos, activeId }));
    const el = $('saveState');
    el.textContent = 'Saved';
    el.classList.add('show');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => el.classList.remove('show'), 1200);
  } catch (_) {}
}

function pageTitle(p) {
  const first = (p.content || '').split('\n').map((l) => l.trim()).find((l) => l.length);
  return first ? first.slice(0, 28) : 'Untitled';
}

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return '';
  }
}

/* ---------- Notes ---------- */

function activePage() {
  return pages.find((p) => p.id === activeId) || pages[0];
}

function renderPages() {
  const list = $('pageList');
  list.innerHTML = '';
  pages.forEach((p) => {
    const item = document.createElement('div');
    item.className = 'page-item' + (p.id === activeId ? ' active' : '');

    const title = document.createElement('span');
    title.className = 'pi-title';
    title.textContent = pageTitle(p);

    const date = document.createElement('span');
    date.className = 'pi-date';
    date.textContent = fmtDate(p.updated || p.created);

    const del = document.createElement('button');
    del.className = 'pi-del';
    del.textContent = '×';
    del.title = 'Delete page';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePage(p.id);
    });

    item.appendChild(title);
    item.appendChild(date);
    item.appendChild(del);
    item.addEventListener('click', () => switchPage(p.id));
    list.appendChild(item);
  });
}

function renderEditor() {
  const p = activePage();
  $('noteArea').value = p.content || '';
  $('pageTitle').textContent = pageTitle(p);
  $('pageDate').textContent = fmtDate(p.updated || p.created);
  updateWordCount();
}

function switchPage(id) {
  activeId = id;
  renderPages();
  renderEditor();
  persist();
}

function newPage() {
  const p = { id: uid(), content: '', created: Date.now(), updated: Date.now() };
  pages.unshift(p);
  activeId = p.id;
  renderPages();
  renderEditor();
  persist();
  $('noteArea').focus();
}

function deletePage(id) {
  if (pages.length <= 1) return;
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return;
  pages.splice(idx, 1);
  if (activeId === id) activeId = pages[Math.max(0, idx - 1)].id;
  renderPages();
  renderEditor();
  persist();
}

function updateWordCount() {
  const text = $('noteArea').value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  $('wordCount').textContent = words + (words === 1 ? ' word' : ' words');
}

$('noteArea').addEventListener('input', () => {
  const p = activePage();
  p.content = $('noteArea').value;
  p.updated = Date.now();
  $('pageTitle').textContent = pageTitle(p);
  updateWordCount();
  persist();
});

/* ---------- Todos ---------- */

function renderTodos() {
  const list = $('todoList');
  list.innerHTML = '';
  todos.forEach((t) => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (t.done ? ' done' : '');

    const check = document.createElement('button');
    check.className = 'todo-check';
    check.title = 'Toggle';
    check.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5.5 L4 8 L8.5 2.5" fill="none" stroke="#0b2530" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    check.addEventListener('click', () => {
      t.done = !t.done;
      renderTodos();
      persist();
    });

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = t.text;

    const del = document.createElement('button');
    del.className = 'todo-del';
    del.textContent = '×';
    del.title = 'Delete';
    del.addEventListener('click', () => {
      todos = todos.filter((x) => x.id !== t.id);
      renderTodos();
      persist();
    });

    item.appendChild(check);
    item.appendChild(text);
    item.appendChild(del);
    list.appendChild(item);
  });

  const left = todos.filter((t) => !t.done).length;
  $('todoCount').textContent = todos.length
    ? left + ' of ' + todos.length + ' left'
    : 'No tasks yet';
}

function addTodo() {
  const input = $('todoInput');
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: uid(), text, done: false, created: Date.now() });
  input.value = '';
  renderTodos();
  persist();
}

$('btnAddTodo').addEventListener('click', addTodo);
$('todoInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

$('btnClearDone').addEventListener('click', () => {
  todos = todos.filter((t) => !t.done);
  renderTodos();
  persist();
});

/* ---------- Views ---------- */

function setView(name) {
  document.querySelectorAll('.seg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.toggle('active', v.id === name + 'View');
  });
  const seg = $('segment');
  seg.classList.toggle('todos', name === 'todos');
}

document.querySelectorAll('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

/* ---------- Notch & window controls ---------- */

(function () {
  const notch = $('notch');
  let downX = 0, downY = 0, downOk = false, justToggled = false;
  notch.addEventListener('pointerdown', (e) => {
    downX = e.clientX;
    downY = e.clientY;
    downOk = true;
  });
  notch.addEventListener('pointerup', (e) => {
    if (!downOk) return;
    downOk = false;
    const moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
    if (moved < 6) {
      justToggled = true;
      window.glasspad.toggle();
      setTimeout(() => { justToggled = false; }, 350);
    }
  });
  notch.addEventListener('click', () => {
    if (justToggled) return;
    window.glasspad.toggle();
  });
})();
$('btnClose').addEventListener('click', () => window.glasspad.collapse());
$('btnMin').addEventListener('click', () => window.glasspad.collapse());

$('btnTop').addEventListener('click', () => {
  const sw = $('swOnTop');
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  sw.setAttribute('aria-checked', String(on));
  $('btnTop').classList.toggle('off', !on);
  window.glasspad.setOnTop(on);
});

/* ---------- Drawer ---------- */

$('btnDrawer').addEventListener('click', () => {
  const d = $('drawer');
  const open = d.classList.toggle('open');
  $('btnDrawer').classList.toggle('active', open);
});

$('btnNewPage').addEventListener('click', newPage);

/* ---------- Settings popover ---------- */

$('btnSettings').addEventListener('click', (e) => {
  e.stopPropagation();
  $('settingsPop').classList.toggle('hidden');
  $('btnSettings').classList.toggle('active');
});

document.addEventListener('click', (e) => {
  const pop = $('settingsPop');
  if (!pop.classList.contains('hidden') && !pop.contains(e.target) && e.target !== $('btnSettings')) {
    pop.classList.add('hidden');
    $('btnSettings').classList.remove('active');
  }
});

$('swStartup').addEventListener('click', () => {
  const sw = $('swStartup');
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  sw.setAttribute('aria-checked', String(on));
  window.glasspad.setAutostart(on);
});

$('swOnTop').addEventListener('click', () => {
  const sw = $('swOnTop');
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  sw.setAttribute('aria-checked', String(on));
  $('btnTop').classList.toggle('off', !on);
  window.glasspad.setOnTop(on);
});

$('swSleep').addEventListener('click', () => {
  const sw = $('swSleep');
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  sw.setAttribute('aria-checked', String(on));
  window.glasspad.setSleep(on);
});

$('swLowMem').addEventListener('click', () => {
  const sw = $('swLowMem');
  const on = !sw.classList.contains('on');
  sw.classList.toggle('on', on);
  sw.setAttribute('aria-checked', String(on));
  window.glasspad.setLowMem(on);
});

$('btnQuit').addEventListener('click', () => window.glasspad.quit());

window.addEventListener('blur', () => document.body.classList.add('blurred'));
window.addEventListener('focus', () => document.body.classList.remove('blurred'));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const pop = $('settingsPop');
    if (!pop.classList.contains('hidden')) {
      pop.classList.add('hidden');
      $('btnSettings').classList.remove('active');
    } else {
      window.glasspad.collapse();
    }
  }
});

/* ---------- Panel state from main ---------- */

window.glasspad.onPanelState((expanded) => {
  document.body.classList.toggle('collapsed', !expanded);
  if (expanded) {
    const pop = $('settingsPop');
    pop.classList.add('hidden');
    $('btnSettings').classList.remove('active');
  }
});

/* ---------- Init ---------- */

load();
renderPages();
renderEditor();
renderTodos();
setView('notes');

window.glasspad.getState().then((s) => {
  if (s && s.alwaysOnTop === false) {
    $('swOnTop').classList.remove('on');
    $('swOnTop').setAttribute('aria-checked', 'false');
    $('btnTop').classList.add('off');
  }
});

window.glasspad.getAutostart().then((on) => {
  $('swStartup').classList.toggle('on', !!on);
  $('swStartup').setAttribute('aria-checked', String(!!on));
});

window.glasspad.getSleep().then((on) => {
  $('swSleep').classList.toggle('on', on !== false);
  $('swSleep').setAttribute('aria-checked', String(on !== false));
});

window.glasspad.getLowMem().then((on) => {
  $('swLowMem').classList.toggle('on', on !== false);
  $('swLowMem').setAttribute('aria-checked', String(on !== false));
});
