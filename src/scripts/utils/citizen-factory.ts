import config from '../config'
import Citizen from '../objects/citizen'
import { childCitizen, fatCitizen, skinnyCitizen } from './constants'
import { random } from './math'
import { CitizenType } from './types'

export default class CitizenFactory {
  scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  createCitizen(): Citizen {
    function generateCitizenType() {
      const typeGenerator = random(0, 4)
      switch (typeGenerator) {
        case 0:
          return childCitizen
        case 1:
          return fatCitizen
        default:
          return skinnyCitizen
      }
    }

    const citizenType: CitizenType = generateCitizenType()
    const { x, y } = this.generateInitialLocation(citizenType)
    const { targetX, targetY } = this.determineTargetLocation(x, y, citizenType)
    return new Citizen(this.scene, x, y, targetX, targetY, citizenType)
  }

  generateInitialLocation(citizenType: CitizenType): { x: number; y: number } {
    const edge = random(0, 4) // 0: top, 1: bottom, 2: left, 3: right
    let x = 0
    let y = 0

    const { width: sceneWidth, height: sceneHeight } = this.scene.cameras.main
    switch (edge) {
      case 0: // Top
        x = random(0, sceneWidth - config.NEST_WIDTH)
        y = -citizenType.height // Just above the screen
        break
      case 1: // Bottom
        x = random(0, sceneWidth - config.NEST_WIDTH)
        y = this.scene.cameras.main.height + citizenType.height // Just below the screen
        break
      case 2: // Left
        x = -citizenType.width // Just left of the screen
        y = random(config.NEST_HEIGHT, sceneHeight)
        break
      case 3: // Right
        x = this.scene.cameras.main.width + citizenType.width // Just right of the screen
        y = random(config.NEST_HEIGHT, sceneHeight)
        break
    }

    return { x, y }
  }

  determineTargetLocation(x: number, y: number, citizenType: CitizenType): { targetX: number; targetY: number } {
    // Determine the target position based on the starting edge
    const { width: sceneWidth, height: sceneHeight } = this.scene.cameras.main
    let targetX = x
    let targetY = y

    if (y <= 0) {
      // Coming from the top
      targetY = sceneHeight + citizenType.height
    } else if (y >= sceneHeight) {
      // Coming from the bottom
      targetY = 0 - citizenType.height
    } else if (x <= 0) {
      // Coming from the left
      targetX = sceneWidth + citizenType.width
    } else if (x >= sceneWidth) {
      // Coming from the right
      targetX = 0 - citizenType.width
    }

    return { targetX, targetY }
  }
}
