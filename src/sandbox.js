/* eslint-disable no-new-func */
import { EventCenterForMicroApp } from './data'
import {getCurrentAppName,setCurrentAppName} from './utils'
import { appInstanceMap } from './app'
const rawWindowAddEventListener = window.addEventListener
const rawWindowRemoveEventListener = window.removeEventListener


 function effect (microWindow) {
  const eventListenerMap = new Map()

  microWindow.addEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type)
    if (listenerList) {
      listenerList.add(listener)
    } else {
      eventListenerMap.set(type, new Set([listener]))
    }
    return rawWindowAddEventListener.call(window, type, listener, options)
  }

  microWindow.removeEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type)
    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener)
    }
    return rawWindowRemoveEventListener.call(window, type, listener, options)
  }

  return () => {
    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        if (listenerList.size) {
          for (const listener of listenerList) {
            rawWindowRemoveEventListener.call(window, type, listener)
          }
        }
      })
      eventListenerMap.clear()
    }
  }
}


let macroTimer
function macroTask (fn) {
  if (macroTimer) clearTimeout(macroTimer)
  macroTimer = setTimeout(fn, 0)
}

const rawQuerySelector = Document.prototype.querySelector

Document.prototype.querySelector = function(selectors){
  const appName = getCurrentAppName()
  const app = appInstanceMap.get(appName)
  // 是主应用
  if (!appName) {
    return rawQuerySelector.call(document, selectors)
  }else{
    // 是子应用
    if(selectors === 'head'){
      selectors = 'micro-app-head'
    }
    if(selectors === 'body'){
      selectors = 'micro-app-body'
    }
    // 开启了shadow
    if(app.shadowDOM){
      return app?.container?.shadow.querySelector(selectors)
    }else{
      return app?.container?.querySelector(selectors)
    }
  }
}

export default class SandBox {
  active = false 
  microWindow = {} 
  injectedKeys = new Set() 

  constructor (appName) {
    this.microWindow.microApp = new EventCenterForMicroApp(appName)
    this.releaseEffect = effect(this.microWindow)
    
    Object.assign(this.microWindow,{
      __MICRO__MICRO_APP_BASE_ROUTE__:appName,
      __APP_NAME__:appName
    })

    this.proxyWindow = new Proxy(this.microWindow, {
      get: (target, key) => {
        // 优先从代理对象上取值
        if (Reflect.has(target, key)) {
          return Reflect.get(target, key)
        }

        if (key === 'document') {
          setCurrentAppName(appName)
          macroTask(() => setCurrentAppName(null))
        }
        // 否则兜底到window对象上取值
        const rawValue = Reflect.get(window, key)
        // 如果兜底的值为函数，则需要绑定window对象，如：console、alert等
        if (typeof rawValue === 'function') {
          const valueStr = rawValue.toString()
          // 排除构造函数
          // setTimeout 函数
          // HTMLIFrameElement 构造函数
          if (!/^function\s+[A-Z]/.test(valueStr) && !/^class\s+/.test(valueStr)) {
            return rawValue.bind(window)
          }
        }
        // 其它情况直接返回
        return rawValue
      },
      set: (target, key, value) => {
        if (this.active) {
          Reflect.set(target, key, value)
          this.injectedKeys.add(key)
        }
        return true
      },
      deleteProperty: (target, key) => {
        if (target.hasOwnProperty(key)) {
          return Reflect.deleteProperty(target, key)
        }
        return true
      },
    })
  }

  start () {
    if (!this.active) {
      this.active = true
    }
  }

  stop () {
    if (this.active) {
      this.active = false

      this.injectedKeys.forEach((key) => {
        Reflect.deleteProperty(this.microWindow, key)
      })
      this.injectedKeys.clear()

      this.releaseEffect()

      this.microWindow.microApp.clearDataListener()
    }
  }

  bindScope (code) {
    window.proxyWindow = this.proxyWindow
    const fn = new Function('proxyWindow',`
      ;(function(window){
        with(window){
          ;${code}\n
        }
      }).call(window.proxyWindow,window.proxyWindow);
    `)
    fn(window.proxyWindow)
  }
}
