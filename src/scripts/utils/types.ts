import Raven from '../objects/raven'
import { MATERIALS, POTION_TYPES } from './constants'

export type Material = (typeof MATERIALS)[number]
export type PotionType = (typeof POTION_TYPES)[number]
export type Ingredient = Material | PotionType

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
  name: PotionType
  essenceCost: number
  ingredientCosts: { ingredient: Ingredient; cost: number }[]
  effect: PotionEffect
}

export type PotionEffect = {
  name: string
  duration: number
  apply: (raven: Raven) => void
}
