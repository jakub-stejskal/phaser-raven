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
        'The young alchemy apprentice Raven Shadowcast made a terrible mistake during one of his experiments, and he had to pay a terrible price: he became a raven, a little bird with feathers dark as night. Since then he is trying to turn back to his human form. To do so, he needs to brew a Transmutation potion. But in his raven form, he has no other choice than to steal shiny items from his fellow citizens on the town square and use them to brew potions.\n' +
          "Unfortunately, every time he makes a potion, there's a 10% chance it will fail and spawn an evil shadow that will try to catch him!",
        {
          fontSize: '12px',
          color: '#ffffff',
          wordWrap: { width: this.cameras.main.width * 0.4 }
        }
      )
      .setOrigin(0.5)

    // Display tutorial on the left side
    this.add
      .text(
        this.cameras.main.width * 0.25,
        400,
        'Tutorial:\n' +
          ' - Use W/A/S/D to move.\n' +
          ' - SPACE to fly.\n' +
          ' - ENTER to enter or exit the nest.\n' +
          ' - SHIFT to steal items from citizens.\n' +
          ' - SHIFT in the nest to drink potions.\n' +
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
        sprite: 'raven',
        name: 'Raven',
        yOffset: 0,
        scale: 4,
        description: 'Control the raven to gather items and avoid enemies.'
      },
      {
        sprite: 'cat',
        name: 'Cat',
        yOffset: 10,
        scale: 4,
        description: 'Avoid these agile predators that hunt the raven.'
      },
      { name: 'Shadowblight', yOffset: 20, scale: 0.5, description: 'Avoid these dangerous shadows.' },
      { sprite: 'citizen', name: 'Citizen', yOffset: 20, scale: 2, description: 'Steal items from citizens.' },
      {
        sprite: 'nest',
        name: 'Nest',
        yOffset: 30,
        scale: 3,
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
      .text(this.cameras.main.width * 0.25, this.cameras.main.height - 50, 'Press SPACE to continue', {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'italic',
        backgroundColor: '#00000'
      })
      .setOrigin(0.5)

    this.add
      .text(
        this.cameras.main.width * 0.8,
        this.cameras.main.height - 50,
        'Credits:\n' +
          'Game design & art: Jindrich Pavlasek\n' +
          'Programming: Jakub Stejskal and Miroslav Mihov\n' +
          'Item sprites: PaperHatLizard/Cryo (https://paperhatlizard.itch.io/cryos-mini-items)',
        { fontSize: '12px', color: '#ffffff', fontStyle: 'italic' }
      )
      .setOrigin(0.8)

    // Listen for SPACE key press to start the game
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('MainScene')
    })
  }
}
