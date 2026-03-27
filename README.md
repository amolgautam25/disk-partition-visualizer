# 🗄️ Disk Partition Visualizer

[![CI](https://github.com/YOUR_USERNAME/disk-partition-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/disk-partition-visualizer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive, browser-based disk partition visualizer that renders real-time LBA block layouts, allocation pie charts, and overlap detection — inspired by Windows Disk Management.

> **[Live Demo →](https://YOUR_USERNAME.github.io/disk-partition-visualizer)**

---

## Screenshots

<!-- Replace with actual screenshots after deploying -->

| Allocation Chart | Block Layout (LBA) |
|:---:|:---:|
| ![Pie Chart](docs/pie-chart.png) | ![Block Layout](docs/block-layout.png) |

| Overlap Detection | Presets |
|:---:|:---:|
| ![Overlap](docs/overlap.png) | ![Presets](docs/presets.png) |

---

## Features

- **Configurable disk geometry** — set disk size (B → TB) and sector size (256 → 4096 bytes); total block count computes instantly
- **Donut allocation chart** — hover to see partition name, percentage, and block count in the center ring
- **Windows Disk Manager–style bar** — rectangular block layout with LBA ruler, boundary tick marks, and hover tooltips showing exact block ranges
- **Dynamic partitions** — create, edit, and delete partitions by specifying name + start/end LBA
- **Overlap detection** — hatched red regions highlight conflicts; warning panel shows exactly which partitions collide and how many blocks are affected
- **Unallocated space** — striped regions clearly indicate free gaps between partitions
- **Preset layouts** — one-click GPT (UEFI), MBR Legacy, Dual Boot, and Overlap Demo configurations
- **Keyboard shortcuts** — Enter to submit, Escape to cancel edit
- **Auto-deploy** — GitHub Actions CI builds, tests, and deploys to GitHub Pages on every push to `main`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Charts | Custom SVG (zero chart library dependencies) |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions → GitHub Pages |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/disk-partition-visualizer.git
cd disk-partition-visualizer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

### Build for Production

```bash
npm run build
npm run preview    # preview the production build locally
```

---

## Project Structure

```
disk-partition-visualizer/
├── .github/workflows/ci.yml    # CI + GitHub Pages deploy
├── public/favicon.svg
├── src/
│   ├── components/
│   │   ├── DiskBar.jsx         # Rectangular block layout with LBA ruler
│   │   ├── DiskConfig.jsx      # Disk size / sector size configuration
│   │   ├── Legend.jsx           # Pie chart color legend
│   │   ├── PartitionForm.jsx   # Create / edit partition form
│   │   ├── PartitionTable.jsx  # Partition detail rows with edit/delete
│   │   ├── PieChart.jsx        # Donut allocation chart (pure SVG)
│   │   └── PresetBar.jsx       # Quick preset buttons
│   ├── hooks/
│   │   └── useDiskState.js     # Central state management hook
│   ├── presets/
│   │   └── index.js            # GPT, MBR, Dual Boot, Overlap presets
│   ├── utils/
│   │   ├── constants.js        # Colors, sector sizes, unit multipliers
│   │   ├── format.js           # formatSize(), formatBlocks()
│   │   └── partition.js        # detectOverlaps(), buildSegments()
│   ├── test/
│   │   ├── setup.js
│   │   ├── format.test.js
│   │   └── partition.test.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── LICENSE
```

---

## How It Works

### Segment Generation (Sweep Line Algorithm)

Partitions can overlap, nest, or leave gaps. Rather than naively rendering rectangles, the visualizer uses a **sweep line** approach:

1. Partition start/end boundaries become events sorted by LBA position
2. A set of "active" partitions is maintained as the sweep progresses
3. At each boundary, a segment is emitted:
   - **0 active** → unallocated (striped)
   - **1 active** → partition (solid color)
   - **2+ active** → overlap (red hatched)

This correctly handles arbitrary nesting, partial overlaps, and gaps in O(n log n) time.

### Overlap Detection

All pairs of partitions are checked for range intersection. An overlap exists when `max(startA, startB) ≤ min(endA, endB)`. Conflicts are reported with exact block ranges.

---

## Deployment

The included GitHub Actions workflow automatically:

1. Runs tests on Node 18, 20, and 22
2. Builds the production bundle
3. Deploys to GitHub Pages (on `main` branch pushes)

To enable: go to **Settings → Pages → Source → GitHub Actions** in your repo.

---

## Contributing

Contributions welcome! Some ideas:

- [ ] Drag-to-resize partitions on the block bar
- [ ] Import/export partition tables as JSON
- [ ] GPT/MBR header visualization (protective MBR, GPT header, partition entries)
- [ ] Filesystem type selector (ext4, NTFS, FAT32) with metadata overhead calculation
- [ ] Dark/light theme toggle
- [ ] Mobile-responsive layout

---

## License

[MIT](LICENSE)
