import * as THREE from 'three'
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { createElement } from '../tool/function'
import Rapier from '@dimforge/rapier3d-compat'

export default class InfoPanel extends Mesh {
  static panels = []
  static activePanel = null
  static ui = null
  static interactionIndicator = null

  constructor(position, title, content, options = {}, physic = null) {
    super()
    
    this.position.set(position.x, position.y, position.z)
    this.title = title
    this.content = content
    this.options = {
      size: 2,
      color: 0x4a90e2,
      ...options
    }
    this.physic = physic
    this.collider = null
    
    this.createVisual()
    this.createTriggerZone()
    this.createCollision()
    InfoPanel.panels.push(this)
    
    console.log(`Panneau créé: ${title} à la position (${position.x}, ${position.y}, ${position.z})`)
  }

  createVisual() {
    // Créer un panneau simple et coloré
    this.createDefaultPanelWithText()
  }

  createDefaultPanelWithText() {
    // Créer le panneau de base avec effet bois cartoon (petit)
    const geometry = new BoxGeometry(1.8, 1.8, 0.15)
    
    // Créer une texture de bois cartoon
    const woodTexture = this.createCartoonWoodTexture()
    const material = new THREE.MeshBasicMaterial({ 
      map: woodTexture,
      transparent: false
    })
    
    this.geometry = geometry
    this.material = material
    this.visible = true
    this.castShadow = true
    this.receiveShadow = true

    // Ajouter le texte directement sur le panneau
    this.addTextToPanel()
  }

  createCartoonWoodTexture() {
    // Créer un canvas pour la texture de bois cartoon
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 256
    canvas.height = 256

    // Couleur de base du bois (marron chaud)
    const baseColor = '#8B5A2B'
    const darkColor = '#654321'
    const lightColor = '#A0702B'

    // Remplir le fond
    ctx.fillStyle = baseColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Ajouter des lignes de bois horizontales (grain du bois)
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * canvas.height
      const thickness = Math.random() * 3 + 1
      const color = Math.random() > 0.5 ? darkColor : lightColor
      
      ctx.strokeStyle = color
      ctx.lineWidth = thickness
      ctx.globalAlpha = 0.3 + Math.random() * 0.3
      
      ctx.beginPath()
      ctx.moveTo(0, y)
      
      // Créer des ondulations pour un effet naturel
      for (let x = 0; x < canvas.width; x += 10) {
        const offset = Math.sin(x * 0.1 + i) * 2
        ctx.lineTo(x, y + offset)
      }
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Ajouter des noeuds de bois (cercles)
    ctx.globalAlpha = 0.4
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 8 + 3
      
      // Cercle extérieur
      ctx.fillStyle = darkColor
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Cercle intérieur
      ctx.fillStyle = baseColor
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Ajouter un contour plus foncé pour l'effet cartoon
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#3D2817'
    ctx.lineWidth = 8
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Ajouter des ombres intérieures pour plus de profondeur
    ctx.globalAlpha = 0.3
    ctx.strokeStyle = darkColor
    ctx.lineWidth = 6
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    return texture
  }

  addTextToPanel() {
    // Créer un canvas pour le texte avec effet parchemin
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 512
    canvas.height = 512

    // Créer l'effet parchemin
    this.createParchmentEffect(context, canvas.width, canvas.height)
    
    // Texte avec style médiéval
    context.fillStyle = '#2c1810' // Brun foncé pour le texte
    context.font = 'bold 24px serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Diviser le texte en lignes
    const lines = this.content.split('\n')
    const maxLines = 6
    const lineHeight = 40
    const startY = canvas.height / 2 - (Math.min(lines.length, maxLines) * lineHeight) / 2

    // Dessiner le titre en français avec style calligraphique
    context.font = 'bold 32px serif'
    context.fillStyle = '#1a0f08' // Plus foncé pour le titre
    context.fillText(this.title, canvas.width / 2, startY - 60)

    // Dessiner le contenu en "elfique" (style runique mystique)
    context.font = '18px serif'
    context.fillStyle = '#3d2914' // Couleur plus mystique
    lines.slice(0, maxLines).forEach((line, index) => {
      const y = startY + (index * lineHeight)
      const elvishText = this.translateToElvish(line)
      context.fillText(elvishText, canvas.width / 2, y)
    })

    // Créer une texture à partir du canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // Créer un plan pour afficher le texte (plus petit que le cadre pour ne pas dépasser)
    const textGeometry = new THREE.PlaneGeometry(1.4, 1.4)
    const textMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    })
    
    const textMesh = new THREE.Mesh(textGeometry, textMaterial)
    textMesh.position.set(0, 0, 0.11) // Légèrement devant le panneau
    this.add(textMesh)
    
    console.log(`Panneau ${this.title} avec effet parchemin créé avec succès`)
  }

  translateToElvish(text) {
    // Système de traduction "elfique" mystique
    const elvishMap = {
      // Lettres communes
      'a': 'ᚪ', 'b': 'ᛒ', 'c': 'ᚳ', 'd': 'ᛞ', 'e': 'ᛖ', 'f': 'ᚠ', 'g': 'ᚷ', 'h': 'ᚻ',
      'i': 'ᛁ', 'j': 'ᛡ', 'k': 'ᚲ', 'l': 'ᛚ', 'm': 'ᛗ', 'n': 'ᚾ', 'o': 'ᚩ', 'p': 'ᛈ',
      'q': 'ᛩ', 'r': 'ᚱ', 's': 'ᛋ', 't': 'ᛏ', 'u': 'ᚢ', 'v': 'ᚡ', 'w': 'ᚹ', 'x': 'ᛪ',
      'y': 'ᚣ', 'z': 'ᛉ',
      // Chiffres
      '0': 'ᛝ', '1': 'ᛁ', '2': 'ᛒ', '3': 'ᛏ', '4': 'ᚠ', '5': 'ᚠ', '6': 'ᛋ', '7': 'ᛋ', '8': 'ᚱ', '9': 'ᚾ',
      // Symboles spéciaux
      '•': '✦', '🎮': '⚔', '🌐': '🌙', '📱': '📜', '📧': '✉', '💼': '⚒', '🐙': '🐉', '📱': '📱',
      '!': '!', '?': '?', ':' : ':', ';': ';', ',': ',', '.': '.', '-': '—', '+': '+',
      ' ': ' ' // Espace reste espace
    }
    
    // Traduire chaque caractère
    let elvishText = ''
    for (let char of text.toLowerCase()) {
      if (elvishMap[char]) {
        elvishText += elvishMap[char]
      } else {
        elvishText += char // Garder les caractères non mappés
      }
    }
    
    return elvishText
  }

  createParchmentEffect(context, width, height) {
    // Couleur de base parchemin
    const baseColor = '#f4e4c1'
    const shadowColor = '#e6d3a3'
    const borderColor = '#d4c4a8'
    
    // Fond principal
    context.fillStyle = baseColor
    context.fillRect(0, 0, width, height)
    
    // Ajouter des variations de couleur pour l'effet vieilli
    const gradient = context.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f7e8d1')
    gradient.addColorStop(0.3, '#f0dfc2')
    gradient.addColorStop(0.7, '#ede0b3')
    gradient.addColorStop(1, '#e8d8a8')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
    
    // Ajouter des taches d'âge
    context.fillStyle = 'rgba(210, 180, 140, 0.3)'
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const radius = 20 + Math.random() * 30
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
    
    // Ajouter des lignes d'âge
    context.strokeStyle = 'rgba(180, 150, 120, 0.4)'
    context.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * height
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y + Math.random() * 10 - 5)
      context.stroke()
    }
    
    // Bordure parchemin
    context.strokeStyle = borderColor
    context.lineWidth = 3
    context.strokeRect(5, 5, width - 10, height - 10)
    
    // Ajouter des coins usés
    context.fillStyle = 'rgba(200, 170, 130, 0.6)'
    context.beginPath()
    context.arc(20, 20, 15, 0, Math.PI * 2)
    context.fill()
    context.beginPath()
    context.arc(width - 20, 20, 15, 0, Math.PI * 2)
    context.fill()
    context.beginPath()
    context.arc(20, height - 20, 15, 0, Math.PI * 2)
    context.fill()
    context.beginPath()
    context.arc(width - 20, height - 20, 15, 0, Math.PI * 2)
    context.fill()
  }

  createTriggerZone() {
    // Zone de déclenchement pour l'interaction
    this.triggerDistance = 3
    this.isPlayerNear = false
  }

  createCollision() {
    // Ajouter une collision solide au panneau
    this.userData = {
      type: 'infoPanel',
      solid: true,
      collision: true
    }
    
    // Marquer comme obstacle pour le système de collision
    this.name = `infoPanel_${this.title.replace(/\s+/g, '_')}`
    
    // Créer un collider physique si le système de physique est disponible
    if (this.physic) {
      this.createPhysicsCollider()
    }
  }

  createPhysicsCollider() {
    // Créer un collider statique pour le panneau
    const rigidBodyDesc = Rapier.RigidBodyDesc.fixed()
    rigidBodyDesc.setTranslation(this.position.x, this.position.y, this.position.z)
    
    const rigidBody = this.physic.createRigidBody(rigidBodyDesc)
    
    // Créer un collider en forme de boîte pour le panneau (1.8x1.8x0.15)
    const colliderDesc = Rapier.ColliderDesc.cuboid(0.9, 0.9, 0.075)
    this.collider = this.physic.createCollider(colliderDesc, rigidBody)
    
    console.log(`Collider créé pour le panneau: ${this.title}`)
  }

  checkPlayerDistance(player) {
    const distance = this.position.distanceTo(player.position)
    this.isPlayerNear = distance <= this.triggerDistance
    return this.isPlayerNear
  }

  showPopup() {
    if (InfoPanel.activePanel && InfoPanel.activePanel !== this) {
      InfoPanel.activePanel.hidePopup()
    }
    
    InfoPanel.activePanel = this
    InfoPanel.hideInteractionIndicator() // Masquer l'indication quand la popup s'ouvre
    this.createPopupUI()
  }

  hidePopup() {
    if (InfoPanel.activePanel === this) {
      InfoPanel.activePanel = null
      this.removePopupUI()
      // L'indication sera réaffichée automatiquement par updateInteractionIndicator si le joueur est encore près d'un panneau
    }
  }

  formatContentWithLinks(text) {
    // Convertir les URLs en liens cliquables
    // Regex pour détecter les URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    
    // Remplacer les URLs par des liens HTML
    let formattedText = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3498db; text-decoration: underline;">${url}</a>`
    })
    
    // Échapper les caractères HTML pour éviter les injections
    formattedText = formattedText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    
    // Mais garder les balises <a> que nous avons créées
    formattedText = formattedText.replace(/&lt;a href="/g, '<a href="')
                                 .replace(/"&gt;/g, '">')
                                 .replace(/&lt;\/a&gt;/g, '</a>')
    
    // Convertir les sauts de ligne en <br>
    formattedText = formattedText.replace(/\n/g, '<br>')
    
    return formattedText
  }

  createPopupUI() {
    // Créer l'interface popup avec les informations en français
    const overlay = document.createElement('div')
    overlay.className = 'info-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `
    
    const panel = document.createElement('div')
    panel.className = 'info-panel'
    panel.style.cssText = `
      background: linear-gradient(135deg, #f4e4c1, #e6d3a3);
      border: 3px solid #d4c4a8;
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      font-family: serif;
      color: #2c1810;
      position: relative;
    `
    
    const title = document.createElement('h2')
    title.className = 'info-title'
    title.textContent = this.title
    title.style.cssText = `
      font-size: 28px;
      font-weight: bold;
      color: #1a0f08;
      text-align: center;
      margin-bottom: 20px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    `
    
    const content = document.createElement('div')
    content.className = 'info-content'
    content.innerHTML = this.formatContentWithLinks(this.content)
    content.style.cssText = `
      font-size: 16px;
      line-height: 1.6;
      white-space: pre-line;
    `
    
    const closeBtn = document.createElement('button')
    closeBtn.className = 'info-close'
    closeBtn.textContent = '✕'
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: #d4c4a8;
      border: 2px solid #b8a082;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 16px;
      color: #2c1810;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.hidePopup()
    })

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hidePopup()
      }
    })

    panel.appendChild(title)
    panel.appendChild(content)
    
    // Ajouter le bouton CV uniquement pour le panneau "Contact"
    if (this.title === "Contact") {
      const cvBtn = document.createElement('button')
      cvBtn.textContent = '📄 Voir mon CV'
      cvBtn.style.cssText = `
        display: block;
        margin: 20px auto 0;
        padding: 12px 24px;
        background: #2ecc71;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s;
      `
      cvBtn.addEventListener('mouseenter', () => {
        cvBtn.style.background = '#27ae60'
      })
      cvBtn.addEventListener('mouseleave', () => {
        cvBtn.style.background = '#2ecc71'
      })
      cvBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        window.open('./CV_Loro.pdf', '_blank')
      })
      panel.appendChild(cvBtn)
    }
    
    panel.appendChild(closeBtn)
    overlay.appendChild(panel)
    
    document.body.appendChild(overlay)
    this.popupUI = overlay
  }

  removePopupUI() {
    if (this.popupUI && this.popupUI.parentNode) {
      this.popupUI.parentNode.removeChild(this.popupUI)
      this.popupUI = null
    }
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

  // Plus besoin de popup - le texte est directement sur le panneau 3D

  removeInfoUI() {
    if (this.ui && this.ui.parentNode) {
      this.ui.parentNode.removeChild(this.ui)
      this.ui = null
    }
  }

  // Plus besoin de update - le texte est toujours visible sur le panneau

  static cleanup() {
    // Fermer seulement les interfaces, ne pas supprimer les panneaux
    for (const panel of InfoPanel.panels) {
      panel.hidePopup()
    }
    InfoPanel.activePanel = null
  }

  static update(player) {
    // Vérifier les interactions avec les panneaux
    for (const panel of InfoPanel.panels) {
      panel.checkPlayerDistance(player)
    }
    
    // Gérer l'affichage de l'indication d'interaction
    InfoPanel.updateInteractionIndicator(player)
  }

  static createInteractionIndicator() {
    if (InfoPanel.interactionIndicator) return
    
    const indicator = document.createElement('div')
    indicator.className = 'interaction-indicator'
    indicator.textContent = 'Appuyez sur Espace'
    indicator.style.display = 'none'
    document.body.appendChild(indicator)
    
    InfoPanel.interactionIndicator = indicator
    console.log("Indicateur d'interaction créé")
  }

  static showInteractionIndicator() {
    if (!InfoPanel.interactionIndicator) {
      InfoPanel.createInteractionIndicator()
    }
    InfoPanel.interactionIndicator.style.display = 'block'
  }

  static hideInteractionIndicator() {
    if (InfoPanel.interactionIndicator) {
      InfoPanel.interactionIndicator.style.display = 'none'
    }
  }

  static updateInteractionIndicator(player) {
    if (!player.active) {
      InfoPanel.hideInteractionIndicator()
      return
    }

    // Vérifier si le joueur est près d'un panneau
    let isNearPanel = false
    for (const panel of InfoPanel.panels) {
      if (panel.isPlayerNear) {
        isNearPanel = true
        break
      }
    }

    if (isNearPanel && !InfoPanel.activePanel) {
      InfoPanel.showInteractionIndicator()
    } else {
      InfoPanel.hideInteractionIndicator()
    }
  }

  static handleSpaceKey(player) {
    console.log("InfoPanel.handleSpaceKey appelé")
    console.log("Nombre de panneaux:", InfoPanel.panels.length)
    
    // Trouver le panneau le plus proche du joueur
    let closestPanel = null
    let closestDistance = Infinity
    
    for (const panel of InfoPanel.panels) {
      console.log(`Panneau ${panel.title}: isPlayerNear=${panel.isPlayerNear}, distance=${panel.position.distanceTo(player.position).toFixed(2)}`)
      if (panel.isPlayerNear) {
        const distance = panel.position.distanceTo(player.position)
        if (distance < closestDistance) {
          closestPanel = panel
          closestDistance = distance
        }
      }
    }
    
    console.log("Panneau le plus proche:", closestPanel ? closestPanel.title : "Aucun")
    
    if (closestPanel) {
      if (InfoPanel.activePanel === closestPanel) {
        console.log("Fermeture de la popup")
        closestPanel.hidePopup()
      } else {
        console.log("Ouverture de la popup")
        closestPanel.showPopup()
      }
    } else {
      console.log("Aucun panneau proche détecté")
    }
  }
}
