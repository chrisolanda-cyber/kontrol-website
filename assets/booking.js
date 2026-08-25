/* ==========================================================================
   Kontrol AI — Cal.com inline booking embed

   REPLACE THE PLACEHOLDER BELOW with your real Cal.com event link — the part
   after cal.com/ in your booking URL. If your booking page is
   https://cal.com/chris-olanda/workflow-review then KONTROL_CAL_LINK is
   'chris-olanda/workflow-review'.

   Renders into any element with id="book" — currently the CTA band at the
   bottom of each landing page. Pages without that element are unaffected.

   On a completed booking this calls window.kontrolTrackBooking() from
   assets/analytics.js, so the Google Ads conversion fires on a real booking
   rather than on a button click.
   ========================================================================== */

var KONTROL_CAL_LINK = 'kontrol-ai/workflow-review';

(function () {
  var mount = document.getElementById('book');
  if (!mount) { return; }

  var target = mount.querySelector('.cal-embed');
  var fallback = mount.querySelector('.cal-fallback');
  if (!target) { return; }

  if (KONTROL_CAL_LINK.indexOf('REPLACE-ME') !== -1) {
    console.warn('[kontrol] KONTROL_CAL_LINK is still a placeholder in assets/booking.js — the calendar will not load. The fallback link is being shown instead.');
    target.remove();
    if (fallback) { fallback.hidden = false; }
    return;
  }

  /* Official Cal.com embed loader. */
  (function (C, A, L) {
    var p = function (a, ar) { a.q.push(ar); };
    var d = C.document;
    C.Cal = C.Cal || function () {
      var cal = C.Cal; var ar = arguments;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
      if (ar[0] === L) {
        var api = function () { p(api, arguments); };
        var namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns[namespace] = cal.ns[namespace] || api;
          p(cal.ns[namespace], ar);
          p(cal, ['initNamespace', namespace]);
        } else { p(cal, ar); }
        return;
      }
      p(cal, ar);
    };
  })(window, 'https://app.cal.com/embed/embed.js', 'init');

  Cal('init', 'review', { origin: 'https://cal.com' });

  Cal.ns.review('inline', {
    elementOrSelector: '#book .cal-embed',
    config: { layout: 'month_view' },
    calLink: KONTROL_CAL_LINK
  });

  Cal.ns.review('ui', {
    hideEventTypeDetails: false,
    layout: 'month_view',
    /* Cal.com's default validation messages are too pale to spot ("This field
       is required." renders at #f9e3e1 on the dark theme). Strong red for the
       error text and the invalid field's border in both themes. */
    cssVarsPerTheme: {
      light: {
        'cal-text-error': '#D92D20',
        'cal-border-error': '#D92D20'
      },
      dark: {
        'cal-text-error': '#FF5C5C',
        'cal-border-error': '#FF5C5C'
      }
    }
  });

  /* Real conversion signal: the booking completed. */
  Cal.ns.review('on', {
    action: 'bookingSuccessful',
    callback: function (e) {
      if (typeof window.kontrolTrackBooking === 'function') {
        window.kontrolTrackBooking(e && e.detail);
      }
    }
  });
})();
