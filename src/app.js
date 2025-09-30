import {clone, spreadAround, proba, cleanGame, removeFromArray} from './tool/function'
import { Scene } from 'three'
import World from './entity/world'
import Player from './entity/player'
import Mob1 from './entity/mob1'
import Mob2 from './entity/mob2'
import Grass from './object/grass'
import Block from './object/block'
import Box from './object/box'
import Rubis from './object/rubis'
import Heart from './object/heart'
import InfoPanel from './object/infoPanel'
import Area from './effect/area'
import Focus from './effect/focus'
import Graphic from './engine/graphic'
import Camera from './engine/camera'
import Light from './engine/light'
import Rules from './tool/rules'
import UI from './ui/ui'
import Home from './ui/home'
import loadAssets from './tool/loader'
import physic from './engine/physic'


const ast = await loadAssets()
const home = new Home()

async function main() {
  console.log("=== DÉBUT DE MAIN ===")
  const scene = new Scene()

  const rubies = ast.meshesRubis.map((m) => new Rubis(m))
  const hearts = ast.meshesHeart.map((m) => new Heart(m))
  const bloks = ast.meshesBlock.map((m) => new Block(m, physic))
  const boxes = ast.meshesBox.map((m) => new Box(m, physic))
  const areas = ast.meshesArea.map((m) => new Area(m))
  const grasses = ast.meshesGrass.map((m) => new Grass(m))
  const player = new Player(clone(ast.meshPlayer), ast.spawn, physic)
  console.log("Joueur créé")
  
  // Créer les panneaux d'information du portfolio près de la position actuelle du joueur
  let infoPanels = []
  try {
    console.log("Création des panneaux...")
    // Vérifier si les panneaux existent déjà
    if (InfoPanel.panels.length === 0) {
      infoPanels = [
    new InfoPanel(
      { x: 19.6, y: 0.5, z: -1.6 }, 
      "Qui suis-je ?", 
      `Bonjour ! Je suis [Votre Nom], développeur passionné par la création d'expériences interactives.

Compétences principales :
• Développement Web (JavaScript, React, Node.js)
• Développement de jeux (Three.js, WebGL)
• Design et UX/UI
• Animation et effets visuels

J'aime créer des projets innovants qui combinent technologie et créativité.`,
      { color: 0x4a90e2 }, // Bleu professionnel
      physic // Passer le système de physique
    ),
    new InfoPanel(
      { x: 25.7, y: 0.5, z: -1.6 }, 
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
      { color: 0x27ae60 }, // Vert professionnel
      physic // Passer le système de physique
    ),
    new InfoPanel(
      { x: 30.5, y: 0.5, z: 2.1 }, 
      "Contact", 
      `N'hésitez pas à me contacter !

📧 Email : votre.email@example.com
💼 LinkedIn : /in/votre-profil
🐙 GitHub : /votre-username
📱 Téléphone : +33 6 XX XX XX XX

Je suis toujours ouvert à de nouvelles opportunités et collaborations intéressantes.`,
      { color: 0xe74c3c }, // Rouge professionnel
      physic // Passer le système de physique
      )
      ]
      console.log("Panneaux créés avec succès:", infoPanels.length)
    } else {
      console.log("Panneaux déjà existants, réutilisation")
      infoPanels = InfoPanel.panels
    }
  } catch (error) {
    console.error("Erreur lors de la création des panneaux:", error)
  }
  console.log("Panneaux finaux:", infoPanels.length)
  console.log("Panneaux dans InfoPanel.panels:", InfoPanel.panels.length)
  const mobs1 = ast.spawnsMobA.map((m) => new Mob1(clone(ast.meshMob1), m, physic))
  const mobs2 = ast.spawnsMobB.map((m) => new Mob2(clone(ast.meshMob2), m, physic))
  const world = new World(ast.meshesSolid, ast.meshesCollider, physic)
  const camera = new Camera(player)
  const focus = new Focus()
  const ui = new UI(player)
  const light = new Light()
  const graphic = new Graphic(scene, camera, focus)
  const mobs = mobs1.concat(mobs2)
  const rules = new Rules(player, bloks, boxes, areas, mobs, world, home, light)

  scene.add(...rubies)
  scene.add(...hearts)
  scene.add(...bloks)
  scene.add(...boxes)
  scene.add(...grasses)
  scene.add(...infoPanels)
  scene.add(...mobs)
  scene.add(player)
  scene.add(world)
  scene.add(light)

  graphic.onUpdate((dt) => {
    physic.step()
    for (const mob of mobs) mob.update(dt, player)
    for (const rubis of rubies) rubis.update(dt, player)
    for (const heart of hearts) heart.update(dt, player)
    for (const blok of bloks) blok.update(player)
    for (const box of boxes) box.update(dt)
    player.update(dt, mobs, grasses, boxes, areas)
    Grass.update(dt, player)
    world.update(dt)
    focus.update(dt, player, camera)
    camera.update(player)
    InfoPanel.update(player)
    rules.update(dt)
    light.update(player)
    ui.update(player)
    
    // Debug position du joueur toutes les 5 secondes
    if (Math.floor(Date.now() / 1000) % 5 === 0) {
      console.log(`🎮 JOUEUR POSITION: x=${player.position.x.toFixed(1)}, y=${player.position.y.toFixed(1)}, z=${player.position.z.toFixed(1)}`)
      console.log(`📍 Pour positionner un panneau, utilisez ces coordonnées:`)
      console.log(`   new InfoPanel({ x: ${player.position.x.toFixed(1)}, y: ${player.position.y.toFixed(1)}, z: ${player.position.z.toFixed(1)} }, "Titre", "Contenu")`)
    }
  })

  Grass.onCut((pos) => {
    if (proba(0.05)) createRubis(pos)
    if (proba(0.05) && player.hp < 4) createHeart(pos)
  })

  Box.onBreak((pos) => {
    for (let i = 0; i < 4; i++) createRubis(pos)
    createRubis(pos, 10)
  })

  Box.onDelete((instance) => {
    removeFromArray(instance, boxes)
  })

  Mob1.onDelete((pos, instance) => {
    if (proba(0.2)) createHeart(pos)
    if (proba(0.2)) createRubis(pos, 10)
    removeFromArray(instance, mobs)
  })

  Mob2.onDelete((pos, instance) => {
    if (proba(0.25)) createHeart(pos)
    removeFromArray(instance, mobs)
  })

  home.onStart(() => {
    home.hide()
    world.playSound()
    player.active = true
  })

  rules.onGameover(() => {
    // Ne pas supprimer les panneaux lors du game over
    const objects3D = {player, mobs, bloks, boxes, grasses, hearts, rubies, focus, world }
    cleanGame(objects3D, graphic, ui)
    main()
  })

  home.show()
  graphic.start()

  function createRubis(pos, val = 1) {
    const ruby = new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1), val)
    rubies.push(ruby)
    scene.add(ruby)
  }

  function createHeart(pos) {
    const heart = new Heart(ast.meshesHeart[0], spreadAround(pos, 1, 1))
    hearts.push(heart)
    scene.add(heart)
  }
}

main()
