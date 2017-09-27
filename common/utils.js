/**
 * Returns a color in the format: '#RRGGBB', or as a hex number if specified.
 * @param {number|string} color
 * @param {boolean=}      toNumber=false  Return color as a hex number.
 * @return {string|number}
 */
export function parseColor (color, toNumber) {
  if (toNumber === true) {
    if (typeof color === 'number') {
      return (color | 0) // chop off decimal
    }
    if (typeof color === 'string' && color[0] === '#') {
      color = color.slice(1)
    }
    return window.parseInt(color, 16)
  } else {
    if (typeof color === 'number') {
      color = '#' + ('00000' + (color | 0).toString(16)).substr(-6) // pad
    }
    return color
  }
}

/**
 * Converts a color to the RGB string format: 'rgb(r,g,b)' or 'rgba(r,g,b,a)'
 * @param {number|string} color
 * @param {number}        alpha
 * @return {string}
 */
export function colorToRGB (color, alpha) {
  // number in octal format or string prefixed with #
  if (typeof color === 'string' && color[0] === '#') {
    color = window.parseInt(color.slice(1), 16)
  }
  alpha = (alpha === undefined) ? 1 : alpha
  // parse hex values
  let r = color >> 16 & 0xff
  let g = color >> 8 & 0xff
  let b = color & 0xff
  let a = (alpha < 0) ? 0 : ((alpha > 1) ? 1 : alpha)
  // only use 'rgba' if needed
  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`
  } else {
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

/**
 * Determine if a rectangle contains the coordinates (x,y) within it's boundaries.
 * @param {object}  rect  Object with properties: x, y, width, height.
 * @param {number}  x     Coordinate position x.
 * @param {number}  y     Coordinate position y.
 * @return {boolean}
 */
export function containsPoint (rect, x, y) {
  return !(x < rect.x ||
           x > rect.x + rect.width ||
           y < rect.y ||
           y > rect.y + rect.height)
}

/**
 * Determine if two rectangles overlap.
 * @param {object}  rectA Object with properties: x, y, width, height.
 * @param {object}  rectB Object with properties: x, y, width, height.
 * @return {boolean}
 */
export function intersects (rectA, rectB) {
  return !(rectA.x + rectA.width < rectB.x ||
          rectB.x + rectB.width < rectA.x ||
          rectA.y + rectA.height < rectB.y ||
          rectB.y + rectB.height < rectA.y)
}

/**
 * Keeps track of the current mouse position, relative to an element.
 * @param {HTMLElement} element
 * @return {object} Contains properties: x, y, event
 */
export function captureMouse (element) {
  let mouse = {x: 0, y: 0, e: null}
  element.addEventListener('mousemove', e => {
    mouse.x = e.offsetX
    mouse.y = e.offsetY
    mouse.e = e
  })
  return mouse
}
