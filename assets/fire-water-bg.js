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

      function draw() {
        t += 0.016;
        // Clean redraw each frame so the header background stays calm.
        ctx.clearRect(0, 0, W, H);

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

        requestAnimationFrame(draw);
      }

      draw();
    }
  }
})();
