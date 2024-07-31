import Raven from '../objects/raven'
import Nest from '../objects/nest'
import Item from '../objects/item'
import config from '../config'
import Citizen from '../objects/citizen'
import Shadowblight from '../objects/shadowblight'
import CitizenFactory from '../utils/citizen-factory'
import ItemFactory from '../utils/item-factory'
import StatusBar from '../objects/statusBar'
import { random } from '../utils/math'
import Cat from '../objects/cat'

const CONTROLS_TIP_MAIN = 'W/A/S/D: Walk      SPACE: Fly     SHIFT: Enter the Nest'
const CONTROLS_TIP_NEST = 'W/A/S/D: Navigate  SPACE: Select  ENTER: Drink a Potion SHIFT: Exit the Nest '

export default class MainScene extends Phaser.Scene {
  statusBar: StatusBar

  citizenFactory: CitizenFactory
  itemFactory: ItemFactory

  nest: Nest
  raven: Raven
  itemsGroup: Phaser.GameObjects.Group
  citizenGroup: Phaser.GameObjects.Group
  shadowBlightGroup: Phaser.GameObjects.Group
  catGroup: Phaser.GameObjects.Group
  gameOverText: Phaser.GameObjects.Text
  gameOver: boolean = false

  damageOverlay: Phaser.GameObjects.Graphics
  debugGraphics: Phaser.GameObjects.Graphics[] = []
  controlsTip: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    this.cameras.main.setBackgroundColor('#909090')
    const background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'ground')
    background.setOrigin(0.5, 0.5)
    background.setDisplaySize(this.cameras.main.width, this.cameras.main.height) // Scale the image to fit the screen

    this.statusBar = new StatusBar(this, config.HEALTH_MAX, config.STAMINA_MAX)

    this.citizenFactory = new CitizenFactory(this)
    this.itemFactory = new ItemFactory(this)

    this.nest = new Nest(this, this.cameras.main.width - config.NEST_WIDTH / 2, config.NEST_HEIGHT / 2)
    this.raven = new Raven(this, this.cameras.main.width - config.NEST_WIDTH / 2 - 100, config.NEST_HEIGHT / 2)
    this.itemsGroup = this.physics.add.group({ classType: Item, runChildUpdate: true })
    this.citizenGroup = this.physics.add.group({ classType: Citizen, runChildUpdate: true })
    this.shadowBlightGroup = this.physics.add.group({ classType: Shadowblight, runChildUpdate: true })
    this.catGroup = this.physics.add.group({ classType: Cat, runChildUpdate: true })

    this.addShadowblight()
    this.addCat()

    // // TODO: Remove this. For testing purposes only
    // const item = this.itemFactory.createItem(0, 0)
    // this.itemsGroup.add(item)
    // const citizen = new Citizen(this, 0, 0, config.SCENE_WIDTH, config.SCENE_HEIGHT, fatCitizen)
    // citizen.giveItem(item)
    // this.citizenGroup.add(citizen)

    this.input.keyboard.on('keydown-SHIFT', () => {
      if (this.raven.isInNest()) {
        this.enterLabTransition()
      }
    })
    this.events.on('resume', this.handleResume, this)

    // Collision handlers
    this.physics.add.overlap(this.raven, this.itemsGroup, this.collectItem, undefined, this)
    this.physics.add.overlap(this.raven, this.nest, this.enterNest, undefined, this)
    this.physics.add.overlap(this.raven, this.citizenGroup, this.alertCitizen, undefined, this)

    // Graphics
    this.addDamageOverlay()
    this.addGameOverText()
    this.addControlsTip()

    if (config.DEBUG) this.addDebugGraphics()
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

    if (random(0, config.CITIZEN_FREQUENCY) == 1) {
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
    const PADDING = 100
    const shadowBlight = new Shadowblight(
      this,
      config.SCENE_WIDTH / 2,
      config.SCENE_HEIGHT / 2
      // random(PADDING, config.SCENE_WIDTH - PADDING),
      // random(PADDING, config.SCENE_HEIGHT - PADDING)
    )
    this.shadowBlightGroup.add(shadowBlight)
  }

  addCat() {
    const PADDING = 100
    const cat = new Cat(
      this,
      PADDING,
      config.SCENE_HEIGHT - PADDING
      // random(PADDING, config.SCENE_WIDTH - PADDING),
      // random(PADDING, config.SCENE_HEIGHT - PADDING)
    )
    this.catGroup.add(cat)
  }

  // Scene transitions

  gameOverTransition() {
    this.gameOver = true
  }

  gameWonTransition() {
    this.scene.launch('EndingScene')
  }

  enterLabTransition() {
    this.controlsTip.text = CONTROLS_TIP_NEST
    this.scene.pause()
    this.scene.launch('LabScene', { raven: this.raven, nest: this.nest })
  }

  handleResume() {
    this.controlsTip.text = CONTROLS_TIP_MAIN
  }

  // Collision handlers

  collectItem(ravenObj: Phaser.GameObjects.GameObject, itemObj: Phaser.GameObjects.GameObject) {
    const raven = ravenObj as Raven
    const item = itemObj as Item

    if (raven.z > -10 && raven.collectItem(item)) {
      return true
    }
    return false
  }

  enterNest(ravenObj: Phaser.GameObjects.GameObject, nest: Phaser.GameObjects.GameObject) {
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

  // Graphics

  addControlsTip() {
    this.controlsTip = this.add
      .text(this.cameras.main.width / 2, this.cameras.main.height - 30, CONTROLS_TIP_MAIN, {
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5, 0.5)
  }

  addDamageOverlay() {
    this.damageOverlay = this.add.graphics()
    this.damageOverlay.fillStyle(0xff0000, 0.5)
    this.damageOverlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height)
    this.damageOverlay.setAlpha(0)
  }

  addGameOverText() {
    this.gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Over', {
      fontSize: '64px',
      color: '#c02060',
      backgroundColor: 'rgba(64,224,162,0.5)'
    })
    this.gameOverText.setOrigin(0.5)
    this.gameOverText.setVisible(false)
  }

  addDebugGraphics() {
    // Create a graphics object for drawing
    const graphics = this.add.graphics()
    // Draw vertical line at x = sceneWidth - config.NEST_WIDTH
    graphics.lineStyle(2, 0x0000ff).beginPath()
    graphics.moveTo(config.SCENE_WIDTH - config.NEST_WIDTH, 0)
    graphics.lineTo(config.SCENE_WIDTH - config.NEST_WIDTH, config.SCENE_HEIGHT)
    graphics.strokePath() // Apply the line style and draw the line
    // Draw horizontal line at y = config.NEST_HEIGHT
    graphics.lineStyle(2, 0x0000ff).beginPath()
    graphics.moveTo(0, config.NEST_HEIGHT)
    graphics.lineTo(config.SCENE_WIDTH, config.NEST_HEIGHT) // Fix this to use scene width, not height
    graphics.strokePath() // Apply the line style and draw the line
  }

  flashDamage() {
    if (this.gameOver) {
      return
    }

    this.damageOverlay.setAlpha(1)
    this.tweens.add({
      targets: this.damageOverlay,
      alpha: 0,
      duration: 200,
      ease: 'Power2'
    })
  }
}
