import {SceneObject} from "interfaces";
import {Rasterizer} from "core/rasterizer";

export interface OrdererOptions {
	rasterizer: Rasterizer;
	content: Iterable<SceneObject>;
}

export class Orderer {
	readonly options: OrdererOptions;
	private currentOrder: SceneObject[] = []

	constructor(opts: OrdererOptions){
		this.options = opts;
	}

	reset(){
		let r = this.options.rasterizer;
		this.currentOrder = [...this.options.content].sort((a, b) => r.depth(a) - r.depth(b));
	}

	doOrdered(action: (x: SceneObject) => void){
		this.currentOrder.forEach(action);
	}
}