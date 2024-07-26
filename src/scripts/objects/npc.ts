import Item from './item'
import {NpcType} from "./types";

export default class Npc extends Phaser.GameObjects.Container {
  shadow: Phaser.GameObjects.Ellipse
  npcSprite: Phaser.GameObjects.Sprite
  npcType: NpcType
  body: Phaser.Physics.Arcade.Body
  items: Item[]
  z: number
  velocityZ: number

  constructor(scene: Phaser.Scene, x: number, y: number, npcType: NpcType) {
    super(scene, x, y)

    this.scene = scene
    this.z = 0
    this.velocityZ = 0
    this.items = []
    this.npcType = npcType;

    // Add the container to the scene
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    // center collision box
    this.body.setSize(this.npcType.width, this.npcType.height)
    // this.body.setOffset(-20, -10)
    // this.body.setCollideWorldBounds(true)

    // Initialize raven and its shadow and add them to the container
    this.shadow = this.scene.add.ellipse(0, 20, this.npcType.width, (this.npcType.height / 2), 0xffff00, 0.2)
    this.npcSprite = this.scene.add.sprite(0, -this.z, npcType.sprite)
    this.add(this.shadow)
    this.add(this.npcSprite)

    // Setup animations
    this.setupAnimations()
  }

  setupAnimations() {
    //TODO this shouldn't be initialized on object create, as it seems the animations are "scene" specific, so all NPCs end up using the same animation
    this.scene.anims.create({
      key: 'npc-walk',
      // frames: this.scene.anims.generateFrameNumbers(this.npcType.sprite, { start: 0, end: 3 }),
      frames: this.scene.anims.generateFrameNumbers('childNpc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    })
  }

  update() {
    // Reset horizontal velocity
    this.body.setVelocity(this.npcType.velocity, 0);
    this.npcSprite.anims.play('npc-walk', true)
  }

  die() {
    // Handle player's death (e.g., reset position, reduce score, etc.)
  }
}
