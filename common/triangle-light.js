import { parseColor } from './utils.js'

// 三角形类
export default class Triangle {
  constructor (a, b, c, color = '#ff0000') {
    this.pointA = a
    this.pointB = b
    this.pointC = c
    this.color = color
    this.lineWidth = 1
    this.light = null
  }
  draw (context) {
    if (this.isBackface()) return
    context.save()
    context.lineWidth = this.lineWidth
    context.fillStyle = context.strokeStyle = this.getAdjustedColor()
    context.beginPath()
    context.moveTo(this.pointA.getScreenX(), this.pointA.getScreenY())
    context.lineTo(this.pointB.getScreenX(), this.pointB.getScreenY())
    context.lineTo(this.pointC.getScreenX(), this.pointC.getScreenY())
    context.closePath()
    context.fill()
    if (this.lineWidth > 0) {
      context.stroke()
    }
    context.restore()
  }
  isBackface () {
    const cax = this.pointC.getScreenX() - this.pointA.getScreenX()
    const cay = this.pointC.getScreenY() - this.pointA.getScreenY()
    const bcx = this.pointB.getScreenX() - this.pointC.getScreenX()
    const bcy = this.pointB.getScreenY() - this.pointC.getScreenY()
    return cax * bcy > cay * bcx
  }
  getDepth () {
    return Math.min(this.pointA.z, this.pointB.z, this.pointC.z)
  }
  getAdjustedColor () {
    const color = parseColor(this.color, true)
    let red = color >> 16
    let green = color >> 8 & 0xff
    let blue = color & 0xff
    const lightFactor = this.getLightFactor()
    red *= lightFactor
    green *= lightFactor
    blue *= lightFactor
    return parseColor(red << 16 | green << 8 | blue)
  }
  getLightFactor () {
    const ab = {
      x: this.pointA.x - this.pointB.x,
      y: this.pointA.y - this.pointB.y,
      z: this.pointA.z - this.pointB.z
    }
    const bc = {
      x: this.pointB.x - this.pointC.x,
      y: this.pointB.y - this.pointC.y,
      z: this.pointB.z - this.pointC.z
    }
    const norm = {
      x: (ab.y * bc.z) - (ab.z * bc.y),
      y: -((ab.x * bc.z) - (ab.z * bc.x)),
      z: (ab.x * bc.y) - (ab.y * bc.x)
    }
    const dotProd = norm.x * this.light.x +
                    norm.y * this.light.y +
                    norm.z * this.light.z
    const normMag = Math.sqrt(
      norm.x * norm.x +
      norm.y * norm.y +
      norm.z * norm.z
    )
    const lightMag = Math.sqrt(
      this.light.x * this.light.x +
      this.light.y * this.light.y +
      this.light.z * this.light.z
    )
    return (Math.acos(dotProd / (normMag * lightMag)) / Math.PI) * this.light.brightness
  }
}
