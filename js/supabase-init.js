/**
 * TNS — Supabase data loader for the public site.
 * Fetches events and announcements and renders them into the
 * Events & Announcements section (index.html).
 *
 * If Supabase is not configured yet, or returns no rows, the original
 * static content remains visible as a fallback.
 */
(function () {
  'use strict';

  function getClient() {
    if (!window.supabase) return null;
    var cfg = window.TNS_SUPABASE;
    if (!cfg || !cfg.url || cfg.url.indexOf('YOUR_') === 0 || !cfg.anonKey || cfg.anonKey.indexOf('YOUR_') === 0) {
      console.warn('[TNS Supabase] Not configured yet. Add your keys in js/supabase-config.js');
      return null;
    }
    return window.supabase.createClient(cfg.url, cfg.anonKey);
  }

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function monthName(dateStr) {
    var d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d.getTime())) return ['', ''];
    return [d.toLocaleString('en-US', { month: 'short' }), String(d.getDate())];
  }

  function emptyState(message) {
    return (
      '<div class="border border-slate-200 rounded-xl p-6 bg-white text-sm text-center" style="color: var(--muted);">' +
      '<i class="fa-solid fa-circle-info mr-2" style="color: var(--gold-deep);" aria-hidden="true"></i>' +
      escapeHTML(message) +
      '</div>'
    );
  }

  function renderEvents(rows) {
    var container = document.getElementById('eventsList');
    if (!container) return false;

    if (!rows.length) {
      container.innerHTML = emptyState('No upcoming events right now. Please check back later.');
      return true;
    }

    var html = rows.map(function (ev) {
      var m = monthName(ev.date);
      var statusClass = String(ev.status || '').toLowerCase().indexOf('plan') !== -1 ? ' planned' : '';
      var metaIcon = ev.location ? 'fa-location-dot' : 'fa-clock';
      var metaText = ev.location || ev.date;
      return (
        '<div class="event-item">' +
        '<div class="event-date"><span class="month">' + escapeHTML(m[0]) + '</span><span class="day">' + escapeHTML(m[1]) + '</span></div>' +
        '<div class="event-body">' +
        '<div class="flex items-center justify-between gap-2 mb-1">' +
        '<h4>' + escapeHTML(ev.title) + '</h4>' +
        (ev.status ? '<span class="event-status' + statusClass + '">' + escapeHTML(ev.status) + '</span>' : '') +
        '</div>' +
        '<p>' + escapeHTML(ev.description) + '</p>' +
        (metaText ? '<div class="meta"><i class="fa-solid ' + metaIcon + '" aria-hidden="true"></i><span>' + escapeHTML(metaText) + '</span></div>' : '') +
        '</div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML = html;
    return true;
  }

  function renderAnnouncements(rows) {
    var container = document.getElementById('announcementsList');
    if (!container) return false;

    if (!rows.length) {
      container.innerHTML = emptyState('No announcements right now. Please check back later.');
      return true;
    }

    var html = rows.map(function (a) {
      var cat = String(a.category || '').toLowerCase();
      var accent = cat === 'academic' ? 'academic' : cat === 'elearning' || cat.indexOf('e-learning') !== -1 ? 'elearning' : '';
      var icon = cat === 'academic' ? 'fa-file-lines' : cat === 'elearning' || cat.indexOf('e-learning') !== -1 ? 'fa-laptop' : 'fa-bullhorn';
      var footIcon = cat === 'academic' ? 'fa-building-columns' : 'fa-circle-info';
      var linkHref = a.link_href || '#contact';
      return (
        '<div class="notice-item ' + accent + '">' +
        '<div class="notice-head">' +
        '<span class="notice-tag"><i class="fa-solid ' + icon + ' mr-1" aria-hidden="true"></i>' + escapeHTML(a.category) + '</span>' +
        (a.date_label ? '<span class="notice-date">' + escapeHTML(a.date_label) + '</span>' : '') +
        '</div>' +
        '<h4>' + escapeHTML(a.title) + '</h4>' +
        '<p>' + escapeHTML(a.description) + '</p>' +
        '<div class="notice-foot">' +
        '<span><i class="fa-solid ' + footIcon + ' mr-1.5" aria-hidden="true"></i>' + escapeHTML(a.footer_label || '') + '</span>' +
        '<a href="' + escapeHTML(linkHref) + '">' + escapeHTML(a.link_text || 'Enquire') + ' <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i></a>' +
        '</div>' +
        '</div>'
      );
    }).join('');

    container.innerHTML = html;
    return true;
  }

  async function load() {
    var client = getClient();
    if (!client) return;

    try {
      var [eventsRes, annRes] = await Promise.all([
        client.from('events').select('*').order('date', { ascending: true }),
        client.from('announcements').select('*').order('created_at', { ascending: false })
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (annRes.error) throw annRes.error;

      renderEvents(eventsRes.data || []);
      renderAnnouncements(annRes.data || []);
    } catch (err) {
      console.warn('[TNS Supabase] Could not load content:', err.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
