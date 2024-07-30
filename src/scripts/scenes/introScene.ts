export default class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' })
  }

  create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#000')

    // Display game name on the left side
    this.add
      .text(this.cameras.main.width * 0.25, 100, 'Raven Shadowcast', {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    // Display story on the left side
    this.add
      .text(
        this.cameras.main.width * 0.25,
        200,
        'In a land where shadows hold power, a raven seeks to gather magical essence.',
        {
          fontSize: '24px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width * 0.4 }
        }
      )
      .setOrigin(0.5)

    // Display tutorial on the left side
    this.add
      .text(
        this.cameras.main.width * 0.25,
        300,
        'Tutorial:\n' +
          ' - Use W/A/S/D to move.\n' +
          ' - SPACE to fly.\n' +
          ' - SHIFT to enter the nest.\n' +
          ' - Steal items from citizens.\n' +
          ' - Avoid cats and shadowblights.\n' +
          ' - Return items to your nest.\n' +
          ' - Combine materials to brew potions.\n' +
          ' - Collect enough essence to win.',
        {
          fontSize: '20px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width * 0.4 }
        }
      )
      .setOrigin(0.5, 0)

    // Display entity introduction on the right side
    const entityX = this.cameras.main.width * 0.6
    let entityY = 100

    const entities = [
      {
        sprite: 'raven-walking',
        name: 'Raven',
        yOffset: 20,
        scale: 0.8,
        description: 'Control the raven to gather items and avoid enemies.'
      },
      {
        sprite: 'cat',
        name: 'Cat',
        yOffset: -10,
        scale: 4,
        description: 'Avoid these agile predators that hunt the raven.'
      },
      { name: 'Shadowblight', yOffset: 20, scale: 0.5, description: 'Avoid these dangerous shadows.' },
      { sprite: 'fatCitizen', name: 'Citizen', yOffset: 20, scale: 0.5, description: 'Steal items from citizens.' },
      {
        sprite: 'nest',
        name: 'Nest',
        yOffset: 30,
        scale: 0.6,
        description: 'Store your loot and combine materials for upgrades.'
      }
    ]

    entities.forEach(entity => {
      if (entity.sprite) {
        this.add.sprite(entityX - 50, entityY + entity.yOffset, entity.sprite).setScale(entity.scale) // Adjust scale as needed
      } else {
        this.add.ellipse(entityX - 50, entityY + entity.yOffset, 120 * entity.scale, 60 * entity.scale, 0xffffff, 0.2) // For Shadowblight
      }
      this.add.text(entityX, entityY, entity.name, { fontSize: '24px', color: '#ffffff' })
      this.add.text(entityX, entityY + 30, entity.description, {
        fontSize: '18px',
        color: '#aaaaaa',
        wordWrap: { width: this.cameras.main.width * 0.4 }
      })
      entityY += 100
    })

    // Display continue message on the left side
    this.add
      .text(this.cameras.main.width * 0.5, this.cameras.main.height - 50, 'Press SPACE to continue', {
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
