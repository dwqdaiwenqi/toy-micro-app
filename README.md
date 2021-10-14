# toy-micro-app

## 使用

```js
// 在 react 中使用
import ToyMicroApp from './index'

ToyMicroApp.start({
  shadowDOM:true // 默认是 false
})
// ...

return(
  <section>
  {presentAppName === 'app1' && 
    <toy-micro-app
      name='app1'
      url='http://localhost:3001/'
    ></toy-micro-app>}

  {presentAppName === 'app2' && 
    <toy-micro-app
      name='app2'
      url='http://localhost:3001/'
    ></toy-micro-app>}
  </section>
)
```
不要在生产环境使用！不要在生产环境使用！不要在生产环境使用！

生产环境建议直接移步 [micro-app](https://github.com/micro-zoe/micro-app)

本项目是基于 simple-micro-app 开发的，是 simple-micro-app 的加强版，与simple-micro-app 的差异为：
* 对 DOM API 进行了劫持，隔离了元素
* 使用 Function 替代 eval
* 支持了 shadowRoot






