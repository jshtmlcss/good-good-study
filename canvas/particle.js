import Tween from '../animation/tween.js'

class Base {
  constructor (selector) {
    this.el = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.width = this.el.width
    this.height = this.el.height
    this.ctx = this.el.getContext('2d')
    this.dots = []
    this.dotsLength = 0
    this.grid = 2
    this.stop = false
    this.timer = null
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
    this.dotsLength = this.dots.length
  }
  clearCanvas () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  animate () {
    let that = this
    let startTime = new Date().getTime()
    let time = 5500
    let type = 'easeBoth'

    function loop () {
      let changeTime = new Date().getTime()
      let scale = 1 - ((Math.max(0, startTime - changeTime + time) / time) || 0)

      function getValue (target) {
        return target[0] === target[1] ? target[0] : Tween[type](scale * time, target[0], target[1] - target[0], time) || 0
      }

      that.clearCanvas()

      that.dots.forEach(dot => {
        if (Math.abs(dot.dx - dot.x) < 0.1 && Math.abs(dot.dy - dot.y) < 0.1) {
          dot.x = dot.dx
          dot.y = dot.dy
        } else {
          // dot.x = dot.x + (dot.dx - dot.x) * 0.1
          // dot.y = dot.y + (dot.dy - dot.y) * 0.1
          dot.x = getValue([dot.x, dot.dx])
          dot.y = getValue([dot.y, dot.dy])
        }
        let last = that.dots[that.dotsLength - 1]
        if (last.x === last.dx && last.y === last.dy) {
          that.stop = true
        }
        dot.draw(that.ctx)
      })
      if (that.stop) {
        window.cancelAnimationFrame(that.timer)
      } else {
        that.timer = window.requestAnimationFrame(loop)
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
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.rgba = rgba
  }
  draw (ctx) {
    ctx.fillStyle = `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${this.rgba[3]})`
    ctx.fillRect(this.x, this.y, 1, 1)
  }
}

export { Text }
