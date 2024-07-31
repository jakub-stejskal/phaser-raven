import Item from './item'
import Raven from './raven'
import { CitizenType as CitizenType } from '../utils/types'
import config from '../config'

export default class Citizen extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  citizenSprite: Phaser.GameObjects.Sprite
  citizenType: CitizenType
  body: Phaser.Physics.Arcade.Body
  items: Item[]
  isGuarded: boolean
  isWalking: boolean
  damage: number

  guardingDelay = 1000 // 1 second delay before becoming guarded
  alertTimer: Phaser.Time.TimerEvent | null
  attackCooldownTimer: Phaser.Time.TimerEvent | null

  debugText: Phaser.GameObjects.Text

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
    this.damage = config.CITIZEN_DAMAGE

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
      config.OBJECTS_SHADOW_ALPHA
    )
    this.citizenSprite = this.scene.add.sprite(0, 0, citizenType.sprite)
    this.citizenSprite.setScale(4)
    this.add(this.shadow)
    this.add(this.citizenSprite)

    // Debug text (optional)
    this.debugText = this.scene.add.text(this.x, this.y, '', { fontSize: '12px', color: '#ffffff' })
    this.debugText.setDepth(Number.MAX_SAFE_INTEGER)
    this.add(this.debugText)

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
    } else {
      // Ensure movement stops when guarded
      this.stopMoving()
    }

    // Check if the citizen has reached the target position
    if (Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY) < 5) {
      this.destroy()
    }

    this.depth = this.y + this.height / 2
  }

  alert(raven: Raven) {
    if (!this.isGuarded && !this.alertTimer) {
      this.animateAlert()
      // Start a delay before becoming alerted
      this.alertTimer = this.scene.time.addEvent({
        delay: this.guardingDelay,
        callback: () => {
          this.isGuarded = true
          this.citizenSprite.setTint(0xff0000) // Set the final alert tint
          this.stopMoving()

          // Revert back to normal after a certain time
          this.scene.time.addEvent({
            delay: 5000,
            callback: this.calmDown,
            callbackScope: this
          })

          this.attackRaven(raven) // Start attacking after becoming alerted
        },
        callbackScope: this
      })
      this.animateGuarding()
    }
  }

  calmDown() {
    this.isGuarded = false
    this.startWalking()
    this.animateCalming()

    // Clear any existing attack cooldown timer
    if (this.attackCooldownTimer) {
      this.attackCooldownTimer.remove()
      this.attackCooldownTimer = null
    }

    // Clear the alert timer to allow future alerts
    if (this.alertTimer) {
      this.alertTimer.remove()
      this.alertTimer = null
    }
  }

  stopMoving() {
    this.isWalking = false
    this.body.setVelocity(0, 0) // Ensure the citizen stops moving
  }

  giveItem(item: Item) {
    this.items.push(item)
    this.add(item)
    item.owner = this
    item.setX(20)
    item.setY(20)
  }

  stealItem() {
    if (!this.isGuarded && this.items.length > 0) {
      const item = this.items.pop()
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
            Phaser.Math.Distance.Between(this.x, this.y, raven.x, raven.y) < this.citizenType.attackRange &&
            raven.z > -this.citizenType.attackRange
          ) {
            raven.takeDamage(this.damage)
            raven.items = [] // Remove all items from the Raven when attacked
            this.animateHit()
          } else {
            console.log('Conditions not met for attack')
          }
        },
        callbackScope: this,
        loop: true
      })
    } else {
      console.log('Attack already in cooldown')
    }
  }

  animateAlert() {
    this.scene.tweens.add({
      targets: this.citizenSprite,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 50,
      ease: 'Power1'
    })
  }

  animateHit() {
    this.scene.tweens.add({
      targets: this.citizenSprite,
      scaleX: 1.3,
      scaleY: 1.3,
      yoyo: true,
      duration: 100,
      ease: 'Power1'
    })
  }

  animateGuarding() {
    this.scene.tweens.addCounter({
      from: 0xffffff,
      to: 0xff0000,
      duration: 1000,
      ease: 'Linear',
      onUpdate: tween => {
        const value = Math.floor(tween.getValue())
        this.citizenSprite.setTint(value)
      },
      onComplete: () => {
        this.citizenSprite.setTint(0xff0000) // Ensure it's fully red

        // Add shake effect after setting the final tint
        this.scene.tweens.add({
          targets: this.citizenSprite,
          x: 5, // Slightly move to the right
          yoyo: true,
          duration: 50,
          repeat: 2, // Shake back and forth a couple of times
          onComplete: () => {
            this.citizenSprite.setX(0) // Reset position after shaking
          }
        })
      }
    })
  }

  animateCalming() {
    this.scene.tweens.addCounter({
      from: 0xff0000,
      to: 0xffffff,
      duration: 1000,
      ease: 'Linear',
      onUpdate: tween => {
        const value = Math.floor(tween.getValue())
        this.citizenSprite.setTint(value)
      },
      onComplete: () => {
        this.citizenSprite.clearTint() // Ensure it's back to the original state
      }
    })
  }
}
