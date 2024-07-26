export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    this.load.image('nest', 'assets/img/nest.png')
    this.load.spritesheet('raven-walking', 'assets/img/raven-walking.png', { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('raven-flying', 'assets/img/raven-flying.png', { frameWidth: 64, frameHeight: 64 })
    this.load.spritesheet('childNpc', 'assets/img/childNpc.png', { frameWidth: 40, frameHeight: 80 })
    this.load.spritesheet('fatCitizen', 'assets/img/fatCitizen.png', { frameWidth: 120, frameHeight: 100 })
    this.load.atlas('itemsAtlas', 'assets/img/items_4x.png', 'assets/img/items_4x.json')
  }

  create() {
    this.scene.start('MainScene')

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
