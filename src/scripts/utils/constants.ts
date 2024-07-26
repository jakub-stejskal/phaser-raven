import { CitizenType } from './types'

export const MATERIALS = ['Mystic Crystals', 'Precious Metals', 'Ancient Scrolls', 'Herbal Extracts']

export const childCitizen: CitizenType = {
  type: 'Child',
  height: 80,
  width: 40,
  velocity: 60,
  attackRange: 10,
  sprite: 'childNpc'
}
export const fatCitizen: CitizenType = {
  type: 'Fat',
  height: 120,
  width: 100,
  velocity: 40,
  attackRange: 10,
  sprite: 'fatCitizen'
}
export const skinnyCitizen: CitizenType = {
  type: 'Skinny',
  height: 140,
  width: 60,
  velocity: 80,
  attackRange: 10,
  sprite: 'childNpc'
}
