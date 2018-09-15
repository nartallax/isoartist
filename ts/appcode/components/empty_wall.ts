import {Painter} from "interfaces";
import {SceneObject} from "core/scene_object";

export class EmptyWall extends SceneObject {
	
	yAligned: boolean
	fillColor: string;
	strokeColor: string;
	
	protected readonly name = "EmptyWall";
	protected get params(){
		return { fc: this.fillColor, sc: this.strokeColor, byY: this.yAligned }
	}
	
	constructor(x: number, y: number, z: number, yAligned: boolean, fillColor: string = "#eee", strokeColor: string = "#888"){
		super(x, y, z);
		this.yAligned = yAligned;
		this.fillColor = fillColor;
		this.strokeColor = strokeColor;
	}
	
	markers = []
	
	draw(painter: Painter){
		let yInc = this.yAligned? 1: 0;
		let xInc = this.yAligned? 0: 1;
		
		let a = this;
		let b = {x: this.x, y: this.y, z: this.z + 1};
		let c = {x: this.x + xInc, y: this.y + yInc, z: this.z + 1}
		let d = {x: this.x + xInc, y: this.y + yInc, z: this.z}
		let arr = [a, b, c, d, a]
		painter.polyfill(arr, this.fillColor, this.strokeColor);
	}
}