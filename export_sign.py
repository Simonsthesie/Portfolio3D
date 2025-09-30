import bpy
import os

# Chemin vers le fichier Sign.blend
blend_path = "/Users/properis/Desktop/zelda/fkisios/public/blender/world/Sign.blend"
output_path = "/Users/properis/Desktop/zelda/fkisios/public/glb/sign.glb"

# Ouvrir le fichier Blender
bpy.ops.wm.open_mainfile(filepath=blend_path)

# Sélectionner tous les objets du panneau
bpy.ops.object.select_all(action='DESELECT')

# Sélectionner l'objet Sign (ajustez le nom si nécessaire)
if "Sign" in bpy.data.objects:
    bpy.data.objects["Sign"].select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects["Sign"]

# Exporter en GLB
bpy.ops.export_scene.gltf(
    filepath=output_path,
    export_format='GLB',
    use_selection=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False
)

print(f"Modèle exporté vers: {output_path}")

