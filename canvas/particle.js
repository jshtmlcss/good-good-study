import Tween from '../common/tween.js'
import Observer from '../common/observer.js'

/**
 * cavnas对象，提供对画布的一些操作。
 */
class Canvas {
  constructor (selector) {
    this.el = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.width = this.el.width
    this.height = this.el.height
    this.ctx = this.el.getContext('2d')
    // 粒子对象
    this.particle = new Particle()
  }
  // 获取像素点
  getImageData () {
    let data = this.ctx.getImageData(0, 0, this.width, this.height).data
    for (let x = 0; x < this.width; x += this.particle.grid) {
      for (let y = 0; y < this.height; y += this.particle.grid) {
        let pos = (y * this.width + x) * 4
        if (data[pos + 3] > 128) {
          this.particle.create({
            x,
            y,
            dx: x,
            dy: y,
            rgba: [data[pos], data[pos + 1], data[pos + 2], data[pos + 3]]
          })
        }
      }
    }
  }
  // 清除画布
  clearCanvas () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  animate (options = {}) {
    let that = this
    let timer = null
    let complete = { length: 0 }
    let { type, speed, end, initDotEach, dotWidth, dotHeight, dotX, dotY } = Object.assign({
      // 动画形式
      type: 'easeOutQuad',
      // 粒子移动速度
      speed: 4,
      // 动画结束回调
      end: function () {},
      // 粒子初始化遍历函数
      initDotEach: function () {},
      // 粒子大小
      dotWidth: 5,
      dotHeight: 5,
      // 粒子初始位置
      dotX: that.width / 2,
      dotY: that.height
    }, options)

    // 获取像素数据和初始化粒子属性
    function init () {
      that.getImageData()
      that.particle.dots.forEach((dot, index) => {
        dot.x = dotX
        dot.y = dotY
        dot.initX = dot.x
        dot.initY = dot.y
        dot.width = dotWidth
        dot.height = dotHeight
        // 增加dot薪属性
        dot.id = index
        dot.time = 150
        dot.currTime = 0
        dot.interval = parseInt(Math.random() * 500)
        initDotEach(dot)
        dot.draw(that.ctx)
      })
    }

    function loop () {
      function getValue (dot, initValue, targetValue) {
        return initValue === targetValue ? initValue : Tween[type](dot.currTime - dot.interval, initValue, targetValue - initValue, dot.time) || 0
      }

      that.clearCanvas()

      that.particle.dots.forEach(dot => {
        // 粒子当前时间小于总时间
        if (dot.currTime < dot.time + dot.interval) {
          // 错开粒子移动的时间，粒子当前时间大于间隔时间才移动
          if (dot.currTime >= dot.interval) {
            dot.x = getValue(dot, dot.initX, dot.dx)
            dot.y = getValue(dot, dot.initY, dot.dy)
          }
          dot.currTime += Math.random() + speed
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

      if (complete.length === that.particle.length) {
        end()
        complete = null
        window.cancelAnimationFrame(timer)
      } else {
        timer = window.requestAnimationFrame(loop)
      }
    }

    init()
    loop()
  }
}

/**
 * 粒子集合对象
 */
class Particle {
  constructor (options) {
    // 粒子集合
    this.dots = []
    // 粒子数量
    this.length = 0
    // 用于控制粒子细粒度，值越小粒子越多
    this.grid = 10
  }
  // 创建粒子
  create (options) {
    this.dots.push(new Dot(options))
    this.length++
  }
}

/**
 * 文本对象
 */
class Text extends Canvas {
  constructor (selector) {
    super(selector)
    this.status = ''
  }
  draw (options) {
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

    return this
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

/**
 * 图片对象
 */
class Picture extends Canvas {
  constructor (selector) {
    super(selector)
    this.status = ''
    // 事件分发
    this.observer = new Observer()
  }
  draw (options) {
    let { src, x, y } = Picture.getOptions(options)
    this.loadImage(src, () => {
      this.ctx.drawImage(this.image, x, y, this.image.width, this.image.height)
      this.observer.emit('loaded')
    })
  }
  loadImage (src, callback) {
    this.image = new window.Image()
    this.image.onload = callback
    this.image.src = src
  }
  static getOptions (options) {
    let defaultOptions = {
      x: 0,
      y: 0,
      src: ''
    }
    if (typeof options === 'string') {
      options = { src: options }
    }
    return Object.assign(defaultOptions, options)
  }
}

/**
 * 粒子对象
 */
class Dot {
  constructor ({ x, y, dx, dy, rgba, width, height }) {
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
    // 大小
    this.width = width || 5
    this.height = height || 5
  }
  draw (ctx) {
    ctx.fillStyle = `rgba(${this.rgba[0]}, ${this.rgba[1]}, ${this.rgba[2]}, ${this.rgba[3]})`
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

export { Text, Picture }
