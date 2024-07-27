import MainScene from '../scenes/mainScene'

export default class Cat extends Phaser.GameObjects.Sprite {
  scene: MainScene
  body: Phaser.Physics.Arcade.Body

  damage: number
  moveSpeed: number
  lastHitTime: number
  hitCooldown: number
  jumpRange: number

  constructor(scene: MainScene, x: number, y: number) {
    super(scene, x, y, 'cat', 27)
    this.scene = scene
    this.damage = 15
    this.moveSpeed = 25
    this.lastHitTime = 0
    this.hitCooldown = 1000 // 1 second cooldown
    this.jumpRange = 200 // Range within which the cat will jump towards the Raven

    // Add the sprite to the scene and enable physics
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)

    // this.setSize(16, 16) // 16x16 collision box
    this.body.setSize(16, 16) // Set the collision box size

    // this.setScale(2) // This makes it 64x64

    this.body.setOffset((this.width * this.scaleX) / 2 - 8, this.height * this.scaleY - 16)
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)

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
    if (this.scene.raven.z > -5 && distanceToRaven < this.jumpRange) {
      this.jumpTowardsRaven()
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
      scaleX: 1.3,
      scaleY: 1.3,
      yoyo: true,
      duration: 100,
      ease: 'Power1'
    })
  }
}
