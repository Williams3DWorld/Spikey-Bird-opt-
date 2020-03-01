// Dependencies
import * as BABLYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

// Store content data
export class UserInterface {
  public static textblock: BABYLON.GUI.TextBlock;

  // Creates material from texture
  public static initialise(): void {
    let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
      "UI"
    );
    let panel = new BABYLON.GUI.StackPanel();
    advancedTexture.addControl(panel);
    //panel.position = "fixed";
    panel.top = "-180px";

    this.textblock = new BABYLON.GUI.TextBlock("textblock", "0");
    this.textblock.width = 0.4;
    this.textblock.height = "60px";
    this.textblock.color = "white";
    this.textblock.fontSize = "30px";
    this.textblock.color = "rgb(255, 163, 165)";
    this.textblock.fontFamily = "Helvetica";
    this.textblock.text = "0";
    panel.addControl(this.textblock);
  }
}
