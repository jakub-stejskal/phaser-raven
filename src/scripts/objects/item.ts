export default class Item extends Phaser.Physics.Arcade.Sprite {
  // Add custom properties here
    body: Phaser.Physics.Arcade.Body

    update() {
        this.body.setVelocity(0)
    }
}
