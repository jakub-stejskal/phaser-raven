import PhaserLogo from '../objects/phaserLogo'
import FpsText from '../objects/fpsText'
import Raven from '../objects/raven'
import Nest from '../objects/nest'
import Item from '../objects/item'

export default class MainScene extends Phaser.Scene {
  fpsText: FpsText
  healthBar: Phaser.GameObjects.Graphics
  staminaBar: Phaser.GameObjects.Graphics
  raven: Raven
  itemsGroup: Phaser.GameObjects.Group
  nest: Nest

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.fpsText = new FpsText(this)

    this.healthBar = this.add.graphics()
    this.staminaBar = this.add.graphics()
    this.raven = new Raven(this, 100, 100)

    this.updateBars()

    this.physics.add.overlap(
      this.raven,
      this.itemsGroup,
      (raven: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) => {
        ;(raven as Raven).collectItem(item as Item)
      }
    )

    this.physics.add.overlap(
      this.raven,
      this.nest,
      (raven: Phaser.GameObjects.GameObject, nest: Phaser.GameObjects.GameObject) => {
        ;(raven as Raven).interactWithNest(nest as Nest)
      }
    )
  }

  update() {
    this.raven.update()
    this.updateBars()
  }

  updateBars() {
    // Health Bar
    this.healthBar.clear()
    this.healthBar.fillStyle(0xff0000, 1)
    this.healthBar.fillRect(20, 20, (this.raven.health / this.raven.maxHealth) * 200, 20)

    // Stamina Bar
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0x00ff00, 1)
    this.staminaBar.fillRect(20, 50, (this.raven.stamina / this.raven.maxStamina) * 200, 20)
  }
}
