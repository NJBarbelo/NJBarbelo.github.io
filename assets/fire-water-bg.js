(function () {
  'use strict';

  // Animate every canvas that declares a mode. This lets us run fire in the
  // header and water in the footer at the same time, each sized to its own
  // region instead of the whole window.
  const canvases = document.querySelectorAll('canvas[data-mode]');
  canvases.forEach(start);

  function start(canvas) {
    const mode = canvas.dataset.mode; // 'fire' | 'water'
    if (!mode) return;

    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      // Size to the canvas's own box (its header/footer parent), not the window.
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = Math.max(1, Math.round(rect.width));
      H = canvas.height = Math.max(1, Math.round(rect.height));
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;

    // ── STARS (night sky) ────────────────────────────────────────────────
    if (mode === 'stars' || mode === 'fire') {
      // Calm starfield: stars hold their place and gently twinkle.
      const COUNT = Math.max(40, Math.round(W / 12));
      const stars = [];

      // Soft warm/cool tints that fit the gold + turquoise theme.
      const tints = [
        [255, 255, 245], // warm white
        [255, 255, 245],
        [255, 255, 245],
        [230, 198, 99],  // gold
        [120, 224, 214], // turquoise
      ];

      function newStar() {
        const tint = tints[Math.floor(Math.random() * tints.length)];
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.1 + 0.4,
          base: Math.random() * 0.4 + 0.25,   // base brightness
          amp: Math.random() * 0.45 + 0.25,   // twinkle depth
          speed: Math.random() * 0.9 + 0.3,   // slow twinkle
          phase: Math.random() * Math.PI * 2,
          tint: tint,
          // A few stars sparkle a little brighter with a soft halo.
          bright: Math.random() < 0.22,
        };
      }

      for (let i = 0; i < COUNT; i++) stars.push(newStar());

      // Click the header sky to add your own twinkling star.
      const header = canvas.parentElement;
      if (header) {
        header.addEventListener('click', e => {
          // Don't steal the logo's easter-egg click or link clicks.
          if (e.target.closest && e.target.closest('#header-logo, a')) return;
          const rect = canvas.getBoundingClientRect();
          const s = newStar();
          s.x = e.clientX - rect.left;
          s.y = e.clientY - rect.top;
          s.born = 0;            // little birth sparkle
          stars.push(s);
        });
      }

      // Shooting stars: rare, swift streaks with a glowing tail — make a wish!
      const shooters = [];
      let shooterNext = 4 + Math.random() * 8;
      function launchShooter() {
        const fromLeft = Math.random() < 0.6;
        const speed = (W / 60) * (3.5 + Math.random() * 2.5);
        const ang = (Math.PI / 7) + Math.random() * (Math.PI / 9); // shallow downward
        shooters.push({
          x: fromLeft ? Math.random() * W * 0.4 : W - Math.random() * W * 0.4,
          y: Math.random() * H * 0.35,
          vx: (fromLeft ? 1 : -1) * speed * Math.cos(ang),
          vy: speed * Math.sin(ang),
          life: 1,
          trail: [],
        });
      }
      function drawShooters() {
        shooterNext -= 0.016;
        if (shooterNext <= 0) {
          launchShooter();
          shooterNext = 5 + Math.random() * 10; // rare
        }
        for (let i = shooters.length - 1; i >= 0; i--) {
          const sh = shooters[i];
          sh.x += sh.vx * 0.016;
          sh.y += sh.vy * 0.016;
          sh.life -= 0.012;
          sh.trail.push({ x: sh.x, y: sh.y });
          if (sh.trail.length > 18) sh.trail.shift();

          // Tail.
          for (let k = 0; k < sh.trail.length; k++) {
            const tp = sh.trail[k];
            const a = (k / sh.trail.length) * sh.life * 0.8;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, (k / sh.trail.length) * 1.6 + 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,250,230,${a.toFixed(3)})`;
            ctx.fill();
          }
          // Head with glow.
          const gr = ctx.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 6);
          gr.addColorStop(0, `rgba(255,255,250,${sh.life.toFixed(3)})`);
          gr.addColorStop(1, 'rgba(255,255,250,0)');
          ctx.beginPath();
          ctx.arc(sh.x, sh.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();

          if (sh.life <= 0 || sh.x < -40 || sh.x > W + 40 || sh.y > H + 40) {
            shooters.splice(i, 1);
          }
        }
      }

      // A lone satellite drifts across the sky now and then.
      const sat = { active: false, next: 2 + Math.random() * 4 };
      function launchSatellite() {
        const leftToRight = Math.random() < 0.5;
        sat.active = true;
        sat.x = leftToRight ? -10 : W + 10;
        sat.y = H * (0.15 + Math.random() * 0.5);
        sat.vx = (leftToRight ? 1 : -1) * (W / 60) * (0.6 + Math.random() * 0.4); // px per second-ish
        sat.vy = (Math.random() - 0.5) * 0.25 * (W / 60);
        sat.blink = Math.random() * Math.PI * 2;
        sat.trail = [];
      }

      function drawSatellite() {
        if (!sat.active) {
          sat.next -= 0.016;
          if (sat.next <= 0) launchSatellite();
          return;
        }
        sat.x += sat.vx * 0.016;
        sat.y += sat.vy * 0.016;
        sat.blink += 0.12;

        // Fading trail.
        sat.trail.push({ x: sat.x, y: sat.y });
        if (sat.trail.length > 22) sat.trail.shift();
        for (let i = 0; i < sat.trail.length; i++) {
          const tp = sat.trail[i];
          const a = (i / sat.trail.length) * 0.18;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,230,255,${a.toFixed(3)})`;
          ctx.fill();
        }

        // Body with a soft glow + gentle blink.
        const blink = 0.7 + 0.3 * Math.sin(sat.blink);
        const glow = ctx.createRadialGradient(sat.x, sat.y, 0, sat.x, sat.y, 5);
        glow.addColorStop(0, `rgba(180,220,255,${(0.6 * blink).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(180,220,255,0)');
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sat.x, sat.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235,245,255,${blink.toFixed(3)})`;
        ctx.fill();

        if (sat.x < -20 || sat.x > W + 20 || sat.y < -20 || sat.y > H + 20) {
          sat.active = false;
          sat.next = 6 + Math.random() * 10; // pause before the next pass
        }
      }

      // ── Moon in the top-right corner, slowly cycling its phase ──────────
      function drawMoon() {
        const r = Math.max(10, H * 0.16);
        const cx = W - r * 1.8;
        const cy = r * 1.5;

        // Soft halo.
        const halo = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.4);
        halo.addColorStop(0, 'rgba(230,235,255,0.16)');
        halo.addColorStop(1, 'rgba(230,235,255,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Moon disc.
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(238,240,228,0.92)';
        ctx.fill();

        // Phase: a shadow disc drifts across very slowly (~90 s cycle).
        const phase = (t / 90) % 1;                 // 0..1
        const offset = Math.cos(phase * Math.PI * 2) * r * 2.1;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(cx + offset, cy, r * 1.02, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,10,20,0.94)';
        ctx.fill();
        ctx.restore();
      }

      // ── UFO: flies in, hovers briefly, then zips away. Rare. ────────────
      const ufo = { phase: 'idle', next: 12 + Math.random() * 18 };
      function launchUFO() {
        ufo.dir = Math.random() < 0.5 ? 1 : -1;
        ufo.x = ufo.dir === 1 ? -40 : W + 40;
        ufo.targetX = W * (0.3 + Math.random() * 0.4);
        ufo.y = H * (0.25 + Math.random() * 0.35);
        ufo.phase = 'in';
        ufo.hover = 0;
        ufo.blink = 0;
        ufo.scale = Math.max(0.6, H / 120);
      }
      function drawUFOShape(x, y, s) {
        ufo.blink += 0.18;
        // Glow underneath.
        const beam = ctx.createRadialGradient(x, y + 4 * s, 0, x, y + 4 * s, 16 * s);
        beam.addColorStop(0, 'rgba(120,224,214,0.18)');
        beam.addColorStop(1, 'rgba(120,224,214,0)');
        ctx.beginPath();
        ctx.arc(x, y + 4 * s, 16 * s, 0, Math.PI * 2);
        ctx.fillStyle = beam;
        ctx.fill();
        // Saucer body.
        ctx.beginPath();
        ctx.ellipse(x, y, 11 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(190,200,215,0.95)';
        ctx.fill();
        // Dome.
        ctx.beginPath();
        ctx.ellipse(x, y - 2.5 * s, 5 * s, 4 * s, 0, Math.PI, 0);
        ctx.fillStyle = 'rgba(150,235,225,0.85)';
        ctx.fill();
        // Blinking lights.
        for (let k = -1; k <= 1; k++) {
          const a = 0.4 + 0.6 * Math.abs(Math.sin(ufo.blink + k));
          ctx.beginPath();
          ctx.arc(x + k * 6 * s, y + 1.5 * s, 1.1 * s, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,235,150,${a.toFixed(2)})`;
          ctx.fill();
        }
      }
      function drawUFO() {
        if (ufo.phase === 'idle') {
          ufo.next -= 0.016;
          if (ufo.next <= 0) launchUFO();
          return;
        }
        const s = ufo.scale;
        if (ufo.phase === 'in') {
          ufo.x += (ufo.targetX - ufo.x) * 0.04;
          if (Math.abs(ufo.targetX - ufo.x) < 2) ufo.phase = 'hover';
        } else if (ufo.phase === 'hover') {
          ufo.hover += 0.016;
          ufo.y += Math.sin(ufo.hover * 2) * 0.15; // gentle bob
          if (ufo.hover > 1.8) ufo.phase = 'out';
        } else if (ufo.phase === 'out') {
          ufo.x += ufo.dir * (W / 60) * 11 * 0.4; // ZIP away super fast
          if (ufo.x < -60 || ufo.x > W + 60) {
            ufo.phase = 'idle';
            ufo.next = 15 + Math.random() * 25;
          }
        }
        drawUFOShape(ufo.x, ufo.y, s);
      }

      function draw() {
        t += 0.016;
        // Clean redraw each frame so the header background stays calm.
        ctx.clearRect(0, 0, W, H);

        drawMoon();

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const tw = s.base + s.amp * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
          const a = Math.max(0, Math.min(1, tw));
          const [r, g, b] = s.tint;

          // Birth sparkle for freshly clicked stars.
          if (s.born !== undefined && s.born < 1) {
            s.born += 0.04;
            const burst = (1 - s.born) * 7;
            const bg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, burst + 1);
            bg.addColorStop(0, `rgba(${r},${g},${b},${(1 - s.born).toFixed(3)})`);
            bg.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, burst + 1, 0, Math.PI * 2);
            ctx.fillStyle = bg;
            ctx.fill();
          }

          if (s.bright) {
            const glow = s.r * 6;
            const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glow);
            gr.addColorStop(0, `rgba(${r},${g},${b},${(a * 0.5).toFixed(3)})`);
            gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(s.x, s.y, glow, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
          ctx.fill();
        }

        drawShooters();
        drawSatellite();
        drawUFO();

        requestAnimationFrame(draw);
      }

      draw();
    }

    // ── WATER ──────────────────────────────────────────────────────────────
    if (mode === 'water') {
      const waveLayers = [
        { freq: 0.006,  speed: 1.6, amp: 0.11, base: 0.30, alpha: 0.075, r: 10, g: 80,  b: 100 },
        { freq: 0.009,  speed: 1.0, amp: 0.08, base: 0.20, alpha: 0.065, r: 20, g: 130, b: 150 },
        { freq: 0.003,  speed: 0.6, amp: 0.14, base: 0.24, alpha: 0.050, r: 35, g: 180, b: 190 },
      ];

      // Click the footer to release a fish + a burst of bubbles.
      const fish = [];
      const bubbles = [];

      function spawnFish(x, y) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const col = Math.random() < 0.5
          ? [120, 224, 214]   // turquoise
          : [230, 198, 99];   // gold
        fish.push({
          x: x, y: y, dir: dir,
          speed: (28 + Math.random() * 26),   // px/s
          size: 9 + Math.random() * 7,
          bob: Math.random() * Math.PI * 2,
          tail: Math.random() * Math.PI * 2,
          col: col,
        });
      }
      function spawnBubbles(x, y) {
        const n = 6 + Math.floor(Math.random() * 6);
        for (let i = 0; i < n; i++) {
          bubbles.push({
            x: x + (Math.random() - 0.5) * 18,
            y: y + (Math.random() - 0.5) * 8,
            r: 1.5 + Math.random() * 3,
            vy: 12 + Math.random() * 22,
            wob: Math.random() * Math.PI * 2,
            life: 1,
          });
        }
      }

      const footer = canvas.parentElement;
      if (footer) {
        footer.style.cursor = 'pointer';
        footer.addEventListener('click', e => {
          // Ignore clicks on links so navigation still works.
          if (e.target.closest && e.target.closest('a')) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          spawnFish(x, y);
          spawnBubbles(x, y);
        });
      }

      function drawFish() {
        for (let i = fish.length - 1; i >= 0; i--) {
          const f = fish[i];
          f.x += f.dir * f.speed * 0.016;
          f.bob += 0.05;
          f.tail += 0.3;
          const yy = f.y + Math.sin(f.bob) * 3;
          const [r, g, b] = f.col;

          ctx.save();
          ctx.translate(f.x, yy);
          ctx.scale(f.dir, 1);
          // Body.
          ctx.beginPath();
          ctx.ellipse(0, 0, f.size, f.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
          ctx.fill();
          // Tail (wiggling).
          const tw = Math.sin(f.tail) * f.size * 0.3;
          ctx.beginPath();
          ctx.moveTo(-f.size * 0.8, 0);
          ctx.lineTo(-f.size * 1.5, -f.size * 0.5 + tw);
          ctx.lineTo(-f.size * 1.5, f.size * 0.5 + tw);
          ctx.closePath();
          ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
          ctx.fill();
          // Eye.
          ctx.beginPath();
          ctx.arc(f.size * 0.45, -f.size * 0.12, f.size * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(10,20,30,0.9)';
          ctx.fill();
          ctx.restore();

          if (f.x < -40 || f.x > W + 40) fish.splice(i, 1);
        }
      }

      function drawBubbles() {
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.y -= b.vy * 0.016;
          b.wob += 0.1;
          b.x += Math.sin(b.wob) * 0.4;
          b.life -= 0.006;
          if (b.life <= 0 || b.y < -10) { bubbles.splice(i, 1); continue; }
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,235,235,${(b.life * 0.6).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      function draw() {
        t += 0.016;
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, W, H);

        // Flowing wave layers rising from the bottom of the footer.
        waveLayers.forEach(l => {
          ctx.beginPath();
          for (let x = 0; x <= W + 4; x += 4) {
            const y = H * l.base
              + Math.sin(x * l.freq + t * l.speed) * H * l.amp
              + Math.sin(x * l.freq * 1.7 + t * l.speed * 0.65) * H * l.amp * 0.5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.lineTo(W, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fillStyle = `rgba(${l.r},${l.g},${l.b},${l.alpha})`;
          ctx.fill();
        });

        drawFish();
        drawBubbles();

        requestAnimationFrame(draw);
      }

      draw();
    }
  }

  // ── EASTER EGG: click the logo for lightning + colour shift + thunder ─────
  (function easterEgg() {
    const logo = document.querySelector('#header-logo') || document.querySelector('.logo');
    if (!logo) return;

    // Inject the flash overlay + keyframes once.
    const style = document.createElement('style');
    style.textContent =
      '#lightning-flash{position:fixed;inset:0;background:rgba(255,255,255,0.45);' +
      'pointer-events:none;z-index:9999;opacity:0;}' +
      '@keyframes lightning-flash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}' +
      '#lightning-flash.active{animation:lightning-flash 1.6s ease-in-out 1;}' +
      '#egg-message{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);' +
      'z-index:10000;background:rgba(0,0,0,0.88);color:#f0ece4;border:1px solid rgba(201,168,76,0.5);' +
      'border-radius:12px;padding:1.4rem 2rem;font-family:"Cinzel",serif;font-size:1rem;' +
      'text-align:center;max-width:80vw;box-shadow:0 0 30px rgba(63,214,200,0.25);' +
      'opacity:0;transition:opacity 0.4s ease;pointer-events:none;}' +
      '#egg-message.show{opacity:1;}';
    document.head.appendChild(style);

    const flashEl = document.createElement('div');
    flashEl.id = 'lightning-flash';
    document.body.appendChild(flashEl);

    logo.style.cursor = 'pointer';

    function showMessage(text) {
      let m = document.getElementById('egg-message');
      if (!m) {
        m = document.createElement('div');
        m.id = 'egg-message';
        document.body.appendChild(m);
      }
      m.textContent = text;
      m.classList.add('show');
      setTimeout(() => m.classList.remove('show'), 3500);
    }

    let clickCount = 0;
    logo.addEventListener('click', e => {
      e.preventDefault();
      flashEl.classList.remove('active');
      void flashEl.offsetWidth; // restart animation
      flashEl.classList.add('active');
      setTimeout(() => flashEl.classList.remove('active'), 1600);

      document.body.style.transition = 'filter 0.6s ease';
      document.body.style.filter = `hue-rotate(${Math.round(Math.random() * 360)}deg)`;
      setTimeout(() => { document.body.style.filter = ''; }, 1400);

      clickCount++;
      if (clickCount === 3) {
        showMessage('🎆 Du hast das geheime Ritual aktiviert! Die Website wird noch magischer… 🌙');
        clickCount = 0;
      }
    });
  })();

  // ── SUN: arcs slowly across the top of the body (rise → zenith → set) ─────
  (function sunArc() {
    const cv = document.createElement('canvas');
    cv.id = 'sun-canvas';
    cv.style.cssText =
      'position:fixed;left:0;top:0;right:0;bottom:0;width:100%;height:100%;' +
      'z-index:1;pointer-events:none;';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    let W, H;
    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    const PERIOD = 80;          // seconds for one full pass across the sky

    // Click anywhere in the body to grow a cloud that then rains down.
    const clouds = [];
    function spawnCloud(x, y) {
      const puffs = [];
      const n = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        puffs.push({
          dx: (i - (n - 1) / 2) * 24 + (Math.random() - 0.5) * 10,
          dy: (Math.random() - 0.5) * 14,
          r: 22 + Math.random() * 16,
        });
      }
      clouds.push({ x: x, y: y, scale: 0, age: 0, phase: 'grow', puffs: puffs, drops: [] });
    }

    document.addEventListener('click', e => {
      if (e.target.closest && e.target.closest('#page-header, #page-footer, a')) return;
      spawnCloud(e.clientX, e.clientY);
    });

    function drawClouds() {
      for (let ci = clouds.length - 1; ci >= 0; ci--) {
        const c = clouds[ci];
        c.age += 0.016;
        if (c.phase === 'grow') {
          c.scale = Math.min(1, c.scale + 0.02);
          if (c.scale >= 1 && c.age > 1.5) c.phase = 'rain';
        } else if (c.phase === 'rain') {
          // Emit raindrops from the underside.
          if (Math.random() < 0.7) {
            const w = 60 * c.scale;
            c.drops.push({
              x: c.x + (Math.random() - 0.5) * w * 2,
              y: c.y + 14 * c.scale,
              vy: 90 + Math.random() * 90,
              len: 6 + Math.random() * 8,
              life: 1,
            });
          }
          if (c.age > 5) c.phase = 'fade';
        } else if (c.phase === 'fade') {
          c.scale = Math.max(0, c.scale - 0.01);
          if (c.scale <= 0 && c.drops.length === 0) { clouds.splice(ci, 1); continue; }
        }

        // Raindrops.
        for (let di = c.drops.length - 1; di >= 0; di--) {
          const d = c.drops[di];
          d.y += d.vy * 0.016;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x, d.y + d.len);
          ctx.strokeStyle = 'rgba(140,200,230,0.55)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          if (d.y > H + 20) c.drops.splice(di, 1);
        }

        // Cloud puffs.
        if (c.scale > 0.01) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.scale(c.scale, c.scale);
          c.puffs.forEach(pf => {
            const gr = ctx.createRadialGradient(pf.dx, pf.dy, 0, pf.dx, pf.dy, pf.r);
            gr.addColorStop(0, 'rgba(235,238,245,0.95)');
            gr.addColorStop(1, 'rgba(200,210,225,0.65)');
            ctx.beginPath();
            ctx.arc(pf.dx, pf.dy, pf.r, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
          });
          ctx.restore();
        }
      }
    }

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const p = (t % PERIOD) / PERIOD;        // 0..1 across the screen
      const r = Math.max(26, Math.min(W, 900) * 0.04);
      const x = -r * 2 + p * (W + r * 4);     // off-screen left → off-screen right
      const arc = Math.sin(p * Math.PI);      // 0 at edges, 1 at zenith
      const y = H * 0.30 - arc * H * 0.16;    // rises toward the top at midday

      // Warmth: reddish near the horizon (arc≈0), golden at midday (arc≈1).
      const warm = 1 - Math.min(1, arc / 0.55);   // 1 at rise/set, 0 at zenith
      const lerp = (a, b) => Math.round(a + (b - a) * warm);
      // colour stops: [zenith → horizon]
      const cCore  = `${lerp(255,255)},${lerp(250,238)},${lerp(225,205)}`;
      const cMid   = `${lerp(255,255)},${lerp(215,150)},${lerp(130,80)}`;
      const cEdge  = `${lerp(250,235)},${lerp(180,90)},${lerp(80,55)}`;
      const cGlow0 = `${lerp(255,255)},${lerp(225,160)},${lerp(150,95)}`;
      const cGlow1 = `${lerp(255,250)},${lerp(190,110)},${lerp(90,70)}`;

      // Soft outer glow — wider and brighter, gently pulsing.
      const pulse = 1 + 0.04 * Math.sin(t * 1.2);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 7 * pulse);
      glow.addColorStop(0, `rgba(${cGlow0},0.55)`);
      glow.addColorStop(0.25, `rgba(${cGlow1},0.30)`);
      glow.addColorStop(0.6, `rgba(${cGlow1},0.12)`);
      glow.addColorStop(1, `rgba(${cGlow1},0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 7 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Bright inner halo.
      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
      halo.addColorStop(0, `rgba(${cCore},0.7)`);
      halo.addColorStop(1, `rgba(${cMid},0)`);
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Sun disc.
      const disc = ctx.createRadialGradient(x, y, 0, x, y, r);
      disc.addColorStop(0, `rgba(${cCore},1)`);
      disc.addColorStop(0.7, `rgba(${cMid},0.98)`);
      disc.addColorStop(1, `rgba(${cEdge},0.95)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = disc;
      ctx.fill();

      drawClouds();

      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ── NEURAL EDGES: a subtle network along the left & right page borders ─────
  // Our whole universe quietly emerges out of this gentle web of connections.
  (function neuralEdges() {
    const cv = document.createElement('canvas');
    cv.id = 'neural-edges';
    cv.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;' +
      'z-index:0;pointer-events:none;opacity:0.55;';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    let W, H, band;
    const neurons = [];
    const MAXDIST = 120;

    function makeNeuron(side) {
      // side: -1 = left band, +1 = right band
      const x = side < 0
        ? Math.random() * band
        : W - Math.random() * band;
      return {
        side: side,
        x: x,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        type: Math.random() > 0.5 ? 'brain' : 'star',
      };
    }

    function build() {
      neurons.length = 0;
      const per = Math.max(10, Math.round(H / 55));
      for (let i = 0; i < per; i++) { neurons.push(makeNeuron(-1)); neurons.push(makeNeuron(1)); }
    }

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
      band = Math.max(70, Math.min(140, W * 0.12));
      build();
    }
    resize();
    window.addEventListener('resize', resize);

    function animate() {
      ctx.clearRect(0, 0, W, H);

      for (const n of neurons) {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
        // Keep each neuron inside its own edge band.
        const lo = n.side < 0 ? 0 : W - band;
        const hi = n.side < 0 ? band : W;
        if (n.x < lo || n.x > hi) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(lo, Math.min(hi, n.x));
        n.y = Math.max(0, Math.min(H, n.y));
      }

      // Connections (bands are far apart, so no lines cross the middle).
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i], b = neurons[j];
          if (a.side !== b.side) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAXDIST) {
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, a.type === 'brain' ? '#ff00ff' : '#00ffff');
            grad.addColorStop(1, b.type === 'brain' ? '#ff00ff' : '#00ffff');
            ctx.strokeStyle = grad;
            ctx.globalAlpha = (1 - dist / MAXDIST) * 0.28;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes.
      for (const n of neurons) {
        ctx.globalAlpha = (0.5 + 0.5 * Math.sin(n.pulse)) * 0.8;
        ctx.fillStyle = n.type === 'brain' ? '#ff00ff' : '#00ffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(animate);
    }
    animate();
  })();
})();
