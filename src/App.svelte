<script>
  import { onMount } from 'svelte';
  import { loadDailyConfig } from './lib/content.js';
  import { readableDate } from './lib/random.js';
  import Fireflies from './components/Fireflies.svelte';
  import Garden from './components/Garden.svelte';
  import Petals from './components/Petals.svelte';
  import Envelope from './components/Envelope.svelte';
  import MusicPlayer from './components/MusicPlayer.svelte';

  let config = $state(null);
  let open = $state(false);
  let player = $state(); // referencia a la instancia de MusicPlayer

  const dateText = readableDate();

  onMount(async () => {
    const base = import.meta.env.BASE_URL;
    document.body.style.setProperty('--bg-image', `url(${base}bg/forest.webp)`);

    config = await loadDailyConfig();

    const { primary, secondary, accent } = config.colorScheme;
    const root = document.documentElement.style;
    root.setProperty('--day-primary', primary);
    root.setProperty('--day-secondary', secondary);
    root.setProperty('--day-accent', accent);
  });

  function handleToggle(isOpen) {
    open = isOpen;
    if (isOpen) player?.play(); // primera apertura reproduce música
  }
</script>

<Fireflies />

<div class="garden-layer" class:dimmed={open}>
  {#if config}
    <Garden theme={config.flowerTheme} colors={config.colorScheme} dateSeed={config.date} />
  {/if}
</div>

{#if config}
  <Petals colors={config.colorScheme} />
{/if}

<div class="focus-overlay" class:visible={open}></div>

<main class="stage">
  {#if config}
    <Envelope
      message={config.message}
      title={config.title}
      signature={config.signature}
      {dateText}
      onToggle={handleToggle}
    />

    <MusicPlayer
      bind:this={player}
      title={config.songTitle}
      src={config.songUrl}
      cover={config.songCover}
    />
  {/if}
</main>

<style>
  .stage {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1500px;
  }

  .garden-layer {
    position: fixed;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    transition: opacity 1s ease, filter 1s ease;
  }

  .garden-layer.dimmed {
    opacity: 0.3;
    filter: blur(2px);
  }
</style>
