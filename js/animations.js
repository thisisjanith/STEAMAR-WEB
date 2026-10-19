/**
 * Smooth Animations & Micro-interactions Engine
 * Narrative-Based AR for Early STEAM Education
 */

(function () {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Scroll Progress Bar
     ========================================================================== */
  function initProgressBar() {
    let bar = document.getElementById('scroll-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scroll-progress-bar';
      document.body.appendChild(bar);
    }

    let ticking = false;
    function updateProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }

  /* ==========================================================================
     2. Header Scroll Effect & ScrollSpy
     ========================================================================== */
  function initHeaderAndScrollSpy() {
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    let ticking = false;

    function onScroll() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // Header background blur & shadow on scroll
      if (header) {
        if (scrollY > 20) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
      }

      // ScrollSpy for sections
      if (sections.length > 0 && navLinks.length > 0) {
        let currentSectionId = '';
        const scrollPosition = scrollY + 160;

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section.offsetTop <= scrollPosition) {
            currentSectionId = section.getAttribute('id');
            break;
          }
        }

        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href === `#${currentSectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    onScroll();
  }

  /* ==========================================================================
     3. Scroll-Triggered Reveal Animations (IntersectionObserver)
     ========================================================================== */
  function initScrollReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.anim-reveal, .anim-reveal-left, .anim-reveal-right, .anim-reveal-scale')
        .forEach(el => el.classList.add('is-revealed'));
      return;
    }

    // Automatically tag key elements for smooth reveal
    const targetSelectors = [
      'section > div > .text-center',
      '#components .grid > *',
      '#milestones details',
      '#documents .grid > *',
      '#presentations .grid > *',
      '#about .grid > *',
      '#contact form',
      '#domain .tab-list',
      'section dl > div'
    ];

    targetSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.classList.contains('anim-reveal') && !el.classList.contains('animate-fade-up')) {
          el.classList.add('anim-reveal');
        }
      });
    });

    // Apply stagger delays to siblings in grids
    const gridContainers = document.querySelectorAll('.grid, section dl, .tab-list, #milestones > div.space-y-4');
    gridContainers.forEach(container => {
      const items = Array.from(container.children).filter(child => child.classList.contains('anim-reveal'));
      items.forEach((item, index) => {
        const delay = Math.min((index % 6) * 75 + 50, 450);
        item.style.transitionDelay = `${delay}ms`;
      });
    });

    // Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.anim-reveal, .anim-reveal-left, .anim-reveal-right, .anim-reveal-scale');
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-revealed');
      } else {
        revealObserver.observe(el);
      }
    });
  }

  /* ==========================================================================
     4. Interactive Card Elevation & Subtle 3D Tilt
     ========================================================================== */
  function initInteractiveCards() {
    const cardSelectors = [
      '#components .rounded-2xl',
      '#about .rounded-2xl',
      '#documents .rounded-2xl',
      '#presentations .rounded-2xl',
      '.interactive-card'
    ];

    const cards = document.querySelectorAll(cardSelectors.join(', '));
    cards.forEach(card => {
      card.classList.add('interactive-card');

      // Subtle mouse tilt effect on desktop devices with hover support
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -2.5;
          const rotateY = ((x - centerX) / centerX) * 2.5;

          card.style.transform = `perspective(1000px) translateY(-5px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      }
    });
  }

  /* ==========================================================================
     5. Back to Top Floating Button
     ========================================================================== */
  function initBackToTop() {
    let btn = document.getElementById('back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      `;
      document.body.appendChild(btn);
    }

    let isVisible = false;
    window.addEventListener('scroll', function () {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 350 && !isVisible) {
        btn.classList.add('is-visible');
        isVisible = true;
      } else if (scrollY <= 350 && isVisible) {
        btn.classList.remove('is-visible');
        isVisible = false;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ==========================================================================
     6. Mobile Menu Auto-close on Navigation
     ========================================================================== */
  function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    if (navToggle && mobileLinks.length > 0) {
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          navToggle.checked = false;
        });
      });
    }
  }

  /* ==========================================================================
     7. Smooth Anchor Scrolling Offset Adjustment
     ========================================================================== */
  function initSmoothAnchorOffset() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          // Update URL hash without jumping
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }
        }
      });
    });
  }

  /* ==========================================================================
     8. Light / Dark Theme Toggle
     ========================================================================== */
  function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn, .theme-toggle, .theme-toggle-mobile');
    
    function updateState(isDark) {
      toggleBtns.forEach(btn => {
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        const textSpan = btn.querySelector('.theme-text');
        if (textSpan) {
          textSpan.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
      });
    }

    // Default to light mode unless explicitly saved as 'dark'
    let isDark = false;
    try {
      const savedTheme = localStorage.getItem('theme');
      isDark = savedTheme === 'dark';
    } catch (e) {}

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateState(isDark);

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        document.documentElement.classList.add('theme-transitioning');
        const nextIsDark = document.documentElement.classList.toggle('dark');
        try {
          localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
        } catch (err) {}
        updateState(nextIsDark);

        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, 350);
      });
    });
  }

  /* ==========================================================================
     Initialize All on DOMContentLoaded
     ========================================================================== */
  function init() {
    initProgressBar();
    initHeaderAndScrollSpy();
    initScrollReveals();
    initInteractiveCards();
    initBackToTop();
    initMobileMenu();
    initSmoothAnchorOffset();
    initThemeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
