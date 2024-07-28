import Raven from '../objects/raven'
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

export type Potion = {
  name: string
  essence: number
  materials: { material: Material; cost: number }[]
  effect: PotionEffect
}

export type PotionEffect = {
  name: string
  duration: number
  apply: (raven: Raven) => void
}
