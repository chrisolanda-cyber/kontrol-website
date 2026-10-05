/* ==========================================================================
   Kontrol AI — enquiry forms

   Any <form data-enquiry="source label"> posts to Formspree in the background
   and counts the lead (kontrolTrackLead) only once Formspree confirms it was
   accepted. A filled honeypot (_gotcha) is treated as a bot and never counted.

   Each submission also carries where the visitor came from (attr_* fields,
   from kontrolAttribution() in analytics.js), so every enquiry email shows
   its own source: Google Ads click ID, UTM tags, landing page and referrer.

   Optional attributes on the form:
     data-thanks="id"   element shown in place of the form once sent
   Optional element inside the form:
     [data-enquiry-msg] where validation and send errors are written
   ========================================================================== */

(function () {
  var forms = document.querySelectorAll('form[data-enquiry]');
  if (!forms.length || !window.fetch || !window.FormData) { return; }

  Array.prototype.forEach.call(forms, function (form) {
    var source = form.getAttribute('data-enquiry') || 'enquiry form';
    var msg = form.querySelector('[data-enquiry-msg]');
    var thanks = document.getElementById(form.getAttribute('data-thanks') || '');
    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button ? button.textContent : '';

    var say = function (text, isError) {
      if (!msg) { return; }
      msg.textContent = text;
      msg.classList.toggle('is-error', !!isError);
    };

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      say('', false);

      if (!form.checkValidity()) {
        say('Please fill in the required fields and a valid email.', true);
        var firstBad = form.querySelector(':invalid');
        if (firstBad) { firstBad.focus(); }
        return;
      }

      var isBot = form.elements._gotcha && form.elements._gotcha.value !== '';
      var data = new FormData(form);
      var attr = typeof window.kontrolAttribution === 'function' ? window.kontrolAttribution() : {};
      Object.keys(attr).forEach(function (k) { if (attr[k]) { data.append('attr_' + k, attr[k]); } });

      if (button) { button.disabled = true; button.textContent = 'Sending…'; }

      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) { throw new Error('status ' + r.status); }
          if (!isBot && typeof window.kontrolTrackLead === 'function') {
            window.kontrolTrackLead(source);
          }
          if (thanks) {
            form.hidden = true;
            thanks.hidden = false;
            thanks.setAttribute('tabindex', '-1');
            thanks.focus();
          } else {
            form.reset();
            say('Sent. I\'ll be in touch shortly.', false);
          }
        })
        .catch(function () {
          if (button) { button.disabled = false; button.textContent = buttonLabel; }
          say('That didn\'t send. Please try again, or email ai@kontrolai.com.au directly.', true);
        });
    });
  });
})();
