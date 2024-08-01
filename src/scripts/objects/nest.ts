import MainScene from '../scenes/mainScene'
import Item from './item'
import Raven from './raven'
import { Ingredient } from '../utils/types'

export default class Nest extends Phaser.Physics.Arcade.Sprite {
  scene: MainScene
  essence: number
  ingredients: Partial<{ [ingredient in Ingredient]: number }>
  essenceText: Phaser.GameObjects.Text
  materialsText: Phaser.GameObjects.Text

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'nest')
    this.setScale(4)
    this.essence = 0
    this.ingredients = {
      'Mystic Crystals': 0,
      'Precious Metals': 0,
      'Ancient Scrolls': 0,
      'Herbal Extracts': 0
    }

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    const RESOURCES_OFFSET = 80
    this.essenceText = this.scene.add.text(this.x - this.width / 2 - RESOURCES_OFFSET, this.y + 50, '', {
      fontSize: '14px',
      color: '#ffffff'
    })
    this.materialsText = this.scene.add.text(this.x - this.width / 2 - RESOURCES_OFFSET, this.y + 70, '', {
      fontSize: '14px',
      color: '#ffffff'
    })
    this.updateResourceDisplay()
  }

  storeItems(items: Item[]): void {
    items.forEach(item => {
      this.essence += item.essenceValue
      this.ingredients[item.material] = (this.ingredients[item.material] || 0) + 1
    })
    this.updateResourceDisplay()

    // win if collected 1000 essence
    if (this.essence >= 1000) {
      this.scene.gameWonTransition()
    }
  }

  healRaven(raven: Raven): void {
    // Heal the raven if it's close to the nest
    if (Phaser.Math.Distance.BetweenPoints(raven, this) < 100) {
      raven.recoverHealth(1) // Adjust healing rate as needed
    }
  }

  updateResourceDisplay(): void {
    this.essenceText.setText(`Essence: ${this.essence}`)
    this.materialsText.setText(
      `Materials: \n${Object.keys(this.ingredients)
        .map(key => `${key}: ${this.ingredients[key]}`)
        .join('\n')}`
    )
  }
}
