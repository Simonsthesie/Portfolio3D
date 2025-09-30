import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three'
import { createElement } from '../tool/function'

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
    // Zone de déclenchement plus petite pour éviter l'ouverture automatique
    this.triggerDistance = 3
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
    // S'assurer que le panneau actif est bien réinitialisé
    if (InfoPanel.activePanel === this) {
      InfoPanel.activePanel = null
    }
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
    // Créer l'interface utilisateur pour afficher les informations
    const overlay = document.createElement('div')
    overlay.className = 'info-overlay'
    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide()
      }
    })
    
    const panel = document.createElement('div')
    panel.className = 'info-panel'
    
    const title = document.createElement('h2')
    title.className = 'info-title'
    title.textContent = this.title
    
    const content = document.createElement('div')
    content.className = 'info-content'
    content.textContent = this.content
    
    const closeBtn = document.createElement('button')
    closeBtn.className = 'info-close'
    closeBtn.textContent = '×'
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.hide()
    })

    panel.appendChild(title)
    panel.appendChild(content)
    panel.appendChild(closeBtn)
    overlay.appendChild(panel)
    
    document.body.appendChild(overlay)
    this.ui = overlay
  }

  removeInfoUI() {
    if (this.ui && this.ui.parentNode) {
      this.ui.parentNode.removeChild(this.ui)
      this.ui = null
    }
  }

  static update(player) {
    // Ne pas afficher les panneaux si le joueur n'est pas actif
    if (!player.active) return
    
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
    // Fermer seulement les interfaces, ne pas supprimer les panneaux
    for (const panel of InfoPanel.panels) {
      panel.hide()
    }
    InfoPanel.activePanel = null
  }
}
