const dns = require('dns')

// DNS解析域名获取ip地址
// dns.lookup('archive.org', (error, address, family) => {
//   console.log('IP 地址: %j 地址族: IPv%s', address, family)
//   console.log(error)
// })

// dns.resolve4('archive.org', (err, addresses) => {
//   if (err) throw err

//   console.log(`IP 地址: ${JSON.stringify(addresses)}`)

//   addresses.forEach((a) => {
//     dns.reverse(a, (err, hostnames) => {
//       if (err) {
//         throw err
//       }
//       console.log(`IP 地址 ${a} 逆向解析到域名: ${JSON.stringify(hostnames)}`)
//     })
//   })
// })

// DNS请求的独立解析程序。使用默认的设置创建一个新的解析程序。
// const { Resolver } = require('dns')
// const resolver = new Resolver()
// resolver.setServers(['4.4.4.4'])

// This request will use the server at 4.4.4.4, independent of global settings.
// resolver.resolve4('bing.com', (err, addresses) => {
//   if (err) {
//     console.log(err)
//   }
//   console.log(addresses)
// })

// 返回一个用于当前DNS解析的IP地址的数组的字符串，格式根据rfc5952。如果使用自定义端口，那么字符串将包括一个端口部分。
console.log(dns.getServers())
