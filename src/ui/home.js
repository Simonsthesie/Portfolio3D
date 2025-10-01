import { createElement, drawInput } from '../tool/function'
import { keys } from '../control/gamepad'
const text = `
Bienvenue dans mon portfolio interactif !

Ancien chef cuisinier reconverti dans le développement,
je crée des expériences web innovantes et interactives.

Explorez mon univers en 3D et découvrez mon parcours.
`

export default class Home {
  display = true
  onStartCb = null

  constructor() {
    const home = createElement('div', 'container')
    const menu = createElement('div', 'menu')
    const title = createElement('div', 'title', 'Simon Loro')
    const desc = createElement('div', 'desc', text)
    const button1 = createElement('div', 'button start', 'START', () => {
      if (this.onStartCb) this.onStartCb()
    })
    const commandsList = createElement('div', 'commands-list')
    this.drawCommands(commandsList)
    menu.appendChild(title)
    menu.appendChild(desc)
    menu.appendChild(commandsList)
    home.appendChild(button1)
    home.appendChild(menu)
    document.body.appendChild(home)
    this.home = home
  }

  drawCommands(div) {
    const commands = [
      { key: 'ZQSD ou Flèches', action: 'Se déplacer' },
      { key: 'Espace', action: 'Interagir avec les panneaux' },
      { key: 'L', action: 'Attaquer' },
      { key: 'M', action: 'Sauter' },
      { key: 'Shift', action: 'Bouclier' }
    ]
    
    div.innerHTML = '<h3 style="color: white; margin-bottom: 1rem; text-align: center;">🎮 Commandes</h3>'
    
    commands.forEach(cmd => {
      const commandLine = document.createElement('div')
      commandLine.style.cssText = `
        color: white;
        font-size: 1.1rem;
        margin-bottom: 0.8rem;
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
      `
      commandLine.innerHTML = `<span style="font-weight: bold;">${cmd.key}</span><span>${cmd.action}</span>`
      div.appendChild(commandLine)
    })
  }

  drawInputs(div) {
    for (let key in keys) {
      const action = keys[key]
      div.appendChild(drawInput(action, key, this.onKeyChange.bind(this)))
    }
  }

  onKeyChange(event) {
    const conf = event.currentTarget.id.split('_')
    const newKey = event.data
    const key = conf[0]
    const action = conf[1]
    delete keys[key]
    keys[newKey] = action
    event.currentTarget.id = `${key}_${action}`
  }

  onStart(callback) {
    this.onStartCb = callback
  }

  hide() {
    this.home.className = 'container hide'
    this.display = false
  }

  show() {
    this.home.className = 'container'
    this.display = true
  }

  get displayed() {
    return this.display
  }
}
