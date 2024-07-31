export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('nest', 'assets/img/nest1.png')
    this.load.image('ground', 'assets/img/background.png')

    this.load.spritesheet('raven', 'assets/img/raven.png', { frameWidth: 31, frameHeight: 26 })
    this.load.spritesheet('citizen', 'assets/img/citizen.png', { frameWidth: 31, frameHeight: 26 })

    this.load.atlas('itemsAtlas', 'assets/img/items_4x.png', 'assets/img/items_4x.json')
    this.load.spritesheet('cat', 'assets/img/cat.png', { frameWidth: 32, frameHeight: 32 })
  }

  create() {
    this.scene.start('IntroScene')

    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
