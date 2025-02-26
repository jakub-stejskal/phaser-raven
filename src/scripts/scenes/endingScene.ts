export default class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' })
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000')

    // Display congratulations message
    this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY - 50, 'Congratulations!', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'The raven has successfully turned back into an aspiring alchemist.',
        {
          fontSize: '24px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width - 100 },
          align: 'center'
        }
      )
      .setOrigin(0.5, 0)

    // Display prompt to restart
    this.add
      .text(this.cameras.main.centerX, this.cameras.main.height - 50, 'Press SPACE to restart', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'italic'
      })
      .setOrigin(0.5)

    // Listen for SPACE key press to restart the game
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('IntroScene') // Restart the game from the intro scene
    })
  }
}
