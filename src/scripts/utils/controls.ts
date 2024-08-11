import Phaser from 'phaser'

interface WASD {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

export default class Controls extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd: WASD
  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null

  constructor(scene: Phaser.Scene) {
    super()
    this.scene = scene

    // Keyboard controls
    this.cursors = this.scene.input.keyboard.createCursorKeys()
    this.wasd = this.scene.input.keyboard.addKeys('W,A,S,D') as WASD

    // Gamepad controls
    this.scene.input.gamepad?.on('connected', this.onGamepadConnected, this)
    this.scene.input.gamepad?.on('disconnected', this.onGamepadDisconnected, this)

    // Event listeners
    this.setupKeyboardListeners()

    // Check for gamepad input in the update loop
    scene.events.on('update', this.update, this)
  }

  private onGamepadConnected(pad: Phaser.Input.Gamepad.Gamepad) {
    this.gamepad = pad
  }

  private onGamepadDisconnected(pad: Phaser.Input.Gamepad.Gamepad) {
    if (this.gamepad === pad) {
      this.gamepad = null
    }
  }

  private setupKeyboardListeners() {
    this.scene.input.keyboard.on('keydown-D', () => this.emit('right'))
    this.scene.input.keyboard.on('keydown-A', () => this.emit('left'))
    this.scene.input.keyboard.on('keydown-S', () => this.emit('down'))
    this.scene.input.keyboard.on('keydown-W', () => this.emit('up'))
    this.scene.input.keyboard.on('keydown-ENTER', () => this.emit('enterOrLeave'))
    this.scene.input.keyboard.on('keydown-SPACE', () => this.emit('action'))
    this.scene.input.keyboard.on('keyup-SPACE', () => this.emit('actionRelease'))
    this.scene.input.keyboard.on('keydown-SHIFT', () => this.emit('itemAction'))
  }

  private update() {
    if (!this.gamepad) return

    // Check axes for movement
    if (this.gamepad.leftStick.y < -0.5) this.emit('up')
    if (this.gamepad.leftStick.y > 0.5) this.emit('down')
    if (this.gamepad.leftStick.x < -0.5) this.emit('left')
    if (this.gamepad.leftStick.x > 0.5) this.emit('right')

    // Check buttons for actions
    if (this.gamepad.buttons[0].pressed) this.emit('action')
    if (this.gamepad.buttons[1].pressed) this.emit('itemAction')
    if (this.gamepad.buttons[2].pressed) this.emit('enterOrLeave')
  }

  get upPressed(): boolean {
    return (this.cursors.up.isDown || this.wasd.W.isDown || (this.gamepad && this.gamepad.leftStick.y < -0.5)) ?? false
  }

  get downPressed(): boolean {
    return (this.cursors.down.isDown || this.wasd.S.isDown || (this.gamepad && this.gamepad.leftStick.y > 0.5)) ?? false
  }

  get leftPressed(): boolean {
    return (
      (this.cursors.left.isDown || this.wasd.A.isDown || (this.gamepad && this.gamepad.leftStick.x < -0.5)) ?? false
    )
  }

  get rightPressed(): boolean {
    return (
      (this.cursors.right.isDown || this.wasd.D.isDown || (this.gamepad && this.gamepad.leftStick.x > 0.5)) ?? false
    )
  }

  get actionPressed(): boolean {
    return (this.cursors.space.isDown || (this.gamepad && this.gamepad.buttons[0].pressed)) ?? false
  }
}
