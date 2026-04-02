# 🗄️ Disk Partition Visualizer

[![CI](https://github.com/amolgautam25/disk-partition-visualizer/actions/workflows/ci.yml/badge.svg)](https://github.com/amolgautam25/disk-partition-visualizer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive, browser-based disk partition visualizer that renders real-time LBA block layouts, allocation pie charts, and overlap detection — inspired by Windows Disk Management.

> **[Live Demo →](https://amolgautam25.github.io/disk-partition-visualizer)**

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

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
git clone https://github.com/amolgautam25/disk-partition-visualizer.git
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
