<script>
  let { message, title, signature, dateText, onToggle } = $props();

  let open = $state(false);
  let closing = $state(false);

  function openLetter() {
    if (open) return;
    open = true;
    closing = false;
    onToggle?.(true);
  }

  function closeLetter() {
    if (!open) return;
    open = false;
    closing = true;
    onToggle?.(false);
    setTimeout(() => (closing = false), 1800); // coincide con pullOutAndDrop
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && open) closeLetter();
  }
</script>

<svelte:window on:keydown={onKeydown} />

<div class="wrapper" class:open class:closing>
  <div class="envelope">
    <div class="back"></div>

    <div
      class="letter"
      role="button"
      tabindex={open ? 0 : -1}
      aria-label="Cerrar la carta"
      onclick={() => open && closeLetter()}
      onkeydown={(e) => open && (e.key === 'Enter' || e.key === ' ') && closeLetter()}
    >
      <div class="letter-content">
        <header class="letter-header">
          <span class="letter-date">{dateText}</span>
          <h2 class="letter-title">{title}</h2>
        </header>
        <div class="letter-body">
          <p class="letter-text">{message}</p>
        </div>
        <footer class="letter-footer">
          <p class="signature">{signature}</p>
        </footer>
      </div>
    </div>

    <div class="front"></div>
    <div class="flap"></div>

    <button class="seal" type="button" onclick={openLetter} aria-label="Abrir la carta">
      <svg viewBox="0 0 100 100" class="seal-svg">
        <circle cx="50" cy="50" r="45" class="seal-outer" />
        <circle cx="50" cy="50" r="38" class="seal-inner" />
        <path
          d="M50 33 C45 23, 25 23, 25 43 C25 61, 50 78, 50 78 C50 78, 75 61, 75 43 C75 23, 55 23, 50 33 Z"
          class="seal-heart"
        />
      </svg>
      <span class="seal-prompt">Abrir</span>
    </button>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    width: 90vw;
    max-width: 500px;
    height: 60vw;
    max-height: 330px;
    cursor: pointer;
    transition: transform 0.5s ease;
    transform-style: preserve-3d;
  }
  .wrapper:hover {
    transform: translateY(-5px) rotateX(2deg);
  }
  .wrapper.open:hover {
    transform: none;
    cursor: default;
  }

  .envelope {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, var(--envelope-dark), var(--envelope-deep));
    border-radius: 0 0 12px 12px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.4);
    transform-style: preserve-3d;
  }

  .back {
    position: absolute;
    inset: 0;
    background: var(--envelope-dark);
    border-radius: 0 0 12px 12px;
    z-index: 1;
  }

  /* ---- Carta ---- */
  .letter {
    position: absolute;
    bottom: 5px;
    left: 4%;
    width: 92%;
    height: 94%;
    background-color: var(--paper);
    background-image:
      radial-gradient(rgba(0, 0, 0, 0.03) 25%, transparent 26%),
      linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px);
    background-size: 20px 20px, 100% 24px;
    border-radius: 6px;
    padding: 6% 8%;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
    z-index: 2;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.9);
    transition:
      transform var(--transition) var(--ease-soft),
      height var(--transition) var(--ease-soft),
      z-index 0s linear var(--transition);
  }

  .letter-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    opacity: 0;
    color: var(--ink);
    transition: opacity 0.5s ease 0.6s;
  }

  .letter-header {
    border-bottom: 1px dashed rgba(139, 38, 62, 0.3);
    padding-bottom: 12px;
  }
  .letter-date {
    display: block;
    font-family: var(--font-body);
    font-size: clamp(0.72rem, 2vw, 0.85rem);
    font-weight: 600;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .letter-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 5vw, 1.9rem);
    font-weight: 700;
    color: var(--envelope);
    margin-top: 5px;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.05);
  }

  .letter-body {
    flex-grow: 1;
    display: flex;
    align-items: center;
    padding: 20px 0;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .letter-body::-webkit-scrollbar {
    display: none;
  }
  .letter-text {
    font-family: var(--font-script);
    font-size: clamp(1.4rem, 6vw, 1.85rem);
    line-height: 1.5;
    color: #1e1b18;
    text-align: center;
    width: 100%;
    word-wrap: break-word;
  }

  .letter-footer {
    border-top: 1px dashed rgba(139, 38, 62, 0.2);
    padding-top: 12px;
    text-align: right;
  }
  .signature {
    font-family: var(--font-script);
    font-size: clamp(1.3rem, 5vw, 1.7rem);
    font-weight: 700;
    color: var(--envelope);
  }

  /* ---- Solapas ---- */
  .front {
    position: absolute;
    inset: 0;
    z-index: 3;
    background: linear-gradient(135deg, var(--envelope), #7a1d33);
    clip-path: polygon(0 0, 50% 50%, 100% 0, 100% 100%, 0 100%);
    border-radius: 0 0 12px 12px;
    pointer-events: none;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
  }
  .front::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(rgba(255, 255, 255, 0.05), transparent);
  }

  .flap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 55%;
    z-index: 4;
    background: linear-gradient(to bottom, var(--envelope-light), var(--envelope));
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    transform-origin: top center;
    transition: transform var(--transition) ease-in-out;
    pointer-events: none;
    filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.5));
  }

  /* ---- Sello de cera ---- */
  .seal {
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    width: clamp(60px, 15vw, 85px);
    height: clamp(60px, 15vw, 85px);
    z-index: 5;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.4s var(--ease-spring), opacity 0.5s ease;
  }
  .seal:hover,
  .seal:focus-visible {
    transform: translate(-50%, -50%) scale(1.1);
    outline: none;
  }
  .seal-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.5));
  }
  .seal-outer {
    fill: var(--seal);
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 1.5;
  }
  .seal-inner {
    fill: #7a1020;
    stroke: var(--gold);
    stroke-width: 1;
    stroke-dasharray: 2 1;
  }
  .seal-heart {
    fill: var(--gold);
    transform-origin: center;
  }
  .seal:hover .seal-heart,
  .seal:focus-visible .seal-heart {
    animation: heartbeat 0.8s ease infinite;
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
  .seal-prompt {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(139, 38, 62, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 6px 14px;
    border-radius: 15px;
    font-family: var(--font-body);
    font-size: clamp(0.72rem, 2vw, 0.82rem);
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    opacity: 0.9;
    pointer-events: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  /* ---- Estado abierto ---- */
  .wrapper.open .flap {
    transform: rotateX(180deg);
    z-index: 1;
  }
  .wrapper.open .letter {
    transition: none;
    animation: pullOutAndDrop 1.8s var(--ease-soft) forwards;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(139, 38, 62, 0.05);
    cursor: pointer;
  }
  .wrapper.open .letter-content {
    opacity: 1;
    transition: opacity 0.8s ease 1s;
  }
  .wrapper.open .seal {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0);
  }

  @keyframes pullOutAndDrop {
    0% { transform: translateY(0); height: 94%; z-index: 2; }
    45% { transform: translateY(calc(-100% - 20px)); height: 94%; z-index: 2; }
    50% { transform: translateY(calc(-100% - 20px)); height: 94%; z-index: 10; }
    100% { transform: translateY(150px); height: min(70vh, 500px); z-index: 10; }
  }

  /* ---- Estado de cierre ---- */
  .wrapper.closing .flap {
    animation: closeFlap 1.8s forwards;
  }
  @keyframes closeFlap {
    0%, 55% { transform: rotateX(180deg); z-index: 1; }
    100% { transform: rotateX(0deg); z-index: 4; }
  }
  .wrapper.closing .letter {
    transition: none;
    animation: pullOutAndDrop 1.8s var(--ease-soft) reverse forwards;
  }
  .wrapper.closing .letter-content {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .wrapper.closing .seal {
    animation: fadeInSeal 1.8s forwards;
  }
  @keyframes fadeInSeal {
    0%, 80% { opacity: 0; transform: translate(-50%, -50%) scale(0); pointer-events: none; }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); pointer-events: auto; }
  }

  @media (max-aspect-ratio: 1/2) {
    @keyframes pullOutAndDrop {
      0% { transform: translateY(0); height: 94%; z-index: 2; }
      45% { transform: translateY(calc(-100% - 20px)); height: 94%; z-index: 2; }
      50% { transform: translateY(calc(-100% - 20px)); height: 94%; z-index: 10; }
      100% { transform: translateY(180px); height: 60vh; z-index: 10; }
    }
  }
</style>
