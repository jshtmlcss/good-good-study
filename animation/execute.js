import Tween from './tween.js'

export default execute

const requestAnimationFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60)
    }
})()

const cancelAnimationFrame = (function () {
  return window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function (id) {
      clearTimeout(id)
    }
})()

const now = () => new Date().getTime()

/**
 * 动画执行函数，仅在opiotns.running函数返回数值，不做具体元素的动画操作
 * @param {Object} options - 选项
 * @property {Number} [options.time = 500] - 在指定时间（ms）内完成动画，默认500ms
 * @property {String} [options.type = 'linear'] - 动画类型，默认linear
 * @property {Array} options.targets - 目标值数组，类似[[0, 100], [100, 0]]：值从0到100或从100到0为止，变化的数值会作为options.running函数的参数
 * @property {Function} options.running - options.targets数值变化过程会执行这个函数
 * @property {Function} options.end - 结束后的回调函数
 */

function execute (options) {
  let timer = null
  let { time = 500, type = 'linear', targets, running, end } = options
  const startTime = now()

  function step () {
    const changeTime = now()
    const scale = 1 - ((Math.max(0, startTime - changeTime + time) / time) || 0)
    const value = []

    targets.forEach(target => {
      const currentValue = target[0] === target[1] ? target[0] : Tween[type](scale * time, target[0], target[1] - target[0], time) || 0
      value.push(currentValue)
    })

    running(value)

    if (scale === 1) {
      cancelAnimationFrame(timer)
      end && end()
    } else {
      timer = requestAnimationFrame(step)
    }
  }

  cancelAnimationFrame(timer)
  timer = requestAnimationFrame(step)

  return {
    stop: function () {
      cancelAnimationFrame(timer)
    }
  }
}
