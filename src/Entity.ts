// Dependencies
import* as BABLYLON from "babylonjs"


// Base abstract class for instancing
export abstract class Entity {
    public active: boolean;
    public type: number;
    public position: BABYLON.Vector2;
    public mesh: BABYLON.Mesh;

    constructor(pos : BABYLON.Vector2) {
        this.active = false;
        this.type = 0;
        this.position = pos;
    }

    abstract update(dT: number) : void;
}

