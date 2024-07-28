import config from '../config'
import MainScene from '../scenes/mainScene'

const SIZE = 16

export default class Cat extends Phaser.GameObjects.Container {
  scene: MainScene
  body: Phaser.Physics.Arcade.Body
  catSprite: Phaser.GameObjects.Sprite
  shadow: Phaser.GameObjects.Ellipse

  damage: number
  moveSpeed: number
  lastHitTime: number
  hitCooldown: number
  jumpRange: number

  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y)
    this.scene = scene
    this.damage = 30
    this.moveSpeed = 50
    this.lastHitTime = 0
    this.hitCooldown = 1000 // 1 second cooldown
    this.jumpRange = 300 // Range within which the cat will jump towards the Raven

    // Add the sprite to the scene and enable physics
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    // Create the cat sprite
    this.catSprite = scene.add.sprite(0, 0, 'cat', 27)
    this.catSprite.setOrigin(0.25, 0.5) // Align bottom center
    this.catSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)

    // Create the shadow as an ellipse
    this.shadow = this.scene.add.ellipse(0, SIZE / 2, SIZE, SIZE / 2, 0x000000, config.OBJECTS_SHADOW_ALPHA)
    this.shadow.setOrigin(0, -0.5) // Center the ellipse

    this.add(this.shadow)
    this.add(this.catSprite)

    // this.setSize(16, 16) // 16x16 collision box
    this.body.setSize(16, 16) // Set the collision box size

    this.setScale(4) // This makes it 64x64

    // this.body.setOffset(8, this.height / 2)

    this.startRoaming()
  }

  startRoaming() {
    this.scene.time.addEvent({
      delay: 5000, // Roam every second
      callback: () => {
        this.randomMove()
      },
      loop: true
    })
  }

  randomMove() {
    const bounds = this.scene.physics.world.bounds
    const targetX = Phaser.Math.Between(bounds.left, bounds.right)
    const targetY = Phaser.Math.Between(bounds.top, bounds.bottom)

    this.scene.physics.moveTo(this, targetX, targetY, this.moveSpeed)
  }

  update() {
    const now = this.scene.time.now

    // Check if the Raven is within the jump range
    const distanceToRaven = Phaser.Math.Distance.Between(this.x, this.y, this.scene.raven.x, this.scene.raven.y)
    if (distanceToRaven < this.jumpRange) {
      if (this.scene.raven.z > -5) {
        this.jumpTowardsRaven()
      } else {
        //stop
        this.body.setVelocity(0)
      }
    }

    // Check collision with Raven for attacking
    this.scene.physics.overlap(this, this.scene.raven, this.onHitRaven, undefined, this)

    this.depth = this.y + this.height / 2
  }

  jumpTowardsRaven() {
    const raven = this.scene.raven
    this.scene.physics.moveTo(this, raven.x, raven.y, this.moveSpeed * 4) // Faster move speed for jump
  }

  onHitRaven() {
    const now = this.scene.time.now
    if (this.scene.raven.z > -5 && now - this.lastHitTime > this.hitCooldown) {
      this.scene.raven.takeDamage(this.damage)
      this.visualHitEffect()
      this.lastHitTime = now
    }
  }

  visualHitEffect() {
    this.scene.tweens.add({
      targets: this,
      scaleX: this.scale * 1.3,
      scaleY: this.scale * 1.3,
      yoyo: true,
      duration: 100,
      ease: 'Power1'
    })
  }
}
