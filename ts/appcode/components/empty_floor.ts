import {Painter} from "interfaces";
import {SceneObject} from "core/scene_object";

export class EmptyFloor extends SceneObject {
	readonly name = "EmptyFloor";
	
	fillColor: string;
	strokeColor: string;
	
	protected get params(){
		return { fc: this.fillColor, sc: this.strokeColor }
	}
	
	constructor(x: number, y: number, z: number, fillColor: string = "#eee", strokeColor: string = "#888"){
		super(x, y, z)
		this.fillColor = fillColor;
		this.strokeColor = strokeColor;
	}
	
	markers = []
	
	draw(painter: Painter){
		let a = this;
		let b = {x: this.x + 1, y: this.y, z: this.z};
		let c = {x: this.x + 1, y: this.y + 1, z: this.z}
		let d = {x: this.x, y: this.y + 1, z: this.z}
		let arr = [a, b, c, d, a];
		painter.polyfill(arr, this.fillColor, this.strokeColor);
	}
}