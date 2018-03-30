var http = require('http')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

var app = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'charset': 'utf-8'
  })

  res.write('loading...<br>')

  return sleep(2000)
    .then(function () {
      res.write(`timer: 2000ms<br>`)
      return sleep(5000)
    })
    .then(function () {
      res.write(`timer: 5000ms<br>`)
    }).then(function () {
      res.end()
    })
})

app.listen(3000)

// require('net').createServer(function (sock) {
//   sock.on('data', function (data) {
//     sock.write('HTTP/1.1 200 OK\r\n')
//     // sock.write('Transfer-Encoding: chunked\r\n')
//     sock.write('\r\n')

//     sock.write('b\r\n')
//     sock.write('01234567890\r\n')

//     sock.write('5\r\n')
//     sock.write('12345\r\n')

//     sock.write('0\r\n')
//     sock.write('\r\n')
//   sock.destroy()
//   })
// }).listen(9090, '127.0.0.1')
