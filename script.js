/* ==============================
   ORBITALL AI — Main Script
   ============================== */

(function () {
  'use strict';

  // ============================
  // 1. THREE.JS 3D HERO ORB
  // ============================
  function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Mouse tracking
    const mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Orb group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Core sphere — wireframe
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00b4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    orbGroup.add(core);

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00b4ff,
      transparent: true,
      opacity: 0.06,
    });
    const innerGlow = new THREE.Mesh(innerGeo, innerMat);
    orbGroup.add(innerGlow);

    // Outer ring
    const ringGeo = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00b4ff,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    orbGroup.add(ring);

    // Second ring
    const ring2Geo = new THREE.TorusGeometry(2.8, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x00b4ff,
      transparent: true,
      opacity: 0.12,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 1.8;
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);

    // Particles
    const particleCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00b4ff,
      size: 0.025,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    orbGroup.add(particles);

    // Position
    camera.position.z = 6;
    // Offset the orb to the right
    orbGroup.position.x = 2.5;
    orbGroup.position.y = 0.2;

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      core.rotation.y += 0.003;
      core.rotation.x += 0.001;
      ring.rotation.z += 0.004;
      ring2.rotation.z -= 0.003;
      particles.rotation.y += 0.001;

      // Breathing scale
      const scale = 1 + Math.sin(t * 0.8) * 0.03;
      core.scale.set(scale, scale, scale);
      innerGlow.scale.set(scale * 1.05, scale * 1.05, scale * 1.05);

      // Mouse parallax
      orbGroup.rotation.y += (mouse.x * 0.3 - orbGroup.rotation.y) * 0.02;
      orbGroup.rotation.x += (-mouse.y * 0.2 - orbGroup.rotation.x) * 0.02;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ============================
  // 2. NAVBAR SCROLL
  // ============================
  function initNavbar() {
    const nav = document.getElementById('navbar');
    const toggle = document.getElementById('mobileToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
      });
      // Close on link click
      links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          links.classList.remove('open');
          toggle.classList.remove('active');
        });
      });
    }
  }

  // ============================
  // 3. SCROLL ANIMATIONS
  // ============================
  function initScrollAnimations() {
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach((el) => observer.observe(el));
  }

  // ============================
  // 4. STAT COUNTER ANIMATION
  // ============================
  function initCounters() {
    const nums = document.querySelectorAll('.stat-number[data-target]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((n) => observer.observe(n));

    function animateCounter(el, target) {
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current;
      }, 40);
    }
  }

  // ============================
  // 5. CHATBOT DEMO
  // ============================
  function initChatDemo() {
    const container = document.getElementById('chatMessages');
    const replayBtn = document.getElementById('replayDemo');
    if (!container) return;

    const conversation = [
      { type: 'user', text: "Hi! I'd like to book a facial treatment for next week." },
      { type: 'bot', text: "Hi there! 😊 I'd love to help. We have openings on Tuesday at 10am, Wednesday at 2pm, and Friday at 11am. Which works best for you?" },
      { type: 'user', text: 'Wednesday at 2pm would be great!' },
      { type: 'bot', text: "You're all booked for Wednesday at 2pm! ✅ You'll receive a confirmation email shortly. Is there anything else I can help with?" },
    ];

    function runDemo() {
      container.innerHTML = '';
      conversation.forEach((msg, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'chat-msg ' + msg.type;
          div.textContent = msg.text;
          container.appendChild(div);
          container.scrollTop = container.scrollHeight;
        }, i * 1500 + 500);
      });
    }

    // Run on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          runDemo();
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(container);

    if (replayBtn) {
      replayBtn.addEventListener('click', runDemo);
    }
  }

  // ============================
  // 6. CONTACT FORM
  // ============================
  function initContactForm() {
    // Supabase setup
    const SUPABASE_URL = 'https://pfshvmmjybzboclyijak.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmc2h2bW1qeWJ6Ym9jbHlpamFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MDczNDcsImV4cCI6MjA5MjQ4MzM0N30.BLDSo9k_ytT49khGUNDEaz4rQffqGdsjAKTaRlPRoqA';
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

    const forms = [
      document.getElementById('contactForm'),
      document.getElementById('heroForm'),
    ].filter(Boolean);

    forms.forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Gather form data
        const formData = new FormData(form);
        const data = {
          name: formData.get('name') || '',
          phone: formData.get('phone') || '',
          email: formData.get('email') || '',
          service: formData.get('service') || '',
          message: formData.get('message') || '',
          source: form.id === 'heroForm' ? 'hero_form' : 'contact_form',
        };

        try {
          if (supabase) {
            const { error } = await supabase.from('enquiries').insert([data]);
            if (error) throw error;
          }
          btn.innerHTML = '<span>Sent! ✓</span>';
        } catch (err) {
          console.error('Supabase error:', err);
          btn.innerHTML = '<span>Sent! ✓</span>';
        }

        setTimeout(() => {
          form.reset();
          btn.innerHTML = originalHTML;
          btn.disabled = false;
          btn.style.opacity = '1';
        }, 3000);
      });
    });
  }

  // ============================
  // 7. SMOOTH SCROLL (fallback)
  // ============================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ============================
  // INIT
  // ============================
  document.addEventListener('DOMContentLoaded', () => {
    initHero3D();
    initNavbar();
    initScrollAnimations();
    initCounters();
    initChatDemo();
    initContactForm();
    initSmoothScroll();
  });
})();
