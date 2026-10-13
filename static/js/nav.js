// Header menus (the GitHub menu). Hover opens them on devices with a mouse
// (see site.css); this adds tap and keyboard: a tap or Enter/Space toggles,
// Escape closes, and they close when focus or a click moves elsewhere.
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('.menu'), function (menu) {
    var toggle = menu.querySelector('.menu-toggle');

    function set(open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function (event) {
      // With a mouse, hover already shows the menu; a click toggling hidden
      // state only flipped the arrow. Taps and Enter/Space still toggle.
      if (event.pointerType === 'mouse') return;
      set(!menu.classList.contains('is-open'));
    });
    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        set(false);
        toggle.focus();
      }
    });
    menu.addEventListener('focusout', function (event) {
      if (!menu.contains(event.relatedTarget)) set(false);
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) set(false);
    });
  });
})();
