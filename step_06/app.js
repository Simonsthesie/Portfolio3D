import { Scene } from 'three'
import Camera from './engine/camera'
import Light from './engine/light'
import Graphic from './engine/graphic'
import World from './entity/world'
import Player from './entity/player'
import InfoPanel from './object/infoPanel'
import { loadWorld, loadEntity } from './tool/loader'
import physic from './engine/physic'

const assetW = await loadWorld('./glb/world2.glb')
const assetP = await loadEntity('./glb/character.glb')

const scene = new Scene()
const camera = new Camera()
const world = new World(assetW.visuals, assetW.colliders, physic, assetW.areas)
const player = new Player(assetP, physic, assetW.areas)
const light = new Light()

// Panneaux éloignés pour éviter les conflits
const infoPanels = [
  new InfoPanel(
    { x: 0, y: 1, z: 5 }, 
    "Qui suis-je ?", 
    `Bonjour ! Je suis [Votre Nom], développeur passionné par la création d'expériences interactives.

Compétences principales :
• Développement Web (JavaScript, React, Node.js)
• Développement de jeux (Three.js, WebGL)
• Design et UX/UI
• Animation et effets visuels

J'aime créer des projets innovants qui combinent technologie et créativité.`,
    { color: 0x0000ff } // Bleu pur
  ),
  new InfoPanel(
    { x: -5, y: 1, z: 0 }, 
    "Mes Projets", 
    `Voici quelques-uns de mes projets récents :

🎮 Jeu 3D Interactif
• Développement d'un jeu 3D avec Three.js
• Système de physique avec Rapier
• Interface utilisateur responsive

🌐 Application Web
• Frontend en React
• Backend en Node.js
• Base de données MongoDB

📱 Application Mobile
• React Native
• Interface native
• Intégration API`,
    { color: 0x00ff00 } // Vert pur
  ),
  new InfoPanel(
    { x: 5, y: 1, z: 0 }, 
    "Contact", 
    `N'hésitez pas à me contacter !

📧 Email : votre.email@example.com
💼 LinkedIn : /in/votre-profil
🐙 GitHub : /votre-username
📱 Téléphone : +33 6 XX XX XX XX

Je suis toujours ouvert à de nouvelles opportunités et collaborations intéressantes.`,
    { color: 0xff0000 } // Rouge pur
  )
]

scene.add(world)
scene.add(light)
scene.add(player)
scene.add(...infoPanels)

const graphic = new Graphic(scene, camera)
graphic.onUpdate((dt) => {
  physic.step()
  player.update(dt, world.areas)
  camera.update(player)
  light.update(player)
  InfoPanel.update(player)
})
