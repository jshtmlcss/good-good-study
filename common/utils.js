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
