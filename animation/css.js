export default css

function cssTransform (el, attr, val) {
  if (!el.transform) {
    el.transform = {}
  }
  if (typeof val === 'undefined') {
    if (typeof el.transform[attr] === 'undefined') {
      switch (attr) {
        case 'scale':
        case 'scaleX':
        case 'scaleY':
          el.transform[attr] = 100
          break
        default:
          el.transform[attr] = 0
      }
    }
    return el.transform[attr]
  } else {
    let transformVal = ''
    el.transform[attr] = Number(val)
    for (let prop in el.transform) {
      switch (prop) {
        case 'rotate':
        case 'rotateX':
        case 'rotateY':
        case 'rotateZ':
        case 'skewX':
        case 'skewY':
          transformVal += ' ' + prop + '(' + el.transform[prop] + 'deg)'
          break
        case 'translateX':
        case 'translateY':
        case 'translateZ':
          transformVal += ' ' + prop + '(' + el.transform[prop] + 'px)'
          break
        case 'scale':
        case 'scaleX':
        case 'scaleY':
          transformVal += ' ' + prop + '(' + el.transform[prop] / 100 + ')'
          break
      }
    }
    el.style.WebkitTransform = el.style.transform = transformVal
  }
}

function css (element, attr, value) {
  const attrs = [
    'rotate', 'rotateX', 'rotateY', 'rotateZ',
    'scale', 'scaleX', 'scaleY',
    'skewX', 'skewY',
    'translateX', 'translateY', 'translateZ'
  ]
  if (attrs.indexOf(attr) !== -1) {
    return cssTransform(element, attr, value)
  }
  if (arguments.length === 2) {
    let val = window.getComputedStyle(element)[attr]
    if (attr === 'opacity') {
      val = Math.round(val * 100)
    }
    return parseFloat(val)
  }
  if (attr === 'opacity') {
    element.style.opacity = value / 100
  } else {
    element.style[attr] = value + 'px'
  }
}
