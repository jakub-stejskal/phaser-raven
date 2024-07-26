import MainScene from '../scenes/mainScene'
import Raven from './raven'

export default class Shadowblight extends Phaser.GameObjects.Ellipse {
  scene: MainScene
  damage: number
  moveSpeed: number
  lastHitTime: number
  hitCooldown: number

  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y, 60, 120, 0x000000)
    this.scene = scene
    this.damage = 10
    this.moveSpeed = 50
    this.lastHitTime = 0
    this.hitCooldown = 1000 // 1 second cooldown

    this.setAlpha(0.2) // Make the ellipse transparent
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    this.startMoving()
  }

  startMoving() {
    this.scene.time.addEvent({
      delay: 1000, // Move every second
      callback: () => {
        this.randomMove()
      },
      loop: true
    })
  }

  //TODO Potential behaviour: when flying, it actively hunts your shadow. When on the ground, randomly walking/sniffing/waiting?

  randomMove() {
    // Random movement within the screen bounds, avoiding the nest area
    const bounds = this.scene.physics.world.bounds
    let targetX = Phaser.Math.Between(bounds.left, bounds.right)
    let targetY = Phaser.Math.Between(bounds.top, bounds.bottom)

    // TODO: Fix this. It's not working as intended
    // Assuming the nest is at the center, avoid the central area
    const nestAvoidRadius = 500
    const { x: nestX, y: nestY } = this.scene.nest.getCenter()
    while (Phaser.Math.Distance.Between(targetX, targetY, nestX, nestY) < nestAvoidRadius) {
      targetX = Phaser.Math.Between(bounds.left, bounds.right)
      targetY = Phaser.Math.Between(bounds.top, bounds.bottom)
    }

    this.scene.physics.moveTo(this, targetX, targetY, this.moveSpeed)
  }

  update() {
    // Make the shadow shiver and twitch visually
    const now = this.scene.time.now
    this.scaleX = 1 + 0.05 * Math.sin(now * 10)
    this.scaleY = 1 + 0.05 * Math.cos(now * 12)

    // Add random twitches
    if (Phaser.Math.Between(0, 100) > 98) {
      this.scaleX += Phaser.Math.Between(-0.1, 0.1)
      this.scaleY += Phaser.Math.Between(-0.1, 0.1)
    }

    // Check collision with Raven's shadow
    this.scene.physics.overlap(this, this.scene.raven, this.onHitRaven, undefined, this)
  }

  onHitRaven() {
    const now = this.scene.time.now
    if (now - this.lastHitTime > this.hitCooldown) {
      this.scene.raven.takeDamage(this.damage)
      this.visualHitEffect()
      this.lastHitTime = now
    }
  }

  visualHitEffect() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      yoyo: true,
      duration: 75,
      ease: 'Power1'
    })
  }
}
