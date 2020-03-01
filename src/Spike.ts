import { Entity } from "./Entity";
import { ContentManager } from "./ContentManager";
import { InstancedMesh } from "babylonjs";

// Deep copy function for cloning active spikes
export function SpikeCopyAssign(copy: Spike) {
  let new_spike = copy;
  new_spike.active = copy.active;
  new_spike.instance_id = copy.instance_id;
  new_spike.position = copy.position;
  new_spike.i_mesh = copy.i_mesh;
  if (copy.i_mesh !== undefined)
    new_spike.i_mesh.position = copy.i_mesh.position;

  return new_spike as Spike;
}

// Spike class for instancing
export class Spike extends Entity {
  public instance_id: number;
  public i_mesh: BABYLON.InstancedMesh;

  constructor(
    id: number,
    pos: BABYLON.Vector2,
    scene: BABYLON.Scene,
    canvas: HTMLCanvasElement
  ) {
    super(pos);

    this.instance_id = id;
    this.i_mesh = ContentManager.spike.createInstance(`instance_${id}`);
    this.position = pos; // Assign default position value
  }

  update(dT: number): void {}
}
