/**
 * Partition color palette. Each partition gets a color by index mod length.
 */
export const PARTITION_COLORS = [
  '#0a84ff', // Blue
  '#30d158', // Green
  '#ff9f0a', // Orange
  '#bf5af2', // Purple
  '#ff453a', // Red
  '#64d2ff', // Cyan
  '#ffd60a', // Yellow
  '#5e5ce6', // Indigo
  '#ff375f', // Pink
  '#32ade6', // Teal
  '#ac8e68', // Brown
  '#63e6e2', // Mint
  '#ff6961', // Salmon
  '#b4d455', // Lime
  '#ff9500', // Amber
];

export const UNALLOC_COLOR = '#3a3a3c';
export const OVERLAP_COLOR = '#ff453a';

/**
 * Available sector sizes in bytes.
 */
export const SECTOR_SIZES = [256, 512, 1024, 2048, 4096];

/**
 * Disk size unit multipliers.
 */
export const SIZE_UNITS = {
  B: 1,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
};
