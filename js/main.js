/* ============================================================
   PA'DONDE — Main JavaScript
   WordPress-ready, vanilla JS
   ============================================================ */

'use strict';

/* ── Mobile Nav ─────────────────────────────────────────── */
(function () {
  const burger = document.querySelector('.pd-nav__burger');
  const mobile = document.querySelector('.pd-nav__mobile');
  if (!burger || !mobile) return;

  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobile.classList.toggle('open');
    burger.setAttribute('aria-expanded', mobile.classList.contains('open'));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pd-nav') && !e.target.closest('.pd-nav__mobile')) {
      burger.classList.remove('open');
      mobile.classList.remove('open');
    }
  });
})();

/* ── Sticky Nav scroll behavior ─────────────────────────── */
(function () {
  const nav = document.querySelector('.pd-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.style.background = 'rgba(0,0,0,0.95)';
    } else {
      nav.style.background = 'rgba(0,0,0,0.8)';
    }
  }, { passive: true });
})();

/* ── Newsletter form ─────────────────────────────────────── */
(function () {
  const forms = document.querySelectorAll('.pd-newsletter__form, .pd-newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button');
      if (!input || !btn) return;

      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        input.style.borderColor = 'rgba(255,76,132,0.6)';
        input.focus();
        return;
      }

      const orig = btn.textContent;
      btn.textContent = '✓ ¡Listo!';
      btn.disabled = true;
      input.value = '';
      input.style.borderColor = 'rgba(154,217,0,0.5)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        input.style.borderColor = '';
      }, 3000);
    });
  });
})();

/* ── Filter buttons (Explorar) ──────────────────────────── */
(function () {
  const filters = document.querySelectorAll('.pd-filter-btn');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.cat || 'all';
      const cards = document.querySelectorAll('.pd-explore-card[data-cat]');
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
          card.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, fill: 'forwards' });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ── Search (Explorar) ──────────────────────────────────── */
(function () {
  const searchInput = document.querySelector('.pd-search-bar__input');
  if (!searchInput) return;

  let timeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const q = searchInput.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.pd-explore-card[data-title]');
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const cat   = (card.dataset.cat   || '').toLowerCase();
        card.style.display = (!q || title.includes(q) || cat.includes(q)) ? '' : 'none';
      });
    }, 200);
  });
})();

/* ── Page tabs (multi-page SPA simulation for demo) ─────── */
(function () {
  const navLinks = document.querySelectorAll('[data-page]');
  const pages    = document.querySelectorAll('[data-page-content]');
  if (!navLinks.length || !pages.length) return;

  function showPage(id) {
    pages.forEach(p => {
      p.hidden = p.dataset.pageContent !== id;
      p.style.animation = p.dataset.pageContent === id ? 'pdFadeIn 0.4s ease' : '';
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.dataset.page === id);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState({ page: id }, '', '#' + id);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
      // Close mobile nav
      document.querySelector('.pd-nav__burger')?.classList.remove('open');
      document.querySelector('.pd-nav__mobile')?.classList.remove('open');
    });
  });

  // Handle back/forward
  window.addEventListener('popstate', (e) => {
    const id = e.state?.page || 'home';
    showPage(id);
  });

  // Initial page from hash
  const hash = location.hash.replace('#', '');
  if (hash) showPage(hash);
})();

/* ── Share buttons ──────────────────────────────────────── */
(function () {
  const shareBtns = document.querySelectorAll('.pd-share__btn[data-share]');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.share;
      const url = encodeURIComponent(window.location.href);
      const title = encodeURIComponent(document.title);
      const urls = {
        twitter:  `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
      };
      if (type === 'copy') {
        navigator.clipboard.writeText(window.location.href).then(() => {
          btn.textContent = '¡Copiado!';
          setTimeout(() => btn.textContent = 'Copiar link', 2000);
        });
      } else if (urls[type]) {
        window.open(urls[type], '_blank', 'width=600,height=400');
      }
    });
  });
})();

/* ── Keyframe injection ─────────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
  @keyframes pdFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pdSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
`;
document.head.appendChild(style);

/* ── Intersection-based reveal animations ───────────────── */
(function () {
  if (!window.IntersectionObserver) return;
  const els = document.querySelectorAll('.pd-card, .pd-feed-item, .pd-explore-card, .pd-how-card, .pd-highlight-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.style.animation = 'pdSlideUp 0.5s ease forwards';
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.animationDelay = (i % 4) * 80 + 'ms';
    obs.observe(el);
  });
})();
