<script>
  // Luciérnagas ligeras: en vez de generar 30 @keyframes únicos (lo que antes
  // pesaba ~70 KB de CSS), cada luciérnaga combina dos animaciones compartidas
  // (deriva X e Y con duraciones distintas) para un vagar orgánico, más un
  // destello. Toda la variación va en variables CSS por elemento.
  const COUNT = 28;

  const fireflies = Array.from({ length: COUNT }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 2.5,
    driftX: 40 + Math.random() * 120,
    driftY: 30 + Math.random() * 100,
    durX: 8 + Math.random() * 10,
    durY: 9 + Math.random() * 11,
    delay: -Math.random() * 12,
    flashDur: 4 + Math.random() * 6,
    flashDelay: Math.random() * 8,
  }));
</script>

<div class="fireflies" aria-hidden="true">
  {#each fireflies as f}
    <span
      class="firefly"
      style="
        left: {f.x}%;
        top: {f.y}%;
        --drift-y: {f.driftY}px;
        --dur-y: {f.durY}s;
        --delay: {f.delay}s;
      "
    >
      <span
        class="dot"
        style="
          width: {f.size}px;
          height: {f.size}px;
          --drift-x: {f.driftX}px;
          --dur-x: {f.durX}s;
          --flash-dur: {f.flashDur}s;
          --flash-delay: {f.flashDelay}s;
        "
      ></span>
    </span>
  {/each}
</div>

<style>
  .fireflies {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
  }

  .firefly {
    position: absolute;
    animation: float-y var(--dur-y) ease-in-out var(--delay) infinite alternate;
    will-change: transform;
  }

  .dot {
    display: block;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px 1px rgba(255, 214, 120, 0.9);
    opacity: 0;
    animation:
      float-x var(--dur-x) ease-in-out infinite alternate,
      flash var(--flash-dur) ease-in-out var(--flash-delay) infinite;
    will-change: transform, opacity;
  }

  @keyframes float-y {
    from { transform: translateY(calc(var(--drift-y) * -0.5)); }
    to   { transform: translateY(calc(var(--drift-y) * 0.5)); }
  }

  @keyframes float-x {
    from { transform: translateX(calc(var(--drift-x) * -0.5)); }
    to   { transform: translateX(calc(var(--drift-x) * 0.5)); }
  }

  @keyframes flash {
    0%, 70%, 100% { opacity: 0; box-shadow: 0 0 6px 1px rgba(255, 214, 120, 0); }
    35% { opacity: 1; box-shadow: 0 0 14px 4px rgba(255, 214, 120, 0.85); }
  }
</style>
