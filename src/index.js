import { defineElement } from './element'
import { EventCenterForBaseApp } from './data'

const BaseAppData = new EventCenterForBaseApp()

const MicroApp = {
  start () {
    defineElement()
  },
}

export default MicroApp
