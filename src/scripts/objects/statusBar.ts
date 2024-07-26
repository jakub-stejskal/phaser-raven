// status-bar.ts
import { Scene } from 'phaser'

export default class StatusBar {
  private scene: Scene
  private healthBar: Phaser.GameObjects.Graphics
  private staminaBar: Phaser.GameObjects.Graphics
  private maxHealth: number
  private maxStamina: number

  constructor(scene: Scene, maxHealth: number, maxStamina: number) {
    this.scene = scene
    this.maxHealth = maxHealth
    this.maxStamina = maxStamina

    this.healthBar = this.scene.add.graphics()
    this.staminaBar = this.scene.add.graphics()
  }

  updateHealth(currentHealth: number) {
    this.healthBar.clear()
    this.healthBar.fillStyle(0x660000, 1)
    this.healthBar.fillRect(20, 20, 200, 5)
    this.healthBar.fillStyle(0xff0000, 1)
    this.healthBar.fillRect(20, 20, (currentHealth / this.maxHealth) * 200, 5)
  }

  updateStamina(currentStamina: number) {
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0x666600, 1)
    this.staminaBar.fillRect(20, 30, 200, 5)
    this.staminaBar.fillStyle(0xffff00, 1)
    this.staminaBar.fillRect(20, 30, (currentStamina / this.maxStamina) * 200, 5)
  }
}
