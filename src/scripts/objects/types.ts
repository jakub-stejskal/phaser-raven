export const MATERIALS = ['Mystic Crystals', 'Precious Metals', 'Ancient Scrolls', 'Herbal Extracts']

export type Material = (typeof MATERIALS)[number]

export type UpgradeType = 'Speed' | 'Capacity' | 'Defense' | 'Stamina' | 'Reach'

export type CitizenType = {
  type: string
  height: number
  width: number
  velocity: number
  sprite: string
}

export const childCitizen: CitizenType = { type: 'Child', height: 80, width: 40, velocity: 60, sprite: 'childNpc' }
export const fatCitizen: CitizenType = { type: 'Fat', height: 120, width: 100, velocity: 40, sprite: 'raven-walking' }
export const skinnyCitizen: CitizenType = {
  type: 'Skinny',
  height: 140,
  width: 60,
  velocity: 80,
  sprite: 'raven-flying'
}
