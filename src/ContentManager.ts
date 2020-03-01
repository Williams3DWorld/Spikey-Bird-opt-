import { ArrayTools } from "babylonjs/Misc/arrayTools";

// Store content data
export class ContentManager {
  public static textures: Array<BABYLON.Texture> = new Array();
  public static materials: Array<BABYLON.StandardMaterial> = new Array();
  public static sounds: Array<BABYLON.Sound> = new Array();
  public static spike: BABYLON.Mesh;

  // Creates material from texture
  public static makeMatFromTexture(dir: string, masked: boolean, s: BABYLON.Scene): void {
    // Create data from input
    let m = new BABYLON.StandardMaterial(`mat_${this.materials.length-1}`, s);
    let t = new BABYLON.Texture(dir, s);

    // Assign data to arrays
    this.materials.push(m);
    this.textures.push(t);

    // Check for alpha
    if (masked) this.materials[this.materials.length-1].opacityTexture = t;

    // Apply default textures
    this.materials[this.materials.length-1].diffuseTexture = t;
    this.materials[this.materials.length-1].emissiveColor = new BABYLON.Color3(
      1,
      1,
      1
    );
  }

  // Push back sound element from file
  public static loadSound(dir: string, s: BABYLON.Scene) {
    // Create sound from input
    let a = new BABYLON.Sound(`snd_${this.sounds.length}`, dir, s);

    // Assign data to array
    this.sounds.push(a);
  }
}
