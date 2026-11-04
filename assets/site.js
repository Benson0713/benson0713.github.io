/* Page behaviour: theme, navigation, filters, lightbox. No dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'sp-theme';

  /* ---------------- theme ---------------- */
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !!(mq && mq.matches);
  }
  function paint() {
    var d = isDark();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.innerHTML = (d ? SUN : MOON) + '<span>' + (d ? 'Light' : 'Dark') + '</span>';
      b.setAttribute('aria-label', d ? 'Switch to light theme' : 'Switch to dark theme');
    });
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(function (m) { m.setAttribute('content', d ? '#0f1217' : '#eceef1'); });
  }
  function announce() { document.dispatchEvent(new CustomEvent('themechange')); }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint(); announce();
    });
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (!root.getAttribute('data-theme')) { paint(); announce(); } });
  paint();

  /* ---------------- CV links ---------------- */
  var cv = (window.SITE && window.SITE.cv) || '';
  document.querySelectorAll('[data-cv]').forEach(function (a) {
    if (cv) { a.href = cv; a.target = '_blank'; a.rel = 'noopener'; }
    else {
      a.href = 'mailto:shaswatpathak.qm.researcher@gmail.com?subject=CV%20request';
      a.lastChild.textContent = 'CV on request';
    }
  });

  /* ---------------- in-page links (also inside an embedding iframe) ---------------- */
  var sheet = document.querySelector('[data-sheet]');
  var menuBtn = document.querySelector('[data-menu]');
  function closeMenu() { if (sheet) { sheet.classList.remove('open'); menuBtn && menuBtn.setAttribute('aria-expanded', 'false'); } }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = !sheet.classList.contains('open');
    sheet.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id === 'top' ? document.body : document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (a.hasAttribute('data-show')) setFilter(a.getAttribute('data-show'));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - (window.innerWidth <= 1020 ? 70 : 20);
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    try { history.replaceState(null, '', '#' + id); } catch (err) {}
  });

  /* ---------------- scroll-spy ---------------- */
  var links = [].slice.call(document.querySelectorAll('[data-nav] a'));
  var ids = []; links.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (ids.indexOf(id) < 0) ids.push(id); });
  var targets = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var topBtn = document.querySelector('[data-top]');
  function spy() {
    var line = window.innerHeight * 0.28, main = null, sub = null;
    targets.forEach(function (t) {
      var r = t.getBoundingClientRect();
      if (r.top <= line) { if (t.tagName === 'ARTICLE') { sub = r.bottom > line ? t.id : sub; } else { main = t.id; if (t.id !== 'research') sub = null; } }
    });
    if (main !== 'research') sub = null;
    links.forEach(function (a) { var id = a.getAttribute('href').slice(1); a.classList.toggle('on', id === main || id === sub); });
    if (topBtn) topBtn.classList.toggle('show', window.scrollY > 700);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------------- publication filters ---------------- */
  var pubs = [].slice.call(document.querySelectorAll('.pub'));
  var chips = [].slice.call(document.querySelectorAll('[data-f]'));
  function setFilter(f) {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-f') === f)); });
    pubs.forEach(function (p) { p.hidden = !(f === 'all' || p.getAttribute('data-c') === f); });
  }
  chips.forEach(function (c) { c.addEventListener('click', function () { setFilter(c.getAttribute('data-f')); }); });
  document.querySelectorAll('[data-n]').forEach(function (n) {
    var f = n.getAttribute('data-n');
    n.textContent = pubs.filter(function (p) { return f === 'all' || p.getAttribute('data-c') === f; }).length;
  });

  /* ---------------- BibTeX ---------------- */
  var BIB = {
    linda2024stacking: '@article{linda2024stacking,\n  title   = {Accelerating the prediction of stacking fault energy by combining ab initio calculations and machine learning},\n  author  = {Linda, Albert and Akhtar, Md. Faiz and Pathak, Shaswat and Bhowmick, Somnath},\n  journal = {Physical Review B},\n  volume  = {109},\n  pages   = {214102},\n  year    = {2024},\n  doi     = {10.1103/PhysRevB.109.214102}\n}',
    pathak2026salt: '@article{pathak2026salt,\n  title   = {Enhancing energy efficiency and sustainability with a modified double-slope solar still: optimization of channel placement and influence of salt concentration},\n  author  = {Pathak, Shaswat and Jeyaraj, Thavamani and Kumar, Pankaj},\n  journal = {Journal of Thermal Analysis and Calorimetry},\n  year    = {2026},\n  doi     = {10.1007/s10973-025-15107-6}\n}',
    pathak2025mlcfd: '@article{pathak2025mlcfd,\n  title   = {ML-augmented CFD-framework for heat-sink and fan-speed optimization in gaming workstation},\n  author  = {Pathak, Shaswat and Luitel, Aayush and Pasha, Amjad Ali and Reddy, D. Siva Krishna and Algarni, Salem and Alqahtani, Talal and Irshad, Kashif},\n  journal = {International Journal of Mechanical Sciences},\n  pages   = {110752},\n  year    = {2025},\n  doi     = {10.1016/j.ijmecsci.2025.110752}\n}',
    pathak2025cfd: '@article{pathak2025cfd,\n  title   = {A CFD and experimental analysis of a double-slope solar still with channel integration},\n  author  = {Pathak, Shaswat and Jeyaraj, Thavamani and Kumar, Pankaj},\n  journal = {Applied Thermal Engineering},\n  volume  = {258},\n  pages   = {124538},\n  year    = {2025},\n  doi     = {10.1016/j.applthermaleng.2024.124538}\n}',
    jeyaraj2025channel: '@article{jeyaraj2025channel,\n  title   = {Enhancing double-slope solar still performance through integrated channel shape variations: An experimental and numerical simulation investigation},\n  author  = {Jeyaraj, Thavamani and Kumar, Pankaj and Pathak, Shaswat},\n  journal = {Renewable and Sustainable Energy Reviews},\n  volume  = {209},\n  pages   = {115106},\n  year    = {2025},\n  doi     = {10.1016/j.rser.2024.115106}\n}',
    jeyaraj2024trapezoidal: '@article{jeyaraj2024trapezoidal,\n  title   = {Experimental and computational modeling analysis of double slope solar still with a trapezoidal channel for preheating},\n  author  = {Jeyaraj, Thavamani and Kumar, Pankaj and Pathak, Shaswat},\n  journal = {Applied Thermal Engineering},\n  pages   = {123757},\n  year    = {2024},\n  doi     = {10.1016/j.applthermaleng.2024.123757}\n}'
  };
  document.querySelectorAll('[data-bib]').forEach(function (b) {
    b.addEventListener('click', function () {
      var host = b.closest('.lk'), box = host.nextElementSibling;
      if (box && box.classList.contains('bibbox')) { box.remove(); b.setAttribute('aria-expanded', 'false'); return; }
      box = document.createElement('div'); box.className = 'bibbox';
      var pre = document.createElement('pre'); pre.textContent = BIB[b.getAttribute('data-bib')] || '';
      var cp = document.createElement('button'); cp.type = 'button'; cp.className = 'mini'; cp.textContent = 'Copy';
      cp.addEventListener('click', function () {
        var done = function () { cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = 'Copy'; }, 1600); };
        try { navigator.clipboard.writeText(pre.textContent).then(done, function () { selectPre(); }); } catch (e) { selectPre(); }
      });
      function selectPre() { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); cp.textContent = 'Press Ctrl+C'; }
      box.appendChild(pre); box.appendChild(cp); host.parentNode.insertBefore(box, host.nextSibling); b.setAttribute('aria-expanded', 'true');
    });
  });

  /* ---------------- lightbox ---------------- */
  var lb = document.querySelector('[data-lbox]');
  if (lb) {
    var img = lb.querySelector('img'), cap = lb.querySelector('figcaption'), last = null;
    document.querySelectorAll('[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () {
        last = b; img.src = b.getAttribute('data-lb'); img.alt = b.querySelector('img') ? b.querySelector('img').alt : '';
        cap.textContent = b.getAttribute('data-cap') || ''; lb.classList.add('open'); lb.querySelector('[data-lbclose]').focus();
      });
    });
    function close() { lb.classList.remove('open'); img.removeAttribute('src'); if (last) last.focus(); }
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.hasAttribute('data-lbclose')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  }

  /* ---------------- reveal on scroll ---------------- */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });
})();
