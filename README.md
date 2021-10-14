# toy-micro-app

## 使用

```js
// 在 react 中使用
import ToyMicroApp from './ToyMicroApp'

ToyMicroApp.start()
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
特别感谢：https://github.com/micro-zoe/micro-app 项目，本项目是基于 simple-micro-app 开发的，与 simple-micro-app 的差异为：
* 对 Dom 元素进行了隔离
* 使用 Function 替代 eval
* 支持 shadowRoot






