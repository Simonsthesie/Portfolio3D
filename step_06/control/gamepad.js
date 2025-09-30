import { floor } from '../tool/function'

const ATTACK = 0
const JUMP = 1
const LOCK = 7
const X = 0
const Z = 1

export default class Gamepad {
  constructor() {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      shift: false
    }
    
    this.setupKeyboardListeners()
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'KeyZ':
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = true
          break
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = true
          break
        case 'KeyQ':
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true
          break
        case 'Space':
          this.keys.space = true
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.shift = true
          break
      }
    })

    document.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'KeyZ':
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = false
          break
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = false
          break
        case 'KeyQ':
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false
          break
        case 'Space':
          this.keys.space = false
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.shift = false
          break
      }
    })
  }

  get gamepad() {
    return navigator.getGamepads()[0]
  }

  get x() {
    // Priorité au clavier, puis gamepad
    if (this.keys.left && this.keys.right) return 0
    if (this.keys.left) return -1
    if (this.keys.right) return 1
    if (!this.gamepad) return 0
    return floor(this.gamepad.axes[X])
  }

  get z() {
    // Priorité au clavier, puis gamepad
    if (this.keys.up && this.keys.down) return 0
    if (this.keys.up) return -1
    if (this.keys.down) return 1
    if (!this.gamepad) return 0
    return floor(this.gamepad.axes[Z])
  }

  get attack() {
    if (this.keys.space) return true
    if (!this.gamepad) return false
    return this.gamepad.buttons[ATTACK].pressed
  }

  get jump() {
    if (this.keys.space) return true
    if (!this.gamepad) return false
    return this.gamepad.buttons[JUMP].pressed
  }

  get lock() {
    if (this.keys.shift) return true
    if (!this.gamepad) return false
    return this.gamepad.buttons[LOCK].pressed
  }

  get moving() {
    return Math.abs(this.x) || Math.abs(this.z)
  }

  get angle() {
    return Math.angle(this.x, this.z)
  }
}
