const path = require('path')
console.log('当前文件执行时的路径:  ', __dirname)
console.log('连接路径: ', path.join('/parent/child/', '../test'))
console.log('相对路径转绝对路径:  ', path.resolve('parent/child', './test'))
console.log('相对路径转绝对路径:  ', path.resolve('test'))
