import Raven from '../objects/raven'
import Nest from '../objects/nest'
import Item from '../objects/item'
import config from '../config'
import { MATERIALS } from '../objects/types'
import {
  childCitizen as childCitizen,
  fatCitizen as fatCitizen,
  CitizenType as CitizenType,
  skinnyCitizen as skinnyCitizen
} from '../objects/types'
import Citizen from '../objects/npc'
import Shadowblight from '../objects/shadowblight'

export default class MainScene extends Phaser.Scene {
  healthBar: Phaser.GameObjects.Graphics
  staminaBar: Phaser.GameObjects.Graphics
  raven: Raven
  itemsGroup: Phaser.GameObjects.Group
  citizenGroup: Phaser.GameObjects.Group
  shadowBlightGroup: Phaser.GameObjects.Group
  nest: Nest

  debugGraphics: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.cameras.main.setBackgroundColor('#909090')

    this.healthBar = this.add.graphics()
    this.staminaBar = this.add.graphics()

    this.nest = new Nest(this, this.cameras.main.centerX, this.cameras.main.centerY)
    this.raven = new Raven(this, this.cameras.main.centerX, this.cameras.main.centerY)

    this.itemsGroup = this.physics.add.group({
      classType: Item,
      runChildUpdate: true
    })

    this.citizenGroup = this.physics.add.group({
      classType: Citizen,
      runChildUpdate: true
    })

    this.shadowBlightGroup = this.physics.add.group({
      classType: Shadowblight,
      runChildUpdate: true
    })

    this.addItem()
    this.addCitizen()
    this.addShadowBlight()
    this.updateBars()

    this.physics.add.overlap(this.raven, this.itemsGroup, this.collectItem)
    this.physics.add.overlap(this.raven, this.nest, this.enterNest)
  }

  update() {
    this.raven.update()
    this.updateBars()

    if (Math.floor(Math.random() * 100) == 1) {
      this.addCitizen()
    }

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
      MATERIALS[Math.floor(Math.random() * MATERIALS.length)]
    )
    this.itemsGroup.add(item)
  }

  addCitizen() {
    function generateCitizenType() {
      const typeGenerator = Math.floor(Math.random() * 3)
      switch (typeGenerator) {
        case 0:
          return childCitizen
        case 1:
          return fatCitizen
        case 2:
          return skinnyCitizen
        default:
          return fatCitizen
      }
    }

    const citizenType: CitizenType = generateCitizenType()
    const citizen = new Citizen(this, Math.floor(Math.random() * 1280), Math.floor(Math.random() * 720), citizenType)
    this.citizenGroup.add(citizen)
  }

  addShadowBlight() {
    const shadowBlight = new Shadowblight(this, Math.floor(Math.random() * 1280), Math.floor(Math.random() * 720))
    this.shadowBlightGroup.add(shadowBlight)
  }

  collectItem = (raven: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) => {
    const r = raven as Raven
    if (r.z > -10 && r.collectItem(item as Item)) {
      this.addItem()
      return true
    }
    return false
  }

  enterNest = (raven: Phaser.GameObjects.GameObject, nest: Phaser.GameObjects.GameObject) => {
    const r = raven as Raven
    if (r.z > -10) {
      r.interactWithNest(nest as Nest)
      return true
    }
    return false
  }

  updateBars() {
    // Health Bar Background (max value)
    this.healthBar.clear()
    this.healthBar.fillStyle(0x660000, 1)
    this.healthBar.fillRect(20, 20, 200, 5)

    // Health Bar Current Value
    this.healthBar.fillStyle(0xff0000, 1)
    this.healthBar.fillRect(20, 20, (this.raven.health / config.HEALTH_MAX) * 200, 5)

    // Stamina Bar Background (max value)
    this.staminaBar.clear()
    this.staminaBar.fillStyle(0x666600, 1)
    this.staminaBar.fillRect(20, 30, 200, 5)

    // Stamina Bar Current Value
    this.staminaBar.fillStyle(0xffff00, 1)
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
