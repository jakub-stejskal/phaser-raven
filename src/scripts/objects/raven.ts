import Item from './item'
import Nest from './nest'
import config from '../config'
import MainScene from '../scenes/mainScene'
import { Potion } from '../utils/types'

interface WASD {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

export default class Raven extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  ravenSprite: Phaser.GameObjects.Sprite
  itemIndicators: Phaser.GameObjects.Ellipse[]

  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  keys: WASD
  body: Phaser.Physics.Arcade.Body
  scene: MainScene

  items: Item[]
  totalWeight: number
  health: number
  stamina: number
  nest: Phaser.GameObjects.GameObject | null
  z: number
  velocityZ: number

  debugText = this.scene.add.text(this.x, this.y, '', { fontSize: '12px', color: '#ffffff' })

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.z = 0
    this.velocityZ = 0
    this.items = []
    this.totalWeight = 0
    this.health = config.HEALTH_MAX
    this.stamina = config.STAMINA_MAX
    this.nest = null

    // Add the container to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    // center collision box
    this.body.setSize(40, 40)
    this.body.setOffset(-20, -10)
    this.body.setCollideWorldBounds(true)

    // Initialize raven and its shadow and add them to the container
    this.shadow = this.scene.add.ellipse(0, 20, 40, 20, 0x000000, config.OBJECTS_SHADOW_ALPHA)
    this.ravenSprite = this.scene.add.sprite(0, -this.z, 'raven-walking')
    this.itemIndicators = []
    this.add(this.shadow)
    this.add(this.ravenSprite)

    // Setup controls
    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.keys = this.scene.input.keyboard.addKeys('W,A,S,D') as WASD

    this.debugText.setDepth(Number.MAX_SAFE_INTEGER)

    // Setup animations
    this.setupAnimations()
  }

  setupAnimations() {
    if (!this.scene.anims.exists('raven-flying')) {
      this.scene.anims.create({
        key: 'fly',
        frames: this.scene.anims.generateFrameNumbers('raven-flying', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      })
    }
    if (!this.scene.anims.exists('raven-walking')) {
      this.scene.anims.create({
        key: 'walk',
        frames: this.scene.anims.generateFrameNumbers('raven-walking', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      })
    }
  }

  update() {
    // Reset horizontal velocity
    this.body.setVelocity(0)

    // Calculate speed adjustment based on weight
    const weightFactor = Math.max(config.ITEM_MAX_WEIGHT_FACTOR, 1 - this.totalWeight / config.ITEM_WEIGHT_FACTOR_COEF) //
    const walkingSpeed = this.z < 0 ? config.SPEED_FLYING * weightFactor : config.SPEED_WALKING
    const ascendSpeed = config.SPEED_ASCEND * weightFactor

    if (this.keys.A.isDown) {
      this.body.setVelocityX(-walkingSpeed)
    } else if (this.keys.D.isDown) {
      this.body.setVelocityX(walkingSpeed)
    }
    if (this.keys.W.isDown) {
      this.body.setVelocityY(-walkingSpeed)
    } else if (this.keys.S.isDown) {
      this.body.setVelocityY(walkingSpeed)
    }

    // Flying logic (adjusts z for height)
    if (this.cursors.space.isDown && this.stamina > 0) {
      this.velocityZ = -ascendSpeed // Ascend
      this.useStamina(config.STAMINA_USE_FLYING)
      this.ravenSprite.anims.play('fly', true)
    } else {
      this.velocityZ += config.SPEED_GRAVITY // Gravity effect
    }
    this.z += (this.velocityZ * this.scene.game.loop.delta) / 1000
    // Prevent raven from going below ground (z = 0)
    if (this.z > 0) {
      this.z = 0
      this.velocityZ = 0
    } else if (this.velocityZ > 0) {
      this.ravenSprite.anims.stop()
    }

    if (this.z === 0) {
      this.ravenSprite.anims.play('walk', true)
      if (this.body.velocity.x === 0 && this.body.velocity.y == 0) {
        this.ravenSprite.anims.stop()
      }
    }

    // Set the raven sprite's y position to simulate height
    this.ravenSprite.y = this.z

    // Adjust the shadow's scale based on height
    this.shadow.scale = 1 - (Math.abs(this.z) / 200) * 0.5

    this.depth = this.y + this.height / 2

    this.updateItemIndicators()

    // Recover stamina when not moving or flying
    if (this.cursors.space.isUp) {
      if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        this.recoverStamina(config.STAMINA_RECOVERY_IDLE)
      } else {
        this.recoverStamina(config.STAMINA_RECOVERY_WALKING)
      }
    }
  }

  //
  isInNest(): boolean {
    // check if nest and raven collide
    return (this.nest && this.scene.physics.overlap(this, this.nest)) ?? false
  }

  collectItem(item: Item): boolean {
    if (item.owner?.isGuarded) return false
    if (this.items.length >= config.ITEM_MAX_CARRIED) return false

    this.items.push(item)
    this.totalWeight += item.weight
    item.destroy()
    return true
  }

  interactWithNest(nest: Nest) {
    this.nest = nest
    nest.storeItems(this.items)
    nest.healRaven(this)
    this.items = []
    this.totalWeight = 0
  }

  takeDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.die()
    }
    this.scene.flashDamage()
  }

  recoverHealth(amount: number) {
    this.health = Phaser.Math.Clamp(this.health + amount, 0, config.HEALTH_MAX)
  }

  useStamina(amount: number) {
    this.stamina -= amount
    if (this.stamina < 0) {
      this.stamina = 0
    }
  }

  recoverStamina(amount: number) {
    this.stamina = Phaser.Math.Clamp(this.stamina + amount, 0, config.STAMINA_MAX)
  }

  // TODO: Move the indicators to a group with the raven for better performance and management
  updateItemIndicators() {
    // Remove existing indicators
    this.itemIndicators.forEach(indicator => indicator.destroy())
    this.itemIndicators = []

    // Add new indicators based on the number of items
    for (let i = 0; i < this.items.length; i++) {
      const offset = i * 10 - (this.items.length - 1) * 5 // Center the indicators
      // Position the indicators below the raven sprite
      const indicator = this.scene.add.ellipse(offset, this.z, 5, 5, 0xffff00)
      this.itemIndicators.push(indicator)
      this.add(indicator)
    }
  }

  die() {
    //TODO not sure this is the correct way to do it. Maybe add a "dead" flag and check it in the MainScene?
    this.scene.gameOver = true
    // wait for a few seconds before restarting the scene
    this.scene.time.delayedCall(3000, () => {
      this.scene.gameOver = false
      this.scene.scene.restart()
    })
    // Handle player's death (e.g., reset position, reduce score, etc.)
  }
}
