export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' })
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000')

    // Display game name
    this.add
      .text(this.cameras.main.centerX, 100, 'Raven Shadowcast', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    // Display story
    this.add
      .text(
        this.cameras.main.centerX,
        200,
        'In a land where shadows hold power, a raven seeks to gather magical essence.',
        {
          fontSize: '24px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width - 100 }
        }
      )
      .setOrigin(0.5)

    // Display tutorial
    this.add
      .text(
        this.cameras.main.centerX,
        300,
        'Tutorial:\n' +
          ' - Use W/A/S/D to move.\n' +
          ' - SPACE to fly.\n' +
          ' - SHIFT to enter the nest.\n' +
          ' - Steal items from citizens and avoid cats and shadowblights.\n' +
          ' - Return items to your nest and combine the materials to gain upgrades.\n' +
          ' - Collect enough essence to win.',
        {
          fontSize: '20px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width - 100 }
        }
      )
      .setOrigin(0.5, 0)

    // Display continue message
    this.add
      .text(this.cameras.main.centerX, this.cameras.main.height - 50, 'Press SPACE to continue', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'italic'
      })
      .setOrigin(0.5)

    // Listen for SPACE key press to start the game
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('MainScene')
    })
  }
}
