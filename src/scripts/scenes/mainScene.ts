import Raven from '../objects/raven'
import Nest from '../objects/nest'
import Item from '../objects/item'
import config from '../config'

export default class MainScene extends Phaser.Scene {
  healthBar: Phaser.GameObjects.Graphics
  staminaBar: Phaser.GameObjects.Graphics
  raven: Raven
  itemsGroup: Phaser.GameObjects.Group
  nest: Nest

  debugGraphics: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.cameras.main.setBackgroundColor('#909090')

    this.healthBar = this.add.graphics()
    this.staminaBar = this.add.graphics()

    this.raven = new Raven(this, this.cameras.main.centerX, this.cameras.main.centerY)

    this.itemsGroup = this.physics.add.group({
      classType: Item,
      runChildUpdate: true
    })

    this.addItem()
    this.updateBars()

    this.physics.add.overlap(this.raven, this.itemsGroup, this.collectItem)
    this.physics.add.overlap(this.raven, this.nest, this.enterNest)
  }

  update() {
    this.raven.update()
    this.updateBars()

    if (config.DEBUG) {
      this.updateDebugGraphics()
    }
  }

  addItem() {
    const frameName = `items_4x${Math.floor(Math.random() * 64)}.png`
    const item = new Item(
      this,
      Math.floor(Math.random() * 1280),
      Math.floor(Math.random() * 720),
      'itemsAtlas',
      frameName,
      'Mystic Crystals'
    )
    this.itemsGroup.add(item)
  }

  collectItem(raven: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) {
    const r = raven as Raven
    if (r.z > -10) {
      console.log('Raven collected item', item)
      r.collectItem(item as Item)
      this.addItem()
      return true
    }
    return false
  }

  enterNest(raven: Phaser.GameObjects.GameObject, nest: Phaser.GameObjects.GameObject) {
    const r = raven as Raven
    if (r.z > -10) {
      console.log('Raven interacted with nest')
      r.interactWithNest(nest as Nest)
      return true
    }
    return false
  }

  updateBars() {
    // Health Bar
    this.healthBar.clear()
    this.healthBar.fillStyle(0x990000, 1)
    this.healthBar.fillRect(20, 20, (this.raven.health / config.HEALTH_MAX) * 200, 5)

    // Stamina Bar
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0xdddd00, 1)
    this.staminaBar.fillRect(20, 30, (this.raven.stamina / config.STAMINA_MAX) * 200, 5)
  }

  updateDebugGraphics() {
    // Redraw line for debugging
    this.debugGraphics.forEach(g => g.clear())
    this.debugGraphics = []
    this.drawDebugLineY(this.raven.y, 0xff0000)

    // print out the raven's position and velocity
    this.add.text(20, 50, `x: ${this.raven.x.toFixed(2)}, y: ${this.raven.y.toFixed(2)}`, {
      fontSize: '16px',
      color: '#ffffff'
    })
  }

  drawDebugLineY(y: number, color: number) {
    this.debugGraphics.push(this.add.graphics().lineStyle(1, color).lineBetween(0, y, 1280, y))
  }
}
