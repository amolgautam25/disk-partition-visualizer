import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiskBar from '../components/DiskBar';

const TOTAL_BLOCKS = 1000;

const segments = [
  { label: 'Root', type: 'partition', color: '#3B82F6', blocks: 500, startBlock: 0, endBlock: 500 },
  { label: 'Home', type: 'partition', color: '#10B981', blocks: 400, startBlock: 500, endBlock: 900 },
  { label: 'Free', type: 'unallocated', color: '#334155', blocks: 100, startBlock: 900, endBlock: 1000 },
];

const partitions = [
  { name: 'Root', startBlock: 0, endBlock: 500 },
  { name: 'Home', startBlock: 500, endBlock: 900 },
];

function renderBar(props = {}) {
  return render(
    <DiskBar
      segments={segments}
      totalBlocks={TOTAL_BLOCKS}
      partitions={partitions}
      {...props}
    />
  );
}

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('DiskBar — rendering', () => {
  it('renders partition labels for large-enough segments', () => {
    renderBar();
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders the LBA ruler with 0 and total at zoom 1', () => {
    renderBar();
    expect(screen.getByText('LBA 0')).toBeInTheDocument();
    expect(screen.getByText(`LBA ${TOTAL_BLOCKS.toLocaleString()}`)).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    renderBar();
    expect(screen.getByText('−')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('1×')).toBeInTheDocument();
  });

  it('shows Ctrl+scroll hint at zoom 1', () => {
    renderBar();
    expect(screen.getByText(/ctrl\+scroll to zoom/i)).toBeInTheDocument();
  });

  it('does not show the minimap at zoom 1', () => {
    renderBar();
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });

  it('does not show the reset button at zoom 1', () => {
    renderBar();
    expect(screen.queryByText('reset')).not.toBeInTheDocument();
  });
});

// ─── Tiny segment filtering ───────────────────────────────────────────────────

describe('DiskBar — segment filtering', () => {
  it('does not render segments below the 0.15% visibility threshold', () => {
    const tinySegments = [
      { label: 'Tiny', type: 'partition', color: '#f00', blocks: 1, startBlock: 0, endBlock: 1 },
      { label: 'Big', type: 'partition', color: '#0f0', blocks: 999, startBlock: 1, endBlock: 1000 },
    ];
    renderBar({ segments: tinySegments });
    // "Tiny" is 0.1% which is below 0.15/1 threshold — label won't render
    expect(screen.queryByText('Tiny')).not.toBeInTheDocument();
    expect(screen.getByText('Big')).toBeInTheDocument();
  });
});

// ─── Zoom controls ───────────────────────────────────────────────────────────

describe('DiskBar — zoom controls', () => {
  it('− button is disabled at zoom 1', () => {
    renderBar();
    expect(screen.getByText('−').closest('button')).toBeDisabled();
  });

  it('+ button is enabled at zoom 1', () => {
    renderBar();
    expect(screen.getByText('+').closest('button')).not.toBeDisabled();
  });

  it('clicking + increments the zoom level display', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('2×')).toBeInTheDocument();
  });

  it('shows the reset button after zooming in', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('reset')).toBeInTheDocument();
  });

  it('clicking reset returns zoom to 1×', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('reset'));
    expect(screen.getByText('1×')).toBeInTheDocument();
    expect(screen.queryByText('reset')).not.toBeInTheDocument();
  });

  it('does not exceed MAX_ZOOM (10×)', () => {
    renderBar();
    const plusBtn = screen.getByText('+').closest('button');
    for (let i = 0; i < 15; i++) fireEvent.click(plusBtn);
    expect(screen.getByText('10×')).toBeInTheDocument();
    expect(plusBtn).toBeDisabled();
  });

  it('does not go below MIN_ZOOM (1×)', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('−'));
    fireEvent.click(screen.getByText('−'));
    expect(screen.getByText('1×')).toBeInTheDocument();
    expect(screen.getByText('−').closest('button')).toBeDisabled();
  });
});

// ─── Minimap ─────────────────────────────────────────────────────────────────

describe('DiskBar — minimap', () => {
  it('shows the minimap after zooming in', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('hides the minimap after resetting zoom', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('reset'));
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
  });
});

// ─── LBA ruler ───────────────────────────────────────────────────────────────

describe('DiskBar — LBA ruler when zoomed', () => {
  it('shows LBA range in the zoom controls bar when zoomed', () => {
    renderBar();
    fireEvent.click(screen.getByText('+'));
    // At zoom=2 scrollLeft=0: startLBA=0, visibleBlocks=500, endLBA=500
    expect(screen.getByText(/LBA 0\s*[–—]\s*500/)).toBeInTheDocument();
  });
});

// ─── Hover behaviour ─────────────────────────────────────────────────────────

describe('DiskBar — hover dimming', () => {
  it('dims non-hovered segments when one segment is hovered', () => {
    const { container } = renderBar();
    const bar = container.querySelector('[style*="width: 50%"]'); // Root is 50%
    fireEvent.mouseEnter(bar, { clientX: 0 });

    // Home segment (40%) should be dimmed
    const homeSegment = container.querySelector('[style*="width: 40%"]');
    expect(homeSegment.style.opacity).toBe('0.6');
  });

  it('restores full opacity on mouse leave', () => {
    const { container } = renderBar();
    const bar = container.querySelector('[style*="width: 50%"]');
    fireEvent.mouseEnter(bar, { clientX: 0 });
    fireEvent.mouseLeave(bar);

    const homeSegment = container.querySelector('[style*="width: 40%"]');
    expect(homeSegment.style.opacity).toBe('1');
  });
});
