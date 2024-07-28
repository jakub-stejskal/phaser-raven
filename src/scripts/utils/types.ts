import { MATERIALS } from './constants'

export type Material = (typeof MATERIALS)[number]

export type UpgradeType = 'Speed' | 'Capacity' | 'Defense' | 'Stamina' | 'Reach'

export type CitizenType = {
  type: string
  height: number
  width: number
  velocity: number
  attackRange: number
  sprite: string
}

export type Recipe = {
  name: string
  essence: number
  materials: { [key: string]: number }
}
