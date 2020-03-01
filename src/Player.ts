import { Entity } from "./Entity";
import { ContentManager } from "./ContentManager";
import { Spike } from "./Spike";

// Define player directions
// const DIR_LEFT: number = 1;
// const DIR_RIGHT: number = -1;

// Player class, includes camera
export class Player extends Entity {
  public static DIR_LEFT: number = 1;
  public static DIR_RIGHT: number = -1;

  public width: number;
  public height: number;
  public speed: number;
  public currentDir: number;
  public hitSpike: boolean;

  constructor(
    pos: BABYLON.Vector2,
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement
  ) {
    super(pos);

    this.width = 60;
    this.height = 98;
    this.currentDir = 1;

    this.mesh = BABYLON.MeshBuilder.CreatePlane(
      "player",
      {
        height: this.width,
        width: this.height
      },
      scene
    );
    this.mesh.position = new BABYLON.Vector3(0, 0, 0);

    this.mesh.checkCollisions = true;
  }

  // Update spike collision
  updateSpikeCollision(activeSpikes: Array<Spike>) {
    for (let i = 0; i < activeSpikes.length; i++) {
      if (this.mesh.intersectsMesh(activeSpikes[i].i_mesh)) {
        this.hitSpike = true;
      }
    }
  }

  // Virtuals
  update(dT: number): void {}
}
