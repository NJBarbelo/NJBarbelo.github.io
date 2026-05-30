(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Fire particles ──────────────────────────────────────────────────────────
  const FIRE_COUNT = 150;
  const fireParticles = [];

  function newFire(randomY) {
    const p = {
      x: Math.random() * W * 0.52,
      y: randomY ? Math.random() * H : H + 20,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(Math.random() * 2.5 + 1.2),
      size: Math.random() * 22 + 10,
      life: randomY ? Math.random() : 1,
      decay: Math.random() * 0.007 + 0.004,
      wobble: Math.random() * Math.PI * 2,
    };
    return p;
  }

  for (let i = 0; i < FIRE_COUNT; i++) fireParticles.push(newFire(true));

  function fireColor(life) {
    if (life > 0.75) {
      const t = (life - 0.75) / 0.25;
      return `rgba(255,${Math.round(230 + 25 * t)},${Math.round(180 * t)},${(life * 0.85).toFixed(2)})`;
    }
    if (life > 0.45) {
      const t = (life - 0.45) / 0.3;
      return `rgba(255,${Math.round(80 + 150 * t)},0,${(life * 0.75).toFixed(2)})`;
    }
    if (life > 0.15) {
      const t = (life - 0.15) / 0.3;
      return `rgba(255,${Math.round(80 * t)},0,${(life * 0.55).toFixed(2)})`;
    }
    return `rgba(160,10,0,${(life * 0.3).toFixed(2)})`;
  }

  // ── Water particles (rising droplets/bubbles) ───────────────────────────────
  const WATER_COUNT = 90;
  const waterParticles = [];

  function newWater(randomY) {
    return {
      x: W * 0.48 + Math.random() * W * 0.52,
      y: randomY ? Math.random() * H : H + 20,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 1.4 + 0.4),
      size: Math.random() * 9 + 2,
      life: randomY ? Math.random() : 1,
      decay: Math.random() * 0.005 + 0.0025,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  for (let i = 0; i < WATER_COUNT; i++) waterParticles.push(newWater(true));

  // ── Wave layers (water right side) ─────────────────────────────────────────
  const waveLayers = [
    { freq: 0.0045, speed: 22, amp: 0.055, alpha: 0.07, r: 8,  g: 70,  b: 90  },
    { freq: 0.006,  speed: 15, amp: 0.042, alpha: 0.06, r: 15, g: 110, b: 130 },
    { freq: 0.004,  speed: 10, amp: 0.06,  alpha: 0.05, r: 25, g: 160, b: 175 },
    { freq: 0.008,  speed: 30, amp: 0.03,  alpha: 0.04, r: 40, g: 200, b: 200 },
  ];

  let t = 0;

  function drawWaterWaves() {
    const startX = W * 0.46;

    waveLayers.forEach(l => {
      ctx.beginPath();
      for (let x = startX; x <= W + 4; x += 3) {
        const y = H * 0.5
          + Math.sin(x * l.freq + t * l.speed) * H * l.amp
          + Math.sin(x * l.freq * 1.6 + t * l.speed * 0.7) * H * l.amp * 0.45;
        if (x <= startX + 3) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(startX, H);
      ctx.closePath();
      ctx.fillStyle = `rgba(${l.r},${l.g},${l.b},${l.alpha})`;
      ctx.fill();
    });
  }

  function drawCenterGlow() {
    const cx = W * 0.5;
    const bw = W * 0.12;
    const pulse = 0.05 + 0.03 * Math.sin(t * 1.8);

    const g = ctx.createLinearGradient(cx - bw, 0, cx + bw, 0);
    g.addColorStop(0,   'rgba(255,140,30,0)');
    g.addColorStop(0.38,'rgba(255,190,80,' + pulse + ')');
    g.addColorStop(0.5, 'rgba(255,255,210,' + (pulse * 2.2) + ')');
    g.addColorStop(0.62,'rgba(80,220,210,' + pulse + ')');
    g.addColorStop(1,   'rgba(63,214,200,0)');

    ctx.fillStyle = g;
    ctx.fillRect(cx - bw, 0, bw * 2, H);
  }

  function animate() {
    t += 0.016;

    // Fade trail — slightly transparent so particles glow
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.fillRect(0, 0, W, H);

    // Water wave base
    drawWaterWaves();

    // Fire particles
    for (let i = 0; i < fireParticles.length; i++) {
      const p = fireParticles[i];
      p.wobble += 0.04;
      p.x += p.vx + Math.sin(p.wobble) * 0.45;
      p.y += p.vy;
      p.life -= p.decay;
      p.size *= 0.997;

      const xRatio = p.x / W;
      let alpha = p.life;
      if (xRatio > 0.42) alpha *= Math.max(0, 1 - (xRatio - 0.42) / 0.18);

      if (alpha > 0.02 && p.size > 1) {
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        const col = fireColor(p.life);
        gr.addColorStop(0, col);
        gr.addColorStop(0.5, col.replace(/[\d.]+\)$/, (alpha * 0.4).toFixed(2) + ')'));
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
      }

      if (p.life <= 0 || p.y < -60) fireParticles[i] = newFire(false);
    }

    // Water particles
    for (let i = 0; i < waterParticles.length; i++) {
      const p = waterParticles[i];
      p.wobble += 0.025;
      p.x += p.vx + Math.sin(p.wobble + i) * 0.18;
      p.y += p.vy;
      p.life -= p.decay;

      const xRatio = p.x / W;
      let alpha = p.life;
      if (xRatio < 0.58) alpha *= Math.max(0, (xRatio - 0.4) / 0.18);

      if (alpha > 0.04) {
        // Droplet glow
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.2);
        gr.addColorStop(0, `rgba(120,235,225,${(alpha * 0.6).toFixed(2)})`);
        gr.addColorStop(0.4, `rgba(63,214,200,${(alpha * 0.35).toFixed(2)})`);
        gr.addColorStop(1, 'rgba(0,80,100,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();

        // Bubble ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(160,240,235,${(alpha * 0.25).toFixed(2)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      if (p.life <= 0 || p.y < -60) waterParticles[i] = newWater(false);
    }

    // Luminous center blend
    drawCenterGlow();

    requestAnimationFrame(animate);
  }

  animate();
})();
