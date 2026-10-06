# Nod — Voice Presentation Assistant

Voice-controlled presentations with a yellow glowing Orb mascot that reacts to your commands.

Drop a PDF, PPTX, or images → present → say **"next"**, **"previous"**, or **"go to slide five"** → the Orb reacts and the slide changes.

## Features

- **Voice navigation** — next, previous, go to slide N, first, last
- **Multi-format support** — PDF, PowerPoint (.pptx), and image decks
- **Nod Orb** — MSG Sphere–inspired yellow mascot with expressive face animations
- **Keyboard fallback** — arrow keys, Space (mic toggle), F (fullscreen), 1–9 (jump)
- **Live transcript** — see what the mic heard next to the Orb
- **Pluggable speech engine** — Web Speech API by default; easy to swap later

## Quick start

```bash
npm install
npm run dev
```

Open in **Chrome** (required for Web Speech API), then drop a presentation file.

## Voice commands

| Say | Action |
|---|---|
| "next" / "next slide" / "forward" | Next slide |
| "previous" / "back" / "go back" | Previous slide |
| "go to slide 5" / "slide five" | Jump to slide 5 |
| "first slide" / "beginning" | First slide |
| "last slide" / "end" | Last slide |

Press **Space** to toggle the microphone.

## Keyboard shortcuts

| Key | Action |
|---|---|
| → / PageDown | Next |
| ← / PageUp | Previous |
| Home / End | First / Last |
| Space | Toggle mic |
| F | Fullscreen |
| Escape | Exit fullscreen / exit presentation |
| 1–9 | Jump to slide |

## Scripts

```bash
npm run dev      # start development server
npm run build    # production build
npm run preview  # preview production build
npm test         # run command parser tests
```

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- pdf.js (PDF rendering)
- JSZip (PPTX extraction)
- Framer Motion (Orb animations)
- Web Speech API (voice recognition)

## Browser support

Voice commands require **Chrome** or **Edge**. Keyboard and mouse navigation work in all modern browsers.

## License

MIT
