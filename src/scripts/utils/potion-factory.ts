import Raven from '../objects/raven'
import { Potion } from './types'

// TODO: Name potions, set costs, implement effects
const POTIONS: Potion[] = [
  {
    name: 'Walking Speed Potion',
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Precious Metals', cost: 5 }
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
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Ancient Scrolls', cost: 5 }
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
    name: 'Ascend speed potion',
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Herbal Extracts', cost: 5 }
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
    essence: 10,
    materials: [
      { material: 'Precious Metals', cost: 5 },
      { material: 'Ancient Scrolls', cost: 5 }
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
    name: 'Recipe 5',
    essence: 10,
    materials: [
      { material: 'Precious Metals', cost: 5 },
      { material: 'Herbal Extracts', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
    }
  },
  {
    name: 'Recipe 6',
    essence: 10,
    materials: [
      { material: 'Ancient Scrolls', cost: 5 },
      { material: 'Herbal Extracts', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
    }
  }
]

const getRecipes = () => POTIONS
export default getRecipes
