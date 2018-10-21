/**
 * 发送消息
 */
(function () {
  const task = new window.Worker('worker.js') // 创建 worker 实例
  let arr = []
  const actions = {
    /**
     * 终止 worker
     * 如果你需要从主线程中立刻终止一个运行中的worker，可以调用worker的terminate 方法
     * worker 线程会被立即杀死，不会有任何机会让它完成自己的操作或清理工作。
     * 而在worker线程中，workers 也可以调用自己的 close 方法进行关闭
     */
    closeInMain () {
      task.terminate()
      arr = null
      console.log('已终止')
    },
    postMessage (e) {
      for (let i = 0; i < 10000000; i++) {
        arr[i] = i
      }
      task.postMessage(arr || e.target.value) // 发送消息到 worker
    },
    onerror (e) {
      console.log(e)
    },
    onmessage (e) {
      // console.log('从worker传回来的数据：' + e.data)
    }
  }
  // 出错捕获
  task.onerror = actions.onerror

  // 消息监听
  task.onmessage = actions.onmessage

  document.body.onclick = function (e) {
    let eventName = e.target.getAttribute('data-event')
    eventName && actions[eventName] && actions[eventName](e)
  }

  document.getElementById('textInput').onchange = actions.postMessage
})()
