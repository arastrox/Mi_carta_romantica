<script>
  import { buildGarden } from '../lib/flowers.js';

  let { theme, colors, dateSeed } = $props();

  let flowers = $state([]);
  let width = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Regenera el jardín cuando cambian las props o el ancho de la ventana.
  // El layout es determinista (sembrado por fecha), así que un resize no
  // reordena las flores de forma aleatoria.
  $effect(() => {
    flowers = buildGarden({ theme, colors, dateSeed, width });
  });

  $effect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => (width = window.innerWidth), 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  });
</script>

<div class="garden">
  {#each flowers as f}
    <div
      class="stem"
      style="
        left: {f.x}px;
        bottom: {f.bottom}px;
        z-index: {f.zIndex};
        animation-duration: {f.swayDuration}s;
        animation-delay: {f.swayDelay}s;
      "
    >
      <div style="transform: scale({f.scale}); transform-origin: bottom center;">
        {@html f.svg}
      </div>
    </div>
  {/each}
</div>

<style>
  .garden {
    position: absolute;
    inset: 0;
  }

  .stem {
    position: absolute;
    transform-origin: bottom center;
    animation-name: sway;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  @keyframes sway {
    0% { transform: rotate(-2deg); }
    100% { transform: rotate(2deg); }
  }

  /* La animación de floración la dispara el SVG inyectado. */
  :global(.flower-head) {
    transform-origin: 0 0;
    animation: bloom 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes bloom {
    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
</style>
