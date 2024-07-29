import 'phaser'
import PreloadScene from './scenes/preloadScene'
import IntroScene from './scenes/introScene'
import MainScene from './scenes/mainScene'
import LabScene from './scenes/labScene'
import { Types } from 'phaser'
import config from './config'

const gameConfig: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#ffffff',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: config.SCENE_WIDTH,
    height: config.SCENE_HEIGHT
  },
  scene: [PreloadScene, IntroScene, MainScene, LabScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: config.DEBUG
    }
  },
  render: {
    antialias: false,
    pixelArt: true
  }
}

window.addEventListener('load', () => {
  const game = new Phaser.Game(gameConfig)
})
