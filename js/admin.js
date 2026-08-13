/**
 * TNS — Admin Dashboard script
 * Login (Supabase Auth), then create / delete events & announcements.
 * Runs on admin.html.
 */
(function () {
  'use strict';

  var client = null;

  var $ = function (id) { return document.getElementById(id); };

  function getClient() {
    var cfg = window.TNS_SUPABASE;
    if (!cfg || !cfg.url || cfg.url.indexOf('YOUR_') === 0 || !cfg.anonKey || cfg.anonKey.indexOf('YOUR_') === 0) {
      return null;
    }
    return window.supabase.createClient(cfg.url, cfg.anonKey);
  }

  function toast(message, ok) {
    var el = $('toast');
    el.textContent = message;
    el.className = 'toast show ' + (ok ? 'ok' : 'err');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.className = 'toast'; }, 3200);
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------ */
  /* VIEW SWITCHING                                                      */
  /* ------------------------------------------------------------------ */
  function showDashboard() {
    $('loginView').classList.add('hidden');
    $('dashboardView').classList.remove('hidden');
  }

  function showLogin() {
    $('dashboardView').classList.add('hidden');
    $('loginView').classList.remove('hidden');
  }

  /* ------------------------------------------------------------------ */
  /* TABS                                                               */
  /* ------------------------------------------------------------------ */
  function initTabs() {
    var btns = document.querySelectorAll('.tab-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.add('hidden-panel'); });
        $('tab-' + btn.dataset.tab).classList.remove('hidden-panel');
        if (btn.dataset.tab === 'events') loadEvents();
        else loadAnnouncements();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* LIST RENDERING                                                      */
  /* ------------------------------------------------------------------ */
  function renderManageList(id, items, onDelete) {
    var container = $(id);
    if (!items.length) {
      container.innerHTML = '<p class="text-sm" style="color: var(--muted);">No items yet. Use the form above to add your first one.</p>';
      return;
    }
    container.innerHTML = '';
    items.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'manage-item';

      var info = document.createElement('div');
      var title = document.createElement('h4');
      title.textContent = item.title;
      var sub = document.createElement('p');
      if (item.date) sub.textContent = item.date;
      else sub.textContent = (item.category || '') + (item.date_label ? ' · ' + item.date_label : '');
      info.appendChild(title);
      info.appendChild(sub);

      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-danger';
      delBtn.innerHTML = '<i class="fa-solid fa-trash-can mr-1" aria-hidden="true"></i>Delete';
      delBtn.addEventListener('click', function () {
        if (window.confirm('Delete "' + item.title + '"? This cannot be undone.')) {
          onDelete(item);
        }
      });

      row.appendChild(info);
      row.appendChild(delBtn);
      container.appendChild(row);
    });
  }

  /* ------------------------------------------------------------------ */
  /* DATA LOADING                                                        */
  /* ------------------------------------------------------------------ */
  async function loadEvents() {
    if (!client) return;
    var res = await client.from('events').select('*').order('date', { ascending: true });
    if (res.error) { toast('Could not load events: ' + res.error.message, false); return; }
    renderManageList('eventsManageList', res.data || [], deleteEvent);
  }

  async function loadAnnouncements() {
    if (!client) return;
    var res = await client.from('announcements').select('*').order('created_at', { ascending: false });
    if (res.error) { toast('Could not load announcements: ' + res.error.message, false); return; }
    renderManageList('annManageList', res.data || [], deleteAnnouncement);
  }

  /* ------------------------------------------------------------------ */
  /* CREATE                                                              */
  /* ------------------------------------------------------------------ */
  async function createEvent(e) {
    e.preventDefault();
    var title = $('evTitle').value.trim();
    var date = $('evDate').value;
    var status = $('evStatus').value;
    var location = $('evLocation').value.trim();
    var description = $('evDescription').value.trim();

    if (!title || !date || !description) {
      toast('Please fill in all required fields (Title, Date, Description).', false);
      return;
    }

    var btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;

    var res = await client.from('events').insert({
      title: title,
      date: date,
      status: status,
      location: location,
      description: description
    });

    btn.disabled = false;
    if (res.error) { toast('Failed to publish event: ' + res.error.message, false); return; }

    e.target.reset();
    toast('Event published!', true);
    loadEvents();
  }

  async function createAnnouncement(e) {
    e.preventDefault();
    var title = $('anTitle').value.trim();
    var category = $('anCategory').value;
    var dateLabel = $('anDateLabel').value.trim();
    var description = $('anDescription').value.trim();
    var footer = $('anFooter').value.trim();
    var linkText = $('anLinkText').value.trim() || 'Enquire';
    var linkHref = $('anLinkHref').value.trim() || '#contact';

    if (!title || !description) {
      toast('Please fill in all required fields (Title, Description).', false);
      return;
    }

    var btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;

    var res = await client.from('announcements').insert({
      title: title,
      category: category,
      date_label: dateLabel,
      description: description,
      footer_label: footer,
      link_text: linkText,
      link_href: linkHref
    });

    btn.disabled = false;
    if (res.error) { toast('Failed to publish announcement: ' + res.error.message, false); return; }

    e.target.reset();
    toast('Announcement published!', true);
    loadAnnouncements();
  }

  /* ------------------------------------------------------------------ */
  /* DELETE                                                              */
  /* ------------------------------------------------------------------ */
  async function deleteEvent(item) {
    var res = await client.from('events').delete().eq('id', item.id);
    if (res.error) { toast('Failed to delete: ' + res.error.message, false); return; }
    toast('Event deleted.', true);
    loadEvents();
  }

  async function deleteAnnouncement(item) {
    var res = await client.from('announcements').delete().eq('id', item.id);
    if (res.error) { toast('Failed to delete: ' + res.error.message, false); return; }
    toast('Announcement deleted.', true);
    loadAnnouncements();
  }

  /* ------------------------------------------------------------------ */
  /* AUTH                                                                */
  /* ------------------------------------------------------------------ */
  async function handleLogin(e) {
    e.preventDefault();
    var email = $('loginEmail').value.trim();
    var password = $('loginPassword').value;
    var errEl = $('loginError');
    errEl.classList.add('hidden');

    if (!email || !password) {
      errEl.textContent = 'Please enter your email and password.';
      errEl.classList.remove('hidden');
      return;
    }

    var btn = $('loginBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2" aria-hidden="true"></i>Signing In...';

    var res = await client.auth.signInWithPassword({ email: email, password: password });

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock-open mr-2" aria-hidden="true"></i> Sign In';

    if (res.error) {
      errEl.textContent = 'Login failed: ' + res.error.message;
      errEl.classList.remove('hidden');
      return;
    }

    enterDashboard(res.data.user);
  }

  function enterDashboard(user) {
    $('adminEmailLabel').textContent = user ? user.email : '';
    showDashboard();
    loadEvents();
    loadAnnouncements();
  }

  async function handleLogout() {
    await client.auth.signOut();
    showLogin();
    $('loginForm').reset();
  }

  /* ------------------------------------------------------------------ */
  /* INIT                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    client = getClient();

    if (!client) {
      toast('Supabase is not configured. Open js/supabase-config.js and add your URL + anon key.', false);
      $('loginBtn').disabled = true;
      $('loginBtn').innerHTML = '<i class="fa-solid fa-plug-circle-xmark mr-2" aria-hidden="true"></i> Not Configured';
      return;
    }

    initTabs();

    $('loginForm').addEventListener('submit', handleLogin);
    $('logoutBtn').addEventListener('click', handleLogout);
    $('eventForm').addEventListener('submit', createEvent);
    $('annForm').addEventListener('submit', createAnnouncement);

    // Restore session if the user refreshed the admin page.
    client.auth.getSession().then(function (res) {
      if (res.data && res.data.session) {
        enterDashboard(res.data.session.user);
      } else {
        showLogin();
      }
    });

    client.auth.onAuthStateChange(function (_event, session) {
      if (session) enterDashboard(session.user);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
