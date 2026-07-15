(function () {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobilePanel = document.getElementById('mobilePanel');
    const setOpen = (open) => {
      mobilePanel.classList.toggle('open', open);
      mobilePanel.setAttribute('aria-hidden', String(!open));
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      // Animate hamburger into an "X" (optional polish)
      const spans = hamburger.querySelectorAll('.lines span');
      if (spans.length === 3) {
        if (open) {
          spans[0].style.top = '6px';
          spans[0].style.transform = 'rotate(45deg)';
          spans[1].style.opacity = '0';
          spans[2].style.top = '6px';
          spans[2].style.transform = 'rotate(-45deg)';
        } else {
          spans[0].style.top = '1px';
          spans[0].style.transform = 'rotate(0deg)';
          spans[1].style.opacity = '1';
          spans[2].style.top = '11px';
          spans[2].style.transform = 'rotate(0deg)';
        }
      }
    };
    // Scroll behavior: shrink/opacity change
    const onScroll = () => {
      const scrolled = window.scrollY > 10;
      navbar.classList.toggle('scrolled', scrolled);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.contains('open');
      setOpen(!isOpen);
    });
    // Close menu when clicking a link
    document.querySelectorAll('[data-close-menu]').forEach((el) => {
      el.addEventListener('click', () => setOpen(false));
    });
    // Close menu on outside click (mobile)
    document.addEventListener('click', (e) => {
      const isOpen = mobilePanel.classList.contains('open');
      if (!isOpen) return;
      const clickedInside = e.target.closest('#navbar');
      if (!clickedInside) setOpen(false);
    });
    // Close menu on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) setOpen(false);
    });
  })();

  // ===== Hero animation (SVG growth + reveal) =====
  (function () {
    const onReady = (fn) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
      } else {
        fn();
      }
    };

    onReady(() => {
      // Fade-in for elements marked with `data-reveal`
      const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
      const reveal = (el) => el.classList.add('reveal-in');

      // Use IntersectionObserver when available for smoother entry
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });

        revealEls.forEach((el) => io.observe(el));
      } else {
        revealEls.forEach(reveal);
      }

      // Animated finance growth line
      const path = document.getElementById('growthPath');
      const glowPath = document.getElementById('growthPathGlow');
      const dotsRoot = document.getElementById('graphDots');

      if (!path || !dotsRoot) return;

      const totalLength = path.getTotalLength();

      // Prepare stroke-dash animation
      path.style.strokeDasharray = String(totalLength);
      path.style.strokeDashoffset = String(totalLength);

      // Also animate glow path for extra premium punch
      if (glowPath) {
        glowPath.style.strokeDasharray = String(totalLength);
        glowPath.style.strokeDashoffset = String(totalLength);
      }

      // Helper for smooth easing
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const durationMs = prefersReduced ? 1 : 1200;

      let start = null;
      const animateLine = (ts) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = durationMs === 0 ? 1 : Math.min(1, elapsed / durationMs);
        const eased = easeOutCubic(t);

        const offset = totalLength * (1 - eased);
        path.style.strokeDashoffset = String(offset);
        if (glowPath) glowPath.style.strokeDashoffset = String(offset);

        if (t < 1) requestAnimationFrame(animateLine);
        else {
          // Place floating dots along the path (after line starts completing)
          placeDots(totalLength, dotsRoot, path);
          // Make dots visible
          const circles = Array.from(dotsRoot.querySelectorAll('circle'));
          circles.forEach((c, i) => {
            setTimeout(() => c.classList.add('ready'), 220 + i * 120);
          });
        }
      };

      const placeDots = (len, root, p) => {
        // Clear any previous dots
        root.innerHTML = '';

        // Choose points along the line. Add a mix of green and gold.
        const dotStops = [
          { frac: 0.18, gold: false },
          { frac: 0.34, gold: true },
          { frac: 0.50, gold: false },
          { frac: 0.67, gold: true },
          { frac: 0.83, gold: false },
        ];

        dotStops.forEach((s, idx) => {
          const pt = p.getPointAtLength(len * s.frac);
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', String(pt.x));
          c.setAttribute('cy', String(pt.y));

          const r = 4.2 - (idx % 2) * 0.4;
          c.setAttribute('r', String(r));

          // Add base "dot-gold" class to alter fill color.
          if (s.gold) c.classList.add('dot-gold');
          // Stagger animation via nth-child selectors; still allow opacity control via JS.
          c.style.animationDelay = `${idx * 0.12}s`;

          root.appendChild(c);
        });
      };

      requestAnimationFrame(animateLine);
    });
  })();
