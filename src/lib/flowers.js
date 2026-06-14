/**
 * Generación procedural del jardín de flores en SVG.
 *
 * `buildGarden` decide posición, escala y profundidad de cada flor (sembrado
 * por la fecha para que el jardín sea estable durante el día), y `flowerSVG`
 * dibuja una flor concreta según el tema y la paleta.
 */
import { seededRandom } from './random.js';

/**
 * Devuelve un arreglo de descriptores de flores listos para renderizar.
 * @returns {{x:number, bottom:number, scale:number, zIndex:number,
 *            swayDuration:number, swayDelay:number, svg:string}[]}
 */
export function buildGarden({ theme, colors, dateSeed, width }) {
  const rand = seededRandom(`${dateSeed}_garden`);
  const count = width < 500 ? 36 : 70;
  const flowers = [];

  for (let i = 0; i < count; i++) {
    const x = rand() * width * 1.2 - width * 0.1;
    const depth = rand(); // 0 (atrás) .. 1 (frente)
    const scale = 0.5 + depth * 0.8;
    const height = (350 + rand() * 650) * scale;

    flowers.push({
      x,
      bottom: -120 + depth * 80,
      scale,
      zIndex: Math.floor(depth * 10),
      swayDuration: 5 + rand() * 4,
      swayDelay: rand() * -5,
      svg: flowerSVG({ theme, colors, index: i, height, dateSeed }),
    });
  }

  return flowers;
}

function flowerSVG({ theme, colors, index, height, dateSeed }) {
  const r = seededRandom(`${dateSeed}_flower_${index}`);

  const stemColor = '#2b4c3f';
  const leafColor = '#3a6652';
  const { primary, secondary, accent } = colors;

  // Tallo: bézier cuadrática con leve curvatura.
  const endX = (r() - 0.5) * 40;
  const endY = -height;
  const controlX = (r() - 0.5) * 60;
  const controlY = -height * 0.5;

  const flowerSize = 55 + r() * 35;
  // Floración en oleadas: se rellena el jardín en ~2 s en vez de >8 s.
  const bloomDelay = 0.2 + (index % 14) * 0.14;

  let petals = '';
  let center = '';

  if (theme === 'roses') {
    for (let layer = 0; layer < 3; layer++) {
      const layerScale = 1 - layer * 0.25;
      const layerPetals = 5 - layer;
      const layerColor = layer === 0 ? primary : layer === 1 ? secondary : accent;
      for (let j = 0; j < layerPetals; j++) {
        const angle = (j / layerPetals) * 360 + layer * 30;
        const pw = flowerSize * 0.65 * layerScale;
        const ph = flowerSize * 0.8 * layerScale;
        petals += `<path d="M0,0 C-${pw},-${ph} ${pw},-${ph} 0,0" fill="${layerColor}" opacity="0.95" transform="rotate(${angle}) translate(0, -${flowerSize * 0.1 * layerScale})" />`;
      }
    }
    center = `<ellipse cx="0" cy="0" rx="${flowerSize * 0.18}" ry="${flowerSize * 0.12}" fill="${accent}" transform="rotate(${r() * 360})" />`;
  } else if (theme === 'sunflowers') {
    const petalCount = 16 + Math.floor(r() * 8);
    for (let j = 0; j < petalCount; j++) {
      const angle = (j / petalCount) * 360;
      petals += `<path d="M0,0 C-8,-${flowerSize} 8,-${flowerSize} 0,0" fill="${primary}" transform="rotate(${angle})" />`;
      petals += `<path d="M0,0 C-4,-${flowerSize * 0.9} 4,-${flowerSize * 0.9} 0,0" fill="${secondary}" transform="rotate(${angle + 360 / (petalCount * 2)})" />`;
    }
    center = `<circle cx="0" cy="0" r="${flowerSize * 0.42}" fill="#3d2314" /><circle cx="0" cy="0" r="${flowerSize * 0.38}" fill="#54331f" stroke="#ffb703" stroke-width="1.5" stroke-dasharray="2,3" />`;
  } else if (theme === 'daisies' || theme === 'cherry_blossoms') {
    const isCherry = theme === 'cherry_blossoms';
    const petalCount = isCherry ? 5 : 12 + Math.floor(r() * 6);
    for (let j = 0; j < petalCount; j++) {
      const angle = (j / petalCount) * 360;
      if (isCherry) {
        petals += `<path d="M0,0 C-15,-${flowerSize * 0.8} -20,-${flowerSize * 1.1} -3,-${flowerSize * 0.9} L0,-${flowerSize} L3,-${flowerSize * 0.9} C20,-${flowerSize * 1.1} 15,-${flowerSize * 0.8} 0,0" fill="${primary}" transform="rotate(${angle})" />`;
      } else {
        petals += `<ellipse cx="0" cy="-${flowerSize * 0.5}" rx="${flowerSize * 0.18}" ry="${flowerSize * 0.5}" fill="${primary}" transform="rotate(${angle})" />`;
      }
    }
    center = `<circle cx="0" cy="0" r="${flowerSize * 0.22}" fill="${accent}" /><circle cx="0" cy="0" r="${flowerSize * 0.16}" fill="${secondary}" opacity="0.6" />`;
  } else {
    // Tulipanes
    petals = `
      <path d="M0,0 C-22,-${flowerSize * 1.1} 22,-${flowerSize * 1.1} 0,0" fill="${secondary}" />
      <path d="M-${flowerSize * 0.1},0 C-${flowerSize * 0.8},-${flowerSize * 0.95} 0,-${flowerSize * 1.2} 0,0" fill="${primary}" transform="rotate(-15)" />
      <path d="M${flowerSize * 0.1},0 C${flowerSize * 0.8},-${flowerSize * 0.95} 0,-${flowerSize * 1.2} 0,0" fill="${primary}" transform="rotate(15)" />
      <path d="M0,0 C-12,-${flowerSize * 0.95} 12,-${flowerSize * 0.95} 0,0" fill="${accent}" />`;
  }

  // Hojas a lo largo del tallo.
  let leaves = '';
  [0.35, 0.65].forEach((t, idx) => {
    const side = idx % 2 === 0 ? 1 : -1;
    const sx = 2 * (1 - t) * t * controlX + t * t * endX;
    const sy = 2 * (1 - t) * t * controlY + t * t * endY;
    const len = 25 + r() * 15;
    const angle = side * (35 + r() * 20);
    leaves += `<path d="M${sx},${sy} C${sx + side * 15},${sy - 5} ${sx + side * len},${sy - len * 0.5} ${sx + side * len * 0.8},${sy - len} C${sx + side * 5},${sy - len * 0.6} ${sx},${sy - 5} ${sx},${sy}" fill="${leafColor}" transform="rotate(${angle}, ${sx}, ${sy})" />`;
  });

  return `
    <svg width="250" height="${height + 100}" viewBox="-125 -${height + 50} 250 ${height + 100}" style="overflow: visible;">
      <defs>
        <filter id="fshadow${index}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#fshadow${index})">
        ${leaves}
        <path d="M0,0 Q${controlX},${controlY} ${endX},${endY}" fill="none" stroke="${stemColor}" stroke-width="5" stroke-linecap="round" />
        <g transform="translate(${endX}, ${endY})">
          <g class="flower-head" style="animation-delay: ${bloomDelay}s;">
            <path d="M-12,-2 C-8,12 8,12 12,-2 L0,-8 Z" fill="${stemColor}" />
            <g>${petals}</g>
            <g>${center}</g>
          </g>
        </g>
      </g>
    </svg>`;
}
