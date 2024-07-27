import Item from './item'
import Raven from './raven'
import { CitizenType as CitizenType } from '../utils/types'

export default class Citizen extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  citizenSprite: Phaser.GameObjects.Sprite
  citizenType: CitizenType
  body: Phaser.Physics.Arcade.Body
  items: Item[]
  isGuarded: boolean
  isWalking: boolean
  alertTimer: Phaser.Time.TimerEvent
  attackCooldownTimer: Phaser.Time.TimerEvent

  debugText = this.scene.add.text(this.x, this.y, '', { fontSize: '12px', color: '#ffffff' })

  targetX: number
  targetY: number

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, citizenType: CitizenType) {
    super(scene, x, y)

    this.targetX = targetX
    this.targetY = targetY
    this.items = [] // Assuming each citizen carries one item for now
    this.citizenType = citizenType
    this.isGuarded = false
    this.isWalking = false

    // Add the container to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    // center collision box
    this.body.setSize(this.citizenType.width, this.citizenType.height)
    this.body.setOffset(-this.citizenType.width / 2, -this.citizenType.height / 2)

    // Initialize citizen and its shadow and add them to the container
    this.shadow = this.scene.add.ellipse(
      0,
      this.citizenType.height / 2,
      this.citizenType.width,
      this.citizenType.height / 2,
      0x000000,
      0.2
    )
    this.citizenSprite = this.scene.add.sprite(0, 0, citizenType.sprite)
    this.add(this.shadow)
    this.add(this.citizenSprite)

    this.debugText.setDepth(Number.MAX_SAFE_INTEGER)

    // Setup animations
    this.setupAnimations()

    // Start walking across the screen
    this.startWalking()
  }

  setupAnimations() {
    if (!this.scene.anims.exists(`npc-walk-${this.citizenType.sprite}`)) {
      this.scene.anims.create({
        key: `npc-walk-${this.citizenType.sprite}`,
        frames: this.scene.anims.generateFrameNumbers(this.citizenType.sprite, { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      })
    }
  }

  startWalking() {
    this.isWalking = true
  }

  update() {
    if (this.isWalking) {
      this.scene.physics.moveTo(this, this.targetX, this.targetY, this.citizenType.velocity)
    }

    if (!this.isGuarded) {
      this.citizenSprite.anims.play(`npc-walk-${this.citizenType.sprite}`, true)
    }

    // Check if the citizen has reached the target position
    if (Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY) < 5) {
      this.destroy()
    }

    this.depth = this.y + this.height / 2
  }

  alert(raven: Raven) {
    if (!this.isGuarded) {
      this.isGuarded = true
      this.citizenSprite.setTint(0xff0000) // Change color to indicate alert status
      this.stopMoving()

      // Revert back to normal after a certain time
      this.alertTimer = this.scene.time.addEvent({
        delay: 5000,
        callback: () => this.calmDown(),
        callbackScope: this
      })
    }
    this.attackRaven(raven)
  }

  calmDown() {
    this.isGuarded = false
    this.citizenSprite.clearTint()
    this.startWalking()
  }

  stopMoving() {
    this.isWalking = false
  }

  giveItem(item: Item) {
    this.items.push(item)
    this.add(item)
  }

  stealItem() {
    if (!this.isGuarded && this.items.length > 0) {
      const item = this.items.pop()
      // Logic to transfer item to Raven
      return item
    }
    return null
  }

  attackRaven(raven: Raven) {
    if (!this.attackCooldownTimer) {
      this.attackCooldownTimer = this.scene.time.addEvent({
        delay: 1000, // Attack every second
        callback: () => {
          if (
            this.isGuarded &&
            Phaser.Math.Distance.Between(this.x, this.y, raven.x, raven.y) < this.citizenType.attackRange
          ) {
            raven.takeDamage(5) // Assume some damage value
          }
        },
        callbackScope: this,
        loop: true
      })
    }
  }
}
