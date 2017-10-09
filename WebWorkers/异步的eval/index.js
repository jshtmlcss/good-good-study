/**
 * 在 worker 内使用  eval() 来按顺序执行异步的任何种类的 JavaScript 代码
 */ 

(function () {
  const asyncEval = (function () {
    let listeners = []
    const parser = new window.Worker(encodeURI(`
      data:text/javascript;charset=US-ASCII,
      onmessage = event => {
        postMessage({
          'id': event.data.id,
          'evaluated': eval(event.data.code)
        })
      }
    `.replace(/\s/g, '')))

    parser.onmessage = e => {
      if (listeners[e.data.id]) {
        listeners[e.data.id](e.data.evaluated)
        delete listeners[e.data.id]
      }
    }
    return (code, listener = function () {}) => {
      listeners.push(listener)
      parser.postMessage({
        code,
        id: listeners.length - 1
      })
    }
  })()

  asyncEval('1 + 2', result => {
    console.log('1 + 2 =', result)
  })

  asyncEval('1 / 2', result => {
    console.log('1 / 2 =', result)
  })
})()
