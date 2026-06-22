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

    // ── FIRE ───────────────────────────────────────────────────────────────
    if (mode === 'fire') {
      // Density scales with width; kept sparse for a calm, subtle header glow.
      const COUNT = Math.max(12, Math.round(W / 45));
      const particles = [];

      function newParticle(randomY) {
        return {
          x: Math.random() * W,
          y: randomY ? Math.random() * H : H + 20,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.9 + 0.4),
          size: Math.random() * 16 + 7,
          life: randomY ? Math.random() : 1,
          decay: Math.random() * 0.004 + 0.002,
          wobble: Math.random() * Math.PI * 2,
        };
      }

      for (let i = 0; i < COUNT; i++) particles.push(newParticle(true));

      function color(life) {
        if (life > 0.7) return `rgba(255,${Math.round(180 + 75 * ((life - 0.7) / 0.3))},0,${(life * 0.35).toFixed(2)})`;
        if (life > 0.4) return `rgba(255,${Math.round(80 + 100 * ((life - 0.4) / 0.3))},0,${(life * 0.28).toFixed(2)})`;
        return `rgba(200,30,0,${(life * 0.18).toFixed(2)})`;
      }

      function draw() {
        t += 0.016;
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.wobble += 0.02;
          p.x += p.vx + Math.sin(p.wobble) * 0.25;
          p.y += p.vy;
          p.life -= p.decay;
          p.size *= 0.998;

          if (p.life > 0.02 && p.size > 1) {
            const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gr.addColorStop(0, color(p.life));
            gr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = gr;
            ctx.fill();
          }

          if (p.life <= 0 || p.y < -60) particles[i] = newParticle(false);
        }

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
