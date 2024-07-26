import Item from '../objects/item'
import { MATERIALS } from './constants'

export default class ItemFactory {
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  createItem(x: number, y: number): Item {
    const frameName = `items_4x${Math.floor(Math.random() * 64)}.png`

    const item = new Item(
      this.scene,
      x,
      y,
      'itemsAtlas',
      frameName,
      MATERIALS[Math.floor(Math.random() * MATERIALS.length)]
    )
    return item
  }
}
