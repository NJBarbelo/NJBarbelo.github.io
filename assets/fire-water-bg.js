(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const mode = canvas.dataset.mode; // 'fire' | 'water'
  if (!mode) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;

  // ── FIRE ─────────────────────────────────────────────────────────────────
  if (mode === 'fire') {
    const COUNT = 60;
    const particles = [];

    function newParticle(randomY) {
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : H + 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(Math.random() * 1.8 + 0.8),
        size: Math.random() * 16 + 7,
        life: randomY ? Math.random() : 1,
        decay: Math.random() * 0.006 + 0.003,
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
        p.wobble += 0.035;
        p.x += p.vx + Math.sin(p.wobble) * 0.35;
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

  // ── WATER ────────────────────────────────────────────────────────────────
  if (mode === 'water') {
    const COUNT = 45;
    const particles = [];

    const waveLayers = [
      { freq: 0.005,  speed: 1.8, amp: 0.04,  alpha: 0.055, r: 10, g: 80,  b: 100 },
      { freq: 0.007,  speed: 1.2, amp: 0.03,  alpha: 0.045, r: 20, g: 130, b: 150 },
      { freq: 0.0035, speed: 0.8, amp: 0.05,  alpha: 0.035, r: 35, g: 180, b: 190 },
    ];

    function newParticle(randomY) {
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : -20,
        vx: (Math.random() - 0.5) * 0.3,
        vy: Math.random() * 0.5 + 0.15,
        size: Math.random() * 6 + 2,
        life: randomY ? Math.random() : 1,
        decay: Math.random() * 0.004 + 0.002,
        wobble: Math.random() * Math.PI * 2,
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(newParticle(true));

    function draw() {
      t += 0.016;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, W, H);

      // Wave layers from bottom
      waveLayers.forEach(l => {
        ctx.beginPath();
        for (let x = 0; x <= W + 4; x += 4) {
          const y = H * 0.65
            + Math.sin(x * l.freq + t * l.speed) * H * l.amp
            + Math.sin(x * l.freq * 1.7 + t * l.speed * 0.65) * H * l.amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.fillStyle = `rgba(${l.r},${l.g},${l.b},${l.alpha})`;
        ctx.fill();
      });

      // Rising droplets
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.wobble += 0.02;
        p.x += p.vx + Math.sin(p.wobble + i) * 0.15;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life > 0.04) {
          const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gr.addColorStop(0, `rgba(100,220,215,${(p.life * 0.4).toFixed(2)})`);
          gr.addColorStop(1, 'rgba(0,60,80,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
        }

        if (p.life <= 0 || p.y > H + 60) particles[i] = newParticle(false);
      }

      requestAnimationFrame(draw);
    }

    draw();
  }
})();
