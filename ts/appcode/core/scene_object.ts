import { SceneObject as ISceneObject, Marker, Painter } from "interfaces"

export abstract class SceneObject implements ISceneObject {
	
	readonly x: number;
	readonly y: number;
	readonly z: number;
	
	drawCacheKey: string = "";
	
	protected readonly params?: any;
	protected abstract readonly name: string;
	abstract readonly markers?: Marker[];
	abstract draw(painter: Painter): void;
	
	constructor(x: number, y: number, z: number){
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	invalidate(){
		this.drawCacheKey = JSON.stringify({n: this.name, p: this.params || null})
	}
	
}