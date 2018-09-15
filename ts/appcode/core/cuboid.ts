import {SceneCuboid as ICuboid, ScenePoint } from "interfaces"

export class Cuboid implements ICuboid {
	lower: ScenePoint;
	upper: ScenePoint;
	
	constructor(a: ScenePoint, b: ScenePoint){
		this.lower = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), z: Math.min(a.z, b.z) }
		this.upper = { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), z: Math.max(a.z, b.z) }
	}
	
	get left(): number { return this.lower.x }
	set left(v: number){ this.lower.x = v }
	get right(): number { return this.upper.x }
	set right(v: number){ this.upper.x = v }
	
	get near(): number { return this.lower.y }
	set near(v: number){ this.lower.y = v }
	get far(): number { return this.upper.y }
	set far(v: number){ this.upper.y = v }
	
	get top(): number { return this.upper.z }
	set top(v: number){ this.upper.z = v }
	get bottom(): number { return this.lower.z }
	set bottom(v: number){ this.lower.z = v }
	
	get width(){ return this.upper.x - this.lower.x }
	get height(){ return this.upper.z - this.lower.z }
	get depth(){ return this.upper.y - this.lower.y }
	
	get volume(){ return this.width * this.height * this.depth }
}