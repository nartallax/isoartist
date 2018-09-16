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
		this.invalidate();
	}
	
	markers = []
	
	draw(painter: Painter){
		let yInc = this.yAligned? 1: 0;
		let xInc = this.yAligned? 0: 1;
		
		let a = {x: 0, y: 0, z: 0};
		let b = {x: 0, y: 0, z: 1};
		let c = {x: xInc, y: yInc, z: 1}
		let d = {x: xInc, y: yInc, z: 0}
		let arr = [a, b, c, d, a]
		painter.polyfill(arr, this.fillColor, this.strokeColor);
	}
}