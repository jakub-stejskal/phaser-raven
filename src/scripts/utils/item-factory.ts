import Item from '../objects/item'
import { MATERIALS } from './constants'
import { random } from './math'

export default class ItemFactory {
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  createItem(x: number, y: number): Item {
    const frameName = `items_4x${random(0, 64)}.png`

    const item = new Item(this.scene, x, y, 'itemsAtlas', frameName, MATERIALS[random(0, MATERIALS.length)])
    return item
  }
}
