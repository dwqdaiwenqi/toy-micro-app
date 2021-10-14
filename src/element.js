import CreateApp, { appInstanceMap } from './app'

class ToyMicroApp extends HTMLElement {
  static get observedAttributes () {
    return ['name', 'url']
  }

  constructor() {
    super()
  }

  connectedCallback () {
    const app = new CreateApp({
      name: this.name,
      url: this.url,
      container: this,
    })
    appInstanceMap.set(this.name, app)
  }

  disconnectedCallback () {
    const app = appInstanceMap.get(this.name)
    app.unmount(this.hasAttribute('destory'))
  }

  attributeChangedCallback (attrName, oldVal, newVal) {
    if (attrName === 'name' && !this.name && newVal) {
      this.name = newVal
    } else if (attrName === 'url' && !this.url && newVal) {
      this.url = newVal
    }
  }
}

export function defineElement () {
  if (!window.customElements.get('toy-micro-app')) {
    window.customElements.define('toy-micro-app', ToyMicroApp)
  }
}
