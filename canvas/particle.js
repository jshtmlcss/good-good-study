import Tween from '../common/tween.js'
import Observer from '../common/observer.js'

/**
 * element对象
 */
class Ele {
  constructor (selector) {
    this[0] = typeof selector === 'string' ? document.querySelector(selector) : selector
    this.width = this[0].width
    this.height = this[0].height
    this.ctx = this[0].getContext('2d')
  }
}

/**
 * cavnas对象，提供对画布的一些操作。
 */
class Canvas {
  constructor (selector) {
    // canvas 节点对象
    this.el = new Ele(selector)
    // 粒子对象
    this.particle = new Particle()
    // 动画对象
    this.animation = new Animate(this.el, this.particle)
  }
  // 获取像素点
  getImageData (gridX = 6, gridY = 6) {
    let data = this.el.ctx.getImageData(0, 0, this.el.width, this.el.height).data
    // 清除上一次获取的粒子
    this.particle.clear()
    // 遍历像素点，找出有颜色的像素点
    for (let x = 0; x < this.el.width; x += gridX) {
      for (let y = 0; y < this.el.height; y += gridY) {
        let pos = (y * this.el.width + x) * 4
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
    this.el.ctx.clearRect(0, 0, this.el.width, this.el.height)
  }
  animate (dotOptions = {}, animateOptions = {}) {
    let { initDotEach, dotWidth, dotHeight, dotX, dotY, gridX, gridY } = Object.assign({
      // 粒子初始化遍历函数
      initDotEach: function () {},
      // 粒子大小
      dotWidth: 5,
      dotHeight: 5,
      // 粒子初始位置
      dotX: this.el.width / 2,
      dotY: this.el.height,
      // 粒子的细粒度，越大粒子数量越少
      gridX: 6,
      gridY: 6
    }, dotOptions)

    // 获取像素数据
    this.getImageData(gridX, gridY)

    // 初始化粒子属性
    this.particle.resetProps((dot, index) => {
      dot.x = dotX
      dot.y = dotY
      dot.initX = dot.x
      dot.initY = dot.y
      dot.width = dotWidth
      dot.height = dotHeight
      initDotEach(dot, index)
    })

    this.animation.stop()
    this.animation.init(animateOptions)
    this.animation.execute()
  }
}

// 动画对象
class Animate {
  constructor (el, particle) {
    // canvas节点对象
    this.el = el
    // 粒子集合对象
    this.particle = particle
    // 用于停止动画
    this.timer = null
  }
  init (options) {
    // 动画选项
    this.options = Object.assign({
      // 动画形式
      type: 'easeOutQuad',
      // 粒子移动速度
      speed: 4,
      // 动画结束回调
      end: function () {}
    }, options)
    // 粒子完成数量
    this.complete = { length: 0 }
    // 动画是否进行中
    this.isWorking = false

    return this
  }
  execute () {
    let { type, speed, end } = this.options

    // 数量一致则动画已结束
    if (this.complete.length === this.particle.length) {
      this.stop()
      this.complete = { length: 0 }
      this.isWorking = false
      end()
      return
    }

    // 清空画布
    this.el.ctx.clearRect(0, 0, this.el.width, this.el.height)

    this.particle.dots.forEach(dot => {
      // 粒子当前时间小于总时间
      if (dot.currTime < dot.time + dot.interval) {
        // 错开粒子移动的时间，粒子当前时间大于间隔时间才移动
        if (dot.currTime >= dot.interval) {
          dot.x = Animate.getValue(type, dot, dot.initX, dot.dx)
          dot.y = Animate.getValue(type, dot, dot.initY, dot.dy)
        }
        dot.currTime += Math.random() + speed
      } else {
        // 当前粒子动画已完成
        dot.x = dot.dx
        dot.y = dot.dy
        if (!this.complete.hasOwnProperty(dot.id)) {
          this.complete[dot.id] = 1
          this.complete.length++
        }
      }
      dot.draw(this.el.ctx)
    })

    this.timer = window.requestAnimationFrame(this.execute.bind(this))
    this.isWorking = true
  }
  stop () {
    window.cancelAnimationFrame(this.timer)
  }
  static getValue (type, dot, initValue, targetValue) {
    return initValue === targetValue ? initValue : Tween[type](dot.currTime - dot.interval, initValue, targetValue - initValue, dot.time) || 0
  }
}

/**
 * 粒子集合对象
 */
class Particle {
  constructor () {
    // 粒子集合
    this.dots = []
    // 粒子数量
    this.length = 0
  }
  // 创建粒子
  create (options) {
    this.dots.push(new Dot(options))
    this.length++
  }
  clear () {
    this.dots = []
    this.length = 0
  }
  // 重置/新增粒子属性
  resetProps (callback = function () {}) {
    this.dots.forEach((dot, index) => {
      dot.id = index
      dot.time = 150
      dot.currTime = 0
      dot.interval = parseInt(Math.random() * 500)
      callback(dot, index)
    })
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
    let ctx = this.el.ctx
    let { text, x, y, font, fillStyle, textAlign } = Text.getOptions(options)

    this.clearCanvas()

    ctx.font = font
    ctx.fillStyle = fillStyle
    ctx.textAlign = textAlign
    if (x === 0 && y === 0) {
      x = this.el.width / 2
      y = this.el.height / 2
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
      this.el.ctx.drawImage(this.image, x, y, this.image.width, this.image.height)
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
