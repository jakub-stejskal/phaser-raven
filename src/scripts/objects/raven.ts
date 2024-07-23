import Item from './item'
import Nest from './nest'

interface WASD {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

export default class Raven extends Phaser.Physics.Arcade.Sprite {
  shadow: Phaser.GameObjects.Ellipse
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  wasd: WASD
  body: Phaser.Physics.Arcade.Body
  items: Item[]
  maxHealth: number
  health: number
  maxStamina: number
  stamina: number
  nest: Phaser.GameObjects.GameObject | null

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'raven-walking')
    this.scene = scene

    // Add the player to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)

    // Create shadow
    this.shadow = this.scene.add.ellipse(x, y + 20, 40, 20, 0x000000, 0.5)

    // Setup controls
    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.wasd = this.scene.input.keyboard.addKeys('W,A,S,D') as WASD

    // Initialize item collection, health, and stamina
    this.items = []
    this.maxHealth = 100
    this.health = this.maxHealth
    this.maxStamina = 100
    this.stamina = this.maxStamina
    this.nest = null // Nest object will be assigned later

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
    this.body.setVelocity(0)

    // Movement by WASD
    if (this.wasd.A.isDown) {
      this.body.setVelocityX(-100)
      this.useStamina(0.1)
    } else if (this.wasd.D.isDown) {
      this.body.setVelocityX(100)
      this.useStamina(0.1)
    }

    if (this.wasd.W.isDown) {
      this.body.setVelocityY(-100)
      this.useStamina(0.1)
    } else if (this.wasd.S.isDown) {
      this.body.setVelocityY(100)
      this.useStamina(0.1)
    }

    // Flying up by SPACE
    if (this.cursors.space.isDown && this.stamina > 0) {
      this.body.setVelocityY(-200)
      this.anims.play('fly', true)
      this.useStamina(1)
    } else {
      if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        this.anims.play('walk', true)
      } else {
        this.anims.stop()
      }
    }

    // Recover stamina when not moving
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0 && this.cursors.space.isUp) {
      this.recoverStamina(0.5)
    }

    // Update shadow position
    this.shadow.setPosition(this.x, this.y + 20)
  }

  collectItem(item: Item) {
    this.items.push(item)
    item.destroy()
  }

  interactWithNest(nest: Nest) {
    this.nest = nest
    // Example: deposit all items in the nest
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
    this.health = Phaser.Math.Clamp(this.health + amount, 0, this.maxHealth)
  }

  useStamina(amount: number) {
    this.stamina -= amount
    if (this.stamina < 0) {
      this.stamina = 0
    }
  }

  recoverStamina(amount: number) {
    this.stamina = Phaser.Math.Clamp(this.stamina + amount, 0, this.maxStamina)
  }

  die() {
    // Handle player's death (e.g., reset position, reduce score, etc.)
  }
}
