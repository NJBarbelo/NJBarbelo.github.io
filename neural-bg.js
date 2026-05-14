class Neuron {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = Math.random() * 1.5 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update(width, height) {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.02;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));
  }

  draw(ctx) {
    const opacity = 0.5 + 0.5 * Math.sin(this.pulse);
    ctx.fillStyle = this.type === 'brain' ? '#ff00ff' : '#00ffff';
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class NeuralNetwork {
  constructor() {
    this.canvas = document.getElementById('neural-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.neurons = [];
    this.init();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  init() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    for (let i = 0; i < 40; i++) {
      this.neurons.push(new Neuron(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 'brain'));
      this.neurons.push(new Neuron(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 'star'));
    }
  }

  drawConnections() {
    const maxDist = 150;
    for (let i = 0; i < this.neurons.length; i++) {
      for (let j = i + 1; j < this.neurons.length; j++) {
        const dx = this.neurons[i].x - this.neurons[j].x;
        const dy = this.neurons[i].y - this.neurons[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.35;
          const gradient = this.ctx.createLinearGradient(this.neurons[i].x, this.neurons[i].y, this.neurons[j].x, this.neurons[j].y);
          if (this.neurons[i].type === this.neurons[j].type) {
            const color = this.neurons[i].type === 'brain' ? '#ff00ff' : '#00ffff';
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color);
          } else {
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(1, '#00ffff');
          }
          this.ctx.strokeStyle = gradient;
          this.ctx.globalAlpha = opacity;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.neurons[i].x, this.neurons[i].y);
          this.ctx.lineTo(this.neurons[j].x, this.neurons[j].y);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }
  }

  animate = () => {
    this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    for (let n of this.neurons) n.update(this.canvas.width, this.canvas.height);
    this.drawConnections();
    for (let n of this.neurons) n.draw(this.ctx);
    requestAnimationFrame(this.animate);
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

document.addEventListener('DOMContentLoaded', () => new NeuralNetwork());
