<script>
  import { onMount } from 'svelte';

  let { colors } = $props();
  let canvas;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // Pétalo dibujado en canvas. Recibe su entorno (contexto + paleta) para
  // mantenerse declarado a nivel del módulo del componente.
  class Petal {
    constructor(env) {
      this.env = env;
      this.color = env.palette[(Math.random() * env.palette.length) | 0];
      this.reset();
      this.y = Math.random() * -H();
    }
    reset() {
      this.x = Math.random() * W();
      this.y = -20;
      this.size = 6 + Math.random() * 11;
      this.speedY = 1 + Math.random() * 1.4;
      this.speedX = -0.5 + Math.random();
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.oscSpeed = 0.01 + Math.random() * 0.02;
      this.oscProgress = Math.random() * 100;
      this.alpha = 0.6 + Math.random() * 0.4;
      this.flipSpeed = 0.02 + Math.random() * 0.03;
      this.flip = Math.random();
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.oscProgress) * 0.6;
      this.oscProgress += this.oscSpeed;
      this.rotation += this.rotationSpeed;
      this.flip = Math.sin(this.y * this.flipSpeed);
      if (this.y > H() + 20 || this.x < -20 || this.x > W() + 20) this.reset();
    }
    draw() {
      const { ctx } = this.env;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(1, this.flip); // simula giro 3D al caer
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size, -this.size * 0.5, -this.size * 1.2, this.size * 0.5, 0, this.size);
      ctx.bezierCurveTo(this.size * 1.2, this.size * 0.5, this.size, -this.size * 0.5, 0, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-this.size * 0.2, this.size * 0.4, 0, this.size);
      ctx.stroke();
      ctx.restore();
    }
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    let petals = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const env = { ctx, palette: [colors.primary, colors.secondary, '#ffccd5', '#ffb3c1'] };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      const n = W() < 500 ? 10 : 22;
      petals = Array.from({ length: n }, () => new Petal(env));
    }

    function loop() {
      ctx.clearRect(0, 0, W(), H());
      for (const p of petals) {
        p.update();
        p.draw();
      }
      raf = requestAnimationFrame(loop);
    }

    function onMouseMove(e) {
      for (const p of petals) {
        const dist = Math.hypot(p.x - e.clientX, p.y - e.clientY);
        if (dist < 120) {
          const angle = Math.atan2(p.y - e.clientY, p.x - e.clientX);
          const force = (120 - dist) * 0.08;
          p.x += Math.cos(angle) * force;
          p.y += Math.sin(angle) * force * 0.5;
        }
      }
    }

    resize();
    spawn();

    if (reduced) {
      // Sin animación: un cuadro estático y suave.
      for (const p of petals) p.draw();
    } else {
      loop();
      window.addEventListener('mousemove', onMouseMove);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        spawn();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  });
</script>

<canvas bind:this={canvas} class="petals" aria-hidden="true"></canvas>

<style>
  .petals {
    position: fixed;
    inset: 0;
    z-index: 3;
    pointer-events: none;
  }
</style>
