import {SceneObject} from "interfaces";
import {Painter, FakePainter} from "./painter"
import {Rasterizer} from "./rasterizer"

interface DrawCacheItem {
	w: number;
	h: number;
	x: number;
	y: number;
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
			//console.log(p.x, p.y)
			painter.image(this.cache[obj.drawCacheKey].el as HTMLCanvasElement, 0, 0, item.w, item.h, p.x + item.x, p.y + item.y, item.w, item.h);
		}
			
	}
	
	private drawOffscreen(obj: SceneObject): DrawCacheItem {
		let r = this.rasterizer.toSizeRecording();
		r.opts.centerX = r.opts.centerY = 0;
		r.updateCache();
		
		let fakePainter = new FakePainter(r);
		obj.draw(fakePainter);
		
		if(!r.haveSizeData){
			return {el: null, w: 0, h: 0, x: 0, y: 0}
		}
		

		r.opts.centerX = -r.left;
		r.opts.centerY = -r.bottom;
		let w = Math.ceil(r.right - r.left), h = Math.ceil(r.top - r.bottom);

		//console.log("Drawn " + obj.drawCacheKey + ": ", w, h)

		let canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;
		let context = canvas.getContext("2d") as CanvasRenderingContext2D;
		
		//TODO: пересоздавать растеризатор здесь? оно стоит того?
		let painter = new Painter(r, context);

		r.updateCache();
		obj.draw(painter);
		
		return { el: canvas, w: w, h: h, x: r.left, y: r.bottom}
	}
	
}