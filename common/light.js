// 光源
export default class Light {
  constructor (x = -100, y = -100, z = -100, brightness = 1) {
    this.x = x
    this.y = y
    this.z = z
    this.brightness = brightness
  }
  setBrightness (b) {
    this.brightness = Math.min(Math.max(b, 0), 1)
  }
}
