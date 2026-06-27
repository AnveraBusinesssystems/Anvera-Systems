// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  reveals.forEach((el) => el.classList.add('visible'));
} else if (reveals.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('visible'));
}

// Trigger hero reveals immediately
if (!prefersReducedMotion) {
  setTimeout(() => {
    document.querySelectorAll('.hero-home .reveal, .page-hero .reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }, 100);
}

// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  const setMenuState = (isOpen, returnFocus = false) => {
    navMenu.classList.toggle('open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');

    if (returnFocus) {
      navToggle.focus();
    }
  };

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navToggle.getAttribute('aria-expanded') !== 'true';
    setMenuState(isOpen);
  });

  document.querySelectorAll('.nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  document.addEventListener('click', (e) => {
    const clickedInsideMenu = navMenu.contains(e.target);
    const clickedToggle = navToggle.contains(e.target);

    if (!clickedInsideMenu && !clickedToggle) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenuState(false, true);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });
}