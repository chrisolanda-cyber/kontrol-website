/* ==========================================================================
   Kontrol AI — GA4 + Google Ads tracking

   REPLACE THE THREE PLACEHOLDERS BELOW. They are the only values that need
   changing anywhere on the site — every page loads this one file.

     KONTROL_GA4_ID     Analytics -> Admin -> Data streams        "G-XXXXXXXXXX"
     KONTROL_ADS_ID     Ads -> Goals -> Conversions               "AW-XXXXXXXXX"
     KONTROL_ADS_LABEL  same screen, the conversion action label

   While the placeholders are in place nothing is sent anywhere and a warning
   is logged to the browser console, so the site is safe to deploy as-is.
   ========================================================================== */

var KONTROL_GA4_ID    = 'G-Y4MKKZ3BXH';
var KONTROL_ADS_ID    = 'AW-XXXXXXXXX';
var KONTROL_ADS_LABEL = 'XXXXXXXXXXXXXXXXXX';

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

(function () {
  var unset = function (v) { return !v || v.indexOf('XXX') !== -1; };

  var ga4Live = !unset(KONTROL_GA4_ID);
  var adsLive = !unset(KONTROL_ADS_ID);

  window.KONTROL_GA4_LIVE = ga4Live;
  window.KONTROL_ADS_LIVE = adsLive;
  window.KONTROL_TRACKING_LIVE = ga4Live || adsLive;

  if (!window.KONTROL_TRACKING_LIVE) {
    console.warn('[kontrol] Tracking IDs are still placeholders in assets/analytics.js — no analytics or conversions are being recorded.');
    return;
  }

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + (ga4Live ? KONTROL_GA4_ID : KONTROL_ADS_ID);
  document.head.appendChild(tag);

  gtag('js', new Date());
  if (ga4Live) { gtag('config', KONTROL_GA4_ID); }
  if (adsLive) { gtag('config', KONTROL_ADS_ID); }
})();

/* --------------------------------------------------------------------------
   The single lead conversion. Call with a short source string describing where
   the lead came from.
   -------------------------------------------------------------------------- */
window.kontrolTrackLead = function (source) {
  source = source || 'unknown';

  if (!window.KONTROL_TRACKING_LIVE) {
    console.warn('[kontrol] Lead captured (' + source + '), but tracking IDs are placeholders — no conversion sent.');
    return;
  }

  if (window.KONTROL_GA4_LIVE) {
    gtag('event', 'generate_lead', {
      currency: 'AUD',
      value: 0,
      lead_source: source
    });
  }

  if (window.KONTROL_ADS_LIVE && KONTROL_ADS_LABEL.indexOf('XXX') === -1) {
    gtag('event', 'conversion', {
      send_to: KONTROL_ADS_ID + '/' + KONTROL_ADS_LABEL
    });
  } else if (window.KONTROL_ADS_LIVE) {
    console.warn('[kontrol] Ads conversion label is still a placeholder — GA4 event sent, Ads conversion skipped.');
  }
};

/* Fired when a discovery call is actually booked — not when someone clicks a
   button. Called by assets/booking.js on Cal.com's bookingSuccessful event. */
window.kontrolTrackBooking = function () {
  window.kontrolTrackLead('cal.com booking');
};

/* Light-touch pathway: clicking any mailto link fires quick_question_click so
   the email rung shows up in GA4 alongside form submits and bookings. Not a
   conversion — a click only proves intent, not a sent email. */
document.addEventListener('click', function (e) {
  var link = e.target && e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
  if (!link || !window.KONTROL_GA4_LIVE) { return; }
  gtag('event', 'quick_question_click', {
    link_text: (link.textContent || '').trim().slice(0, 60),
    page_path: location.pathname
  });
});
