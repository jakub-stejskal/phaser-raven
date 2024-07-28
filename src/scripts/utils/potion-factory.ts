import Raven from '../objects/raven'
import { Potion } from './types'

// TODO: Name potions, set costs, implement effects
const POTIONS: Potion[] = [
  {
    name: 'Recipe 1',
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Precious Metals', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
    }
  },
  {
    name: 'Recipe 2',
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Ancient Scrolls', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
    }
  },
  {
    name: 'Recipe 3',
    essence: 10,
    materials: [
      { material: 'Mystic Crystals', cost: 5 },
      { material: 'Herbal Extracts', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
    }
  },
  {
    name: 'Recipe 4',
    essence: 10,
    materials: [
      { material: 'Precious Metals', cost: 5 },
      { material: 'Ancient Scrolls', cost: 5 }
    ],
    effect: {
      name: 'Speed',
      duration: 10,
      apply: (raven: Raven) => {}
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
