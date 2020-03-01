// Classes
import { generateSpikeIndicesFromLevel } from "./SpikeGenerator";
import { Entity } from "./Entity";
import { Player } from "./Player";
import { OrthoCamera } from "./Camera";
import { Spike, SpikeCopyAssign } from "./Spike";
import { ContentManager } from "./ContentManager";
import { UserInterface } from "./UI";

import { Camera, FresnelParameters, TextureAssetTask } from "babylonjs";

// The main game object
class Game {
  // Main elements
  public _canvas: HTMLCanvasElement;
  public _engine: BABYLON.Engine;
  public _scene: BABYLON.Scene;

  // Stats
  public _delta: number;
  public _gravity: number;
  public _score: number;
  public _interp_t: number; // dist during interp
  public _interp_speed: number; // Interp speed
  public _gameover: boolean; // Check if player hit spike
  public _player_ready: boolean; // Check if player has been reset back after gameover (or first time playing)
  public _generated_spikes: boolean; // Check whether or not spikes have been generated

  // Game objects
  private _cam: OrthoCamera;
  private _player: Player;
  private _left_spikes: Array<Spike> = new Array();
  private _right_spikes: Array<Spike> = new Array();
  private _top_spikes: Array<Spike> = new Array();
  private _bottom_spikes: Array<Spike> = new Array();
  private _active_spikes_left: Array<Spike> = new Array();
  private _active_spikes_right: Array<Spike> = new Array();
  private _moving_spike_indices: Array<number> = new Array();

  // Constants
  readonly LEFT_SPIKES_FRAME_0: number = -400;
  readonly LEFT_SPIKES_FRAME_1: number = -333;
  readonly LEFT_SPIKES: number = 0;
  readonly RIGHT_SPIKES: number = 1;

  constructor(canvasElement: string) {
    /* ----------------------------- ENGINE SET-UP ----------------------------- */
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
    this._scene = new BABYLON.Scene(this._engine);

    /* ----------------------------- STATES ----------------------------- */
    this._gameover = false;
    this._player_ready = false;
    this._generated_spikes = false;
    this._gravity = -1350;
    this._interp_speed = 0.01;
    this._score = 0;
  }

  /* ----------------------------- GLOBAL FUNCTIONS ----------------------------- */
  interpolateSpikes(spikes: Array<Spike>, dest_x: number): void {
    this._interp_t = BABYLON.Scalar.Lerp(
      spikes[0].i_mesh.position.x,
      dest_x,
      this._interp_speed * this._delta
    );

    for (var i = 0; i < spikes.length; i++)
      spikes[i].i_mesh.position.x = this._interp_t;
  }

  toggleSpikes(
    spikes: Array<Spike>,
    active_spikes: Array<Spike>,
    dest_x: number
  ): void {
    if (!this._generated_spikes) {
      active_spikes.length = 0; // Reset active spike array
      let spike_indices = generateSpikeIndicesFromLevel(this._score);
      for (let i = 0; i < spike_indices.length; i++) {
        active_spikes.push(SpikeCopyAssign(spikes[spike_indices[i]]));
      }
      console.log(`${active_spikes.length} generated.`);

      this._generated_spikes = true;
    }

    this.interpolateSpikes(active_spikes, dest_x);
  }

  /* ----------------------------- PRE-LOADED CONTENT ----------------------------- */
  initialise(): void {
    this._scene.gravity = new BABYLON.Vector3(0, -500, 0);
    this._scene.collisionsEnabled = true;
    this._scene.enablePhysics(
      new BABYLON.Vector3(0, this._gravity, 0),
      new BABYLON.AmmoJSPlugin()
    );

    // User Interface
    UserInterface.initialise();

    // Materials & textures
    ContentManager.makeMatFromTexture("./assets/Bird0.png", true, this._scene); // Player material
    ContentManager.textures.push(
      new BABYLON.Texture("./assets/Bird1.png", this._scene)
    ); // Additional flap texture
    ContentManager.materials.push(
      new BABYLON.StandardMaterial("Spike_mat", this._scene)
    ); // Spike material
    ContentManager.materials[1].emissiveColor = new BABYLON.Color3(
      1,
      0.63,
      0.66
    );

    // Sounds
    ContentManager.loadSound("./assets/Flap.wav", this._scene);
    ContentManager.loadSound("./assets/WallHit.wav", this._scene);
    ContentManager.loadSound("./assets/Gameover.wav", this._scene);

    // Meshes
    ContentManager.spike = BABYLON.Mesh.CreateDisc(
      "triangle",
      35,
      3,
      this._scene
    ); // Spike instance
    ContentManager.spike.isVisible = false;
    ContentManager.spike.material = ContentManager.materials[1];
    ContentManager.spike.scaling.y = 1.1;

    // Initialise camera
    this._cam = new OrthoCamera(
      new BABYLON.Vector2(0, 0),
      this._scene,
      this._canvas
    );

    // Initialise Player
    this._player = new Player(
      new BABYLON.Vector2(0, 0),
      this._scene,
      this._canvas
    );
    this._player.mesh.material = ContentManager.materials[0];

    /* -------------------------------- SPIKES ------------------------------- */
    // Initialise spikes (left and right)
    ContentManager.spike.position.x = this.LEFT_SPIKES_FRAME_0;
    let offset = -170;
    let margin = 84;
    let i = 0;
    for (i = 0; i < 5; i++) {
      // LEFT
      this._left_spikes.push(
        new Spike(i, new BABYLON.Vector2(0, 0), this._scene, this._canvas)
      );
      this._left_spikes[this._left_spikes.length - 1].i_mesh.position.y =
        offset + i * margin;

      this._active_spikes_left[i] = this._left_spikes[i];
    }
    ContentManager.spike.position.x = -this.LEFT_SPIKES_FRAME_0;
    ContentManager.spike.scaling.x = -ContentManager.spike.scaling.x;
    for (i = 0; i < 5; i++) {
      // RIGHT
      this._right_spikes.push(
        new Spike(i, new BABYLON.Vector2(0, 0), this._scene, this._canvas)
      );
      this._right_spikes[this._right_spikes.length - 1].i_mesh.position.y =
        offset + i * margin;

      this._active_spikes_right[i] = this._right_spikes[i];
    }

    // Initialise spikes (top and bottom)
    ContentManager.spike.position.y = 284;
    ContentManager.spike.rotate(
      new BABYLON.Vector3(0, 0, 1),
      BABYLON.Tools.ToRadians(90),
      BABYLON.Space.LOCAL
    );
    offset = -382;
    margin = 76;
    for (i = 0; i < 10; i++) {
      this._top_spikes.push(
        new Spike(i, new BABYLON.Vector2(0, 0), this._scene, this._canvas)
      );
      this._top_spikes[this._top_spikes.length - 1].i_mesh.position.x =
        offset + i * margin;
    }
    ContentManager.spike.position.y = -284;
    ContentManager.spike.rotate(
      new BABYLON.Vector3(0, 0, 1),
      BABYLON.Tools.ToRadians(180),
      BABYLON.Space.LOCAL
    );
    for (i = 0; i < 10; i++) {
      this._top_spikes.push(
        new Spike(i, new BABYLON.Vector2(0, 0), this._scene, this._canvas)
      );
      this._top_spikes[this._top_spikes.length - 1].i_mesh.position.x =
        offset + i * margin;
    }

    /* -------------------------------- INPUT ------------------------------- */
    // Key down callback
    var onKeyDown = event => {
      if (!this._gameover) {
        switch (event.keyCode) {
          case 32: // space
            if (ContentManager.materials[0].alpha >= 0.9) {
              ContentManager.materials[0].alpha = 1;
              ContentManager.materials[0].diffuseTexture =
                ContentManager.textures[1];
              ContentManager.sounds[0].play(); // Flap sound

              if (!this._player_ready) {
                this._player.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(
                  this._player.mesh,
                  BABYLON.PhysicsImpostor.SphereImpostor,
                  { mass: 1, restitution: 0.9 },
                  this._scene
                );
                this._player.speed = 0.225;
                UserInterface.textblock.text = "0";

                this._generated_spikes = false;
                this._player_ready = true;
              }
              this._player.mesh.physicsImpostor.setLinearVelocity(
                new BABYLON.Vector3(0, 1, 0)
              );
              this._player.mesh.applyImpulse(
                new BABYLON.Vector3(0, 400, 0),
                this._player.mesh
                  .getAbsolutePosition()
                  .add(BABYLON.Vector3.Zero())
              );
            }
            break;
        }
      }
    };

    // Key up callback
    var onKeyUp = event => {
      if (!this._gameover) {
        switch (event.keyCode) {
          case 32: // space
            ContentManager.materials[0].diffuseTexture =
              ContentManager.textures[0];
            break;
        }
      }
    };

    // Check top and bottom for player overlap
    var hitKillZone = () => {
      return (
        this._player.mesh.position.y + this._player.height / 2 > 250 ||
        this._player.mesh.position.y - this._player.height / 2 < -250
      );
    };

    /* -------------------------------- UPDATE ------------------------------- */
    var update = () => {
      // Calc delta here
      this._delta = this._engine.getDeltaTime();

      if (this._player_ready) {
        this._player.mesh.position.x +=
          this._player.speed * this._delta * this._player.currentDir;

        // First check if player is alive
        if (!this._gameover) {
          // Check killzone
          if (hitKillZone()) {
            ContentManager.sounds[2].play(); // Gameover sound
            this._gameover = true;
          }

          if (this._player.currentDir == Player.DIR_RIGHT) {
            this.toggleSpikes(
              // SWITCH TO LEFT SPIKES
              this._left_spikes,
              this._active_spikes_left,
              this.LEFT_SPIKES_FRAME_1
            );

            this.interpolateSpikes(
              this._active_spikes_right,
              -this.LEFT_SPIKES_FRAME_0
            );
          } else {
            this.toggleSpikes(
              // SWITCH TO LEFT SPIKES
              this._right_spikes,
              this._active_spikes_right,
              -this.LEFT_SPIKES_FRAME_1
            );

            this.interpolateSpikes(
              this._active_spikes_left,
              this.LEFT_SPIKES_FRAME_0
            );
          }

          // Check player direction
          if (this._player.currentDir == Player.DIR_LEFT) {
            // RIGHT FACING
            // RIGHT SPIKES
            if (this._player.mesh.position.x >= 296) {
              this._generated_spikes = false;
              this._player.currentDir = Player.DIR_RIGHT;
              this._score++;
              UserInterface.textblock.text = `${this._score}`;
              this._player.mesh.scaling.x = -this._player.mesh.scaling.x;
              this._interp_t = 0;

              ContentManager.sounds[1].play(); // WallHit sound
            }

            // CHECK RIGHT ACTIVE SPIKES
            for (var i = 0; i < this._active_spikes_right.length; i++) {
              if (this._active_spikes_right[i]) {
                if (
                  this._player.mesh.intersectsMesh(
                    this._active_spikes_right[i].i_mesh
                  )
                ) {
                  ContentManager.sounds[2].play(); // Gameover sound
                  this._gameover = true;
                }
              }
            }
          } else {
            // LEFT FACING
            if (this._player.mesh.position.x <= -296) {
              this._generated_spikes = false;
              this._player.currentDir = Player.DIR_LEFT;
              this._score++;
              UserInterface.textblock.text = "" + this._score;
              this._player.mesh.scaling.x = -this._player.mesh.scaling.x;
              this._interp_t = 0;

              ContentManager.sounds[1].play(); // WallHit sound
            }

            // CHECK LEFT ACTIVE SPIKES
            for (var i = 0; i < this._active_spikes_left.length; i++) {
              if (this._active_spikes_left[i]) {
                if (
                  this._player.mesh.intersectsMesh(
                    this._active_spikes_left[i].i_mesh
                  )
                ) {
                  ContentManager.sounds[2].play(); // Gameover sound
                  this._gameover = true;
                }
              }
            }
          }
        } else if (this._gameover) {
          this._player.mesh.rotate(
            new BABYLON.Vector3(0, 0, 1),
            BABYLON.Tools.ToRadians(6),
            BABYLON.Space.LOCAL
          );

          ContentManager.materials[0].alpha -= 0.001 * this._delta;

          if (this._player.mesh.position.y < -1000) {
            // Reset spikes
            if (this._score > 0) {
              this.interpolateSpikes(
                this._active_spikes_left,
                this.LEFT_SPIKES_FRAME_0
              );
            }

            this.interpolateSpikes(
              this._active_spikes_right,
              -this.LEFT_SPIKES_FRAME_0
            );

            if (
              this._active_spikes_left[0].i_mesh.position.x <=
                this.LEFT_SPIKES_FRAME_0 + 1 &&
              this._active_spikes_right[0].i_mesh.position.x >=
                -this.LEFT_SPIKES_FRAME_0 - 1
            ) {
              console.log("RESET!");
              this._scene
                .getPhysicsEngine()
                .removeImpostor(this._player.mesh.physicsImpostor);
              this._player.mesh.position = BABYLON.Vector3.Zero();
              this._player.mesh.rotationQuaternion.copyFromFloats(0, 0, 0, 1);
              this._player.mesh.scaling.x = Math.abs(
                this._player.mesh.scaling.x
              );
              ContentManager.materials[0].alpha = 1;
              ContentManager.materials[0].diffuseTexture =
                ContentManager.textures[0];
              this._score = 0;
              this._player.currentDir = Player.DIR_LEFT;
              this._player_ready = false;
              this._gameover = false;
            }
          }
        }
      }
      this._player.speed += 0.000001 * this._delta;
    };

    this._canvas.addEventListener("keydown", onKeyDown, false);
    this._canvas.addEventListener("keyup", onKeyUp, false);

    // Updates
    this._scene.registerBeforeRender(function() {
      update();
    });
  }

  /* -------------------------------- BABYLON RENDER LOOP ------------------------------- */
  playLoop(): void {
    let self = this;

    // run the render loop
    this._engine.runRenderLoop(() => {
      //this.update();
      this._scene.clearColor = new BABYLON.Color4(1, 0.94, 0.96, 1);
      self._scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener("resize", () => {
      self._engine.resize();
    });
  }
}

/* -------------------------------- ENTRY POINT ------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  // Create the game using the 'renderCanvas'
  let game = new Game("renderCanvas");

  // Create the scene
  game.initialise();

  // Game loop
  game.playLoop();
});
