import Raven from '../objects/raven'
import Nest from '../objects/nest'
import Item from '../objects/item'
import config from '../config'
import Citizen from '../objects/citizen'
import Shadowblight from '../objects/shadowblight'
import CitizenFactory from '../utils/citizen-factory'
import ItemFactory from '../utils/item-factory'
import StatusBar from '../objects/statusBar'

export default class MainScene extends Phaser.Scene {
  statusBar: StatusBar

  citizenFactory: CitizenFactory
  itemFactory: ItemFactory

  nest: Nest
  raven: Raven
  itemsGroup: Phaser.GameObjects.Group
  citizenGroup: Phaser.GameObjects.Group
  shadowBlightGroup: Phaser.GameObjects.Group
  gameOverText: Phaser.GameObjects.Text
  gameOver: boolean = false

  debugGraphics: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.cameras.main.setBackgroundColor('#909090')

    this.statusBar = new StatusBar(this, config.HEALTH_MAX, config.STAMINA_MAX)

    this.citizenFactory = new CitizenFactory(this)
    this.itemFactory = new ItemFactory(this)

    this.nest = new Nest(this, this.cameras.main.centerX, this.cameras.main.centerY)
    this.raven = new Raven(this, this.cameras.main.centerX, this.cameras.main.centerY)
    this.itemsGroup = this.physics.add.group({ classType: Item, runChildUpdate: true })
    this.citizenGroup = this.physics.add.group({ classType: Citizen, runChildUpdate: true })
    this.shadowBlightGroup = this.physics.add.group({ classType: Shadowblight, runChildUpdate: true })

    this.addShadowblight()

    this.physics.add.overlap(this.raven, this.itemsGroup, this.collectItem)
    this.physics.add.overlap(this.raven, this.nest, this.enterNest)
    this.physics.add.overlap(this.raven, this.citizenGroup, this.alertCitizen)

    this.gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Over', {
      fontSize: '64px',
      color: '#c02060',
      backgroundColor: 'rgba(64,224,162,0.5)'
    })
    this.gameOverText.setOrigin(0.5)
    this.gameOverText.setVisible(false)
  }

  update() {
    if (this.gameOverText.visible) {
      return
    }
    if (this.gameOver) {
      this.gameOverText.setVisible(true)

      this.tweens.pauseAll()
      this.physics.pause()
      this.anims.pauseAll()
      // Stop player input
      this.input.keyboard.removeAllListeners()
      return
    }

    this.raven.update()
    this.statusBar.updateHealth(this.raven.health)
    this.statusBar.updateStamina(this.raven.stamina)

    if (Math.floor(Math.random() * 100) == 1) {
      this.addCitizen()
    }
  }

  addCitizen() {
    if (this.citizenGroup.getChildren().length < config.CITIZEN_MAX_COUNT) {
      const citizen = this.citizenFactory.createCitizen()
      const item = this.itemFactory.createItem(0, 0)
      this.itemsGroup.add(item)
      citizen.giveItem(item)
      this.citizenGroup.add(citizen)
    }
  }

  addShadowblight() {
    const shadowBlight = new Shadowblight(this, Math.floor(Math.random() * 1280), Math.floor(Math.random() * 720))
    this.shadowBlightGroup.add(shadowBlight)
  }

  // Collision handlers

  collectItem = (ravenObj: Phaser.GameObjects.GameObject, item: Phaser.GameObjects.GameObject) => {
    const raven = ravenObj as Raven
    if (raven.z > -10 && raven.collectItem(item as Item)) {
      return true
    }
    return false
  }

  enterNest = (ravenObj: Phaser.GameObjects.GameObject, nest: Phaser.GameObjects.GameObject) => {
    const raven = ravenObj as Raven
    if (raven.z > -10) {
      raven.interactWithNest(nest as Nest)
      return true
    }
    return false
  }

  alertCitizen(ravenObj: Phaser.GameObjects.GameObject, citizenObj: Phaser.GameObjects.GameObject) {
    const citizen = citizenObj as Citizen
    const raven = ravenObj as Raven
    citizen.alert(raven)
  }
}
