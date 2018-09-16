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
		this.invalidate();
	}
	
	markers = []
	
	draw(painter: Painter){
		let a = {x: 0, y: 0, z: 0};
		let b = {x: 1, y: 0, z: 0};
		let c = {x: 1, y: 1, z: 0}
		let d = {x: 0, y: 1, z: 0}
		let arr = [a, b, c, d, a];
		painter.polyfill(arr, this.fillColor, this.strokeColor);
	}
}