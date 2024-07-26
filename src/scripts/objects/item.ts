import { Material } from '../utils/types'

export default class Item extends Phaser.Physics.Arcade.Sprite {
  material: Material
  weight: number
  essenceValue: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: string,
    material: Material,
    weight: number = 1
  ) {
    super(scene, x, y, texture, frame)
    this.material = material
    this.weight = weight
    this.essenceValue = this.calculateEssenceValue(material, weight)

    // Add the item to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
  }

  calculateEssenceValue(material: Material, weight: number): number {
    // Calculate the essence value based on the type and weight
    switch (material) {
      case 'Mystic Crystals':
        return weight * 10
      case 'Precious Metals':
        return weight * 7
      case 'Ancient Scrolls':
        return weight * 15
      case 'Herbal Extracts':
        return weight * 5
      default:
        return weight // Default essence value
    }
  }
}
