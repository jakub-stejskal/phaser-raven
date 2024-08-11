import Item from './item'
import Nest from './nest'
import config from '../config'
import MainScene from '../scenes/mainScene'
import Controls from '../utils/controls'

const SPRITE_SCALE = 4

export default class Raven extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  ravenSprite: Phaser.GameObjects.Sprite
  itemIndicators: Phaser.GameObjects.Ellipse[]

  controls: Controls
  body: Phaser.Physics.Arcade.Body
  scene: MainScene

  items: Item[]
  itemInReach: Item | null
  totalWeight: number
  health: number
  stamina: number
  nest: Phaser.GameObjects.GameObject | null
  z: number
  velocityZ: number

  flyingSpeed: number
  walkingSpeed: number
  ascendSpeed: number

  isFlying: boolean = false
  flyTimer: Phaser.Time.TimerEvent | null = null

  transformed: boolean = false

  debugText = this.scene.add.text(this.x, this.y, '', { fontSize: '12px', color: '#ffffff' })

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    this.z = 0
    this.velocityZ = 0
    this.items = []
    this.totalWeight = 0
    this.health = config.HEALTH_MAX
    this.stamina = config.STAMINA_MAX
    this.flyingSpeed = config.SPEED_FLYING
    this.walkingSpeed = config.SPEED_WALKING
    this.ascendSpeed = config.SPEED_ASCEND
    this.nest = null

    // Add the container to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    // center collision box
    this.body.setSize(40, 40)
    this.body.setOffset(-20, 10)
    this.body.setCollideWorldBounds(true)

    // Initialize raven and its shadow and add them to the container
    const shadowSize = 40
    this.shadow = this.scene.add.ellipse(
      0,
      52,
      shadowSize,
      shadowSize * config.OBJECTS_SHADOW_RATIO,
      0x000000,
      config.OBJECTS_SHADOW_ALPHA
    )
    this.ravenSprite = this.scene.add.sprite(0, -this.z, 'raven-walking')
    this.ravenSprite.setScale(SPRITE_SCALE)
    this.itemIndicators = []
    this.add(this.shadow)
    this.add(this.ravenSprite)

    // Setup controls
    this.controls = new Controls(this.scene)
    this.controls.on('action', this.startFlying, this)
    this.controls.on('actionRelease', this.stopFlying, this)
    this.controls.on('itemAction', this.collectItem, this)

    this.debugText.setDepth(Number.MAX_SAFE_INTEGER)

    // Setup animations
    this.setupAnimations()
  }

  setupAnimations() {
    if (!this.scene.anims.exists('fly')) {
      this.scene.anims.create({
        key: 'fly',
        frames: this.scene.anims.generateFrameNumbers('raven', { start: 2, end: 3 }),
        frameRate: 10,
        repeat: -1
      })
    }
    if (!this.scene.anims.exists('walk')) {
      this.scene.anims.create({
        key: 'walk',
        frames: this.scene.anims.generateFrameNumbers('raven', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
      })
    }
  }

  update() {
    // Reset horizontal velocity
    this.body.setVelocity(0)

    // Calculate speed adjustment based on weight
    const weightFactor = Math.max(config.ITEM_MAX_WEIGHT_FACTOR, 1 - this.totalWeight / config.ITEM_WEIGHT_FACTOR_COEF)
    const speed = this.z < 0 ? this.flyingSpeed * weightFactor : this.walkingSpeed
    const ascendSpeed = this.ascendSpeed * weightFactor

    // Track whether the Raven is moving left or right
    let movingLeft = false
    let movingRight = false

    // Handle left and right movement
    if (this.controls.leftPressed) {
      this.body.setVelocityX(-speed)
      movingLeft = true
    } else if (this.controls.rightPressed) {
      this.body.setVelocityX(speed)
      movingRight = true
    }

    // Handle up and down movement
    if (this.controls.upPressed) {
      this.body.setVelocityY(-speed)
    } else if (this.controls.downPressed) {
      this.body.setVelocityY(speed)
    }

    // Flying logic (adjusts z for height)
    if (this.isFlying) {
      this.velocityZ = -ascendSpeed // Ascend
      this.useStamina(config.STAMINA_USE_FLYING)
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

    // Update animations and flip based on movement direction
    if (this.z === 0) {
      this.ravenSprite.anims.play('walk', true)
      if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        this.ravenSprite.anims.stop()
      }
    }

    // Set the raven sprite's y position to simulate height
    this.ravenSprite.y = this.z

    // Adjust the shadow's scale based on height
    this.shadow.scale = 1 - (Math.abs(this.z) / 200) * 0.5

    // Flip the sprite based on direction
    if (movingLeft) {
      this.ravenSprite.setFlipX(true)
    } else if (movingRight) {
      this.ravenSprite.setFlipX(false)
    }

    this.depth = this.y + this.height / 2

    this.detectNearbyItems()
    this.updateItemIndicators()

    // Recover stamina when not moving or flying
    if (!this.controls.actionPressed) {
      if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        this.recoverStamina(config.STAMINA_RECOVERY_IDLE)
      } else {
        this.recoverStamina(config.STAMINA_RECOVERY_WALKING)
      }
    }
  }

  startFlying() {
    // Require at least 10% stamina to fly
    if (this.stamina > config.STAMINA_MIN_FLY) {
      this.isFlying = true
      this.velocityZ = -this.ascendSpeed // Ascend
      this.useStamina(config.STAMINA_USE_FLYING)
      this.ravenSprite.anims.play('fly', true)
    }
    this.flyTimer = this.scene.time.delayedCall(100, this.stopFlying, [], this)
  }

  stopFlying() {
    if (this.flyTimer) {
      this.flyTimer.remove(false) // Remove the timer without calling the callback
      this.flyTimer = null
    }
    this.isFlying = false
  }

  isInNest(): boolean {
    // check if nest and raven collide
    return (this.nest && this.scene.physics.overlap(this, this.nest)) ?? false
  }

  detectNearbyItems() {
    // Reset the nearbyItem to null before checking
    this.itemInReach = null

    this.scene.physics.overlap(this, this.scene.itemsGroup, (_, itemObject) => {
      const item = itemObject as Item

      if (this.z > -10 && !item.owner?.isGuarded) {
        // Set the itemInReach to the first overlapping item found
        this.itemInReach = item
      }
    })

    // TODO: provide feedback to the player when an item is nearby
    // if (this.itemInReach) {}
  }

  collectItem(): boolean {
    console.log('collectItem', this.itemInReach, this.itemInReach?.owner?.isGuarded)
    if (!this.itemInReach || this.itemInReach?.owner?.isGuarded || this.items.length >= config.ITEM_MAX_CARRIED) {
      return false
    }
    console.log('collectItem success')
    this.items.push(this.itemInReach)
    this.totalWeight += this.itemInReach.weight
    this.itemInReach.destroy()
    this.itemInReach = null
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
