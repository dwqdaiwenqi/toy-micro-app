import loadHtml from './source'
import Sandbox from './sandbox'

export const appInstanceMap = new Map()

export default class CreateApp {
  constructor ({ name, url, container }) {
    this.name = name 
    this.url = url  
    this.container = container 
    this.status = 'loading'
    loadHtml(this)
    this.sandbox = new Sandbox(name)
  }

  status = 'created' 

  source = {
    links: new Map(), 
    scripts: new Map(), 
  }

  onLoad (htmlDom) {
    this.loadCount = this.loadCount ? this.loadCount + 1 : 1
    if (this.loadCount === 2 && this.status !== 'unmount') {
      this.source.html = htmlDom
      this.mount()
    }
  }

  mount () {
    const cloneHtml = this.source.html.cloneNode(true)
    const fragment = document.createDocumentFragment()
    Array.from(cloneHtml.childNodes).forEach((node) => {
      fragment.appendChild(node)
    })
    this.container.appendChild(fragment)
    this.sandbox.start(this.name)
    this.source.scripts.forEach((info) => {
     this.sandbox.bindScope(info.code)
    })
    this.status = 'mounted'
  }

  unmount (destory) {
    this.status = 'unmount'
    this.container = null
    this.sandbox.stop()
    if (destory) {
      appInstanceMap.delete(this.name)
    }
  }
}
