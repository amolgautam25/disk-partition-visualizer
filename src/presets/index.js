/**
 * Common disk partition layout presets.
 * Each preset defines a complete disk configuration.
 */
const PRESETS = [
  {
    id: 'gpt-uefi',
    label: 'GPT (UEFI)',
    description: 'Typical Windows 10/11 UEFI installation on a 500 GB NVMe',
    disk: '500',
    unit: 'GB',
    sector: '512',
    partitions: [
      { name: 'EFI System', startBlock: 2048, endBlock: 1050623 },
      { name: 'Microsoft Reserved', startBlock: 1050624, endBlock: 1083391 },
      { name: 'Windows C:', startBlock: 1083392, endBlock: 671088639 },
      { name: 'Recovery', startBlock: 671088640, endBlock: 976773133 },
    ],
  },
  {
    id: 'mbr-linux',
    label: 'MBR Legacy',
    description: 'Classic Linux installation with boot, root, swap, and home',
    disk: '250',
    unit: 'GB',
    sector: '512',
    partitions: [
      { name: '/boot', startBlock: 2048, endBlock: 1026047 },
      { name: '/', startBlock: 1026048, endBlock: 420456447 },
      { name: 'swap', startBlock: 420456448, endBlock: 437233663 },
      { name: '/home', startBlock: 437233664, endBlock: 488281249 },
    ],
  },
  {
    id: 'dual-boot',
    label: 'Dual Boot',
    description: 'Windows + Linux dual boot on a 1 TB drive',
    disk: '1',
    unit: 'TB',
    sector: '512',
    partitions: [
      { name: 'EFI System', startBlock: 2048, endBlock: 1050623 },
      { name: 'Windows C:', startBlock: 1050624, endBlock: 500000000 },
      { name: 'Linux /', startBlock: 500000001, endBlock: 900000000 },
      { name: 'Linux swap', startBlock: 900000001, endBlock: 932000000 },
      { name: 'Shared Data', startBlock: 932000001, endBlock: 1953525167 },
    ],
  },
  {
    id: 'overlap-demo',
    label: 'Overlap Demo',
    description: 'Demonstrates partition overlap detection',
    disk: '100',
    unit: 'GB',
    sector: '512',
    partitions: [
      { name: 'Partition A', startBlock: 0, endBlock: 100000 },
      { name: 'Partition B', startBlock: 80000, endBlock: 150000 },
      { name: 'Partition C', startBlock: 160000, endBlock: 195312499 },
    ],
  },
];

export default PRESETS;
