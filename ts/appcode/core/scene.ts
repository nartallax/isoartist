import {Scene as IScene, SceneObject, Mutator, SetLike } from "interfaces"
import {Rasterizer, RasterizerOptions} from "./rasterizer"
import {Painter} from "./painter"
import {Cuboid} from "./cuboid"
import {DrawCache} from "./draw_cache"
import {Orderer} from "core/orderer";

export interface SceneOptions extends RasterizerOptions {
	context: CanvasRenderingContext2D
	width: number;
	depth: number;
	height: number;
}

export class ObjectSet implements SetLike<SceneObject> {
	private items = new Set<SceneObject>();
	
	add(x: SceneObject): SetLike<SceneObject> {
		this.items.add(x);
		return this;
	}
	
	delete(x: SceneObject): boolean {
		return this.items.delete(x);
	}
	
	[Symbol.iterator](){
		return this.items[Symbol.iterator]();
	}
}

export class Scene implements IScene {
	readonly objects = new ObjectSet();
	readonly options: SceneOptions;
	readonly bounds: Cuboid;
	readonly name = "Scene";
	readonly drawCache: DrawCache;
	readonly orderer: Orderer;
	
	private rasterizer: Rasterizer;
	
	constructor(options: SceneOptions){
		this.options = options;
		this.rasterizer = new Rasterizer(options);
		this.orderer = new Orderer({ rasterizer: this.rasterizer, content: this.objects })
		this.drawCache = new DrawCache(this.rasterizer);
		this.bounds = new Cuboid(
			{ x: -Math.floor(options.width / 2), y: -Math.floor(options.depth / 2), z: 0},
			{ x: Math.ceil(options.width / 2), y: Math.ceil(options.depth / 2), z: options.height}
		);
	}
	
	createPainter(){
		this.rasterizer.updateCache();
		return new Painter(this.rasterizer, this.options.context);
	}
	
	mutate(mutator: Mutator){
		mutator.mutate(this);
	}
	
	draw(painter: Painter){
		this.orderer.doOrdered(x => this.drawCache.draw(x, painter));
		/*
		for(let object of this.objects){
			this.drawCache.draw(object, painter);
		}
		*/
	}
	
	private invalidateDrawCache(){
		this.drawCache.reset();
	}
	
	private invalidateOrder(){
		this.orderer.reset();
	}
	
	invalidateScale(){
		this.invalidateDrawCache();
	}
	
	invalidateYawPitch(){
		this.invalidateDrawCache();
		this.invalidateOrder();
	}
	
	invalidate(){
		this.invalidateYawPitch();
		this.invalidateScale();
	}
	
}

