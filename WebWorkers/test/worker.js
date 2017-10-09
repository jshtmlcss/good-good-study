/**
 * 接受主线程传递过来的消息
 * onmessage、 close、postMessage 都是当前文件内的全局方法
 * close 用于关闭线程
 * postMessage 用于发送消息到主线程
 */
onmessage = function (e) {
  console.log('从主线程传递过来的数据：' + e.data)
  postMessage(`/***** ${e.data} *****/`)
  // close()
}
