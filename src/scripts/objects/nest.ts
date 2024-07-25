import Item from './item'
import Raven from './raven'
import { UpgradeType } from './types'

export default class Nest extends Phaser.Physics.Arcade.Sprite {
  essence: number
  materials: { [key: string]: number } // Stores different types of materials and their quantities

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'nest')
    this.essence = 0
    this.materials = {}

    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
  }

  storeItems(items: Item[]): void {
    items.forEach(item => {
      this.essence += item.essenceValue
      this.materials[item.material] = (this.materials[item.material] || 0) + 1
      item.destroy()
    })
  }

  craftUpgrade(upgradeType: UpgradeType): boolean {
    // Implement crafting logic based on the upgrade type and required materials
    // Example: Use essence and specific materials to craft an upgrade
    const upgradeCost = this.getUpgradeCost(upgradeType)
    if (this.canAffordUpgrade(upgradeCost)) {
      this.applyUpgrade(upgradeType)
      this.spendResources(upgradeCost)
      return true
    }
    return false
  }

  getUpgradeCost(upgradeType: UpgradeType): { essence: number; materials: { [key: string]: number } } {
    // Define costs for different upgrades
    // Example structure for costs: { essence: 100, materials: { 'Mystic Crystals': 5, 'Alchemy Powders': 10 } }
    // This is a placeholder implementation
    return { essence: 100, materials: { 'Mystic Crystals': 5, 'Alchemy Powders': 10 } }
  }

  canAffordUpgrade(cost: { essence: number; materials: { [key: string]: number } }): boolean {
    // Check if the nest has enough essence and materials to craft the upgrade
    if (this.essence < cost.essence) return false
    for (const material in cost.materials) {
      if ((this.materials[material] || 0) < cost.materials[material]) return false
    }
    return true
  }

  applyUpgrade(upgradeType: UpgradeType): void {
    // Apply the upgrade effect
    // This is a placeholder implementation
    console.log(`Applied upgrade: ${upgradeType}`)
  }

  spendResources(cost: { essence: number; materials: { [key: string]: number } }): void {
    this.essence -= cost.essence
    for (const material in cost.materials) {
      this.materials[material] -= cost.materials[material]
    }
  }

  healRaven(raven: Raven): void {
    // Heal the raven if it's close to the nest
    if (Phaser.Math.Distance.Between(raven.x, raven.y, this.x, this.y) < 100) {
      raven.recoverHealth(1) // Adjust healing rate as needed
    }
  }
}
