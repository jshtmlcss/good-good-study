import Tween from '../animation/tween.js'

class Base {
  constructor (selector) {
    this.el = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.width = this.el.width
    this.height = this.el.height
    this.ctx = this.el.getContext('2d')
    this.dots = []
    this.dotsLength = 0
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
    this.dotsLength = this.dots.length
  }
  clearCanvas () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  animate () {
    let that = this
    let timer = null
    let type = 'easeOutQuad'
    let complete = { length: 0 }

    function loop () {
      function getValue (dot, initValue, targetValue) {
        return initValue === targetValue ? initValue : Tween[type](dot.currTime - dot.interval, initValue, targetValue - initValue, dot.time) || 0
      }

      that.clearCanvas()

      that.dots.forEach(dot => {
        // 粒子当前时间小于总时间
        if (dot.currTime < dot.time + dot.interval) {
          // 错开粒子移动的时间，粒子当前时间大于间隔时间才移动
          if (dot.currTime >= dot.interval) {
            dot.x = getValue(dot, dot.initX, dot.dx)
            dot.y = getValue(dot, dot.initY, dot.dy)
          }
          dot.currTime += Math.random() + 4
        } else {
          // 当前粒子动画已完成
          dot.x = dot.dx
          dot.y = dot.dy
          if (!complete.hasOwnProperty(dot.id)) {
            complete[dot.id] = 1
            complete.length++
          }
        }
        dot.draw(that.ctx)
      })

      if (complete.length === that.dotsLength) {
        console.log('end')
        complete = null
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
    this.dots.forEach((dot, index) => {
      // dot.x = Math.random() * this.width
      // dot.y = Math.random() * this.height
      dot.id = index
      dot.x = this.width / 2
      dot.y = this.height
      dot.initX = dot.x
      dot.initY = dot.y
      dot.time = 150
      dot.currTime = 0
      dot.interval = parseInt(Math.random() * 500)
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
