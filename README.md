# Mi Carta Romántica ❤️

Una página de una sola pantalla: un sobre interactivo que se abre con un sello de
cera y revela una carta de amor que cambia cada día. Alrededor hay un jardín de
flores generado proceduralmente, pétalos cayendo, luciérnagas y un reproductor de
música ambiental.

Construida con **Svelte 5 + Vite**.

## Desarrollo

```bash
npm install
npm run dev        # servidor local en http://localhost:5173
npm run build      # genera la versión de producción en dist/
npm run preview    # previsualiza el build
```

## El mensaje del día

El mensaje se genera **automáticamente cada día** (ver _Automatización_ más abajo),
pero también puedes editarlo a mano en [`public/daily.json`](public/daily.json). El
mensaje solo se muestra si el campo `date` coincide con la fecha de hoy (formato
`YYYY-MM-DD`). Si no coincide —o si el archivo falta— la página usa un mensaje de
respaldo elegido de forma determinista según el día, así que nunca se ve vacía.

```jsonc
{
  "date": "2026-06-14",            // debe ser la fecha de hoy para mostrarse
  "message": "Tu mensaje aquí...",
  "title": "Para mi amor ❤️",      // opcional
  "signature": "Con amor, Pablo 🌹", // opcional
  "flowerTheme": "roses",          // roses | sunflowers | daisies | tulips | cherry_blossoms
  "colorScheme": {                 // opcional; si falta, se elige una paleta del tema
    "primary": "#E91E63",
    "secondary": "#FCE4EC",
    "accent": "#FFD700"
  },
  "songTitle": "...",              // opcional
  "songUrl": "audio/aesthetics.mp3", // opcional (ruta en public/ o URL completa)
  "songCover": "..."               // opcional
}
```

## Estructura

```
public/            assets servidos tal cual (daily.json, audio/, bg/)
src/
  app.css          sistema de diseño (tokens) y estilos base
  main.js          punto de entrada
  App.svelte       orquestador: carga el contenido y compone las capas
  lib/             lógica pura (aleatorio sembrado, contenido, flores SVG)
  components/      Envelope, Garden, Petals, Fireflies, MusicPlayer
scripts/
  optimize-assets.js   re-optimiza el fondo a WebP (npm run optimize:assets)
  generate-daily.js    genera public/daily.json del día (lo usa el cron)
.github/workflows/
  deploy.yml           build + deploy a GitHub Pages
  daily-letter.yml     cron diario: genera mensaje, commitea y avisa por WhatsApp
```

## Automatización diaria (GitHub Actions)

El workflow [`daily-letter.yml`](.github/workflows/daily-letter.yml) corre cada día
(`0 12 * * *` UTC ≈ 08:00 en Chile) y:

1. Llama a **Gemini** para generar un mensaje nuevo + tema de flor + paleta
   ([`scripts/generate-daily.js`](scripts/generate-daily.js)). Si la respuesta
   falla o es inválida, escribe un respaldo determinista (nunca publica un JSON roto).
2. Commitea `public/daily.json` con el `GITHUB_TOKEN` integrado (sin PAT).
3. Avisa por WhatsApp vía Twilio (paso opcional, no bloquea si falla).

El commit encadena el deploy mediante `workflow_run`, así que el sitio se actualiza
solo. Como corre en la nube, **no depende de que tu equipo esté encendido**.

### Secretos necesarios

En *Settings → Secrets and variables → Actions* del repo, añade:

| Secret | Para qué |
|---|---|
| `GEMINI_API_KEY` | generar el mensaje del día |
| `TWILIO_ACCOUNT_SID` | aviso por WhatsApp (opcional) |
| `TWILIO_AUTH_TOKEN` | aviso por WhatsApp (opcional) |

Si omites los de Twilio, el aviso simplemente no se envía y todo lo demás funciona.

> **WhatsApp:** hoy usa el *sandbox* de Twilio (`From: +14155238886`), que tiene
> límites de sesión. Para un envío diario fiable a largo plazo necesitarás un
> remitente de WhatsApp propio aprobado por Meta + una plantilla.

## Despliegue

Cada push a `main` (y cada ejecución del cron diario) despliega automáticamente a
GitHub Pages mediante [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
Activa Pages una vez en *Settings → Pages → Build and deployment → Source: GitHub
Actions*.

> El fondo de alta resolución no se versiona (`assets-src/` está en `.gitignore`).
> La versión optimizada `public/bg/forest.webp` sí está en el repo. Para
> regenerarla, coloca la imagen en `assets-src/forest.jpg` y corre
> `npm run optimize:assets`.
