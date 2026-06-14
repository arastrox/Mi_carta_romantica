<script>
  import { tick } from 'svelte';

  let { title = 'Instrumental Romántico', src = '', cover = '' } = $props();

  let audio;
  let titleEl;
  let marqueeEl;

  let playing = $state(false);
  let expanded = $state(false);
  let volume = $state(0.5);
  let scrolling = $state(false);

  // Expuesto al padre vía bind:this — la primera apertura del sobre lo llama.
  export function play() {
    if (!audio) return;
    audio
      .play()
      .then(() => (playing = true))
      .catch(() => {
        // La reproducción automática puede requerir interacción del usuario.
      });
  }

  function toggle() {
    if (playing) {
      audio.pause();
      playing = false;
    } else {
      play();
    }
  }

  function setVolume(e) {
    volume = +e.target.value;
    if (audio) audio.volume = volume;
  }

  // Activa el marquee solo si el título no cabe en su contenedor.
  $effect(() => {
    title; // dependencia
    tick().then(() => {
      if (titleEl && marqueeEl) {
        scrolling = titleEl.scrollWidth > marqueeEl.clientWidth;
      }
    });
  });
</script>

<div class="music" class:expanded class:playing>
  <div class="header">
    <button
      class="icon-btn"
      type="button"
      onclick={toggle}
      aria-label={playing ? 'Pausar música' : 'Reproducir música'}
    >
      {#if playing}
        <svg viewBox="0 0 24 24" class="icon"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
      {:else}
        <svg viewBox="0 0 24 24" class="icon"><path d="M4.27 3L3 4.27l9 9v.28c-.53-.34-1.14-.55-1.8-.55C8.36 13 6.8 14.57 6.8 16.5S8.36 20 10.2 20s3.4-1.57 3.4-3.5v-1.92l4.88 4.88 1.27-1.27L4.27 3zM14.2 7h2.8V3h-5.6v2.37l2.8 2.8V7z" /></svg>
      {/if}
    </button>

    <button
      class="preview"
      type="button"
      onclick={() => (expanded = !expanded)}
      aria-expanded={expanded}
      aria-label="Mostrar detalles de la canción"
    >
      <span>Música</span>
      <svg viewBox="0 0 24 24" class="chevron"><path d="M7 10l5 5 5-5z" fill="currentColor" /></svg>
    </button>
  </div>

  <div class="dropdown">
    <div class="dropdown-content">
      <div class="cover">
        {#if cover}
          <img src={cover} alt="Portada" />
        {:else}
          <svg viewBox="0 0 24 24" class="vinyl">
            <circle cx="12" cy="12" r="10" fill="#222" stroke="#444" stroke-width="2" />
            <circle cx="12" cy="12" r="3" fill="var(--day-accent)" />
            <circle cx="12" cy="12" r="1" fill="#111" />
          </svg>
        {/if}
      </div>
      <div class="info">
        <div class="marquee" bind:this={marqueeEl}>
          <div class="marquee-text" class:scroll={scrolling} bind:this={titleEl}>{title}</div>
        </div>
        <div class="volume">
          <svg viewBox="0 0 24 24" class="vol-icon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" /></svg>
          <input type="range" min="0" max="1" step="0.01" value={volume} oninput={setVolume} aria-label="Volumen" />
        </div>
      </div>
    </div>
  </div>

  <audio bind:this={audio} {src} loop preload="auto"></audio>
</div>

<style>
  .music {
    position: fixed;
    top: clamp(15px, 4vw, 25px);
    right: clamp(15px, 4vw, 25px);
    background: rgba(25, 15, 25, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 25px;
    z-index: 100;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.4s var(--ease-spring);
    min-width: clamp(40px, 10vw, 50px);
  }

  .header {
    display: flex;
    align-items: center;
    height: clamp(40px, 10vw, 50px);
    padding-right: 15px;
  }

  .icon-btn {
    width: clamp(40px, 10vw, 50px);
    height: clamp(40px, 10vw, 50px);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  .icon {
    width: 45%;
    height: 45%;
    fill: #fff;
  }

  .preview {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    color: #fff;
    font-family: var(--font-body);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    opacity: 0.9;
    white-space: nowrap;
  }
  .chevron {
    width: 16px;
    height: 16px;
    fill: #fff;
    transition: transform 0.4s ease;
  }
  .music.expanded .chevron {
    transform: rotate(180deg);
  }

  .dropdown {
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s var(--ease-spring);
  }
  .music.expanded .dropdown {
    height: 70px;
    opacity: 1;
    pointer-events: auto;
  }
  .dropdown-content {
    display: flex;
    padding: 0 15px 15px;
    gap: 12px;
    align-items: center;
  }

  .cover {
    width: 45px;
    height: 45px;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .vinyl {
    width: 35px;
    height: 35px;
  }
  .music.playing .vinyl {
    animation: spin 3s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    min-width: 120px;
    max-width: 180px;
  }
  .marquee {
    width: 100%;
    overflow: hidden;
    position: relative;
    height: 20px;
    margin-bottom: 5px;
  }
  .marquee-text {
    display: inline-block;
    white-space: nowrap;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }
  .marquee-text.scroll {
    padding-left: 100%;
    animation: marquee 10s linear infinite;
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }

  .volume {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vol-icon {
    width: 14px;
    height: 14px;
    fill: #fff;
    opacity: 0.8;
  }
  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--gold);
    cursor: pointer;
    box-shadow: 0 0 5px rgba(255, 183, 3, 0.5);
  }
  input[type='range']::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--gold);
    border: none;
    cursor: pointer;
  }
</style>
