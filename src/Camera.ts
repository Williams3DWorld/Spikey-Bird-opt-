import { Entity } from "./Entity";

// Ortho camera
export class OrthoCamera extends Entity {
  camObj: BABYLON.Camera;

  constructor(
    pos: BABYLON.Vector2,
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement
  ) {
    super(pos);
    this.camObj = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 0, -10),
      scene
    );

    this.camObj.inputs.clear();
    this.camObj.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    let ratio = window.innerWidth / window.innerHeight;
    let zoom = this.camObj.orthoTop;
    let newWidth = zoom * ratio;
    this.camObj.orthoTop = newWidth;
    this.camObj.orthoLeft = -Math.abs(zoom);
    this.camObj.orthoRight = newWidth;
    this.camObj.orthoBottom = -Math.abs(zoom);
    this.camObj.attachControl(canvas, true);
  }

  update(dT: number): void {}
}