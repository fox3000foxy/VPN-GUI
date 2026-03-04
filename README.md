

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=FoxyProxies&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=32&desc=Neutralino%20%2B%20React%20%2B%20Vite%20Desktop%20App&descSize=18&descAlignY=52" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&pause=1000&color=8B5CF6&center=true&vCenter=true&width=500&lines=VPN+GUI+for+Tor+and+Proxy;Cross-platform+Desktop+App;Modern+UI+with+React+%2B+Tailwind;Neutralino.js+%2B+Vite+Template" alt="Typing SVG" />

</div>

---

# FoxyProxies

> **A modern, cross-platform desktop GUI for Tor and proxy management, built with Neutralino.js, React, TypeScript, and Vite.**

---

---


# Table of Contents

- [✨ About FoxyProxies](#-about-FoxyProxies)
- [Features](#features)
- [How it works](#how-it-works)
<!-- - [Screenshots](#screenshots) -->
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---


## ✨ About FoxyProxies

**FoxyProxies** is a lightweight, cross-platform desktop application to control Tor, manage proxies, and visualize connection status. Built with Neutralino.js, React, TypeScript, and Vite.

> Sleek, fast, and multiplatform — without Electron.

---


## Features

- Start, stop, and restart Tor service
- Real-time security indicator and logs
- Country selection for routing
- Modern UI with React + TailwindCSS
- Works on Windows, Linux, macOS
- Lightweight (Neutralino.js, no Electron)

---


## How it works

```
User Action
   │
   ▼
[FoxyProxies React UI] ──► [Neutralino Backend] ──► [Tor Process / Proxy Scripts]
   │
   └─► [Live Status, Logs, Security Indicator]
```

1. **User interacts** with the React UI (start/stop Tor, select country, view logs).
2. **Neutralino backend** executes system commands/scripts (e.g., launches Tor, changes proxy settings).
3. **Status and logs** are streamed back to the UI in real time.

> **NOTE**
> FoxyProxies does **not** use Electron, making it much lighter and faster to launch.

> **WARNING**
> Make sure you trust the Tor binaries and scripts included in `tor-expert-bundle/` before running them.

> **CAUTION**
> Some features (like proxy or Tor control) may require administrator rights or special firewall permissions on your OS.

---

<!-- ## Screenshots

> *(Add your application screenshots here)*

--- -->


## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Run in development

- Start the Vite dev server:
   ```bash
   pnpm run dev
   ```
- In another terminal, launch the Neutralino window:
   ```bash
   pnpm run neutralino:start
   ```
   The app loads from `http://localhost:3000` by default in dev mode.

### 3. Build the app

```bash
pnpm run build
pnpm run neutralino:build
```

---


## Configuration

- Edit `neutralino.config.json` to adjust window size, application ID, and other options.
- The `url` field should point to a local file (`./index.html`) for production.
- Neutralino binaries are in `bin/`.
- Tor files are in `tor-expert-bundle/`.

---


## Project Structure

```
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── neutralino.config.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── libs/
│   ├── styles/
│   └── types/
├── public/
├── bin/
├── tor-expert-bundle/
└── README.md
```

---


## Troubleshooting

| Symptom | Likely cause | Solution |
|---|---|---|
| Neutralino does not start | Missing binary or wrong path | Check the `bin/` folder and config |
| Tor does not start | Wrong path or permissions | Check `tor-expert-bundle/` and permissions |
| UI does not display | Wrong URL or missing build | Check Vite build and Neutralino config |

---


## Contributing

Contributions are welcome! Open an issue or PR. Keep changes small and tested.

---


## License

MIT