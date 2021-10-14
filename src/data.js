import { appInstanceMap } from './app'

class EventCenter {
  eventList = new Map()
  on (name, f) {
    let eventInfo = this.eventList.get(name)
    if (!eventInfo) {
      eventInfo = {
        data: {},
        callbacks: new Set(),
      }
      this.eventList.set(name, eventInfo)
    }
    eventInfo.callbacks.add(f)
  }

  off (name, f) {
    const eventInfo = this.eventList.get(name)
    if (eventInfo && typeof f === 'function') {
      eventInfo.callbacks.delete(f)
    }
  }

  dispatch (name, data) {
    const eventInfo = this.eventList.get(name)
    if (eventInfo && eventInfo.data !== data) {
      eventInfo.data = data
      for (const f of eventInfo.callbacks) {
        f(data)
      }
    }
  }
}

const eventCenter = new EventCenter()

function formatEventName (appName, fromBaseApp) {
  if (typeof appName !== 'string' || !appName) return ''
  return fromBaseApp ? `__from_base_app_${appName}__` : `__from_micro_app_${appName}__`
}

export class EventCenterForBaseApp {
  setData (appName, data) {
    eventCenter.dispatch(formatEventName(appName, true), data)
  }

  clearDataListener (appName) {
    eventCenter.off(formatEventName(appName, false))
  }
}

export class EventCenterForMicroApp {
  constructor (appName) {
    this.appName = appName
  }

  addDataListener (cb) {
    eventCenter.on(formatEventName(this.appName, true), cb)
  }

  removeDataListener (cb) {
    if (typeof cb === 'function') {
      eventCenter.off(formatEventName(this.appName, true), cb)
    }
  }

  dispatch (data) {
    const app = appInstanceMap.get(this.appName)
    if (app?.container) {
      const event = new CustomEvent('datachange', {
        detail: {
          data,
        }
      })

      app.container.dispatchEvent(event)
    }
  }
  clearDataListener () {
    eventCenter.off(formatEventName(this.appName, true))
  }
}
