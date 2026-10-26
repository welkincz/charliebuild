/* Native scrolling keeps touch navigation working even without this enhancement. */
(function () {
  var carousel = document.querySelector('.project-carousel');
  if (!carousel) return;
  var track = carousel.querySelector('.project-track');
  var slides = Array.from(track.querySelectorAll('.project-slide'));
  var links = Array.from(carousel.querySelectorAll('.project-nav a'));
  var previous = carousel.querySelector('[data-project-previous]');
  var next = carousel.querySelector('[data-project-next]');
  var position = carousel.querySelector('[data-project-position]');
  var fill = carousel.querySelector('.project-position-fill');
  var status = carousel.querySelector('[data-project-status]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var active = 0;
  var requested = null;
  var trackWidth = track.clientWidth;
  var frame = 0;
  var settleTimer;

  function update(index) {
    active = index;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
      slide.inert = i !== index;
      if (i === index) links[i].setAttribute('aria-current', 'true');
      else links[i].removeAttribute('aria-current');
    });
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    position.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    fill.style.width = ((index + 1) / slides.length * 100) + '%';
  }

  function goTo(index, immediate) {
    index = Math.max(0, Math.min(slides.length - 1, index));
    requested = index;
    update(index);
    track.scrollTo({ left: slides[index].offsetLeft, behavior: immediate || reduced.matches ? 'instant' : 'smooth' });
  }

  function sync() {
    frame = 0;
    if (track.clientWidth !== trackWidth) {
      trackWidth = track.clientWidth;
      goTo(active, true);
      return;
    }
    // Scroll events between the endpoints must not undo an arrow/tab selection.
    if (requested !== null && Math.abs(slides[requested].offsetLeft - track.scrollLeft) > 2) return;
    requested = null;
    var closest = 0;
    var distance = Infinity;
    slides.forEach(function (slide, index) {
      var delta = Math.abs(slide.offsetLeft - track.scrollLeft);
      if (delta < distance) { closest = index; distance = delta; }
    });
    update(closest);
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      status.textContent = links[active].textContent.trim() + ', project ' + (active + 1) + ' of ' + slides.length;
    }, 160);
  }

  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) { event.preventDefault(); goTo(index); });
  });
  previous.addEventListener('click', function () { goTo(active - 1); });
  next.addEventListener('click', function () { goTo(active + 1); });
  track.addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
  track.addEventListener('pointerdown', function () { requested = null; }, { passive: true });
  track.addEventListener('wheel', function () { requested = null; }, { passive: true });
  track.addEventListener('keydown', function (event) {
    if (event.target !== track) return;
    var targets = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: slides.length - 1 };
    if (!Object.prototype.hasOwnProperty.call(targets, event.key)) return;
    event.preventDefault();
    goTo(targets[event.key]);
  });
  window.addEventListener('hashchange', function () {
    var index = slides.findIndex(function (slide) { return '#' + slide.id === window.location.hash; });
    if (index >= 0) goTo(index, true);
  });

  // Keep the selected project aligned after orientation or responsive-layout changes.
  var observer = new ResizeObserver(function () { goTo(active, true); });
  observer.observe(track);
  var initial = slides.findIndex(function (slide) { return '#' + slide.id === window.location.hash; });
  carousel.classList.add('is-enhanced');
  carousel.querySelector('.project-controls').hidden = false;
  carousel.querySelector('.project-position').hidden = false;
  track.setAttribute('tabindex', '0');
  goTo(initial < 0 ? 0 : initial, true);
})();
