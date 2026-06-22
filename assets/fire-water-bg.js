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

  // ── PLANT: a vine grows up the left edge, out of the footer water ─────────
  (function growPlant() {
    const cv = document.createElement('canvas');
    cv.id = 'plant-canvas';
    cv.style.cssText =
      'position:fixed;left:0;top:0;bottom:0;width:150px;height:100%;' +
      'z-index:1;pointer-events:none;';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    let W, H;
    function resize() {
      W = cv.width = 150;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Leaves sprout at fractions along the stem, alternating sides.
    const leaves = [];
    for (let i = 0; i < 9; i++) {
      leaves.push({
        at: 0.12 + i * 0.092 + (Math.random() - 0.5) * 0.03, // 0=base .. 1=tip
        side: i % 2 === 0 ? 1 : -1,
        size: 14 + Math.random() * 10,
      });
    }

    let t = 0;
    let grow = 0;                       // 0..1 growth progress
    const TARGET = 0.72;                // fraction of viewport height
    const baseX = 26;                   // distance from left edge

    function stemX(y, topY) {
      // Gentle sway, stronger toward the tip.
      const along = (H - y) / Math.max(1, H - topY); // 0 base .. 1 tip
      const sway = Math.sin(t * 0.6 + along * 2.2) * (6 + along * 14);
      return baseX + sway * along;
    }

    function draw() {
      t += 0.016;
      if (grow < 1) grow += 0.0035;     // slow, calm growth
      ctx.clearRect(0, 0, W, H);

      const fullH = H * TARGET;
      const topY = H - fullH * grow;    // current tip height

      // Stem.
      ctx.beginPath();
      for (let y = H; y >= topY; y -= 4) {
        const x = stemX(y, topY);
        if (y === H) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(90,165,95,0.85)';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Leaves that have been reached by the growth.
      leaves.forEach(lf => {
        const grownTo = (H - topY) / fullH;       // 0..1 currently visible
        if (lf.at > grownTo) return;
        const ly = H - fullH * lf.at;
        const lx = stemX(ly, topY);
        const open = Math.min(1, (grownTo - lf.at) * 6); // unfurl
        const sway = Math.sin(t * 0.6 + lf.at * 5) * 0.18;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(lf.side * (0.7 + sway));
        ctx.scale(open * lf.side, open);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(lf.size * 0.6, -lf.size * 0.5, lf.size, 0);
        ctx.quadraticCurveTo(lf.size * 0.6, lf.size * 0.5, 0, 0);
        ctx.fillStyle = 'rgba(80,170,100,0.8)';
        ctx.fill();
        // Leaf vein.
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(lf.size * 0.9, 0);
        ctx.strokeStyle = 'rgba(60,130,75,0.6)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      });

      // A little flower blooms at the tip once fully grown.
      if (grow > 0.96) {
        const fx = stemX(topY, topY);
        const bloom = Math.min(1, (grow - 0.96) / 0.04);
        const petals = 6;
        for (let p = 0; p < petals; p++) {
          const ang = (p / petals) * Math.PI * 2 + t * 0.3;
          const pr = 7 * bloom;
          const px = fx + Math.cos(ang) * pr;
          const py = topY + Math.sin(ang) * pr;
          ctx.beginPath();
          ctx.arc(px, py, 4 * bloom, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(230,198,99,0.85)';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(fx, topY, 3.5 * bloom, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(120,224,214,0.95)';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    draw();
  })();
})();
