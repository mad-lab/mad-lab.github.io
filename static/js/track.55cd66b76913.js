// Hover, tap and keyboard details for the insertion track on the home page.
// Near an insertion: its read count. Over a gene (or its stretch of genome):
// the gene, its insertions and how many of its TA sites were hit.
(function () {
  var svg = document.querySelector('.track');
  if (!svg) return;
  var figure = svg.closest('figure');
  var tip = figure.querySelector('.track-tip');
  var band = svg.querySelector('.band');
  var ticks = Array.prototype.slice.call(svg.querySelectorAll('.insertions line'));
  var genes = Array.prototype.slice.call(svg.querySelectorAll('.gene'));
  var view = svg.viewBox.baseVal;
  var axis = Number(svg.dataset.axis);
  var active = [];

  function x1(el) { return Number(el.getAttribute('x1')); }
  function geneStart(g) { return Number(g.getAttribute('x')); }
  function geneEnd(g) { return geneStart(g) + Number(g.getAttribute('width')); }

  function clear() {
    if (tip.hidden && !active.length) return;
    active.forEach(function (el) { el.classList.remove('is-active'); });
    active = [];
    band.classList.remove('is-shown', 'is-essential');
    tip.hidden = true;
  }

  function showTip(lines, viewX) {
    tip.innerHTML = '';
    lines.forEach(function (text, i) {
      var line = document.createElement('span');
      line.textContent = text;
      if (i) line.className = 'track-tip-detail';
      tip.appendChild(line);
    });
    tip.hidden = false;
    var svgBox = svg.getBoundingClientRect();
    var figBox = figure.getBoundingClientRect();
    var half = tip.offsetWidth / 2;
    var left = svgBox.left - figBox.left + (viewX / view.width) * svgBox.width;
    tip.style.left = Math.min(Math.max(left, half), figBox.width - half) + 'px';
    tip.style.top = svgBox.top - figBox.top - tip.offsetHeight - 6 + 'px';
  }

  function highlight(els) {
    els.forEach(function (el) { el.classList.add('is-active'); });
    active = active.concat(els);
  }

  function showGene(g) {
    var start = geneStart(g), end = geneEnd(g);
    highlight([g].concat(ticks.filter(function (t) { return x1(t) >= start && x1(t) <= end; })));
    band.setAttribute('x', start);
    band.setAttribute('width', end - start);
    band.classList.add('is-shown');
    if (g.classList.contains('essential')) band.classList.add('is-essential');
    showTip([g.dataset.kind, g.dataset.hit + ' of ' + g.dataset.sites + ' TA sites hit'], (start + end) / 2);
  }

  function showTick(t) {
    highlight([t]);
    var reads = Number(t.dataset.reads);
    showTip([reads + (reads === 1 ? ' read' : ' reads')], x1(t));
  }

  function onPointer(event) {
    var box = svg.getBoundingClientRect();
    var x = (event.clientX - box.left) / box.width * view.width;
    var y = (event.clientY - box.top) / box.height * view.height;
    clear();
    if (y < axis) {
      var nearest = null, best = 6;
      ticks.forEach(function (t) {
        var d = Math.abs(x1(t) - x);
        if (d < best) { best = d; nearest = t; }
      });
      if (nearest) return showTick(nearest);
    }
    var gene = genes.filter(function (g) { return x >= geneStart(g) && x <= geneEnd(g); })[0];
    if (gene) showGene(gene);
  }

  // Mouse, pen and trackpad details go away as soon as the pointer is off the
  // track; a tapped detail stays until the next tap elsewhere or a scroll.
  function hovers(event) { return event.pointerType !== 'touch'; }

  svg.addEventListener('pointermove', onPointer);
  svg.addEventListener('pointerdown', onPointer);
  svg.addEventListener('pointerleave', function (event) {
    if (hovers(event)) clear();
  });
  document.addEventListener('pointermove', function (event) {
    if (hovers(event) && !svg.contains(event.target)) clear();
  }, { passive: true });
  document.addEventListener('pointerdown', function (event) {
    if (!svg.contains(event.target)) clear();
  });
  window.addEventListener('scroll', clear, { passive: true });
  window.addEventListener('blur', clear);
  genes.forEach(function (g) {
    g.addEventListener('focus', function () { clear(); showGene(g); });
    g.addEventListener('blur', clear);
  });
})();
