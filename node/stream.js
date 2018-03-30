const fs = require('fs')
const zlib = require('zlib')

const r = fs.createReadStream('file.txt')
const z = zlib.createGzip()
const w = fs.createWriteStream('file.txt.gz')

r.pipe(z).pipe(w)

// const http = require('http')
// const fs = require('fs')

// http
//   .request(
//     'http://www.baidu.com/img/pcindexskin_small.png',
//     res => {
//       res.pipe(fs.createWriteStream('logo.png'))
//     }
//   )
//   .end()
