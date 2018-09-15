import {SceneObject} from "interfaces";
import {Painter, FakePainter} from "./painter"
import {Rasterizer} from "./rasterizer"

interface DrawCacheItem {
	w: number;
	h: number;
	el: HTMLCanvasElement | null;
}

export class DrawCache {
	private cache: {[k: string]: DrawCacheItem } = {};
	private readonly rasterizer: Rasterizer;
	
	constructor(rasterizer: Rasterizer){
		this.rasterizer = rasterizer;
		this.reset();
	}
	
	reset(){
		this.cache = {};
	}
	
	draw(obj: SceneObject, painter: Painter): void{
		if(!obj.drawCacheKey)
			return obj.draw(painter);
		let item = this.cache[obj.drawCacheKey];
		if(!item)
			item = this.cache[obj.drawCacheKey] = this.drawOffscreen(obj);
		if(item.el){
			let p = this.rasterizer.point(obj);
			painter.image(this.cache[obj.drawCacheKey].el as HTMLCanvasElement, p.x, p.y, item.w, item.h, 0, 0, item.w, item.h);
		}
			
	}
	
	private drawOffscreen(obj: SceneObject): DrawCacheItem {
		let r = this.rasterizer.toSizeRecording();
		r.opts.centerX = r.opts.centerY = 0;
		r.updateCache();
		
		let fakePainter = new FakePainter(r);
		obj.draw(fakePainter);
		
		if(!r.haveSizeData){
			return {el: null, w: 0, h: 0}
		}
		
		let canvas = document.createElement("canvas");
		// TODO: test for perf here
		canvas.width = 1000;
		canvas.height = 1000;
		let context = canvas.getContext("2d") as CanvasRenderingContext2D;
		
		//TODO: пересоздавать растеризатор здесь? оно стоит того?
		let painter = new Painter(r, context);
		
		
		r.opts.centerX = r.left;
		r.opts.centerY = r.bottom;
		r.updateCache();
		obj.draw(painter);
		
		return {
			el: canvas,
			w: r.right - r.left,
			h: r.top - r.bottom
		}
	}
	
}