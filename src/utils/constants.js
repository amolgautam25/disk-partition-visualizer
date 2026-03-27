/**
 * Partition color palette. Each partition gets a color by index mod length.
 */
export const PARTITION_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#E11D48', '#7C3AED', '#0EA5E9', '#D946EF', '#84CC16',
];

export const UNALLOC_COLOR = '#1E293B';
export const OVERLAP_COLOR = '#DC2626';

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
