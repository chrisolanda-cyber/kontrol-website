/* Homepage explainer video: muted autoplay loop that only plays while on screen,
   plus a sound toggle. The first unmute restarts from the top so the viewer gets
   the whole story with audio. Visitors who prefer reduced motion get the poster
   and a manual play instead of autoplay. */
(function () {
  var video = document.getElementById('explainer-video');
  var btn = document.getElementById('explainer-sound');
  if (!video || !btn) { return; }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused = false;
  var restartedForSound = false;

  function play() {
    var p = video.play();
    if (p && p.catch) { p.catch(function () {}); }
  }

  if (reduceMotion) {
    video.controls = true;
  } else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!userPaused) { play(); }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.35 }).observe(video);
  } else {
    play();
  }

  video.addEventListener('click', function () {
    if (video.controls) { return; }
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
  });

  btn.addEventListener('click', function () {
    var turningOn = video.muted;
    video.muted = !turningOn;
    btn.setAttribute('aria-pressed', turningOn ? 'true' : 'false');
    btn.querySelector('.explainer-sound-label').textContent = turningOn ? 'Sound off' : 'Sound on';
    if (turningOn) {
      if (!restartedForSound) { video.currentTime = 0; restartedForSound = true; }
      userPaused = false;
      play();
      if (window.KONTROL_GA4_LIVE && typeof gtag === 'function') {
        gtag('event', 'explainer_unmute', { page_path: location.pathname });
      }
    }
  });
})();
