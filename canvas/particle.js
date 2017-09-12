import Tween from '../animation/tween.js'

class Base {
  constructor (selector) {
    this.el = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.width = this.el.width
    this.height = this.el.height
    this.ctx = this.el.getContext('2d')
    this.dots = []
    this.grid = 10
  }
  getImageData () {
    let data = this.ctx.getImageData(0, 0, this.width, this.height).data
    for (let x = 0; x < this.width; x += this.grid) {
      for (let y = 0; y < this.height; y += this.grid) {
        let pos = (y * this.width + x) * 4
        if (data[pos + 3] > 128) {
          this.dots.push(new Dot(x, y, x, y, [data[pos], data[pos + 1], data[pos + 2], data[pos + 3]]))
        }
      }
    }
  }
  clearCanvas () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  animate () {
    let that = this
    let timer = null
    let startTime = new Date().getTime()
    let time = 1000
    let type = 'easeBoth'

    function loop () {
      let changeTime = new Date().getTime()
      let scale = 1 - ((Math.max(0, startTime - changeTime + time) / time) || 0)

      function getValue (initValue, targetValue) {
        return initValue === targetValue ? initValue : Tween[type](scale * time, initValue, targetValue - initValue, time) || 0
      }

      that.clearCanvas()

      that.dots.forEach(dot => {
        dot.x = getValue(dot.initX, dot.dx)
        dot.y = getValue(dot.initY, dot.dy)
        dot.draw(that.ctx)
      })

      if (scale === 1) {
        window.cancelAnimationFrame(timer)
      } else {
        timer = window.requestAnimationFrame(loop)
      }
    }

    loop()
  }
}

class Text extends Base {
  constructor (selector) {
    super(selector)
    this.status = ''
  }
  draw (options) {
    this.drawText(options)
    this.getImageData()
    this.clearCanvas()
    this.dots.forEach(dot => {
      dot.x = Math.random() * this.width
      dot.y = Math.random() * this.height
      dot.initX = dot.x
      dot.initY = dot.y
      dot.draw(this.ctx)
    })
    this.animate()
  }
  drawText (options) {
    let ctx = this.ctx
    let { text, x, y, font, fillStyle, textAlign } = Text.getOptions(options)

    this.clearCanvas()

    ctx.font = font
    ctx.fillStyle = fillStyle
    ctx.textAlign = textAlign
    if (x === 0 && y === 0) {
      x = this.width / 2
      y = this.height / 2
    }
    ctx.fillText(text, x, y)
  }
  static getOptions (options) {
    let defaultOptions = {
      text: '',
      fillStyle: '#000',
      textAlign: 'center',
      font: '200px 微软雅黑 bold',
      x: 0,
      y: 0
    }
    if (typeof options === 'string') {
      options = { text: options }
    }
    return Object.assign(defaultOptions, options)
  }
}

class Dot {
  constructor (x, y, dx, dy, rgba) {
    // 当前坐标
    this.x = x
    this.y = y
    // 目的地坐标
    this.dx = dx
    this.dy = dy
    // 初始坐标
    this.initX = x
    this.initY = y
    // 颜色
    this.rgba = rgba
  }
  draw (ctx) {
    ctx.fillStyle = `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${this.rgba[3]})`
    ctx.fillRect(this.x, this.y, 5, 5)
  }
}

export { Text }
