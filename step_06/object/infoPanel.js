import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three'

export default class InfoPanel extends Mesh {
  static panels = []
  static activePanel = null
  static ui = null

  constructor(position, title, content, options = {}) {
    super()
    
    this.position.set(position.x, position.y, position.z)
    this.title = title
    this.content = content
    this.options = {
      size: 2,
      color: 0x4a90e2,
      ...options
    }
    
    this.createVisual()
    this.createTriggerZone()
    InfoPanel.panels.push(this)
    
    console.log(`Panneau créé: ${title} à la position (${position.x}, ${position.y}, ${position.z})`)
  }

  createVisual() {
    // Créer un panneau très simple et visible
    const geometry = new BoxGeometry(2, 2, 2) // Cube simple
    const material = new MeshBasicMaterial({ 
      color: this.options.color,
      transparent: false,
      opacity: 1.0
    })
    
    this.geometry = geometry
    this.material = material
    this.visible = true
  }

  createTriggerZone() {
    // Zone de déclenchement plus grande que le panneau
    this.triggerDistance = this.options.size * 2
  }

  checkPlayerDistance(player) {
    const distance = this.position.distanceTo(player.position)
    return distance <= this.triggerDistance
  }

  show() {
    this.visible = true
    this.showUI()
  }

  hide() {
    this.visible = false
    this.hideUI()
  }

  showUI() {
    if (InfoPanel.activePanel === this) return
    
    InfoPanel.activePanel = this
    this.createInfoUI()
  }

  hideUI() {
    if (InfoPanel.activePanel !== this) return
    
    InfoPanel.activePanel = null
    this.removeInfoUI()
  }

  createInfoUI() {
    // Interface très simple pour éviter les erreurs
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.background = 'rgba(0, 0, 0, 0.8)'
    overlay.style.display = 'flex'
    overlay.style.justifyContent = 'center'
    overlay.style.alignItems = 'center'
    overlay.style.zIndex = '1000'
    
    const panel = document.createElement('div')
    panel.style.background = '#2c3e50'
    panel.style.padding = '2rem'
    panel.style.borderRadius = '10px'
    panel.style.maxWidth = '500px'
    panel.style.color = 'white'
    panel.style.position = 'relative'
    
    const title = document.createElement('h2')
    title.textContent = this.title
    title.style.marginBottom = '1rem'
    title.style.textAlign = 'center'
    
    const content = document.createElement('div')
    content.textContent = this.content
    content.style.whiteSpace = 'pre-line'
    content.style.lineHeight = '1.5'
    
    const closeBtn = document.createElement('button')
    closeBtn.textContent = 'Fermer'
    closeBtn.style.position = 'absolute'
    closeBtn.style.top = '10px'
    closeBtn.style.right = '10px'
    closeBtn.style.background = '#e74c3c'
    closeBtn.style.color = 'white'
    closeBtn.style.border = 'none'
    closeBtn.style.padding = '5px 10px'
    closeBtn.style.cursor = 'pointer'
    closeBtn.onclick = () => {
      this.hide()
    }

    panel.appendChild(title)
    panel.appendChild(content)
    panel.appendChild(closeBtn)
    overlay.appendChild(panel)
    
    document.body.appendChild(overlay)
    this.ui = overlay
  }

  removeInfoUI() {
    if (this.ui) {
      document.body.removeChild(this.ui)
      this.ui = null
    }
  }

  static update(player) {
    // Trouver le panneau le plus proche
    let closestPanel = null
    let closestDistance = Infinity
    
    for (const panel of InfoPanel.panels) {
      const distance = panel.position.distanceTo(player.position)
      if (distance <= panel.triggerDistance && distance < closestDistance) {
        closestPanel = panel
        closestDistance = distance
      }
    }
    
    // Afficher seulement le panneau le plus proche
    for (const panel of InfoPanel.panels) {
      if (panel === closestPanel) {
        if (InfoPanel.activePanel !== panel) {
          panel.show()
        }
      } else {
        if (InfoPanel.activePanel === panel) {
          panel.hide()
        }
      }
    }
  }

  static cleanup() {
    for (const panel of InfoPanel.panels) {
      panel.hide()
    }
    InfoPanel.panels = []
    InfoPanel.activePanel = null
  }
}
