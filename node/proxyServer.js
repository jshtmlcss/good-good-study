const http = require('http')
const parseUrl = require('url').parse

class ProxyServer {
  constructor (options) {
    options.target = parseUrl(options.target)
    this.options = options
  }

  // 创建代理服务
  _createServer () {
    // 仅支持 http 协议
    this._server = http.createServer(
      (this._requestListener = this._requestListener.bind(this))
    )

    return this._server
  }

  // 代理请求监听
  _requestListener (req, res) {
    const options = helpers.getRequestOptions(this.options, req)

    // 使用 http.request 请求目标 url
    const proxyReq = http.request(options)

    req.pipe(proxyReq)

    proxyReq.on('response', proxyRes => {
      // 设置响应头内容为代理的响应头内容
      helpers.setHeads(res, proxyRes)
      // 写入状态码
      helpers.writeStatusCode(res, proxyRes)
      // 传递内容
      proxyRes.pipe(res)
    })
  }

  listen (port) {
    this._createServer().listen(port)
  }
}

const helpers = {
  setHeads (res, proxyRes) {
    Object.keys(proxyRes.headers).forEach(key => {
      const header = proxyRes.headers[key]

      res.setHeader(String(key).trim(), header)
    })
  },
  writeStatusCode (res, proxyRes) {
    if (proxyRes.statusMessage) {
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage)
    } else {
      res.writeHead(proxyRes.statusCode)
    }
  },
  getRequestOptions (opts, req) {
    const options = {
      port: helpers.getPort(opts.target),
      host: opts.target.host,
      hostname: opts.target.hostname,
      method: req.method,
      path: req.url,
      headers: Object.assign(
        {},
        req.headers,
        opts.config ? opts.config.headers : null
      ),
      agent: false
    }

    if (opts.config) {
      const config = Object.assign({}, opts.config)

      delete config.headers

      Object.assign(options, config)
    }

    return options
  },
  getPort (target) {
    return target.port || target.protocol === 'https:' ? 443 : 80
  }
}

// example
new ProxyServer({
  target: 'http://nodejs.cn',
  config: {
    headers: {
      host: 'nodejs.cn',
      cookie: ''
    }
  }
}).listen(8005)

console.log('http proxy server started on port 8005')
