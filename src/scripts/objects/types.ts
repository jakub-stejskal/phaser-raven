export const MATERIALS = ['Mystic Crystals', 'Precious Metals', 'Ancient Scrolls', 'Herbal Extracts']

export type Material = (typeof MATERIALS)[number]

export type UpgradeType = 'Speed' | 'Capacity' | 'Defense' | 'Stamina' | 'Reach'
