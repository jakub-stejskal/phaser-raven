import { CitizenType, Potion } from './types'
import Raven from '../objects/raven'

export const MATERIALS = ['Mystic Crystals', 'Precious Metals', 'Ancient Scrolls', 'Herbal Extracts'] as const

export const POTION_TYPES = [
  'Walking Speed Potion',
  'Flying Speed Potion',
  'Ascend Speed Potion',
  'Shrink Potion',
  'Stamina Potion',
  'Liquid Gold',
  'Liquid Silver',
  'Transmutation'
] as const

export const childCitizen: CitizenType = {
  type: 'Child',
  height: 80,
  width: 40,
  velocity: 60,
  attackRange: 100,
  sprite: 'childNpc'
}
export const fatCitizen: CitizenType = {
  type: 'Fat',
  height: 120,
  width: 100,
  velocity: 40,
  attackRange: 100,
  sprite: 'fatCitizen'
}
export const skinnyCitizen: CitizenType = {
  type: 'Skinny',
  height: 140,
  width: 60,
  velocity: 80,
  attackRange: 100,
  sprite: 'childNpc'
}

// TODO: Name potions, set costs, implement effects
export const POTIONS: Potion[] = [
  {
    name: 'Walking Speed Potion',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Mystic Crystals', cost: 1 },
      { ingredient: 'Precious Metals', cost: 1 }
    ],
    effect: {
      name: 'Walking Speed',
      duration: 10,
      apply: (raven: Raven) => {
        raven.walkingSpeed = raven.walkingSpeed * 1.5
      }
    }
  },
  {
    name: 'Flying Speed Potion',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Mystic Crystals', cost: 1 },
      { ingredient: 'Ancient Scrolls', cost: 1 }
    ],
    effect: {
      name: 'Flying Speed',
      duration: 10,
      apply: (raven: Raven) => {
        raven.flyingSpeed = raven.flyingSpeed * 1.5
      }
    }
  },
  {
    name: 'Ascend Speed Potion',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Mystic Crystals', cost: 1 },
      { ingredient: 'Herbal Extracts', cost: 1 }
    ],
    effect: {
      name: 'Ascend Speed',
      duration: 10,
      apply: (raven: Raven) => {
        raven.ascendSpeed = raven.ascendSpeed * 1.5
      }
    }
  },
  {
    name: 'Shrink Potion',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Precious Metals', cost: 1 },
      { ingredient: 'Ancient Scrolls', cost: 1 }
    ],
    effect: {
      name: 'Shrink',
      duration: 10,
      apply: (raven: Raven) => {
        raven.body.setSize(raven.body.width * 0.5, raven.body.height * 0.5)
      }
    }
  },
  {
    name: 'Stamina Potion',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Precious Metals', cost: 1 },
      { ingredient: 'Herbal Extracts', cost: 1 }
    ],
    effect: {
      name: 'Stamina increase',
      duration: 10,
      apply: (raven: Raven) => {
        raven.stamina = raven.stamina * 1.5
      }
    }
  },
  {
    name: 'Liquid Gold',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Stamina Potion', cost: 1 },
      { ingredient: 'Walking Speed Potion', cost: 1 }
    ],
    effect: {
      name: 'Ingredient for better stuff',
      duration: 10,
      apply: (raven: Raven) => {
        console.log('MADE A LIQUID GOLD POT!')
      }
    }
  },
  {
    name: 'Liquid Silver',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Flying Speed Potion', cost: 1 },
      { ingredient: 'Shrink Potion', cost: 1 }
    ],
    effect: {
      name: 'Ingredient for better stuff',
      duration: 10,
      apply: (raven: Raven) => {
        console.log('MADE A LIQUID SILV POT!')
      }
    }
  },
  {
    name: 'Transmutation',
    essenceCost: 10,
    ingredientCosts: [
      { ingredient: 'Liquid Gold', cost: 1 },
      { ingredient: 'Liquid Silver', cost: 1 }
    ],
    effect: {
      name: 'Ingredient for better stuff',
      duration: 10,
      apply: (raven: Raven) => {
        console.log('WE HAVE TURNED BACK INTO HUMAN!')
        raven.transformed = true
        raven.scene.gameWonTransition()
      }
    }
  }
]
