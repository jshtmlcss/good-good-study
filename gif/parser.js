import Stream from './stream.js'
import EventEmitter from './eventEmitter.js'
import { bitsToNum, byteToBitArr, lzwDecode, deinterlace, fileToArrayBuffer } from './utils.js'

export default class Parser extends EventEmitter {
  constructor () {
    super()

    this.stream = null
  }

  load (src, callback) {
    const that = this

    if (window.FileReader && (src instanceof window.Blob || src instanceof window.File)) {
      fileToArrayBuffer(src, arrayBuffer => {
        const data = new Uint8Array(arrayBuffer)

        that.loadEnd(data, callback)
      }, error => {
        that.emit('loadError', error)
      })
      return
    }

    that.req = new window.XMLHttpRequest()

    // new browsers (XMLHttpRequest2-compliant)
    that.req.open('GET', src, true)

    if ('overrideMimeType' in that.req) {
      that.req.overrideMimeType('text/plain; charset=x-user-defined')
    } else if ('responseType' in that.req) {
      // old browsers (XMLHttpRequest-compliant)
      that.req.responseType = 'arraybuffer'
    } else {
      // IE9 (Microsoft.XMLHTTP-compliant)
      that.req.setRequestHeader('Accept-Charset', 'x-user-defined')
    }

    // req.onloadstart = function () {
    // }

    that.req.onload = function (e) {
      if (this.status !== 200) {
        that.emit('loadError', { status: this.status })
      }

      // emulating response field for IE9
      if (!('response' in this)) {
        this.response = new window.VBArray(this.responseText)
          .toArray()
          .map(String.fromCharCode)
          .join('')
      }

      var data = this.response

      if (data.toString().indexOf('ArrayBuffer') > 0) {
        data = new Uint8Array(data)
      }

      that.loadEnd(data, callback, e)
    }

    that.req.onprogress = function (e) {
      if (e.lengthComputable) {
        that.emit('loadProgress', e.loaded, e.total)
      }
    }

    that.req.onerror = function (error) {
      that.emit('loadError', error)
      that.req = null
    }

    that.req.send()

    return that
  }

  loadAbort () {
    if (this.req) {
      this.req.abort()
      this.req = null
      this.emit('loadAbort')
    }
  }

  loadEnd (data, callback, e) {
    const that = this

    that.stream = new Stream(data)

    setTimeout(() => {
      callback && callback()
      that.emit('loaded', e || null)
      that.req = null
      that.parse()
    }, 0)
  }

  parse () {
    try {
      this.parseHeader()
      setTimeout(() => {
        this.parseBlock()
      }, 0)
    } catch (error) {
      this.emit('parseError', error)
    }
  }

  parseCT (entries) {
    // Each entry is 3 bytes, for RGB.
    var ct = []
    for (var i = 0; i < entries; i++) {
      ct.push(this.stream.readBytes(3))
    }
    return ct
  }

  readSubBlocks () {
    var size, data
    data = ''
    do {
      size = this.stream.readByte()
      data += this.stream.read(size)
    } while (size !== 0)
    return data
  }

  parseHeader () {
    var hdr = {}
    hdr.sig = this.stream.read(3)
    hdr.ver = this.stream.read(3)
    if (hdr.sig !== 'GIF') throw new Error('Not a GIF file.') // XXX: This should probably be handled more nicely.
    hdr.width = this.stream.readUnsigned()
    hdr.height = this.stream.readUnsigned()

    var bits = byteToBitArr(this.stream.readByte())
    hdr.gctFlag = bits.shift()
    hdr.colorRes = bitsToNum(bits.splice(0, 3))
    hdr.sorted = bits.shift()
    hdr.gctSize = bitsToNum(bits.splice(0, 3))

    hdr.bgColor = this.stream.readByte()
    hdr.pixelAspectRatio = this.stream.readByte() // if not 0, aspectRatio = (pixelAspectRatio + 15) / 64
    if (hdr.gctFlag) {
      hdr.gct = this.parseCT(1 << (hdr.gctSize + 1))
    }
    this.setParseStatus('parseHeader', hdr)
  }

  parseImg (img) {
    img.leftPos = this.stream.readUnsigned()
    img.topPos = this.stream.readUnsigned()
    img.width = this.stream.readUnsigned()
    img.height = this.stream.readUnsigned()

    var bits = byteToBitArr(this.stream.readByte())
    img.lctFlag = bits.shift()
    img.interlaced = bits.shift()
    img.sorted = bits.shift()
    img.reserved = bits.splice(0, 2)
    img.lctSize = bitsToNum(bits.splice(0, 3))

    if (img.lctFlag) {
      img.lct = this.parseCT(1 << (img.lctSize + 1))
    }

    img.lzwMinCodeSize = this.stream.readByte()

    var lzwData = this.readSubBlocks()

    img.pixels = lzwDecode(img.lzwMinCodeSize, lzwData)

    if (img.interlaced) {
      // Move
      img.pixels = deinterlace(img.pixels, img.width)
    }

    this.setParseStatus('parseImg', img)
  }

  parseBlock () {
    const that = this

    var block = {}
    block.sentinel = that.stream.readByte()

    switch (String.fromCharCode(block.sentinel)) { // For ease of matching
      case '!':
        block.type = 'ext'
        that.parseExt(block)
        break
      case ',':
        block.type = 'img'
        that.parseImg(block)
        break
      case ';':
        block.type = 'eof'
        that.emit('parseEnd', block)
        break
      default:
        throw new Error('Unknown block: 0x' + block.sentinel.toString(16)) // TODO: Pad this with a 0.
    }

    if (block.type !== 'eof') {
      setTimeout(() => {
        that.parseBlock()
      }, 0)
    }
  }

  parseExt (block) {
    block.label = this.stream.readByte()
    switch (block.label) {
      case 0xf9:
        block.extType = 'gce'
        this.parseGCExt(block)
        break
      case 0xfe:
        block.extType = 'com'
        this.parseComExt(block)
        break
      case 0x01:
        block.extType = 'pte'
        this.parsePTExt(block)
        break
      case 0xff:
        block.extType = 'app'
        this.parseAppExt(block)
        break
      default:
        block.extType = 'unknown'
        this.parseUnknownExt(block)
        break
    }
  }

  parseGCExt (block) {
    this.stream.readByte() // Always 4
    var bits = byteToBitArr(this.stream.readByte())
    block.reserved = bits.splice(0, 3) // Reserved; should be 000.
    block.disposalMethod = bitsToNum(bits.splice(0, 3))
    block.userInput = bits.shift()
    block.transparencyGiven = bits.shift()

    block.delayTime = this.stream.readUnsigned()

    block.transparencyIndex = this.stream.readByte()

    block.terminator = this.stream.readByte()

    this.setParseStatus('parseGCExt', block)
  }

  parseComExt (block) {
    block.comment = this.readSubBlocks()
    this.setParseStatus('parseComExt', block)
  }

  parsePTExt (block) {
    // No one *ever* uses this. If you use it, deal with parsing it yourself.
    this.stream.readByte() // Always 12
    block.ptHeader = this.stream.readBytes(12)
    block.ptData = this.readSubBlocks()
    this.setParseStatus('parsePTExt', block)
  }

  parseAppExt (block) {
    const that = this

    var parseNetscapeExt = function (block) {
      that.stream.readByte() // Always 3
      block.unknown = that.stream.readByte() // ??? Always 1? What is this?
      block.iterations = that.stream.readUnsigned()
      block.terminator = that.stream.readByte()
      that.setParseStatus('parseAppExt', block)
    }

    var parseUnknownAppExt = function (block) {
      block.appData = that.readSubBlocks()
      that.setParseStatus('parseUnknownAppExt', block)
    }

    that.stream.readByte() // Always 11
    block.identifier = that.stream.read(8)
    block.authCode = that.stream.read(3)
    switch (block.identifier) {
      case 'NETSCAPE':
        parseNetscapeExt(block)
        break
      default:
        parseUnknownAppExt(block)
        break
    }
  }

  parseUnknownExt (block) {
    block.data = this.readSubBlocks()
    this.setParseStatus('parseUnknownExt', block)
  }

  setParseStatus (eventName, data) {
    this.emit(eventName, data)
    this.emit('parseProgress', eventName, this.stream.pos, this.stream.data.length)
  }
}
