import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class SignLoader {
  static loader = new GLTFLoader()
  static cache = new Map()

  static async loadSign() {
    if (this.cache.has('sign')) {
      return this.cache.get('sign')
    }

    try {
      const gltf = await this.loader.loadAsync('./glb/sign.glb')
      this.cache.set('sign', gltf)
      return gltf
    } catch (error) {
      console.warn('Impossible de charger sign.glb, utilisation du modèle par défaut:', error)
      return null
    }
  }

  static createDefaultSign(color = 0x4a90e2) {
    // Créer un panneau par défaut si le modèle n'est pas disponible
    const geometry = new BoxGeometry(3, 4, 0.2)
    const material = new MeshBasicMaterial({ color })
    const mesh = new Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }
}

