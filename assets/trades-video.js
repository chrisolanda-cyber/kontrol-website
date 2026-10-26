/* Trades page diagram loops: silent, so they autoplay muted, but only while on
   screen. Each diagram ships a 16:9 and a 4:5 cut; CSS shows one per screen size
   and only the visible one is ever loaded (preload="none"). Visitors who prefer
   reduced motion never get the videos: CSS shows the static flow instead. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { return; }
  var videos = document.querySelectorAll('.flow-video video');
  if (!videos.length) { return; }

  function shown(v) { return v.offsetParent !== null; }
  function play(v) {
    var p = v.play();
    if (p && p.catch) { p.catch(function () {}); }
  }

  if (!('IntersectionObserver' in window)) {
    videos.forEach(function (v) { if (shown(v)) { play(v); } });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && shown(v)) { play(v); } else if (!v.paused) { v.pause(); }
    });
  }, { threshold: 0.35 });
  videos.forEach(function (v) { io.observe(v); });
})();
