import Item from './item'
import Nest from './nest'
import config from '../config'

interface WASD {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

export default class Raven extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  ravenSprite: Phaser.GameObjects.Sprite
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  keys: WASD
  body: Phaser.Physics.Arcade.Body
  items: Item[]
  health: number
  stamina: number
  nest: Phaser.GameObjects.GameObject | null
  z: number
  velocityZ: number

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.scene = scene
    this.z = 0
    this.velocityZ = 0
    this.items = []
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
    this.shadow = this.scene.add.ellipse(0, 20, 40, 20, 0x000000, 0.2)
    this.ravenSprite = this.scene.add.sprite(0, -this.z, 'raven-walking')
    this.add(this.shadow)
    this.add(this.ravenSprite)

    // Setup controls
    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.keys = this.scene.input.keyboard.addKeys('W,A,S,D') as WASD

    // Setup animations
    this.setupAnimations()
  }

  setupAnimations() {
    this.scene.anims.create({
      key: 'fly',
      frames: this.scene.anims.generateFrameNumbers('raven-flying', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.scene.anims.create({
      key: 'walk',
      frames: this.scene.anims.generateFrameNumbers('raven-walking', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })
  }

  update() {
    // Reset horizontal velocity
    this.body.setVelocity(0)

    // Ground movement (affects the container's position)
    const speed = this.z < 0 ? config.SPEED_FLYING : config.SPEED_WALKING
    if (this.keys.A.isDown) {
      this.body.setVelocityX(-speed)
    } else if (this.keys.D.isDown) {
      this.body.setVelocityX(speed)
    }
    if (this.keys.W.isDown) {
      this.body.setVelocityY(-speed)
    } else if (this.keys.S.isDown) {
      this.body.setVelocityY(speed)
    }

    // Flying logic (adjusts z for height)
    if (this.cursors.space.isDown && this.stamina > 0) {
      this.velocityZ = -config.SPEED_ASCEND // Ascend
      this.useStamina(config.STAMINA_USE_FLYING)
    } else {
      this.velocityZ += config.SPEED_GRAVITY // Gravity effect
    }
    this.z += (this.velocityZ * this.scene.game.loop.delta) / 1000
    // Prevent raven from going below ground (z = 0)
    if (this.z > 0) {
      this.z = 0
      this.velocityZ = 0
    }

    // Set the raven sprite's y position to simulate height
    this.ravenSprite.y = this.z

    // Adjust the shadow's scale based on height
    this.shadow.scale = 1 - (Math.abs(this.z) / 200) * 0.5

    // Recover stamina when not moving or flying
    if (this.cursors.space.isUp) {
      if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        this.recoverStamina(config.STAMINA_RECOVERY_IDLE)
      } else {
        this.recoverStamina(config.STAMINA_RECOVERY_WALKING)
      }
    }
  }

  collectItem(item: Item) {
    this.items.push(item)
    item.destroy()
  }

  interactWithNest(nest: Nest) {
    this.nest = nest
    nest.storeItems(this.items)
    this.items = []
  }

  takeDamage(amount: number) {
    this.health -= amount
    if (this.health <= 0) {
      this.die()
    }
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

  die() {
    // Handle player's death (e.g., reset position, reduce score, etc.)
  }
}
