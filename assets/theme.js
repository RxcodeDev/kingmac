/**
 * KINGDEN THEME — theme.js
 * Vanilla JS — No jQuery
 * Shopify OS 2.0 Compatible
 */
'use strict';

/* ─── UTILITIES ─────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatMoney(cents) {
  if (!cents) return '$0.00';
  return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ─── CART MODULE ────────────────────────────────────────────────────────── */
const Cart = (() => {
  let cartCount = 0;

  const cartDrawer  = $('#cart-drawer');
  const cartOverlay = $('#cart-overlay');
  const cartBody    = $('#cart-drawer-body');
  const cartTotal   = $('#cart-total');
  const closeBtn    = $('#cart-drawer-close');
  const toast       = $('#cart-toast');
  const countBadges = $$('.cart-btn__count');

  function openDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-visible');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Ocultar botones flotantes
    const floatContact = $('.float-contact');
    if (floatContact) floatContact.classList.add('is-hidden');
    
    renderCart();
  }

  function closeDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-visible');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Mostrar botones flotantes
    const floatContact = $('.float-contact');
    if (floatContact) floatContact.classList.remove('is-hidden');
  }

  function showToast(message, duration = 2800) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), duration);
  }

  function updateCountBadges(count) {
    cartCount = count;
    countBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  async function getCart() {
    try {
      const res = await fetch('/cart.js');
      return await res.json();
    } catch (e) {
      console.error('Cart fetch error:', e);
      return null;
    }
  }

  async function renderCart() {
    if (!cartBody) return;
    const cart = await getCart();
    if (!cart) return;

    updateCountBadges(cart.item_count);
    if (cartTotal) cartTotal.textContent = formatMoney(cart.total_price);

    if (cart.item_count === 0) {
      cartBody.innerHTML = '<p class="cart-drawer__empty">Tu carrito está vacío.</p>';
      return;
    }

    cartBody.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-line="${item.key}">
        <img
          class="cart-item__image"
          src="${item.image ? item.image : ''}"
          alt="${item.title}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
        <div class="cart-item__info">
          <p class="cart-item__title">${item.title}</p>
          <p class="cart-item__price">${formatMoney(item.final_line_price)}</p>
          <p class="cart-item__qty">Cantidad: ${item.quantity}</p>
        </div>
        <button class="cart-item__remove" data-key="${item.key}" aria-label="Remover ${item.title}">
          &times;
        </button>
      </div>
    `).join('');

    /* Remove item handlers */
    $$('.cart-item__remove', cartBody).forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.dataset.key));
    });
  }

  async function addItem(variantId, quantity = 1, productTitle = '') {
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ id: variantId, quantity })
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.description || 'No se pudo agregar al carrito.');
        return;
      }

      const cartJSON = await getCart();
      if (cartJSON) updateCountBadges(cartJSON.item_count);
      showToast(`¡${productTitle || 'Producto'} agregado al carrito!`);
      openDrawer();
    } catch (e) {
      console.error('Add to cart error:', e);
      showToast('Ocurrió un error. Intenta de nuevo.');
    }
  }

  async function removeItem(key) {
    try {
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      });
      renderCart();
    } catch (e) {
      console.error('Remove item error:', e);
    }
  }

  function init() {
    /* Cart button(s) open drawer */
    $$('.js-cart-open').forEach(btn => btn.addEventListener('click', openDrawer));
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeDrawer);

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });

    /* Initial count */
    getCart().then(cart => {
      if (cart) updateCountBadges(cart.item_count);
    });

    /* Delegate Add-to-Cart buttons */
    document.addEventListener('click', e => {
      const btn = e.target.closest('.js-add-to-cart');
      if (!btn) return;
      e.preventDefault();
      const variantId = btn.dataset.variantId;
      const productTitle = btn.dataset.productTitle;
      if (variantId) addItem(variantId, 1, productTitle);
    });
  }

  return { init, openDrawer, closeDrawer, addItem, renderCart };
})();

/* ─── HERO SLIDESHOW ─────────────────────────────────────────────────────── */
const HeroSlideshow = (() => {
  function init(el) {
    if (!el) return;
    const track    = $('.hero-slideshow__track', el);
    const originals = Array.from($$('.hero-slide', el));
    const dots      = $$('.hero-slideshow__dot', el);
    const prevBtn   = $('.hero-slideshow__btn--prev', el);
    const nextBtn   = $('.hero-slideshow__btn--next', el);
    const N         = originals.length;

    if (N <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    /*
     * Layout: [clone_last | slide0 | slide1 | ... | slideN-1 | clone_first]
     * Total = N + 2 slides, each 100vw wide.
     * DOM index of slide[i] = i + 1
     * translateX to show slide[i] = -((i+1) * 100)vw
     *
     * goRight (content exits RIGHT, new enters from LEFT):
     *   translateX increases (less negative) → move to lower DOM index
     *   When we reach translateX(0) = clone_last, jump to translateX(-N*100vw) = last original
     *
     * goLeft (content exits LEFT, new enters from RIGHT):
     *   translateX decreases (more negative) → move to higher DOM index
     *   When we reach translateX(-((N+1)*100)vw) = clone_first, jump to translateX(-100vw) = slide0
     */
    const cloneLast  = originals[N - 1].cloneNode(true);
    const cloneFirst = originals[0].cloneNode(true);
    cloneLast.setAttribute('aria-hidden', 'true');
    cloneFirst.setAttribute('aria-hidden', 'true');
    track.insertBefore(cloneLast, originals[0]);  // prepend clone of last
    track.appendChild(cloneFirst);               // append clone of first

    /* Sizing */
    track.style.width = `${(N + 2) * 100}vw`;

    let current = 0;          // index within originals (0 … N-1)
    let busy    = false;
    let autoTimer = null;
    const autoDelay = parseInt(el.dataset.autoplay || '5000', 10);
    const DURATION  = 600;

    function posVw(i) { return (i + 1) * 100; } // vw offset for original[i]

    function applyTransform(vw, animated) {
      track.style.transition = animated
        ? `transform ${DURATION}ms cubic-bezier(0.25,0.46,0.45,0.94)`
        : 'none';
      track.style.transform = `translateX(-${vw}vw)`;
    }

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    /* Move right: content moves right, new slide appears from left */
    function goRight() {
      if (busy) return;
      busy = true;
      const from = posVw(current);
      const to   = from - 100;  // one step toward clone_last
      applyTransform(to, true);
      setTimeout(() => {
        if (to === 0) {
          // Landed on clone_last → jump to real last slide
          current = N - 1;
          applyTransform(posVw(current), false);
        } else {
          current = current - 1;
        }
        updateDots();
        busy = false;
      }, DURATION);
    }

    /* Move left: content moves left, new slide appears from right */
    function goLeft() {
      if (busy) return;
      busy = true;
      const from = posVw(current);
      const to   = from + 100;  // one step toward clone_first
      applyTransform(to, true);
      setTimeout(() => {
        if (to >= (N + 1) * 100) {
          // Landed on clone_first → jump to real first slide
          current = 0;
          applyTransform(posVw(current), false);
        } else {
          current = current + 1;
        }
        updateDots();
        busy = false;
      }, DURATION);
    }

    function startAuto() {
      if (!autoDelay) return;
      autoTimer = setInterval(goRight, autoDelay);
    }
    function stopAuto() { clearInterval(autoTimer); }

    /* Init position */
    applyTransform(posVw(current), false);
    updateDots();

    /* Controls */
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goRight(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goLeft();  startAuto(); });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAuto(); current = i; applyTransform(posVw(current), true); updateDots(); startAuto(); });
    });

    /* Touch / swipe */
    let touchStartX = 0;
    el.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopAuto();
        diff > 0 ? goLeft() : goRight(); // swipe left = go left; swipe right = go right
        startAuto();
      }
    });

    startAuto();
  }

  return {
    init() {
      $$('.hero-slideshow').forEach(el => init(el));
    }
  };
})();

/* ─── MOBILE NAVIGATION ──────────────────────────────────────────────────── */
const MobileNav = (() => {
  function init() {
    const hamburger = $('#hamburger-btn');
    const mobileNav = $('#mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Close on outside click */
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  return { init };
})();

/* ─── SEARCH FORM + SUGGESTIONS DROPDOWN ────────────────────────────────── */
const SearchForm = (() => {

  function highlight(title, typed) {
    const d = document.createElement('div');
    const lTitle = title.toLowerCase();
    const lTyped = typed.toLowerCase();
    const idx    = lTitle.indexOf(lTyped);
    function esc(s) { d.textContent = s; return d.innerHTML; }
    if (idx === -1) return `<span class="search-suggest__rest">${esc(title)}</span>`;
    const before = esc(title.slice(0, idx));
    const match  = esc(title.slice(idx, idx + typed.length));
    const after  = esc(title.slice(idx + typed.length));
    return `${before}<span class="search-suggest__typed">${match}</span><span class="search-suggest__rest">${after}</span>`;
  }

  function bindSuggest(wrap, input, list) {
    if (!wrap || !input || !list) return;
    let debounceTimer = null;
    let activeIndex   = -1;
    let items         = [];

    function closeList() {
      list.hidden = true;
      list.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      items = [];
    }

    function openList(products, q) {
      const html = products.map(p =>
        `<li class="search-suggest__item" role="option">${highlight(p.title, q)}</li>`
      ).join('');
      list.innerHTML = html;
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      items = Array.from(list.querySelectorAll('.search-suggest__item'));
      activeIndex = -1;

      items.forEach((el, i) => {
        el.addEventListener('mousedown', e => {
          e.preventDefault();
          input.value = products[i].title;
          closeList();
          input.closest('form').submit();
        });
      });
    }

    async function suggest(q) {
      try {
        const res = await fetch(
          `/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=8`
        );
        if (!res.ok) { closeList(); return; }
        const data     = await res.json();
        const products = (data.resources && data.resources.results && data.resources.results.products) || [];
        if (!products.length) { closeList(); return; }
        openList(products, q);
      } catch (_) { closeList(); }
    }

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) { closeList(); return; }
      debounceTimer = setTimeout(() => suggest(q), 180);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) suggest(input.value.trim());
    });

    /* keyboard nav */
    input.addEventListener('keydown', e => {
      if (list.hidden) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
      } else if (e.key === 'Escape') {
        closeList(); return;
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
        return;
      } else { return; }
      items.forEach((el, i) => el.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false'));
      if (activeIndex >= 0) input.value = items[activeIndex].textContent;
    });

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) closeList();
    });
  }

  function init() {
    /* ── Prevent empty submit ── */
    $$('.search-form, .search-page__form').forEach(form => {
      const inp = $('input[name="q"]', form);
      if (!inp) return;
      form.addEventListener('submit', e => {
        if (!inp.value.trim()) { e.preventDefault(); inp.focus(); }
      });
    });

    /* ── Desktop suggest ── */
    bindSuggest(
      $('.js-search-wrap:not(.site-header__search-bar-inner)'),
      $('.js-search-input'),
      $('#search-suggest')
    );

    /* ── Mobile bar suggest ── */
    bindSuggest(
      $('.site-header__search-bar-inner.js-search-wrap'),
      $('.js-search-bar-input'),
      $('#search-bar-suggest')
    );
  }

  return { init };
})();

/* ─── MARQUEE (Reduce Motion) ────────────────────────────────────────────── */
const Marquee = (() => {
  function init() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      $$('.marquee-track').forEach(t => { t.style.animationPlayState = 'paused'; });
    }
  }
  return { init };
})();

/* ─── PARALLAX ──────────────────────────────────────────────────────────── */
const Parallax = (() => {
  function init() {
    const section = $('.content-highlight');
    const layer   = $('.content-highlight__pattern');
    if (!section || !layer) return;

    // Disable on reduced-motion preference only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking  = false;
    // Softer strength on mobile (smaller viewport = smaller travel distance needed)
    let strength = window.matchMedia('(max-width: 768px)').matches ? 0.15 : 0.28;

    function update() {
      const rect          = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewCenter    = window.innerHeight / 2;
      // Clamp to ±60px — matches the 12% layer oversizing in CSS
      const raw    = (viewCenter - sectionCenter) * strength;
      const offset = Math.max(-60, Math.min(60, raw));
      layer.style.transform = `translateY(${offset}px)`;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Adjust strength when crossing the 768px breakpoint on resize
    window.addEventListener('resize', () => {
      strength = window.matchMedia('(max-width: 768px)').matches ? 0.15 : 0.28;
    }, { passive: true });

    update();
  }
  return { init };
})();
/* ─── COLLECTION PAGE (filtros + sort + cols toggle) ──────────────────── */
const CollectionPage = (() => {
  function init() {
    if (!document.querySelector('.collection-layout')) return;

    /* ── Filter group collapse toggle ─────────────────────────────────── */
    $$('.js-filter-group-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.js-filter-group');
        const isCollapsed = group.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', String(!isCollapsed));
      });
    });

    /* ── Sort selects — auto-submit on change ─────────────────────────── */
    $$('.js-sort-select, .js-sort-select-toolbar').forEach(sel => {
      sel.addEventListener('change', () => sel.closest('form').submit());
    });

    /* Sync toolbar sort with sidebar sort */
    const sidebarSort  = $('.js-sort-select');
    const toolbarSort  = $('.js-sort-select-toolbar');
    if (sidebarSort && toolbarSort) {
      toolbarSort.addEventListener('change', () => {
        sidebarSort.value = toolbarSort.value;
      });
      sidebarSort.addEventListener('change', () => {
        toolbarSort.value = sidebarSort.value;
      });
    }

    /* ── Mobile sidebar toggle ─────────────────────────────────────────── */
    const filterToggle = $('.js-filter-toggle');
    const sidebar      = $('#collection-sidebar');
    if (filterToggle && sidebar) {
      filterToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('is-open');
        filterToggle.setAttribute('aria-expanded', String(isOpen));
      });
      /* Close on outside tap */
      document.addEventListener('click', e => {
        if (!sidebar.contains(e.target) && !filterToggle.contains(e.target)) {
          sidebar.classList.remove('is-open');
          filterToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ── Columns toggle ────────────────────────────────────────────────── */
    const grid = $('.js-collection-grid');
    $$('.js-col-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const cols = parseInt(btn.dataset.cols, 10);
        if (!grid || !cols) return;
        grid.style.setProperty('--col-count', cols);
        grid.dataset.cols = cols;
        $$('.js-col-toggle').forEach(b => b.classList.toggle('is-active', b === btn));
      });
    });

    /* ── Price range slider ────────────────────────────────────────────── */
    const minInput  = $('.js-price-min');
    const maxInput  = $('.js-price-max');
    const minLabel  = $('.js-price-min-label');
    const maxLabel  = $('.js-price-max-label');
    const fill      = $('#price-fill');
    const availChk  = $('.js-filter-available');
    const countEl   = $('.collection-toolbar__count');

    function applyFilters() {
      const cards = $$('.js-collection-grid .product-card');
      const onlyAvail = availChk && availChk.checked;
      const priceMin  = minInput  ? parseFloat(minInput.value)  : -Infinity;
      const priceMax  = maxInput  ? parseFloat(maxInput.value)  :  Infinity;
      let visible = 0;
      cards.forEach(card => {
        const price   = parseFloat(card.dataset.price   || 0);
        const avail   = card.dataset.available === 'true';
        const show    = (!onlyAvail || avail) && price >= priceMin && price <= priceMax;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (countEl) {
        countEl.innerHTML = '<strong>' + visible + '</strong> producto' + (visible !== 1 ? 's' : '') + ' encontrado' + (visible !== 1 ? 's' : '');
      }
    }

    function updatePriceFill() {
      if (!minInput || !maxInput || !fill) return;
      const min    = parseFloat(minInput.min);
      const max    = parseFloat(minInput.max);
      const valMin = parseFloat(minInput.value);
      const valMax = parseFloat(maxInput.value);
      const pctMin = ((valMin - min) / (max - min)) * 100;
      const pctMax = ((valMax - min) / (max - min)) * 100;
      fill.style.left  = pctMin + '%';
      fill.style.right = (100 - pctMax) + '%';
      if (minLabel) minLabel.textContent = '$' + Math.round(valMin);
      if (maxLabel) maxLabel.textContent = '$' + Math.round(valMax);
    }

    if (minInput && maxInput) {
      [minInput, maxInput].forEach(input => {
        input.addEventListener('input', () => {
          /* Prevent thumbs crossing */
          if (parseFloat(minInput.value) > parseFloat(maxInput.value)) {
            if (input === minInput) minInput.value = maxInput.value;
            else maxInput.value = minInput.value;
          }
          updatePriceFill();
          applyFilters();
        });
      });
      updatePriceFill();
    }

    if (availChk) {
      availChk.addEventListener('change', applyFilters);
    }
  }

  return { init };
})();
/* ─── STICKY HEADER OFFSET ───────────────────────────────────────────────── */
function setStickyOffset() {
  const header = $('.site-header');
  if (header) {
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }
}

/* ─── PAGE TRANSITIONS ───────────────────────────────────────────────────── */
const PageTransition = (() => {
  const overlay = document.getElementById('page-transition');

  function enter() {
    if (!overlay) return;
    overlay.classList.remove('is-leaving');
    overlay.classList.add('is-entering');
    setTimeout(() => overlay.classList.remove('is-entering'), 350);
  }

  function leave(href) {
    if (!overlay) { window.location = href; return; }
    overlay.classList.remove('is-entering');
    overlay.classList.add('is-leaving');
    setTimeout(() => { window.location = href; }, 390);
  }

  function init() {
    // Intercept nav and breadcrumb links only (same origin, not anchors)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Skip: external, hash-only, mailto, tel, target blank, download
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        link.origin !== location.origin
      ) return;
      // Skip cart / search AJAX triggers
      if (link.closest('.js-cart-open, .search-form, .filter-tag-link, .filter-chip, .pagination-btn, .js-sort-select')) return;
      e.preventDefault();
      leave(href);
    });

    // Animate in on page load
    enter();
  }

  return { init };
})();

/* ─── SEARCH TOGGLE (mobile collapsible bar) ─────────────────────────────── */
const SearchToggle = (() => {
  function init() {
    const toggleBtns = $$('.js-search-toggle');
    const bar        = $('.js-search-bar');
    const barInput   = bar && bar.querySelector('.js-search-bar-input');

    if (!bar || !toggleBtns.length) return;

    function open() {
      bar.classList.add('is-open');
      bar.setAttribute('aria-hidden', 'false');
      if (barInput) setTimeout(() => barInput.focus(), 320);
    }

    function close() {
      bar.classList.remove('is-open');
      bar.setAttribute('aria-hidden', 'true');
    }

    function toggle() {
      bar.classList.contains('is-open') ? close() : open();
    }

    toggleBtns.forEach(btn => btn.addEventListener('click', toggle));

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && bar.classList.contains('is-open')) close();
    });

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (
        bar.classList.contains('is-open') &&
        !bar.contains(e.target) &&
        !e.target.closest('.js-search-toggle')
      ) close();
    });
  }

  return { init };
})();

/* ─── ANNOUNCEMENT ROTATOR ───────────────────────────────────────────────── */
const AnnouncementRotator = (() => {
  let currentIndex = 0;
  let timer = null;
  let items = [];
  let container = null;
  const mq = window.matchMedia('(max-width: 768px)');

  function showItem(index) {
    items.forEach((item, i) => item.classList.toggle('is-active', i === index));
  }

  function advance() {
    currentIndex = (currentIndex + 1) % items.length;
    showItem(currentIndex);
  }

  function start() {
    if (!container) return;
    items = Array.from(container.querySelectorAll('.announcement-bar__item'));
    if (items.length <= 1) { return; }
    container.classList.add('is-rotator');
    currentIndex = 0;
    showItem(currentIndex);
    timer = setInterval(advance, 2800);
  }

  function stop() {
    if (!container) return;
    clearInterval(timer);
    timer = null;
    container.classList.remove('is-rotator');
    items.forEach(item => item.classList.remove('is-active'));
  }

  function init() {
    container = document.querySelector('.js-announcement-rotator');
    if (!container) return;
    mq.addEventListener('change', e => e.matches ? start() : stop());
    if (mq.matches) start();
  }

  return { init };
})();

/* ─── RANDOM PRODUCT GRID ────────────────────────────────────────────────── */
const RandomProductGrid = (() => {
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function init() {
    // Primero procesar todos los carruseles juntos
    const carousels = $$('.js-random-grid.product-carousel');
    
    if (carousels.length > 0) {
      // Recolectar todos los productos únicos de todos los carruseles
      const allProducts = new Map(); // handle -> card element de referencia
      
      carousels.forEach(carousel => {
        const cards = carousel.querySelectorAll('.product-card');
        cards.forEach(card => {
          const handle = card.dataset.handle || Math.random().toString();
          if (!allProducts.has(handle)) {
            allProducts.set(handle, card);
          }
        });
      });
      
      // Mezclar los handles y dividir entre carruseles
      const handles = shuffle([...allProducts.keys()]);
      const productsPerCarousel = Math.ceil(handles.length / carousels.length);
      
      carousels.forEach((carousel, index) => {
        const startIdx = index * productsPerCarousel;
        const endIdx = startIdx + productsPerCarousel;
        const assignedHandles = new Set(handles.slice(startIdx, endIdx));
        
        const cards = carousel.querySelectorAll('.product-card');
        cards.forEach(card => {
          const handle = card.dataset.handle || '';
          if (assignedHandles.has(handle)) {
            card.classList.add('product-card--visible');
          }
        });
      });
    }
    
    // Procesar grids normales (no carruseles) con la lógica original
    const usedHandles = new Set();
    $$('.js-random-grid').forEach(grid => {
      if (grid.classList.contains('product-carousel')) return; // Ya procesado arriba
      
      const count = parseInt(grid.dataset.randomCount, 10) || 5;
      const cards = [...grid.querySelectorAll('.product-card')];
      if (!cards.length) return;

      shuffle(cards);

      let shown = 0;
      for (const card of cards) {
        const handle = card.dataset.handle || '';
        if (usedHandles.has(handle)) continue;
        card.classList.add('product-card--visible');
        if (handle) usedHandles.add(handle);
        shown++;
        if (shown >= count) break;
      }
    });
  }

  return { init };
})();

/* ─── MOBILE NAV HORIZONTAL AUTO-SCROLL ─────────────────────────────────── */
const MobileNavAutoScroll = (() => {
  function init() {
    const navScroll = $('.mobile-nav-horizontal__scroll');
    if (!navScroll) return;

    // Don't auto-scroll if we're already on a collection/category page
    const isCollectionPage = document.body.classList.contains('template-collection') || 
                             window.location.pathname.includes('/collections/');
    
    let autoScrollInterval = null;
    let shouldScroll = !isCollectionPage; // Don't scroll if already in a section

    function startAutoScroll() {
      if (!shouldScroll || autoScrollInterval) return;
      
      autoScrollInterval = setInterval(() => {
        if (!shouldScroll) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
          return;
        }

        // Move left to right
        navScroll.scrollLeft += 1.5;
        
        // If reached end, restart from beginning
        const maxScroll = navScroll.scrollWidth - navScroll.clientWidth;
        if (navScroll.scrollLeft >= maxScroll - 5) {
          navScroll.scrollLeft = 0;
        }
      }, 30);
    }

    function stopAutoScroll() {
      shouldScroll = false;
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    // Handle link clicks
    const navLinks = $$('.mobile-nav-horizontal__link');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Don't prevent default - allow navigation to work
        
        // STOP scrolling permanently when a category is selected
        stopAutoScroll();
        
        // Remove active class from all items
        $$('.mobile-nav-horizontal__item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Add active to clicked item
        const parentItem = this.closest('.mobile-nav-horizontal__item');
        if (parentItem) {
          parentItem.classList.add('active');
        }
        
        // Center the selected item
        this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });

    // Only start auto-scroll on home page, not on collection pages
    if (!isCollectionPage) {
      setTimeout(() => {
        if (shouldScroll) {
          startAutoScroll();
        }
      }, 1000);
    }

    // Stop on any user interaction
    navScroll.addEventListener('touchstart', stopAutoScroll, { passive: true });
    navScroll.addEventListener('mousedown', stopAutoScroll);
  }

  return { init };
})();

/* ─── PRODUCT CAROUSEL ───────────────────────────────────────────────────── */
const ProductCarousel = (() => {
  function init() {
    const wrappers = $$('.product-carousel-wrapper');
    
    wrappers.forEach(wrapper => {
      const carousel = $('.product-carousel', wrapper);
      const prevBtn = $('.carousel-nav--prev', wrapper);
      const nextBtn = $('.carousel-nav--next', wrapper);
      
      if (!carousel || !prevBtn || !nextBtn) return;
      
      // Esperar a que los productos estén visibles
      setTimeout(() => {
        setupCarousel(carousel, prevBtn, nextBtn);
      }, 100);
    });
  }
  
  function setupCarousel(carousel, prevBtn, nextBtn) {
    const cards = carousel.querySelectorAll('.product-card--visible');
    if (cards.length === 0) return;
    
    let currentIndex = 0;
    const totalCards = cards.length;
    
    function updateScroll() {
      const cardWidth = cards[0]?.offsetWidth || 200;
      const gap = 28;
      const scrollAmount = cardWidth + gap;
      const targetScroll = currentIndex * scrollAmount;
      
      carousel.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
    
    function scrollNext() {
      currentIndex++;
      if (currentIndex >= totalCards) {
        currentIndex = 0; // Loop infinito
      }
      updateScroll();
    }
    
    function scrollPrev() {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = totalCards - 1; // Loop infinito
      }
      updateScroll();
    }
    
    prevBtn.addEventListener('click', scrollPrev);
    nextBtn.addEventListener('click', scrollNext);
    
    // Soporte para arrastre con mouse
    let isDown = false;
    let startX;
    let scrollLeft;
    
    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      carousel.style.cursor = 'grabbing';
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
    });
    
    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });
  }

  return { init };
})();

/* ─── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  HeroSlideshow.init();
  MobileNav.init();
  MobileNavAutoScroll.init();
  SearchForm.init();
  SearchToggle.init();
  AnnouncementRotator.init();
  Marquee.init();
  Parallax.init();
  CollectionPage.init();
  RandomProductGrid.init();
  ProductCarousel.init();
  setStickyOffset();
  window.addEventListener('resize', setStickyOffset);
});
