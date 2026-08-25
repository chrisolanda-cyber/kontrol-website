/* ==========================================================================
   Kontrol AI — lead magnet capture (.magnet-form)

   Submits the checklist email form to Formspree via fetch so the visitor
   stays on the page, then reveals the .magnet-success line with the direct
   link to the checklist. Fires a GA4 `lead_magnet_signup` event — deliberately
   NOT `generate_lead`, so checklist emails never pollute the Google Ads
   conversion (which imports generate_lead and must mean a booked review or
   contact-form lead only).

   If fetch fails for any reason, falls back to a normal form post so the
   capture is never lost.
   ========================================================================== */

(function () {
  var forms = document.querySelectorAll('.magnet-form');
  if (!forms.length) { return; }

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var button = form.querySelector('button[type="submit"]');
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (!res.ok) { throw new Error('formspree ' + res.status); }

        var wrap = form.closest('.magnet') || form.parentElement;
        var note = wrap ? wrap.querySelector('.magnet-note') : null;
        var success = wrap ? wrap.querySelector('.magnet-success') : null;
        form.hidden = true;
        if (note) { note.hidden = true; }
        if (success) { success.hidden = false; }

        if (window.KONTROL_GA4_LIVE && typeof gtag === 'function') {
          gtag('event', 'lead_magnet_signup', {
            lead_source: 'admin time-cost checklist',
            page_path: window.location.pathname
          });
        }
      }).catch(function () {
        /* Network or Formspree hiccup — let the browser do a plain post.
           form.submit() does not re-fire submit listeners, so no loop. */
        if (button) { button.disabled = false; }
        form.submit();
      });
    });
  });
})();
