import execute from './execute.js'
import css from './css.js'

export default animate

/**
 * CSS动画函数
 * @param {String|HTMLElement} selector - 选项
 * @param {Object} options - 选项
 * @property {Number} options.style - 动画样式
 * @property {Number} [options.time = 500] - 在指定时间（ms）内完成动画，默认500ms
 * @property {String} [options.type = 'linear'] - 动画类型，默认linear
 * @property {Function} options.running - 动画执行中的回调
 * @property {Function} options.end - 结束后的回调
 */

function animate (selector, options) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector
  const { style, running = function () {} } = options
  options.targets = []
  options.running = (value) => {
    Object.keys(style).forEach((prop, index) => {
      css(el, prop, value[index])
    })
    running(value)
  }
  for (let prop in style) {
    options.targets.push([
      css(el, prop),
      style[prop]
    ])
  }
  return execute(options)
}
